const express = require("express");
const routes = require("./view/routes");
const dotenv = require("dotenv");
const cors = require("cors") ;
const uploads = require("./utils/upload.js");
const os = require("os");
const path = require("path");
const { fileURLToPath } = require("url");


dotenv.config();

const Port = process.env.PORT || process.env.API_PORT || 3000;
console.log( process.env.DB_TYPE) ;

const app = express();
const projectRoot = path.resolve(__dirname, '..', '..');

const { db } = require('./databases/DatabaseContext.js');
app.use(express.json());
app.use(cors({
    origin: true
}));
app.use( routes );

app.use(express.static(projectRoot));

app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '..', 'uploads'))
);

app.post('/upload', uploads.single('avatar'), (req, res) => {
    if (!req.file) {
        res.send('Erro ao fazer upload do arquivo!');
    } else {
        res.send('Arquivo enviado com sucesso!') ;
    }
})

async function startServer() {
    console.log( "iniciando banco")
    await db.init();

    app.listen(Port, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta: ${Port}`);
        console.log(`API:  http://localhost:${Port}/test`);
        console.log(`Site: http://localhost:${Port}/login.html`);
        console.log('Pressione CTRL+C para encerrar.');
    });
   
}

startServer();

