// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::io;
use std::path::PathBuf;

use dirs::data_local_dir;
use tauri::command;

/// Returns the path to the JSON file in the app's local data directory.
/// Creates an "ss-graph-tool" subfolder in the platform-appropriate app data folder.
fn get_layout_file_path() -> Result<PathBuf, String> {
    let mut base = data_local_dir().ok_or("Could not find platform local data directory")?;

    // create an app-specific subfolder so we don't clutter the user's app-data root
    base.push("ss-graph-tool");

    // ensure the directory exists
    fs::create_dir_all(&base).map_err(|e| format!("Failed to create app data dir: {}", e))?;

    base.push("nodePositions.json");
    Ok(base)
}

#[command]
fn save_layout_to_disk(json_data: String) -> Result<(), String> {
    let path = get_layout_file_path()?;
    fs::write(&path, json_data).map_err(|e| format!("Failed to write file {:?}: {}", path, e))?;
    Ok(())
}

#[command]
fn load_layout_from_disk() -> Result<String, String> {
    let path = get_layout_file_path()?;
    match fs::read_to_string(&path) {
        Ok(s) => Ok(s),
        Err(e) => {
            if e.kind() == io::ErrorKind::NotFound {
                // Return empty on first-run (no file yet) so frontend can handle it
                Ok(String::new())
            } else {
                Err(format!("Failed to read file {:?}: {}", path, e))
            }
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_layout_to_disk,
            load_layout_from_disk
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
