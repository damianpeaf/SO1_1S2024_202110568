import os
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))

client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT)

def handle_message(message):
    print('Mensaje recibido:', message['data'].decode('utf-8'))

canal = 'test'
pubsub = client.pubsub()
pubsub.subscribe(canal)

for message in pubsub.listen():
    if message['type'] == 'message':
        handle_message(message)
