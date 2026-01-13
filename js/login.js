function login() {
    fetch("http://127.0.0.1:5000/login", {
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
            window.location.href = "index.html";
        } else {
            document.getElementById("msg").innerText = "Usuário ou senha inválidos";
        }
    })
    .catch(() => {
        document.getElementById("msg").innerText = "Erro ao conectar com o servidor";
    });
}
