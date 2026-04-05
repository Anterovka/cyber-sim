-- CyberSim Database Migration
-- Таблица: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    league VARCHAR(20) DEFAULT 'beginner' CHECK (league IN ('beginner', 'intermediate', 'advanced', 'expert')),
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица: user_progress
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_id VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    mistakes INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, scenario_id)
);

-- Таблица: attack_type_stats
CREATE TABLE IF NOT EXISTS attack_type_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attack_type VARCHAR(50) NOT NULL,
    encountered INTEGER DEFAULT 0,
    successfully_defended INTEGER DEFAULT 0,
    UNIQUE(user_id, attack_type)
);

-- Таблица: certificates
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    league VARCHAR(20) NOT NULL,
    final_score INTEGER NOT NULL,
    qr_code_path TEXT,
    is_valid BOOLEAN DEFAULT true
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_scenario ON user_progress(scenario_id);
CREATE INDEX IF NOT EXISTS idx_attack_type_stats_user_id ON attack_type_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_users_league ON users(league);
CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score DESC);
