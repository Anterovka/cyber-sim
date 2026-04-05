use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use validator::Validate;
use once_cell::sync::Lazy;
use regex::Regex;

static USERNAME_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"^[a-zA-Z0-9_]{3,50}$").unwrap());

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct RegisterRequest {
    #[validate(length(min = 3, max = 50))]
    #[schema(example = "cyberuser")]
    pub username: String,
    #[validate(length(min = 6))]
    #[schema(example = "securepass123")]
    pub password: String,
    #[schema(example = "user@example.com", nullable)]
    pub email: Option<String>,
}

impl RegisterRequest {
    pub fn validate_username_format(&self) -> bool {
        USERNAME_REGEX.is_match(&self.username)
    }
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct LoginRequest {
    #[schema(example = "cyberuser")]
    pub username: String,
    #[schema(example = "securepass123")]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct ScenarioCompleteRequest {
    #[schema(example = 100)]
    pub score: i32,
    #[schema(example = 0)]
    pub mistakes: i32,
    #[serde(rename = "timeSpentSeconds")]
    #[schema(example = 120)]
    pub time_spent_seconds: i32,
}
