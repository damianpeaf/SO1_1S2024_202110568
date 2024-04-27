use rocket::{routes, serde::json::Json};
use rocket::post;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use rocket::config::SecretKey;
use rocket_cors::{AllowedOrigins, CorsOptions};
use std::time::Duration;
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::ClientConfig;
use serde_json::json;
use rocket::response::status::BadRequest;
use dotenv::dotenv;
use std::env;

#[derive(Debug, Serialize, Deserialize)]
struct Data {
    name: String,
    album: String,
    rank: String,
    year: String,
}

#[rocket::post("/vote", data = "<data>")]
async fn vote(data: Json<Data>) -> Result<String, BadRequest<String>> {
    let received_data = data.into_inner();

    println!("Rust Server Received data: name: {}, album: {}, rank: {}, year: {}", 
        received_data.name, received_data.album, received_data.rank, received_data.year);

    send_vote(&received_data).await;

    Ok(format!("Received data: name: {}, album: {}, rank: {}, year: {}", 
        received_data.name, received_data.album, received_data.rank, received_data.year))
}

async fn send_vote(data: &Data) {
    let data_json = json!(data).to_string();

    dotenv().ok(); // Cargar las variables de entorno desde el archivo .env

    let kafka_broker = env::var("KAFKA_BROKER")
        .expect("KAFKA_BROKER no está definido en el archivo .env");

    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", &kafka_broker)
        .create()
        .expect("Producer creation error");

    let future_result = producer.send(
        FutureRecord::to("votes")
            .payload(&data_json)
            .key("key"), 
        Duration::from_secs(0)
    );

    if let Err((e, _)) = future_result.await {
        eprintln!("Failed to produce message: {}", e);
    } else {
        println!("Message sent successfully");
    }
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
        port: 3001,
        secret_key: secret_key.unwrap(), // Desempaqueta la clave secreta generada
        ..rocket::Config::default()
    };
    //----------------------------------------------------------------------------
    //rocket::build().mount("/", routes![vote]).launch().await.unwrap();
    rocket::custom(config)
    .attach(cors)
    .mount("/", rocket::routes![vote])
    .launch()
    .await
    .unwrap();
}