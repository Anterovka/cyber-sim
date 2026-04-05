use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use axum::Router;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "CyberSim API",
        description = "API для образовательного симулятора кибербезопасности",
        version = "1.0.0"
    ),
    paths(
        crate::handlers::auth::register,
        crate::handlers::auth::login,
        crate::handlers::auth::me,
        crate::handlers::progress::get_progress,
        crate::handlers::progress::complete_scenario,
        crate::handlers::leaderboard::get_leaderboard,
        crate::handlers::certificate::create_certificate,
        crate::handlers::certificate::get_certificates,
        crate::handlers::certificate::get_qr_code,
        crate::handlers::certificate::verify_certificate,
    ),
    components(
        schemas(
            crate::models::request::RegisterRequest,
            crate::models::request::LoginRequest,
            crate::models::request::ScenarioCompleteRequest,
            crate::models::response::UserResponse,
            crate::models::response::AuthResponse,
            crate::models::response::ProgressResponse,
            crate::models::response::CompletedScenarioResponse,
            crate::models::response::StatisticsResponse,
            crate::models::response::AttackTypeStatResponse,
            crate::models::response::WeeklyActivityResponse,
            crate::models::response::LeaderboardEntry,
            crate::models::response::CertificateResponse,
            crate::models::response::VerifyResponse,
        )
    ),
    tags(
        (name = "auth", description = "Аутентификация и регистрация"),
        (name = "progress", description = "Прогресс обучения"),
        (name = "leaderboard", description = "Таблица лидеров"),
        (name = "certificates", description = "Сертификаты и верификация"),
    ),
    modifiers(&SecurityAddon),
)]
pub struct ApiDoc;

struct SecurityAddon;

impl utoipa::Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "bearer_auth",
                utoipa::openapi::security::SecurityScheme::Http(
                    utoipa::openapi::security::HttpBuilder::new()
                        .scheme(utoipa::openapi::security::HttpAuthScheme::Bearer)
                        .bearer_format("JWT")
                        .build(),
                ),
            );
        }
    }
}

pub fn swagger_router<S>() -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    Router::new()
        .merge(SwaggerUi::new("/docs").url("/api-docs/openapi.json", ApiDoc::openapi()))
}
