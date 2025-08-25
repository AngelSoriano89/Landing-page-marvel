from flask import Flask, jsonify, render_template
import requests
import hashlib
import time
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, template_folder='templates')

MARVEL_PUBLIC_KEY = os.getenv("MARVEL_PUBLIC_KEY")
MARVEL_PRIVATE_KEY = os.getenv("MARVEL_PRIVATE_KEY")

cache = {"data": None, "timestamp": 0}
CACHE_DURATION = 3600  # 1 hora

@app.route('/api/marvel')
def get_marvel_characters():
    now = time.time()
    # Verifica si hay datos en caché y si no ha expirado
    if cache["data"] and now - cache["timestamp"] < CACHE_DURATION:
        return jsonify(cache["data"])
    
    # Si no hay caché válido, consulta la API de Marvel
    ts = str(int(now))
    hash_str = ts + MARVEL_PRIVATE_KEY + MARVEL_PUBLIC_KEY
    hash_md5 = hashlib.md5(hash_str.encode()).hexdigest()
    url = (
        f"https://gateway.marvel.com/v1/public/characters"
        f"?ts={ts}&apikey={MARVEL_PUBLIC_KEY}&hash={hash_md5}&limit=100"
    )
    response = requests.get(url)
    data = response.json()
    results = []
    for char in data.get("data", {}).get("results", []):
        results.append({
            "name": char["name"],
            "description": char["description"],
            "thumbnail": char["thumbnail"],
            "comics": [comic["name"] for comic in char.get("comics", {}).get("items", [])],
            "series": [serie["name"] for serie in char.get("series", {}).get("items", [])],
            "events": [event["name"] for event in char.get("events", {}).get("items", [])],
            "creators": []
        })
    # Guarda los datos en caché
    cache["data"] = results
    cache["timestamp"] = now
    return jsonify(results)

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)

