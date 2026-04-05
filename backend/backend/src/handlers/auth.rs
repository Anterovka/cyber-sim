use axum::{
    extract::{State, Extension},
    Json,
    http::StatusCode,
};
use utoipa::ToSchema;
use validator::Validate;
use uuid::Uuid;
use chrono::Utc;
use crate::state::AppState;
use crate::models::request::RegisterRequest;
use crate::models::response::{UserResponse, AuthResponse};
use crate::services::password::{hash_password, verify_password};
use crate::services::jwt::generate_token;
use crate::middleware::auth::AuthUser;
use crate::error::AppError;

#[utoipa::path(
    post,
    path = "/api/v1/auth/register",
    tag = "auth",
    request_body = RegisterRequest,
    responses(
        (status = 201, description = "Пользователь успешно зарегистрирован", body = AuthResponse),
        (status = 400, description = "Ошибка валидации", body = serde_json::Value),
        (status = 409, description = "Пользователь уже существует", body = serde_json::Value),
    )
)]
pub async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), AppError> {
    req.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    if !req.validate_username_format() {
        return Err(AppError::Validation("Неверный формат username".to_string()));
    }

    let existing: Option<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM users WHERE username = $1"
    )
    .bind(&req.username)
    .fetch_optional(&state.db)
    .await?;

    if existing.is_some() {
        return Err(AppError::Conflict("Пользователь уже существует".to_string()));
    }

    let password_hash = hash_password(&req.password)?;
    let email = req.email.unwrap_or_else(|| format!("{}@cybersim.local", req.username));

    let row: (Uuid,) = sqlx::query_as(
        "INSERT INTO users (username, email, password_hash, league, total_score, role) VALUES ($1, $2, $3, 'beginner', 0, 'user') RETURNING id"
    )
    .bind(&req.username)
    .bind(&email)
    .bind(&password_hash)
    .fetch_one(&state.db)
    .await?;

    let user_id = row.0;
    let token = generate_token(user_id, &req.username, &state.settings.jwt.secret, state.settings.jwt.expiration_hours)?;

    let now = Utc::now();
    let user_response = UserResponse {
        id: user_id,
        username: req.username,
        email,
        league: "beginner".to_string(),
        role: "user".to_string(),
        total_score: 0,
        created_at: now,
    };

    Ok((StatusCode::CREATED, Json(AuthResponse {
        user: user_response,
        token,
    })))
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/login",
    tag = "auth",
    request_body = crate::models::request::LoginRequest,
    responses(
        (status = 200, description = "Успешный вход", body = AuthResponse),
        (status = 401, description = "Неверный логин или пароль", body = serde_json::Value),
    )
)]
pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<crate::models::request::LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let user: Option<(Uuid, String, String, String, String, String, i32, chrono::DateTime<Utc>)> = sqlx::query_as(
        "SELECT id, username, email, password_hash, role, league, total_score, created_at FROM users WHERE username = $1"
    )
    .bind(&req.username)
    .fetch_optional(&state.db)
    .await?;

    let user = user.ok_or_else(|| AppError::Unauthorized("Неверный логин или пароль".to_string()))?;

    let password_valid = verify_password(&req.password, &user.3)?;
    if !password_valid {
        return Err(AppError::Unauthorized("Неверный логин или пароль".to_string()));
    }

    let token = generate_token(user.0, &user.1, &state.settings.jwt.secret, state.settings.jwt.expiration_hours)?;

    let user_response = UserResponse {
        id: user.0,
        username: user.1,
        email: user.2,
        league: user.5,
        role: user.4,
        total_score: user.6,
        created_at: user.7,
    };

    Ok(Json(AuthResponse {
        user: user_response,
        token,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/auth/me",
    tag = "auth",
    security(("bearer_auth" = [])),
    responses(
        (status = 200, description = "Информация о пользователе", body = UserResponse),
        (status = 401, description = "Неавторизован", body = serde_json::Value),
    )
)]
pub async fn me(
    Extension(auth_user): Extension<AuthUser>,
    State(state): State<AppState>,
) -> Result<Json<UserResponse>, AppError> {
    let db_user: Option<(Uuid, String, String, String, String, i32, chrono::DateTime<Utc>)> = sqlx::query_as(
        "SELECT id, username, email, league, role, total_score, created_at FROM users WHERE id = $1"
    )
    .bind(auth_user.user_id)
    .fetch_optional(&state.db)
    .await?;

    let db_user = db_user.ok_or_else(|| AppError::NotFound("Пользователь не найден".to_string()))?;

    Ok(Json(UserResponse {
        id: db_user.0,
        username: db_user.1,
        email: db_user.2,
        league: db_user.3,
        role: db_user.4,
        total_score: db_user.5,
        created_at: db_user.6,
    }))
}
