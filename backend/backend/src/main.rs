use axum::{
    Router,
    routing::{get, post, patch, delete},
    middleware::from_fn_with_state,
};
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;

mod config;
mod error;
mod state;
mod models;
mod services;
mod middleware;
mod handlers;
mod api_doc;

use state::AppState;
use middleware::auth::{auth_middleware, admin_middleware};
use api_doc::swagger_router;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,tower_http=debug,axum=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();


    let settings = config::Settings::load().unwrap_or_default();

    tracing::info!("Starting Cybersim backend on {}:{}", settings.server.host, settings.server.port);


    let db_pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&settings.database.url)
        .await
        .expect("Failed to connect to database");


    sqlx::migrate!("./migrations")
        .run(&db_pool)
        .await
        .expect("Failed to run migrations");


    let redis_client = redis::Client::open(settings.redis.url.as_str())
        .expect("Failed to connect to Redis");
    let redis_conn = redis_client
        .get_connection_manager()
        .await
        .expect("Failed to get Redis connection");


    std::fs::create_dir_all(&settings.certificates.dir)
        .expect("Failed to create certificates directory");


    let app_state = AppState {
        db: db_pool,
        redis: redis_conn,
        settings: settings.clone(),
    };


    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
            axum::http::header::ACCEPT,
        ]);


    let protected_routes = Router::new()
        .route("/api/v1/auth/me", get(handlers::auth::me))
        .route("/api/v1/progress", get(handlers::progress::get_progress))
        .route(
            "/api/v1/progress/scenarios/:id/complete",
            post(handlers::progress::complete_scenario),
        )
        .route("/api/v1/leaderboard", get(handlers::leaderboard::get_leaderboard))
        .route("/api/v1/certificates", post(handlers::certificate::create_certificate))
        .route("/api/v1/certificates", get(handlers::certificate::get_certificates))
        .layer(from_fn_with_state(app_state.clone(), auth_middleware))
        .layer(cors.clone());


    let public_routes = Router::new()
        .route("/api/v1/auth/register", post(handlers::auth::register))
        .route("/api/v1/auth/login", post(handlers::auth::login))
        .route(
            "/api/v1/certificates/:id/qr.png",
            get(handlers::certificate::get_qr_code),
        )
        .route(
            "/api/v1/verify/:user_id/:score",
            get(handlers::certificate::verify_certificate),
        )
        .route("/api/v1/scenarios", get(handlers::scenarios::list_scenarios))
        .route("/api/v1/scenarios/:id", get(handlers::scenarios::get_scenario))
        .layer(cors.clone());


    let admin_routes = Router::new()
        .route("/api/v1/admin/stats", get(handlers::admin::get_stats))
        .route("/api/v1/admin/users", get(handlers::admin::list_users))
        .route("/api/v1/admin/users/bulk", post(handlers::admin::bulk_users_operation))
        .route("/api/v1/admin/users/:id", get(handlers::admin::get_user))
        .route("/api/v1/admin/users/:id", patch(handlers::admin::update_user))
        .route("/api/v1/admin/users/:id", delete(handlers::admin::delete_user))
        .route("/api/v1/admin/certificates", get(handlers::admin::list_certificates))
        .route("/api/v1/admin/certificates/:id", delete(handlers::admin::delete_certificate))
        .route("/api/v1/admin/certificates/:id/revoke", patch(handlers::admin::revoke_certificate))
        .route("/api/v1/admin/scenarios/import", post(handlers::admin::import_scenario))
        .route("/api/v1/admin/scenarios", get(handlers::admin::list_scenarios))
        .route("/api/v1/admin/scenarios/:id", delete(handlers::admin::delete_scenario))
        .layer(from_fn_with_state(app_state.clone(), auth_middleware))
        .layer(from_fn_with_state(app_state.clone(), admin_middleware))
        .layer(cors.clone());


    let app = Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .merge(admin_routes)
        .merge(swagger_router())
        .layer(TraceLayer::new_for_http())
        .with_state(app_state);


    let addr = SocketAddr::new(
        settings.server.host.parse().unwrap(),
        settings.server.port,
    );

    tracing::info!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    tracing::info!("Server shut down gracefully");

    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::info!("Shutting down server...");
}
