function login() {
    // Usa a URL do Render
    fetch("https://organiza-finance.onrender.com/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: document.getElementById("user").value,
            password: document.getElementById("pass").value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem("logado", "true");
            // Redireciona para a rota raiz "/" (que é o index.html servido pelo Flask)
            window.location.href = "/";
        } else {
            document.getElementById("msg").innerText = "Usuário ou senha inválidos";
        }
    })
    .catch(() => {
        document.getElementById("msg").innerText = "Erro ao conectar com o servidor";
    });
}