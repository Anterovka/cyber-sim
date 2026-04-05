use serde::{Serialize, Deserialize};
use utoipa::ToSchema;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Serialize, Clone, ToSchema)]
pub struct UserResponse {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub league: String,
    pub role: String,
    #[serde(rename = "totalScore")]
    pub total_score: i32,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, ToSchema)]
pub struct AuthResponse {
    pub user: UserResponse,
    pub token: String,
}

#[derive(Serialize, ToSchema)]
pub struct CompletedScenarioResponse {
    #[serde(rename = "scenarioId")]
    pub scenario_id: String,
    #[serde(rename = "completedAt")]
    pub completed_at: DateTime<Utc>,
    pub score: i32,
    pub mistakes: i32,
    #[serde(rename = "timeSpentSeconds")]
    pub time_spent_seconds: i32,
}

#[derive(Serialize, ToSchema)]
pub struct AttackTypeStatResponse {
    pub encountered: i32,
    #[serde(rename = "successfullyDefended")]
    pub successfully_defended: i32,
}

#[derive(Serialize, ToSchema)]
pub struct WeeklyActivityResponse {
    pub week: String,
    #[serde(rename = "scenariosCompleted")]
    pub scenarios_completed: i64,
    #[serde(rename = "averageScore")]
    pub average_score: f64,
}

#[derive(Serialize, ToSchema)]
pub struct StatisticsResponse {
    #[serde(rename = "totalScenariosCompleted")]
    pub total_scenarios_completed: usize,
    #[serde(rename = "totalMistakes")]
    pub total_mistakes: i32,
    #[serde(rename = "successRate")]
    pub success_rate: f64,
    #[serde(rename = "attackTypeStats")]
    pub attack_type_stats: std::collections::HashMap<String, AttackTypeStatResponse>,
    #[serde(rename = "weeklyActivity")]
    pub weekly_activity: Vec<WeeklyActivityResponse>,
}

#[derive(Serialize, ToSchema)]
pub struct ProgressResponse {
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    #[serde(rename = "completedScenarios")]
    pub completed_scenarios: Vec<CompletedScenarioResponse>,
    #[serde(rename = "totalScore")]
    pub total_score: i32,
    pub league: String,
    #[serde(rename = "securityLevel")]
    pub security_level: i32,
    pub streak: i32,
    pub statistics: StatisticsResponse,
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
pub struct LeaderboardEntry {
    pub rank: i64,
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    pub username: String,
    pub league: String,
    #[serde(rename = "totalScore")]
    pub total_score: i32,
    #[serde(rename = "scenariosCompleted")]
    pub scenarios_completed: i64,
}

#[derive(Serialize, Clone, ToSchema)]
pub struct CertificateResponse {
    pub id: Uuid,
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    #[serde(rename = "issuedAt")]
    pub issued_at: DateTime<Utc>,
    pub league: String,
    #[serde(rename = "finalScore")]
    pub final_score: i32,
    #[serde(rename = "qrCodeUrl")]
    pub qr_code_url: String,
}

#[derive(Serialize, ToSchema)]
pub struct VerifyResponse {
    pub valid: bool,
    #[serde(rename = "userId")]
    pub user_id: Option<Uuid>,
    pub username: Option<String>,
    pub league: Option<String>,
    pub score: Option<i32>,
    #[serde(rename = "issuedAt")]
    pub issued_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}
