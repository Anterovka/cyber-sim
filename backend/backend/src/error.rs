use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Redis error: {0}")]
    Redis(#[from] redis::RedisError),

    #[error("JWT error: {0}")]
    Jwt(#[from] jsonwebtoken::errors::Error),

    #[error("Password hash error: {0}")]
    PasswordHash(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Internal error: {0}")]
    Internal(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Image error: {0}")]
    Image(String),
}

impl axum::response::IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match &self {
            AppError::Validation(msg) => (axum::http::StatusCode::BAD_REQUEST, msg.clone()),
            AppError::NotFound(msg) => (axum::http::StatusCode::NOT_FOUND, msg.clone()),
            AppError::Conflict(msg) => (axum::http::StatusCode::CONFLICT, msg.clone()),
            AppError::Unauthorized(msg) => (axum::http::StatusCode::UNAUTHORIZED, msg.clone()),
            AppError::Database(_) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string()),
            AppError::Redis(_) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Redis error".to_string()),
            AppError::Jwt(_) => (axum::http::StatusCode::UNAUTHORIZED, "Invalid token".to_string()),
            AppError::PasswordHash(_) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Password hash error".to_string()),
            AppError::Internal(msg) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
            AppError::Io(_) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "IO error".to_string()),
            AppError::Image(_) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Image generation error".to_string()),
        };

        let body = serde_json::json!({
            "message": message,
        });

        (status, axum::Json(body)).into_response()
    }
}
