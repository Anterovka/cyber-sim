use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use chrono::Utc;
use uuid::Uuid;
use crate::error::AppError;

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub username: String,
    pub exp: usize,
    pub iat: usize,
}

pub fn generate_token(user_id: Uuid, username: &str, secret: &str, expiration_hours: u64) -> Result<String, AppError> {
    let now = Utc::now();
    let exp = now + chrono::Duration::hours(expiration_hours as i64);

    let claims = Claims {
        sub: user_id,
        username: username.to_string(),
        exp: exp.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::Jwt(e))?;

    Ok(token)
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    let mut validation = Validation::default();
    validation.leeway = 0;

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )
    .map_err(|e| AppError::Jwt(e))?;

    Ok(token_data.claims)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_and_verify_token() {
        let secret = "test-secret-key-min-32-chars-long";
        let user_id = Uuid::new_v4();
        let username = "testuser";

        let token = generate_token(user_id, username, secret, 24).unwrap();
        let claims = verify_token(&token, secret).unwrap();

        assert_eq!(claims.sub, user_id);
        assert_eq!(claims.username, username);
    }
}
