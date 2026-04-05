use axum::{
    extract::{Path, Query, State, Extension},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::state::AppState;
use crate::middleware::auth::AuthUser;

#[derive(Serialize, sqlx::FromRow)]
pub struct AdminCertificateResponse {
    pub id: Uuid,
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    pub username: String,
    pub league: String,
    #[serde(rename = "finalScore")]
    pub final_score: i32,
    #[serde(rename = "issuedAt")]
    pub issued_at: DateTime<Utc>,
    #[serde(rename = "isValid")]
    pub is_valid: bool,
}

#[derive(Deserialize)]
pub struct CertificatesQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub search: Option<String>,
    #[serde(rename = "validOnly")]
    pub valid_only: Option<bool>,
}

#[derive(Serialize)]
pub struct PaginatedCertificatesResponse {
    pub certificates: Vec<AdminCertificateResponse>,
    pub total: i64,
    pub page: i64,
    #[serde(rename = "totalPages")]
    pub total_pages: i64,
}

pub async fn list_certificates(
    State(state): State<AppState>,
    Query(params): Query<CertificatesQuery>,
) -> Result<Json<PaginatedCertificatesResponse>, StatusCode> {
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;
    let valid_only = params.valid_only.unwrap_or(false);
    let search = params.search.unwrap_or_default();

    let valid_filter = if valid_only { "AND c.is_valid = true" } else { "" };

    let search_filter = if search.is_empty() {
        "".to_string()
    } else {
        "AND (u.username ILIKE $1 OR u.email ILIKE $1)".to_string()
    };

    let count_query = if search.is_empty() {
        if valid_only {
            "SELECT COUNT(*) FROM certificates c JOIN users u ON c.user_id = u.id WHERE c.is_valid = true"
        } else {
            "SELECT COUNT(*) FROM certificates c JOIN users u ON c.user_id = u.id"
        }
    } else {
        if valid_only {
            "SELECT COUNT(*) FROM certificates c JOIN users u ON c.user_id = u.id WHERE c.is_valid = true AND (u.username ILIKE $1 OR u.email ILIKE $1)"
        } else {
            "SELECT COUNT(*) FROM certificates c JOIN users u ON c.user_id = u.id WHERE (u.username ILIKE $1 OR u.email ILIKE $1)"
        }
    };

    let total: i64 = if search.is_empty() {
        sqlx::query_scalar(count_query)
            .fetch_one(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    } else {
        sqlx::query_scalar(count_query)
            .bind(format!("%{}%", search))
            .fetch_one(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    };

    let total_pages = (total as f64 / limit as f64).ceil() as i64;

    let data_query = format!(
        "SELECT c.id, c.user_id, u.username, c.league, c.final_score, c.issued_at, c.is_valid
         FROM certificates c
         JOIN users u ON c.user_id = u.id
         WHERE true {} {}
         ORDER BY c.issued_at DESC
         LIMIT $1 OFFSET $2",
        valid_filter, search_filter
    );

    let certificates: Vec<AdminCertificateResponse> = if search.is_empty() {
        sqlx::query_as(&data_query)
            .bind(limit)
            .bind(offset)
            .fetch_all(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    } else {
        sqlx::query_as(&data_query)
            .bind(format!("%{}%", search))
            .bind(limit)
            .bind(offset)
            .fetch_all(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    };

    Ok(Json(PaginatedCertificatesResponse {
        certificates,
        total,
        page,
        total_pages,
    }))
}

pub async fn delete_certificate(
    State(state): State<AppState>,
    Path(cert_id): Path<Uuid>,
    Extension(_auth): Extension<AuthUser>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query("DELETE FROM certificates WHERE id = $1")
        .bind(cert_id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
}

pub async fn revoke_certificate(
    State(state): State<AppState>,
    Path(cert_id): Path<Uuid>,
    Extension(_auth): Extension<AuthUser>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query("UPDATE certificates SET is_valid = false WHERE id = $1")
        .bind(cert_id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::OK)
}

#[derive(Deserialize)]
pub struct BulkOperationRequest {
    pub user_ids: Vec<Uuid>,
    pub operation: String,
    pub league: Option<String>,
    pub role: Option<String>,
}

#[derive(Serialize)]
pub struct BulkOperationResponse {
    pub success: i64,
    pub failed: i64,
    pub errors: Vec<String>,
}

#[axum::debug_handler]
pub async fn bulk_users_operation(
    State(state): State<AppState>,
    Extension(_auth): Extension<AuthUser>,
    Json(body): Json<BulkOperationRequest>,
) -> Result<Json<BulkOperationResponse>, StatusCode> {
    if body.user_ids.is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let mut success = 0i64;
    let mut failed = 0i64;
    let mut errors = Vec::new();

    match body.operation.as_str() {
        "delete" => {
            for user_id in &body.user_ids {
                match sqlx::query("DELETE FROM users WHERE id = $1")
                    .bind(user_id)
                    .execute(&state.db)
                    .await
                {
                    Ok(res) => {
                        if res.rows_affected() > 0 {
                            success += 1;
                        } else {
                            failed += 1;
                            errors.push(format!("User {} not found", user_id));
                        }
                    }
                    Err(e) => {
                        failed += 1;
                        errors.push(format!("Error deleting {}: {}", user_id, e));
                    }
                }
            }
        }
        "change_league" => {
            let league = body.league.as_ref().ok_or(StatusCode::BAD_REQUEST)?;
            for user_id in &body.user_ids {
                match sqlx::query("UPDATE users SET league = $1, updated_at = NOW() WHERE id = $2")
                    .bind(league)
                    .bind(user_id)
                    .execute(&state.db)
                    .await
                {
                    Ok(res) => {
                        if res.rows_affected() > 0 {
                            success += 1;
                        } else {
                            failed += 1;
                            errors.push(format!("User {} not found", user_id));
                        }
                    }
                    Err(e) => {
                        failed += 1;
                        errors.push(format!("Error updating {}: {}", user_id, e));
                    }
                }
            }
        }
        "change_role" => {
            let role = body.role.as_ref().ok_or(StatusCode::BAD_REQUEST)?;
            for user_id in &body.user_ids {
                match sqlx::query("UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2")
                    .bind(role)
                    .bind(user_id)
                    .execute(&state.db)
                    .await
                {
                    Ok(res) => {
                        if res.rows_affected() > 0 {
                            success += 1;
                        } else {
                            failed += 1;
                            errors.push(format!("User {} not found", user_id));
                        }
                    }
                    Err(e) => {
                        failed += 1;
                        errors.push(format!("Error updating {}: {}", user_id, e));
                    }
                }
            }
        }
        _ => return Err(StatusCode::BAD_REQUEST),
    }

    Ok(Json(BulkOperationResponse {
        success,
        failed,
        errors,
    }))
}

#[derive(Serialize, sqlx::FromRow)]
pub struct AdminUserResponse {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub league: String,
    pub role: String,
    #[serde(rename = "totalScore")]
    pub total_score: i32,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "scenariosCompleted")]
    pub scenarios_completed: i64,
}

#[derive(Deserialize)]
pub struct PaginationQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub search: Option<String>,
}

#[derive(Serialize)]
pub struct PaginatedUsersResponse {
    pub users: Vec<AdminUserResponse>,
    pub total: i64,
    pub page: i64,
    #[serde(rename = "totalPages")]
    pub total_pages: i64,
}

pub async fn list_users(
    State(state): State<AppState>,
    Query(params): Query<PaginationQuery>,
) -> Result<Json<PaginatedUsersResponse>, StatusCode> {
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;

    let search = params.search.unwrap_or_default();


    let total: i64 = if search.is_empty() {
        sqlx::query_scalar("SELECT COUNT(*) FROM users")
            .fetch_one(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    } else {
        sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE username ILIKE $1 OR email ILIKE $1")
            .bind(format!("%{}%", search))
            .fetch_one(&state.db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    };

    let total_pages = (total as f64 / limit as f64).ceil() as i64;


    let users: Vec<AdminUserResponse> = if search.is_empty() {
        sqlx::query_as(
            r#"
            SELECT
                u.id, u.username, u.email, u.league, u.role, u.total_score, u.created_at,
                COALESCE(COUNT(up.id), 0) as scenarios_completed
            FROM users u
            LEFT JOIN user_progress up ON u.id = up.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT $1 OFFSET $2
            "#,
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    } else {
        sqlx::query_as(
            r#"
            SELECT
                u.id, u.username, u.email, u.league, u.role, u.total_score, u.created_at,
                COALESCE(COUNT(up.id), 0) as scenarios_completed
            FROM users u
            LEFT JOIN user_progress up ON u.id = up.user_id
            WHERE u.username ILIKE $1 OR u.email ILIKE $1
            GROUP BY u.id
            ORDER BY u.created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(format!("%{}%", search))
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    };

    Ok(Json(PaginatedUsersResponse {
        users,
        total,
        page,
        total_pages,
    }))
}

pub async fn get_user(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
) -> Result<Json<AdminUserDetailResponse>, StatusCode> {
    let user: Option<AdminUserDetailResponse> = sqlx::query_as(
        r#"
        SELECT
            u.id, u.username, u.email, u.league, u.role, u.total_score, u.created_at,
            COALESCE(COUNT(DISTINCT up.id), 0) as scenarios_completed,
            COALESCE(SUM(up.score), 0) as total_scenario_score,
            COALESCE(SUM(up.mistakes), 0) as total_mistakes,
            COALESCE(SUM(up.time_spent_seconds), 0) as total_time_spent
        FROM users u
        LEFT JOIN user_progress up ON u.id = up.user_id
        WHERE u.id = $1
        GROUP BY u.id
        "#,
    )
    .bind(user_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match user {
        Some(u) => Ok(Json(u)),
        None => Err(StatusCode::NOT_FOUND),
    }
}

#[derive(Serialize, sqlx::FromRow)]
pub struct AdminUserDetailResponse {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub league: String,
    pub role: String,
    #[serde(rename = "totalScore")]
    pub total_score: i32,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "scenariosCompleted")]
    pub scenarios_completed: i64,
    #[serde(rename = "totalScenarioScore")]
    pub total_scenario_score: i64,
    #[serde(rename = "totalMistakes")]
    pub total_mistakes: i64,
    #[serde(rename = "totalTimeSpent")]
    pub total_time_spent: i64,
}

#[derive(Deserialize)]
pub struct UpdateUserRequest {
    pub league: Option<String>,
    pub role: Option<String>,
    #[serde(rename = "totalScore")]
    pub total_score: Option<i32>,
}

#[axum::debug_handler]
pub async fn update_user(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
    Extension(_auth): Extension<AuthUser>,
    Json(body): Json<UpdateUserRequest>,
) -> Result<Json<AdminUserResponse>, StatusCode> {
    let mut updates = Vec::new();
    let mut param_idx = 1i32;

    if let Some(ref league) = body.league {
        updates.push(format!("league = ${}", param_idx));
        param_idx += 1;
    }
    if let Some(ref role) = body.role {
        updates.push(format!("role = ${}", param_idx));
        param_idx += 1;
    }
    if let Some(score) = body.total_score {
        updates.push(format!("total_score = ${}", param_idx));
        param_idx += 1;
    }

    if updates.is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    updates.push(format!("updated_at = NOW()"));

    let query = format!(
        "UPDATE users SET {} WHERE id = ${} RETURNING id, username, email, league, role, total_score, created_at",
        updates.join(", "),
        param_idx
    );



    let user = match (body.league, body.role, body.total_score) {
        (Some(league), Some(role), Some(score)) => {
            sqlx::query_as(
                "UPDATE users SET league = $1, role = $2, total_score = $3, updated_at = NOW() WHERE id = $4 RETURNING id, username, email, league, role, total_score, created_at"
            )
            .bind(league).bind(role).bind(score).bind(user_id)
            .fetch_one(&state.db)
            .await
        }
        (Some(league), Some(role), None) => {
            sqlx::query_as(
                "UPDATE users SET league = $1, role = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email, league, role, total_score, created_at"
            )
            .bind(league).bind(role).bind(user_id)
            .fetch_one(&state.db)
            .await
        }
        (Some(league), None, Some(score)) => {
            sqlx::query_as(
                "UPDATE users SET league = $1, total_score = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email, league, role, total_score, created_at"
            )
            .bind(league).bind(score).bind(user_id)
            .fetch_one(&state.db)
            .await
        }
        (None, Some(role), Some(score)) => {
            sqlx::query_as(
                "UPDATE users SET role = $1, total_score = $2, updated_at = NOW() WHERE id = $3 RETURNING id, username, email, league, role, total_score, created_at"
            )
            .bind(role).bind(score).bind(user_id)
            .fetch_one(&state.db)
            .await
        }
        (Some(league), None, None) => {
            sqlx::query_as(
                "UPDATE users SET league = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, league, role, total_score, created_at"
            )
            .bind(league).bind(user_id)
            .fetch_one(&state.db)
            .await
        }
        (None, Some(role), None) => {
            sqlx::query_as(
                "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, league, role, total_score, created_at"
            )
            .bind(role).bind(user_id)
            .fetch_one(&state.db)
            .await
        }
        (None, None, Some(score)) => {
            sqlx::query_as(
                "UPDATE users SET total_score = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, league, role, total_score, created_at"
            )
            .bind(score).bind(user_id)
            .fetch_one(&state.db)
            .await
        }
        (None, None, None) => return Err(StatusCode::BAD_REQUEST),
    }.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;


    let scenarios_completed: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM user_progress WHERE user_id = $1"
    )
    .bind(user_id)
    .fetch_one(&state.db)
    .await
    .unwrap_or(0);

    Ok(Json(AdminUserResponse {
        scenarios_completed,
        ..user
    }))
}

pub async fn delete_user(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
    Extension(_auth): Extension<AuthUser>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(user_id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
}

#[derive(Serialize)]
pub struct AdminStatsResponse {
    #[serde(rename = "totalUsers")]
    pub total_users: i64,
    #[serde(rename = "totalScenarios")]
    pub total_scenarios: i64,
    #[serde(rename = "totalCertificates")]
    pub total_certificates: i64,
    #[serde(rename = "averageScore")]
    pub average_score: f64,
    #[serde(rename = "usersByLeague")]
    pub users_by_league: serde_json::Value,
    #[serde(rename = "recentRegistrations")]
    pub recent_registrations: Vec<RecentRegistration>,
    #[serde(rename = "topUsers")]
    pub top_users: Vec<TopUserEntry>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct RecentRegistration {
    pub id: Uuid,
    pub username: String,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct TopUserEntry {
    pub id: Uuid,
    pub username: String,
    pub league: String,
    #[serde(rename = "totalScore")]
    pub total_score: i32,
    #[serde(rename = "scenariosCompleted")]
    pub scenarios_completed: i64,
}

pub async fn get_stats(
    State(state): State<AppState>,
) -> Result<Json<AdminStatsResponse>, StatusCode> {
    let total_users: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(&state.db)
        .await.map_err(|e| { tracing::error!("total_users error: {:?}", e); StatusCode::INTERNAL_SERVER_ERROR })?;

    let total_scenarios: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM user_progress")
        .fetch_one(&state.db)
        .await.map_err(|e| { tracing::error!("total_scenarios error: {:?}", e); StatusCode::INTERNAL_SERVER_ERROR })?;

    let total_certificates: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM certificates")
        .fetch_one(&state.db)
        .await.map_err(|e| { tracing::error!("total_certificates error: {:?}", e); StatusCode::INTERNAL_SERVER_ERROR })?;

    let average_score: f64 = sqlx::query_scalar("SELECT COALESCE(AVG(total_score)::float8, 0) FROM users")
        .fetch_one(&state.db)
        .await.map_err(|e| { tracing::error!("average_score error: {:?}", e); StatusCode::INTERNAL_SERVER_ERROR })?;

    let users_by_league: Vec<(String, i64)> = sqlx::query_as(
        "SELECT COALESCE(league, 'unknown'), COUNT(*)::bigint FROM users GROUP BY league ORDER BY COUNT(*) DESC"
    )
    .fetch_all(&state.db)
    .await.map_err(|e| { tracing::error!("users_by_league error: {:?}", e); StatusCode::INTERNAL_SERVER_ERROR })?;

    let league_map: serde_json::Map<String, serde_json::Value> = users_by_league
        .into_iter()
        .map(|(league, count)| (league, serde_json::json!(count)))
        .collect();

    let recent_registrations: Vec<RecentRegistration> = sqlx::query_as(
        "SELECT id, username, created_at FROM users ORDER BY created_at DESC LIMIT 10"
    )
    .fetch_all(&state.db)
    .await.map_err(|e| { tracing::error!("recent_registrations error: {:?}", e); StatusCode::INTERNAL_SERVER_ERROR })?;

    let top_users: Vec<TopUserEntry> = sqlx::query_as(
        r#"
        SELECT
            u.id, u.username, u.league, u.total_score,
            COALESCE(COUNT(up.id), 0) as scenarios_completed
        FROM users u
        LEFT JOIN user_progress up ON u.id = up.user_id
        GROUP BY u.id
        ORDER BY u.total_score DESC
        LIMIT 10
        "#,
    )
    .fetch_all(&state.db)
    .await.map_err(|e| { tracing::error!("top_users error: {:?}", e); StatusCode::INTERNAL_SERVER_ERROR })?;

    Ok(Json(AdminStatsResponse {
        total_users,
        total_scenarios,
        total_certificates,
        average_score,
        users_by_league: serde_json::Value::Object(league_map),
        recent_registrations,
        top_users,
    }))
}

#[derive(Deserialize, Serialize)]
pub struct ScenarioImportStep {
    pub text: String,
    pub actions: Vec<ScenarioImportAction>,
}

#[derive(Deserialize, Serialize)]
pub struct ScenarioImportAction {
    pub id: String,
    pub text: String,
    pub is_correct: bool,
    pub consequence_on_fail: Option<String>,
    pub consequence_on_success: Option<String>,
    pub hint: Option<String>,
}

#[derive(Deserialize)]
pub struct ScenarioImportRequest {
    pub title: String,
    pub description: Option<String>,
    pub location: String,
    pub attack_type: String,
    pub difficulty: Option<i32>,
    pub steps: Vec<ScenarioImportStep>,
}

#[derive(Serialize)]
pub struct ScenarioImportResponse {
    pub id: Uuid,
    pub title: String,
    pub location: String,
    pub attack_type: String,
    pub difficulty: i32,
    pub steps_count: usize,
}

#[axum::debug_handler]
pub async fn import_scenario(
    State(state): State<AppState>,
    Extension(_auth): Extension<AuthUser>,
    Json(body): Json<ScenarioImportRequest>,
) -> Result<Json<ScenarioImportResponse>, StatusCode> {

    let valid_locations = ["office", "home", "public_wifi", "mobile", "cloud"];
    if !valid_locations.contains(&body.location.as_str()) {
        return Err(StatusCode::BAD_REQUEST);
    }


    let valid_attacks = [
        "phishing", "skimming", "brute_force", "social_engineering",
        "deepfake", "malware", "man_in_the_middle", "smishing", "ransomware",
    ];
    if !valid_attacks.contains(&body.attack_type.as_str()) {
        return Err(StatusCode::BAD_REQUEST);
    }

    let difficulty = body.difficulty.unwrap_or(1).clamp(1, 5);
    let steps_json = serde_json::to_value(&body.steps)
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    let description = body.description.unwrap_or_default();

    let id: Uuid = sqlx::query_scalar(
        "INSERT INTO scenarios (title, description, location, attack_type, difficulty, steps) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"
    )
    .bind(&body.title)
    .bind(&description)
    .bind(&body.location)
    .bind(&body.attack_type)
    .bind(difficulty)
    .bind(&steps_json)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Import scenario error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    tracing::info!("Imported scenario: {} (id={})", body.title, id);

    Ok(Json(ScenarioImportResponse {
        id,
        title: body.title,
        location: body.location,
        attack_type: body.attack_type,
        difficulty,
        steps_count: body.steps.len(),
    }))
}

pub async fn list_scenarios(
    State(state): State<AppState>,
    Query(params): Query<PaginationQuery>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;

    let total: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM scenarios")
        .fetch_one(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let scenarios: Vec<(Uuid, String, String, String, i32, i64, DateTime<Utc>)> = sqlx::query_as(
        "SELECT id, title, location, attack_type, difficulty, \
         (SELECT COUNT(*) FROM user_progress WHERE scenario_id = scenarios.id::text), \
         created_at \
         FROM scenarios ORDER BY created_at DESC LIMIT $1 OFFSET $2"
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let data: Vec<serde_json::Value> = scenarios.into_iter().map(|(id, title, location, attack_type, difficulty, completions, created_at)| {
        serde_json::json!({
            "id": id,
            "title": title,
            "location": location,
            "attackType": attack_type,
            "difficulty": difficulty,
            "completions": completions,
            "createdAt": created_at,
        })
    }).collect();

    Ok(Json(serde_json::json!({
        "scenarios": data,
        "total": total,
        "page": page,
        "totalPages": (total as f64 / limit as f64).ceil() as i64,
    })))
}

pub async fn delete_scenario(
    State(state): State<AppState>,
    Path(scenario_id): Path<Uuid>,
    Extension(_auth): Extension<AuthUser>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query("DELETE FROM scenarios WHERE id = $1")
        .bind(scenario_id)
        .execute(&state.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
}
