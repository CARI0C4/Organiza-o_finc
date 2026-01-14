from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
import os

# Define que os templates e estáticos estão nas pastas certas
app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

# --- BANCO DE DADOS ---
def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    # Cria tabela de usuários
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT
        )
    """)
    # Cria tabela de transações (com coluna 'reason' adicionada para o motivo)
    c.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL,
            type TEXT,
            reason TEXT, 
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Cria usuário admin se não existir
    c.execute("SELECT * FROM users WHERE username='admi'")
    if not c.fetchone():
        c.execute("INSERT INTO users (username, password) VALUES (?,?)", ("admi", "290712"))
    conn.commit()
    conn.close()

# Inicializa o banco ao ligar
init_db()

# --- ROTAS DO SITE (As páginas visuais) ---
@app.route("/")
def home():
    # Essa rota carrega o index.html quando acessa a raiz
    return render_template("index.html")

@app.route("/login-page")
def login_page():
    return render_template("login.html")

# --- API (O cérebro por trás) ---
@app.route("/login", methods=["POST"])
def login_api():
    data = request.json
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username=? AND password=?", (data["username"], data["password"]))
    result = c.fetchone()
    conn.close()
    return jsonify({"success": bool(result)})

@app.route("/add", methods=["POST"])
def add():
    data = request.json
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    # Agora salva também o motivo (reason)
    motivo = data.get("reason", "Movimentação")
    c.execute("INSERT INTO transactions (amount, type, reason) VALUES (?,?,?)", (data["amount"], data["type"], motivo))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/list")
def list_all():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT amount, type, reason, date FROM transactions ORDER BY date DESC")
    rows = c.fetchall()
    conn.close()

    data = []
    saldo = 0
    for a, t, r, d in rows:
        if t == "add":
            saldo += a
        else:
            saldo -= a
        data.append({"amount": a, "type": t, "reason": r, "date": d})

    return jsonify({"saldo": saldo, "historico": data})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)