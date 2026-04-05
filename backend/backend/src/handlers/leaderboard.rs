use axum::{
    extract::{State, Query},
    Json,
};
use serde::Deserialize;
use utoipa::ToSchema;
use uuid::Uuid;
use crate::state::AppState;
use crate::models::response::LeaderboardEntry;
use crate::error::AppError;

#[derive(Deserialize, ToSchema, utoipa::IntoParams)]
pub struct LeaderboardQuery {
    #[schema(default = 50)]
    limit: Option<i64>,
}

#[utoipa::path(
    get,
    path = "/api/v1/leaderboard",
    tag = "leaderboard",
    params(
        LeaderboardQuery
    ),
    responses(
        (status = 200, description = "Список лидеров", body = Vec<LeaderboardEntry>),
    )
)]
pub async fn get_leaderboard(
    State(state): State<AppState>,
    Query(query): Query<LeaderboardQuery>,
) -> Result<Json<Vec<LeaderboardEntry>>, AppError> {
    let limit = query.limit.unwrap_or(50);

    let cache_key = format!("leaderboard:{}", limit);
    let cached: Option<String> = redis::cmd("GET")
        .arg(&cache_key)
        .query_async(&mut state.redis.clone())
        .await
        .ok();

    if let Some(cached_data) = cached {
        let entries: Vec<LeaderboardEntry> = serde_json::from_str(&cached_data)
            .unwrap_or_default();
        if !entries.is_empty() {
            return Ok(Json(entries));
        }
    }

    let records: Vec<(Uuid, String, String, i32, i64)> = sqlx::query_as(
        "SELECT u.id, u.username, u.league, u.total_score, COUNT(up.id)::bigint AS scenarios_completed FROM users u LEFT JOIN user_progress up ON u.id = up.user_id GROUP BY u.id ORDER BY u.total_score DESC LIMIT $1"
    )
    .bind(limit)
    .fetch_all(&state.db)
    .await?;

    let entries: Vec<LeaderboardEntry> = records
        .iter()
        .enumerate()
        .map(|(i, r)| LeaderboardEntry {
            rank: (i + 1) as i64,
            user_id: r.0,
            username: r.1.clone(),
            league: r.2.clone(),
            total_score: r.3,
            scenarios_completed: r.4,
        })
        .collect();

    let cache_data = serde_json::to_string(&entries).unwrap_or_default();
    let _: Result<String, _> = redis::cmd("SET")
        .arg(&cache_key)
        .arg(&cache_data)
        .arg("EX")
        .arg(300)
        .query_async(&mut state.redis.clone())
        .await;

    Ok(Json(entries))
}
