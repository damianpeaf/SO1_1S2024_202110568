# Usa la imagen oficial de Rust como base
FROM rust:latest as builder

# Crea un directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de tu aplicación al contenedor
COPY . .

# Compila la aplicación
RUN cargo build --release

# Crea una nueva imagen ligera
FROM ubuntu:latest

# Instala las dependencias necesarias
RUN apt-get update && apt-get install -y libssl-dev

# Copia el binario compilado desde la imagen de compilación a la imagen final
COPY --from=builder /usr/src/app/target/release/rust-server /usr/local/bin/rust-server

# Exponer el puerto que utiliza tu aplicación
EXPOSE 8080

# Comando para ejecutar tu aplicación cuando se inicie el contenedor
CMD ["rust-server"]