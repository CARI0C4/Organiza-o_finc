const targetBalance = 12000;

// Carrega dados salvos
let currentBalance = parseFloat(localStorage.getItem("saldo")) || 0;
let history = JSON.parse(localStorage.getItem("historico")) || [];

const balanceEl = document.getElementById("balanceDisplay");
const progressEl = document.getElementById("progressBar");
const amountInput = document.getElementById("amountInput");
const historyList = document.getElementById("historyList");

document.getElementById("btnAdd").addEventListener("click", handleAdd);
document.getElementById("btnSub").addEventListener("click", handleSubtract);

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

    historyList.innerHTML = "";
    history.forEach(item => {
        const li = document.createElement("li");
        li.className = "history-item";
        li.innerHTML = `
            <div>
                <div>${item.date}</div>
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
        reason: "Depósito",
        date: new Date().toLocaleString("pt-BR")
    });

    saveData();
    updateUI();
    amountInput.value = "";
}

function handleSubtract() {
    const value = parseFloat(amountInput.value);
    if (!value || value <= 0) return alert("Digite um valor válido");

    const reason = prompt("Motivo da retirada:");
    if (!reason) return alert("Motivo é obrigatório");

    if (value > currentBalance) return alert("Saldo insuficiente");

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
}

updateUI();
