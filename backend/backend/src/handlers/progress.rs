use axum::{
    extract::{State, Path, Extension},
    Json,
};
use utoipa::ToSchema;
use chrono::{Utc, Datelike};
use std::collections::HashMap;
use crate::state::AppState;
use crate::models::request::ScenarioCompleteRequest;
use crate::models::response::{
    ProgressResponse, CompletedScenarioResponse, StatisticsResponse,
    AttackTypeStatResponse, WeeklyActivityResponse,
};
use crate::middleware::auth::AuthUser;
use crate::error::AppError;

pub fn calculate_league(score: i32) -> &'static str {
    match score {
        s if s >= 1000 => "expert",
        s if s >= 500 => "advanced",
        s if s >= 200 => "intermediate",
        _ => "beginner",
    }
}

pub fn calculate_security_level(total_mistakes: i32, streak: i32) -> i32 {
    let base = 100;
    let penalty = total_mistakes * 10;
    let bonus = streak * 5;
    (base - penalty + bonus).clamp(0, 100)
}

pub fn calculate_streak(records: &[CompletedScenarioResponse]) -> i32 {
    let mut streak = 0;
    for record in records.iter().rev() {
        if record.mistakes == 0 {
            streak += 1;
        } else {
            break;
        }
    }
    streak
}

/// Получить прогресс пользователя
#[utoipa::path(
    get,
    path = "/api/v1/progress",
    tag = "progress",
    security(("bearer_auth" = [])),
    responses(
        (status = 200, description = "Прогресс пользователя", body = ProgressResponse),
        (status = 401, description = "Неавторизован", body = serde_json::Value),
    )
)]
pub async fn get_progress(
    Extension(auth_user): Extension<AuthUser>,
    State(state): State<AppState>,
) -> Result<Json<ProgressResponse>, AppError> {
    let db_user: Option<(i32, String)> = sqlx::query_as(
        "SELECT total_score, league FROM users WHERE id = $1"
    )
    .bind(auth_user.user_id)
    .fetch_optional(&state.db)
    .await?;

    let db_user = db_user.ok_or_else(|| AppError::NotFound("Пользователь не найден".to_string()))?;

    let progress_records: Vec<(String, i32, i32, i32, chrono::DateTime<Utc>)> = sqlx::query_as(
        "SELECT scenario_id, score, mistakes, time_spent_seconds, completed_at FROM user_progress WHERE user_id = $1 ORDER BY completed_at ASC"
    )
    .bind(auth_user.user_id)
    .fetch_all(&state.db)
    .await?;

    let completed_scenarios: Vec<CompletedScenarioResponse> = progress_records
        .iter()
        .map(|r| CompletedScenarioResponse {
            scenario_id: r.0.clone(),
            completed_at: r.4,
            score: r.1,
            mistakes: r.2,
            time_spent_seconds: r.3,
        })
        .collect();

    let attack_stats: Vec<(String, i32, i32)> = sqlx::query_as(
        "SELECT attack_type, encountered, successfully_defended FROM attack_type_stats WHERE user_id = $1"
    )
    .bind(auth_user.user_id)
    .fetch_all(&state.db)
    .await?;

    let attack_type_stats: HashMap<String, AttackTypeStatResponse> = attack_stats
        .iter()
        .map(|a| (
            a.0.clone(),
            AttackTypeStatResponse {
                encountered: a.1,
                successfully_defended: a.2,
            }
        ))
        .collect();

    let all_attack_types = vec![
        "phishing", "skimming", "brute_force", "social_engineering",
        "deepfake", "malware", "man_in_the_middle",
    ];
    let mut full_attack_stats: HashMap<String, AttackTypeStatResponse> = all_attack_types
        .iter()
        .map(|t| (t.to_string(), AttackTypeStatResponse { encountered: 0, successfully_defended: 0 }))
        .collect();
    full_attack_stats.extend(attack_type_stats);

    let total_scenarios_completed = completed_scenarios.len();
    let total_mistakes: i32 = completed_scenarios.iter().map(|c| c.mistakes).sum();
    let success_rate = if total_scenarios_completed > 0 {
        ((total_scenarios_completed as i32 - total_mistakes) as f64 / total_scenarios_completed as f64) * 100.0
    } else {
        0.0
    };

    let streak = calculate_streak(&completed_scenarios);
    let security_level = calculate_security_level(total_mistakes, streak);
    let weekly_activity = generate_weekly_activity(&completed_scenarios);

    Ok(Json(ProgressResponse {
        user_id: auth_user.user_id,
        completed_scenarios,
        total_score: db_user.0,
        league: db_user.1,
        security_level,
        streak,
        statistics: StatisticsResponse {
            total_scenarios_completed,
            total_mistakes,
            success_rate,
            attack_type_stats: full_attack_stats,
            weekly_activity,
        },
    }))
}

