import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '../config/env.js';

const migrationsDir = path.resolve(process.cwd(), 'db/migrations');

// A single Client (not a Pool): a transaction only works if every query runs
// on the same connection.
const client = new Client({ connectionString: env.databaseUrl });
await client.connect();

try {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name text PRIMARY KEY,
            applied_at timestamptz NOT NULL DEFAULT now()
        )`);

    const { rows } = await client.query<{ name: string }>(
        'SELECT name FROM schema_migrations',
    );

    const applied = new Set(rows.map((row) => row.name));

    const files = (await readdir(migrationsDir))
        .filter((file) => file.endsWith('.sql'))
        .sort();

    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
        console.log('No pending migrations.');
    }

    for (const file of pending) {
        const sql = await readFile(path.join(migrationsDir, file), 'utf-8');

        if (sql.trim() === '') {
            throw new Error(`Migration ${file} is empty`);
        }

        try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query(
                'INSERT INTO schema_migrations (name) VALUES ($1)',
                [file],
            );
            await client.query('COMMIT');
            console.log(`Applied ${file}`);
        } catch (err) {
            await client.query('ROLLBACK');
            throw new Error(`Migration ${file} failed`, { cause: err });
        }
    }
} finally {
    await client.end();
}
