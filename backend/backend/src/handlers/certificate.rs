use axum::{
    extract::{State, Path, Extension},
    Json,
    http::StatusCode,
    body::Body,
    response::IntoResponse,
};
use utoipa::ToSchema;
use uuid::Uuid;
use chrono::Utc;
use crate::state::AppState;
use crate::models::response::{CertificateResponse, VerifyResponse};
use crate::middleware::auth::AuthUser;
use crate::services::qr_code::generate_qr_code;
use crate::error::AppError;

#[utoipa::path(
    post,
    path = "/api/v1/certificates",
    tag = "certificates",
    security(("bearer_auth" = [])),
    responses(
        (status = 201, description = "Сертификат создан", body = CertificateResponse),
        (status = 400, description = "Необходимо пройти хотя бы один сценарий", body = serde_json::Value),
        (status = 401, description = "Неавторизован", body = serde_json::Value),
    )
)]
pub async fn create_certificate(
    Extension(auth_user): Extension<AuthUser>,
    State(state): State<AppState>,
) -> Result<(StatusCode, Json<CertificateResponse>), AppError> {
    let db_user: Option<(Uuid, String, String, i32)> = sqlx::query_as(
        "SELECT id, username, league, total_score FROM users WHERE id = $1"
    )
    .bind(auth_user.user_id)
    .fetch_optional(&state.db)
    .await?;

    let db_user = db_user.ok_or_else(|| AppError::NotFound("Пользователь не найден".to_string()))?;

    if db_user.3 <= 0 {
        return Err(AppError::Validation(
            "Необходимо пройти хотя бы один сценарий".to_string()
        ));
    }

    sqlx::query(
        "UPDATE certificates SET is_valid = false WHERE user_id = $1"
    )
    .bind(auth_user.user_id)
    .execute(&state.db)
    .await?;

    let qr_path = generate_qr_code(
        auth_user.user_id,
        &db_user.1,
        &db_user.2,
        db_user.3,
        &state.settings.certificates.dir,
        &state.settings.server.public_url,
    )?;

    let cert_id: Uuid = sqlx::query_scalar(
        "INSERT INTO certificates (user_id, league, final_score, qr_code_path, is_valid) VALUES ($1, $2, $3, $4, true) RETURNING id"
    )
    .bind(auth_user.user_id)
    .bind(&db_user.2)
    .bind(db_user.3)
    .bind(&qr_path)
    .fetch_one(&state.db)
    .await?;

    let qr_code_url = format!("/api/v1/certificates/{}/qr.png", cert_id);

    let now = Utc::now();
    Ok((StatusCode::CREATED, Json(CertificateResponse {
        id: cert_id,
        user_id: auth_user.user_id,
        issued_at: now,
        league: db_user.2,
        final_score: db_user.3,
        qr_code_url,
    })))
}

#[utoipa::path(
    get,
    path = "/api/v1/certificates",
    tag = "certificates",
    security(("bearer_auth" = [])),
    responses(
        (status = 200, description = "Список сертификатов", body = Vec<CertificateResponse>),
        (status = 401, description = "Неавторизован", body = serde_json::Value),
    )
)]
pub async fn get_certificates(
    Extension(auth_user): Extension<AuthUser>,
    State(state): State<AppState>,
) -> Result<Json<Vec<CertificateResponse>>, AppError> {
    let records: Vec<(Uuid, Uuid, chrono::DateTime<Utc>, String, i32, Option<String>)> = sqlx::query_as(
        "SELECT id, user_id, issued_at, league, final_score, qr_code_path FROM certificates WHERE user_id = $1 AND is_valid = true ORDER BY issued_at DESC"
    )
    .bind(auth_user.user_id)
    .fetch_all(&state.db)
    .await?;

    let certificates = records
        .iter()
        .map(|r| {
            let qr_code_url = r.5.as_ref().map_or_else(
                || "".to_string(),
                |_| format!("/api/v1/certificates/{}/qr.png", r.0),
            );
            CertificateResponse {
                id: r.0,
                user_id: r.1,
                issued_at: r.2,
                league: r.3.clone(),
                final_score: r.4,
                qr_code_url,
            }
        })
        .collect();

    Ok(Json(certificates))
}

#[utoipa::path(
    get,
    path = "/api/v1/certificates/{id}/qr.png",
    tag = "certificates",
    params(
        ("id" = Uuid, Path, description = "ID сертификата")
    ),
    responses(
        (status = 200, description = "PNG изображение QR-кода", content_type = "image/png"),
        (status = 404, description = "Сертификат не найден", body = serde_json::Value),
    )
)]
pub async fn get_qr_code(
    Path(cert_id): Path<Uuid>,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, AppError> {
    let qr_path: Option<String> = sqlx::query_scalar(
        "SELECT qr_code_path FROM certificates WHERE id = $1"
    )
    .bind(cert_id)
    .fetch_optional(&state.db)
    .await?;

    let qr_path = qr_path.ok_or_else(|| AppError::NotFound("Сертификат не найден".to_string()))?;

    let image_data = tokio::fs::read(&qr_path).await
        .map_err(|_| AppError::NotFound("Файл QR-кода не найден".to_string()))?;

    Ok((
        StatusCode::OK,
        [(axum::http::header::CONTENT_TYPE, "image/png")],
        Body::from(image_data),
    ))
}

#[utoipa::path(
    get,
    path = "/api/v1/verify/{user_id}/{score}",
    tag = "certificates",
    params(
        ("user_id" = Uuid, Path, description = "ID пользователя"),
        ("score" = i32, Path, description = "Итоговый счёт")
    ),
    responses(
        (status = 200, description = "Результат верификации", body = VerifyResponse),
    )
)]
pub async fn verify_certificate(
    Path((user_id_str, score_str)): Path<(String, String)>,
    State(state): State<AppState>,
) -> Result<Json<VerifyResponse>, AppError> {
    let user_id = Uuid::parse_str(&user_id_str)
        .map_err(|_| AppError::Validation("Неверный формат user_id".to_string()))?;

    let score = score_str.parse::<i32>()
        .map_err(|_| AppError::Validation("Неверный формат score".to_string()))?;

    let cert: Option<(Uuid, Uuid, chrono::DateTime<Utc>, String, i32, String)> = sqlx::query_as(
        "SELECT c.id, c.user_id, c.issued_at, c.league, c.final_score, u.username FROM certificates c JOIN users u ON c.user_id = u.id WHERE c.user_id = $1 AND c.final_score = $2 AND c.is_valid = true"
    )
    .bind(user_id)
    .bind(score)
    .fetch_optional(&state.db)
    .await?;

    match cert {
        Some(c) => Ok(Json(VerifyResponse {
            valid: true,
            user_id: Some(c.1),
            username: Some(c.5),
            league: Some(c.3),
            score: Some(c.4),
            issued_at: Some(c.2),
            message: None,
        })),
        None => Ok(Json(VerifyResponse {
            valid: false,
            user_id: None,
            username: None,
            league: None,
            score: None,
            issued_at: None,
            message: Some("Сертификат не найден".to_string()),
        })),
    }
}
