from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -------- BANCO --------
def init_db():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    # usuários
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT
        )
    """)

    # movimentações
    c.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL,
            type TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # cria admin
    c.execute("SELECT * FROM users WHERE username='admi'")
    if not c.fetchone():
        c.execute("INSERT INTO users (username, password) VALUES (?,?)", ("admi", "290712"))

    conn.commit()
    conn.close()

init_db()

# -------- LOGIN --------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username=? AND password=?", (data["username"], data["password"]))
    ok = c.fetchone()
    conn.close()
    return jsonify({"success": bool(ok)})

# -------- ADD MOVIMENTAÇÃO --------
@app.route("/add", methods=["POST"])
def add():
    data = request.json
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("INSERT INTO transactions (amount, type) VALUES (?,?)", (data["amount"], data["type"]))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# -------- LISTAR MOVIMENTAÇÕES --------
@app.route("/list")
def list_all():
    conn = sqlite3.connect("database.db")
    c = conn.cursor()
    c.execute("SELECT amount, type, date FROM transactions ORDER BY date DESC")
    rows = c.fetchall()
    conn.close()

    data = []
    saldo = 0
    for a, t, d in rows:
        if t == "add":
            saldo += a
        else:
            saldo -= a
        data.append({"amount": a, "type": t, "date": d})

    return jsonify({"saldo": saldo, "historico": data})

app.run(host="0.0.0.0", port=5000)
