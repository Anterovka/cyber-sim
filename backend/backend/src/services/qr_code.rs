use qrcode::QrCode;
use image::Luma;
use uuid::Uuid;
use chrono::Utc;
use crate::error::AppError;

pub fn generate_qr_code(
    user_id: Uuid,
    username: &str,
    league: &str,
    score: i32,
    output_dir: &str,
    public_url: &str,
) -> Result<String, AppError> {
    let cert_id = Uuid::new_v4();
    let date = Utc::now().to_rfc3339();


    let qr_data = format!("{}/verify/{}/{}", public_url, user_id, score);

    let code = QrCode::new(qr_data.as_bytes())
        .map_err(|e| AppError::Image(format!("Failed to generate QR code: {}", e)))?;

    let image = code.render::<Luma<u8>>().build();

    std::fs::create_dir_all(output_dir)
        .map_err(|e| AppError::Io(e))?;

    let file_path = format!("{}/{}.png", output_dir, cert_id);
    image.save(&file_path)
        .map_err(|e| AppError::Image(format!("Failed to save QR code: {}", e)))?;

    Ok(file_path)
}
