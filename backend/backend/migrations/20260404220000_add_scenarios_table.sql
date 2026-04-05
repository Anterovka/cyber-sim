-- Таблица для хранения сценариев (импорт через API)
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    location VARCHAR(50) NOT NULL DEFAULT 'office' CHECK (location IN ('office', 'home', 'public_wifi', 'mobile', 'cloud')),
    attack_type VARCHAR(50) NOT NULL CHECK (attack_type IN ('phishing', 'skimming', 'brute_force', 'social_engineering', 'deepfake', 'malware', 'man_in_the_middle', 'smishing', 'ransomware')),
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    steps JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_location ON scenarios(location);
CREATE INDEX IF NOT EXISTS idx_scenarios_attack_type ON scenarios(attack_type);
CREATE INDEX IF NOT EXISTS idx_scenarios_difficulty ON scenarios(difficulty);
