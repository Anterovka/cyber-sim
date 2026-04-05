use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::state::AppState;

#[derive(Serialize, sqlx::FromRow)]
pub struct ScenarioResponse {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub location: String,
    #[serde(rename = "attackType")]
    pub attack_type: String,
    pub difficulty: i32,
    pub steps: serde_json::Value,
}

pub async fn list_scenarios(
    State(state): State<AppState>,
) -> Result<Json<Vec<ScenarioResponse>>, StatusCode> {
    let scenarios: Vec<ScenarioResponse> = sqlx::query_as(
        "SELECT id, title, description, location, attack_type, difficulty, steps
         FROM scenarios WHERE is_active = true ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("List scenarios error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(scenarios))
}

pub async fn get_scenario(
    State(state): State<AppState>,
    Path(scenario_id): Path<Uuid>,
) -> Result<Json<ScenarioResponse>, StatusCode> {
    let scenario: Option<ScenarioResponse> = sqlx::query_as(
        "SELECT id, title, description, location, attack_type, difficulty, steps
         FROM scenarios WHERE id = $1 AND is_active = true"
    )
    .bind(scenario_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Get scenario error: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    match scenario {
        Some(s) => Ok(Json(s)),
        None => Err(StatusCode::NOT_FOUND),
    }
}
