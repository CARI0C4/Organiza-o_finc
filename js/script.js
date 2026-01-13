const targetBalance = 12000;
const API = "http://127.0.0.1:5000";

function carregar() {
    fetch(API + "/list")
    .then(r => r.json())
    .then(data => {
        document.getElementById("balanceDisplay").innerText = "R$ " + data.saldo.toFixed(2);

        const list = document.getElementById("historyList");
        list.innerHTML = "";

        data.historico.forEach(item => {
            const li = document.createElement("li");
            li.innerText = (item.type === "add" ? "+ " : "- ") + "R$ " + item.amount.toFixed(2);
            list.appendChild(li);
        });
    });
}

document.getElementById("btnAdd").onclick = () => {
    enviar("add");
};

document.getElementById("btnSub").onclick = () => {
    enviar("sub");
};

function enviar(tipo) {
    const valor = parseFloat(document.getElementById("amountInput").value);

    fetch(API + "/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: valor, type: tipo })
    })
    .then(() => carregar());
}

carregar();


// Carregar dados salvos ou iniciar vazio
let currentBalance = parseFloat(localStorage.getItem("saldo")) || 0;
let history = JSON.parse(localStorage.getItem("historico")) || [];

// Elementos do DOM
const balanceEl = document.getElementById("balanceDisplay");
const progressEl = document.getElementById("progressBar");
const amountInput = document.getElementById("amountInput");
const historyList = document.getElementById("historyList");
const rightPanel = document.getElementById("rightPanel");
const hamburger = document.getElementById("hamburger");

// Event Listeners
document.getElementById("btnAdd").addEventListener("click", handleAdd);
document.getElementById("btnSub").addEventListener("click", handleSubtract);

// --- Lógica do Menu Hamburger e Animação ---
hamburger.addEventListener("click", () => {
    rightPanel.classList.toggle("active"); // Abre/Fecha painel
    hamburger.classList.toggle("active");  // Ativa/Desativa animação do X
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 && 
        !rightPanel.contains(e.target) && 
        !hamburger.contains(e.target) &&
        rightPanel.classList.contains('active')) {
        
        closeMenu();
    }
});

// Função auxiliar para fechar tudo corretamente
function closeMenu() {
    rightPanel.classList.remove('active');
    hamburger.classList.remove('active'); // Garante que o X volte a ser hamburger
}

function formatCurrency(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function saveData() {
    localStorage.setItem("saldo", currentBalance);
    localStorage.setItem("historico", JSON.stringify(history));
}

function updateUI() {
    balanceEl.textContent = formatCurrency(currentBalance);

    let percent = (currentBalance / targetBalance) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    progressEl.style.width = percent + "%";
    progressEl.textContent = percent.toFixed(1) + "%";

    if (percent >= 100) {
        progressEl.style.background = "#2ecc71";
    } else {
        progressEl.style.background = "linear-gradient(90deg, #4cd137, #44bd32)";
    }

    historyList.innerHTML = "";
    history.forEach(item => {
        const li = document.createElement("li");
        li.className = "history-item";
        
        li.innerHTML = `
            <div>
                <div style="font-size:0.8em; color:#718093">${item.date}</div>
                <div class="history-reason">${item.reason}</div>
            </div>
            <span class="${item.type === 'add' ? 'amount-plus' : 'amount-minus'}">
                ${item.type === 'add' ? '+' : '-'} ${formatCurrency(item.value)}
            </span>
        `;
        historyList.appendChild(li);
    });
}

function handleAdd() {
    const value = parseFloat(amountInput.value);
    if (!value || value <= 0) return alert("Digite um valor válido");

    currentBalance += value;
    history.unshift({
        type: "add",
        value: value,
        reason: "Entrada de Valor",
        date: new Date().toLocaleString("pt-BR")
    });

    saveData();
    updateUI();
    amountInput.value = "";
    if(window.innerWidth <= 900) closeMenu();
}

function handleSubtract() {
    const value = parseFloat(amountInput.value);
    if (!value || value <= 0) return alert("Digite um valor válido");

    const reason = prompt("Motivo da retirada:");
    if (!reason || reason.trim() === "") return alert("Motivo é obrigatório");

    currentBalance -= value;
    history.unshift({
        type: "sub",
        value: value,
        reason: reason,
        date: new Date().toLocaleString("pt-BR")
    });

    saveData();
    updateUI();
    amountInput.value = "";
    if(window.innerWidth <= 900) closeMenu();
}

// Inicializa a tela
updateUI();