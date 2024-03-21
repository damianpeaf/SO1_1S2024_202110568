const Redis = require('ioredis');
require('dotenv').config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT
});

client.on('error', (err) => {
    console.error('Error de conexión a Redis:', err);
});

client.on('connect', () => {
    console.log('Conexión a Redis establecida correctamente');
});

async function publicarMensaje() {
    try {
        const mensaje = JSON.stringify({ "msg": "Hola a todos" });
        const canal = 'test';


        await client.publish(canal, mensaje);
        console.log('Mensaje publicado correctamente en el canal', canal);
    } catch (error) {
        console.error('Error al publicar el mensaje:', error);
    }
}

setInterval(publicarMensaje, 5000);
