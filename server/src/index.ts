import express from "express"; //express é o framework que cria servidor e rotas
import cors from "cors";
import { prisma } from "./prisma.js";


const app = express();
app.use(cors());    //libera o acesso
app.use(express.json()); //entende o JSON

function validar(corpo: any): string | null {
    const {nome, quantidade, unidade, validade } = corpo;
        if (!nome || typeof nome !== "string" || nome.trim() === "") {
            return "Nome é obrigatorio. ";
        }
        if (typeof quantidade !== "number" || quantidade <= 0) {
            return "Quantidade precisa ser maior que Zero. "
        }
        if (!unidade || !validade) {
            return "Unidade e validade são obrigatórias. ";
        }
        return null;
}

app.get("/health", (_req, res) => {
    res.json({ status: "ok"});
});

app.get("/alimentos", async (_req, res) => { //faz devolver a lista inteira
    const alimentos = await prisma.alimento.findMany({
        orderBy: { validade: "asc"}
    });
    res.json(alimentos);
});

app.post("/alimentos", async (req, res) => {
    const erro = validar(req.body);
    if (erro) {
        return res.status(400).json({ erro });
    }

    const { nome, quantidade, unidade, validade } = req.body;

    const novo = await prisma.alimento.create({
        data: { nome: nome.trim(), quantidade, unidade, validade },
    });
    res.status(201).json(novo);
});

app.put("/alimentos/:id", async (req, res) => {
    const {id} = req.params;
    
    const existe = await prisma.alimento.findUnique({ where: { id } });
    if (!existe) {
        return res.status(404).json({ erro: "Alimento não encontrado. " });
    }

    const erro = validar(req.body);
    if (erro) {
        return res.status(400).json({ erro });
    }

    const { nome, quantidade, unidade, validade } = req.body

    const atualizado = await prisma.alimento.update({
        where: { id },
        data: { nome: nome.trim(), quantidade, unidade, validade },
    });
    res.json(atualizado);
});

app.delete("/alimentos/:id", async (req, res) => {
    const { id } = req.params;

    const existe = await prisma.alimento.findUnique({ where: { id } });
    if (!existe) {
        return res.status(404).json({ erro: "Alimento não encontrado." });
    }

    await prisma.alimento.delete({ where: { id } });
    res.status(204).send();
});

const PORT = 3333;
app.listen(PORT, () =>{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});