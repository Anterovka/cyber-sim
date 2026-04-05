use serde::Deserialize;

#[derive(Deserialize, Clone)]
pub struct Settings {
    pub server: ServerSettings,
    pub database: DatabaseSettings,
    pub redis: RedisSettings,
    pub jwt: JwtSettings,
    pub certificates: CertificateSettings,
}

#[derive(Deserialize, Clone)]
pub struct ServerSettings {
    pub host: String,
    pub port: u16,
    pub public_url: String,
}

#[derive(Deserialize, Clone)]
pub struct DatabaseSettings {
    pub url: String,
}

#[derive(Deserialize, Clone)]
pub struct RedisSettings {
    pub url: String,
}

#[derive(Deserialize, Clone)]
pub struct JwtSettings {
    pub secret: String,
    pub expiration_hours: u64,
}

#[derive(Deserialize, Clone)]
pub struct CertificateSettings {
    pub dir: String,
}

impl Settings {
    pub fn load() -> Result<Self, config::ConfigError> {
        dotenvy::dotenv().ok();

        let builder = config::Config::builder()
            .add_source(config::Environment::default().separator("__"))
            .build()?;

        builder.try_deserialize()
    }
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            server: ServerSettings {
                host: "0.0.0.0".to_string(),
                port: 8000,
                public_url: "http://localhost:3000".to_string(),
            },
            database: DatabaseSettings {
                url: "postgres://cybersim_user:cybersim_password@localhost:5432/cybersim".to_string(),
            },
            redis: RedisSettings {
                url: "redis://localhost:6379".to_string(),
            },
            jwt: JwtSettings {
                secret: "G46rj7bHah2ew44loQBbjofixViepXTuJj0j6B7R6nQ".to_string(),
                expiration_hours: 168,
            },
            certificates: CertificateSettings {
                dir: "./certificates".to_string(),
            },
        }
    }
}
