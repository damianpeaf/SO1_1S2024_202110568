use rocket::{routes, serde::json::Json};
use rocket::post;
use rocket::get;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use rocket::config::SecretKey;
use rocket_cors::{AllowedOrigins, CorsOptions};

#[derive(Debug, Serialize, Deserialize)]
struct Data {
    name: String,
    album: String,
    rank: String,
    year: String,
}

#[post("/rust", data = "<data>")]
async fn vote(data: Json<Data>) -> String {
    let client = Client::new();

    // print
    println!("Client received data. Sending to server: name: {}, album: {}, rank: {}, year: {}", data.name, data.album, data.rank, data.year);

    let server_url = "http://localhost:3001/vote";
    let response = client.post(server_url).json(&data.into_inner()).send().await;

    match response {
        Ok(_) => "Data sent successfully!".to_string(),
        Err(e) => format!("Failed to send data: {}", e),
    }
}

#[get("/rust")]
async fn get_data() -> String {
    "Hello from Rust client!".to_string()
}

#[rocket::main]
async fn main() {
    // --------------------------------------------------------------------------
    let secret_key = SecretKey::generate(); // Genera una nueva clave secreta

    // Configuración de opciones CORS
    let cors = CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .to_cors()
        .expect("failed to create CORS fairing");

    let config = rocket::Config {
        address: "0.0.0.0".parse().unwrap(),
        port: 3000,
        secret_key: secret_key.unwrap(), // Desempaqueta la clave secreta generada
        ..rocket::Config::default()
    };

    //----------------------------------------------------------------------------
    rocket::custom(config)
    .attach(cors)
    .mount("/", rocket::routes![vote, get_data])
    .launch()
    .await
    .unwrap();
}