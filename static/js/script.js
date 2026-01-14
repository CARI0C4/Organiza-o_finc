const API = "https://organiza-finance.onrender.com"; // Sua URL
const targetBalance = 12000;

// Elementos da tela
const balanceEl = document.getElementById("balanceDisplay");
const historyList = document.getElementById("historyList");
const progressBar = document.getElementById("progressBar");
const amountInput = document.getElementById("amountInput");
const hamburger = document.getElementById("hamburger");
const rightPanel = document.getElementById("rightPanel");

// --- ELEMENTOS DO MODAL DE SUBTRAÇÃO ---
const modalSub = document.getElementById("modalSub");
const modalReasonInput = document.getElementById("modalReasonInput");
const btnConfirmModal = document.getElementById("btnConfirmModal");
const btnCancelModal = document.getElementById("btnCancelModal");

// --- ELEMENTOS DO MODAL DE ERRO (NOVO) ---
const modalError = document.getElementById("modalError");
const errorMessage = document.getElementById("errorMessage");
const btnErrorOk = document.getElementById("btnErrorOk");

// --- FUNÇÃO PARA MOSTRAR ERRO (Substitui o alert) ---
function mostrarErro(mensagem) {
    errorMessage.innerText = mensagem;
    modalError.classList.remove("hidden");
}

// Fecha o modal de erro ao clicar em "Entendido"
btnErrorOk.onclick = () => {
    modalError.classList.add("hidden");
};

// --- FUNÇÃO CARREGAR DADOS ---
function carregar() {
    fetch(API + "/list")
    .then(r => r.json())
    .then(data => {
        balanceEl.innerText = data.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        
        historyList.innerHTML = "";
        data.historico.forEach(item => {
            const li = document.createElement("li");
            li.className = "history-item";
            
            const sinal = item.type === "add" ? "+" : "-";
            const cor = item.type === "add" ? "amount-plus" : "amount-minus";
            
            li.innerHTML = `
                <div>
                    <div style="font-size:0.8em; color:#718093">${new Date(item.date).toLocaleString('pt-BR')}</div>
                    <div class="history-reason">${item.reason}</div>
                </div>
                <span class="${cor}">
                    ${sinal} ${item.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
            `;
            historyList.appendChild(li);
        });

        atualizarBarra(data.saldo);
    })
    .catch(err => console.error("Erro:", err));
}

function atualizarBarra(saldoAtual) {
    let percent = (saldoAtual / targetBalance) * 100;
    if (percent < 0) percent = 0; 
    if (percent > 100) percent = 100;

    progressBar.style.width = percent + "%";
    progressBar.innerText = percent.toFixed(1) + "%";
    progressBar.style.background = percent >= 100 ? "#2ecc71" : "linear-gradient(90deg, #4cd137, #44bd32)";
}

// --- LÓGICA DE ENVIO ---

function enviarParaAPI(valor, tipo, motivo) {
    fetch(API + "/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: valor, type: tipo, reason: motivo })
    })
    .then(res => res.json())
    .then(() => {
        amountInput.value = ""; 
        modalReasonInput.value = ""; 
        modalSub.classList.add("hidden"); // Fecha modal de subtração
        carregar();
        
        if(window.innerWidth <= 900) {
            rightPanel.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}

// 1. Botão ADICIONAR
document.getElementById("btnAdd").onclick = () => {
    const valor = parseFloat(amountInput.value);
    
    // AQUI: Usamos o novo modal em vez de alert
    if (!valor || valor <= 0) return mostrarErro("Por favor, digite um valor válido!");
    
    enviarParaAPI(valor, "add", "Depósito");
};

// 2. Botão SUBTRAIR
document.getElementById("btnSub").onclick = () => {
    const valor = parseFloat(amountInput.value);
    
    // AQUI: Usamos o novo modal em vez de alert
    if (!valor || valor <= 0) return mostrarErro("Digite um valor válido antes de subtrair!");
    
    modalSub.classList.remove("hidden");
    modalReasonInput.focus();
};

// 3. Confirmar no Modal de Subtração
btnConfirmModal.onclick = () => {
    const valor = parseFloat(amountInput.value);
    const motivo = modalReasonInput.value || "Sem motivo"; 
    enviarParaAPI(valor, "sub", motivo);
};

// 4. Cancelar Modal Subtração
btnCancelModal.onclick = () => {
    modalSub.classList.add("hidden");
};

// Menu Hamburger
hamburger.addEventListener("click", () => {
    rightPanel.classList.toggle("active");
    hamburger.classList.toggle("active");
});

// Inicia
carregar();