from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import psycopg2

# Configuração de caminhos (igual fizemos antes)
base_dir = os.path.abspath(os.path.dirname(__file__))
template_dir = os.path.join(base_dir, 'templates')
static_dir = os.path.join(base_dir, 'static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
CORS(app)

# --- CONEXÃO COM O BANCO (PostgreSQL) ---
def get_db_connection():
    # Pega a URL do banco das variáveis de ambiente do Render
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Cria tabela de usuários (Postgres usa SERIAL para id automático)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT,
            password TEXT
        )
    """)
    
    # Cria tabela de transações
    cur.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            amount REAL,
            type TEXT,
            reason TEXT, 
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Verifica se admin existe
    cur.execute("SELECT * FROM users WHERE username=%s", ('admi',))
    if not cur.fetchone():
        cur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", ('admi', '290712'))
    
    conn.commit()
    cur.close()
    conn.close()

# Tenta iniciar o banco (pode falhar se rodar local sem configurar, mas no Render vai funcionar)
try:
    init_db()
except Exception as e:
    print(f"Erro ao iniciar banco (normal se estiver local): {e}")

# --- ROTAS ---
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login-page")
def login_page():
    return render_template("login.html")

# --- API ---
@app.route("/login", methods=["POST"])
def login_api():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    # Note o uso de %s em vez de ?
    cur.execute("SELECT * FROM users WHERE username=%s AND password=%s", (data["username"], data["password"]))
    result = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify({"success": bool(result)})

@app.route("/add", methods=["POST"])
def add():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    motivo = data.get("reason", "Movimentação")
    cur.execute("INSERT INTO transactions (amount, type, reason) VALUES (%s, %s, %s)", (data["amount"], data["type"], motivo))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"success": True})

@app.route("/list")
def list_all():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT amount, type, reason, date FROM transactions ORDER BY date DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    data = []
    saldo = 0
    for row in rows:
        # No Postgres, row é uma tupla (amount, type, reason, date)
        a = row[0]
        t = row[1]
        r = row[2]
        d = row[3]
        
        if t == "add":
            saldo += a
        else:
            saldo -= a
        data.append({"amount": a, "type": t, "reason": r, "date": d})

    return jsonify({"saldo": saldo, "historico": data})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)