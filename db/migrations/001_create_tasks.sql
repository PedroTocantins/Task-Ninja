CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT uuidv7(),
    title text NOT NULL,
    description text NOT NULL,

    status text NOT NULL
        CONSTRAINT tasks_status_check
        CHECK (status IN ('pending', 'in_progress', 'done')),

    priority text NOT NULL
        CONSTRAINT tasks_priority_check
        CHECK (priority IN ('high', 'medium', 'low')),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
