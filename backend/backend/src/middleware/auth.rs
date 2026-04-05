use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use uuid::Uuid;
use crate::state::AppState;
use crate::services::jwt::verify_token;

#[derive(Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
    pub username: String,
    pub role: String,
}

fn extract_bearer_token(request: &Request) -> Result<String, StatusCode> {
    let auth_header = request
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let auth_str = auth_header
        .to_str()
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    if !auth_str.starts_with("Bearer ") {
        return Err(StatusCode::UNAUTHORIZED);
    }

    Ok(auth_str[7..].to_string())
}

pub async fn auth_middleware(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let token = extract_bearer_token(&request)?;

    let claims = verify_token(&token, &state.settings.jwt.secret)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;


    let role: String = sqlx::query_scalar("SELECT role FROM users WHERE id = $1")
        .bind(claims.sub)
        .fetch_one(&state.db)
        .await
        .unwrap_or_else(|_| "user".to_string());

    let auth_user = AuthUser {
        user_id: claims.sub,
        username: claims.username,
        role,
    };

    let mut request = request;
    request.extensions_mut().insert(auth_user);

    Ok(next.run(request).await)
}

pub async fn admin_middleware(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let token = extract_bearer_token(&request)?;

    let claims = verify_token(&token, &state.settings.jwt.secret)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    let role: String = sqlx::query_scalar("SELECT role FROM users WHERE id = $1")
        .bind(claims.sub)
        .fetch_one(&state.db)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    if role != "admin" {
        return Err(StatusCode::FORBIDDEN);
    }

    let auth_user = AuthUser {
        user_id: claims.sub,
        username: claims.username,
        role,
    };

    let mut request = request;
    request.extensions_mut().insert(auth_user);

    Ok(next.run(request).await)
}
