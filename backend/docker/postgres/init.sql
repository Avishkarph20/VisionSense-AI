
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ Step 2: standalone lookup tables ============

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE activity_types (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) UNIQUE NOT NULL,
    default_severity VARCHAR(20) NOT NULL DEFAULT 'low'
);

CREATE TABLE model_versions (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(50) NOT NULL,
    version_tag VARCHAR(50) NOT NULL,
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT
);

-- ============ Step 3: users (depends on roles) ============

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Step 4: sessions (depends on users) ============

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Step 5: cameras (no dependencies) ============

CREATE TABLE cameras (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    rtsp_url VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Step 6: junction table (many-to-many) ============

CREATE TABLE user_camera_assignments (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    camera_id INT NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, camera_id)
);
--=====================Step 7 : Rule Engine ==========================================
CREATE TABLE rules (

    id SERIAL PRIMARY KEY,

    name VARCHAR(100),

    activity_type_id INT REFERENCES activity_types(id),

    threshold REAL,

    enabled BOOLEAN,

    created_at TIMESTAMPTZ DEFAULT now()

);

-- ============ Step 8: alerts : central fact table ============

CREATE TABLE alerts (
    id BIGSERIAL PRIMARY KEY,
    camera_id INT NOT NULL REFERENCES cameras(id),
    activity_type_id INT REFERENCES activity_types(id),
    confidence REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    severity VARCHAR(20) NOT NULL DEFAULT 'low',
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','approved','dismissed','false_positive')),
    detected_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Step 9: video_clips — 1-to-1 with alerts ============

CREATE TABLE video_clips (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL UNIQUE REFERENCES alerts(id) ON DELETE CASCADE,
    minio_object_path VARCHAR(255) NOT NULL,
    duration_seconds SMALLINT,
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Step 10: detection_results ============

CREATE TABLE detection_results (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    model_version_id INT REFERENCES model_versions(id),
    track_id INT,
    bbox JSONB,
    pose_keypoints JSONB,
    confidence REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    frame_timestamp TIMESTAMPTZ NOT NULL
);

-- ============ Step 11: feedback ============

CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    decision VARCHAR(20) NOT NULL
        CHECK (decision IN ('approved','dismissed','false_positive')),
    comment TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ Step 12: system_logs ============

CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);