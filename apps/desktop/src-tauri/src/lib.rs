mod probe;

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
struct PersistedData {
    resources: Option<String>,
    settings: Option<String>,
}

fn data_file(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("netprobe-data.json"))
}

#[tauri::command]
fn load_persisted_data(app: tauri::AppHandle) -> Result<PersistedData, String> {
    let path = data_file(&app)?;
    if !path.exists() {
        return Ok(PersistedData {
            resources: None,
            settings: None,
        });
    }
    let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_persisted_data(
    app: tauri::AppHandle,
    resources: Option<String>,
    settings: Option<String>,
) -> Result<(), String> {
    let path = data_file(&app)?;
    let payload = PersistedData {
        resources,
        settings,
    };
    let raw = serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())?;
    fs::write(path, raw).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            load_persisted_data,
            save_persisted_data,
            probe::probe_http,
            probe::probe_dns,
            probe::probe_tls,
            probe::probe_keyword,
            probe::probe_geo,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
