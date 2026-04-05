use sqlx::PgPool;
use redis::aio::ConnectionManager;
use crate::config::Settings;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: ConnectionManager,
    pub settings: Settings,
}