/// Завершить сценарий и сохранить результат
#[utoipa::path(
    post,
    path = "/api/v1/progress/scenarios/{id}/complete",
    tag = "progress",
    security(("bearer_auth" = [])),
    params(
        ("id" = String, Path, description = "ID сценария")
    ),
    request_body = ScenarioCompleteRequest,
    responses(
        (status = 200, description = "Результат сохранён", body = ProgressResponse),
        (status = 401, description = "Неавторизован", body = serde_json::Value),
    )
)]
pub async fn complete_scenario(
    Extension(auth_user): Extension<AuthUser>,
    State(state): State<AppState>,
    Path(scenario_id): Path<String>,
    Json(req): Json<ScenarioCompleteRequest>,
) -> Result<Json<ProgressResponse>, AppError> {
    sqlx::query(
        "INSERT INTO user_progress (user_id, scenario_id, score, mistakes, time_spent_seconds) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, scenario_id) DO UPDATE SET score = EXCLUDED.score, mistakes = EXCLUDED.mistakes, time_spent_seconds = EXCLUDED.time_spent_seconds, completed_at = NOW()"
    )
    .bind(auth_user.user_id)
    .bind(&scenario_id)
    .bind(req.score)
    .bind(req.mistakes)
    .bind(req.time_spent_seconds)
    .execute(&state.db)
    .await?;

    let attack_type = extract_attack_type(&scenario_id);
    let successfully_defended = if req.mistakes == 0 { 1 } else { 0 };
    sqlx::query(
        "INSERT INTO attack_type_stats (user_id, attack_type, encountered, successfully_defended) VALUES ($1, $2, 1, $3) ON CONFLICT (user_id, attack_type) DO UPDATE SET encountered = attack_type_stats.encountered + 1, successfully_defended = attack_type_stats.successfully_defended + $3"
    )
    .bind(auth_user.user_id)
    .bind(&attack_type)
    .bind(successfully_defended)
    .execute(&state.db)
    .await?;

    let new_total_score: i32 = sqlx::query_scalar(
        "UPDATE users SET total_score = total_score + $1, updated_at = NOW() WHERE id = $2 RETURNING total_score"
    )
    .bind(req.score)
    .bind(auth_user.user_id)
    .fetch_one(&state.db)
    .await?;

    let new_league = calculate_league(new_total_score);

    sqlx::query(
        "UPDATE users SET league = $1 WHERE id = $2"
    )
    .bind(&new_league)
    .bind(auth_user.user_id)
    .execute(&state.db)
    .await?;

    get_progress(
        Extension(auth_user),
        State(state),
    ).await
}

fn extract_attack_type(scenario_id: &str) -> String {
    if scenario_id.contains("phish") { "phishing".to_string() }
    else if scenario_id.contains("skim") { "skimming".to_string() }
    else if scenario_id.contains("brute") { "brute_force".to_string() }
    else if scenario_id.contains("social") { "social_engineering".to_string() }
    else if scenario_id.contains("deepfake") { "deepfake".to_string() }
    else if scenario_id.contains("malware") { "malware".to_string() }
    else if scenario_id.contains("mitm") || scenario_id.contains("man_in") { "man_in_the_middle".to_string() }
    else { "phishing".to_string() }
}

fn generate_weekly_activity(records: &[CompletedScenarioResponse]) -> Vec<WeeklyActivityResponse> {
    let mut weekly_map: HashMap<String, (i64, i64)> = HashMap::new();

    for record in records {
        let week = format!("{}-W{:02}", record.completed_at.year(), record.completed_at.iso_week().week());
        let entry = weekly_map.entry(week).or_insert((0, 0));
        entry.0 += 1;
        entry.1 += record.score as i64;
    }

    let mut weekly_activity: Vec<WeeklyActivityResponse> = weekly_map
        .into_iter()
        .map(|(week, (count, total_score))| WeeklyActivityResponse {
            week,
            scenarios_completed: count,
            average_score: if count > 0 { total_score as f64 / count as f64 } else { 0.0 },
        })
        .collect();

    weekly_activity.sort_by(|a, b| a.week.cmp(&b.week));
    weekly_activity
}
