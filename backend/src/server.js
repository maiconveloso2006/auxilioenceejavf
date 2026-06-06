const express = require("express");
const routes = require("./view/routes");
const dotenv = require("dotenv");
const cors = require("cors");
const uploads = require("./utils/upload.js");
const path = require("path");
const fs = require("fs");

dotenv.config();

const Port = process.env.PORT || process.env.API_PORT || 3000;

const app = express();

// Garante que a pasta uploads existe (necessário em ambientes cloud)
const uploadsDir = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const { db } = require("./databases/DatabaseContext.js");

app.use(express.json());
app.use(cors({ origin: true }));

// Rotas da API
app.use(routes);

// Serve arquivos de upload
app.use("/uploads", express.static(uploadsDir));

// Upload de avatar
app.post("/upload", uploads.single("avatar"), (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: "Erro ao fazer upload do arquivo!" });
    } else {
        res.status(200).json({ message: "Arquivo enviado com sucesso!", file: req.file.filename });
    }
});

// Serve o frontend (HTML/CSS/JS/Imagens) da raiz do projeto
// Em produção (Koyeb), a raiz do projeto fica um nível acima da pasta backend
const projectRoot = process.env.FRONTEND_PATH
    ? path.resolve(process.env.FRONTEND_PATH)
    : path.resolve(__dirname, '..', '..'); // ../.. sobe de src/ para backend/ e depois para a raiz

app.use(express.static(projectRoot));

// Rota fallback: qualquer rota não encontrada redireciona para o login
app.get("*", (req, res) => {
    const loginPage = path.join(projectRoot, "login.html");
    if (fs.existsSync(loginPage)) {
        res.sendFile(loginPage);
    } else {
        res.status(404).json({ message: "Página não encontrada" });
    }
});

async function startServer() {
    console.log("Iniciando banco de dados...");
    await db.init();

    app.listen(Port, "0.0.0.0", () => {
        console.log(`Servidor rodando na porta: ${Port}`);
        console.log(`API:  http://localhost:${Port}/test`);
        console.log(`Site: http://localhost:${Port}/login.html`);
        console.log("Pressione CTRL+C para encerrar.");
    });
}

startServer();
