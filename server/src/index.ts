import express from "express"; //express é o framework que cria servidor e rotas
import cors from "cors";
import { randomUUID} from "node:crypto"; //gera ids igual do front

type Alimento = {
    id: string;
    nome: string;
    quantidade: number;
    unidade: string;
    validade: string;
}

const app = express();

app.use(cors());    //libera o acesso
app.use(express.json()); //entende o JSON

let alimentos: Alimento[] = [
    {id: "1", nome: "Leite", quantidade: 2, unidade: "L", validade: "2026-11-05" },
    {id: "2", nome: "Arroz", quantidade: 5, unidade: "Kg", validade: "2027-03-10" },
];

app.get("/health", (_req, res) => {
    res.json({ status: "ok"});
});

app.get("/alimentos", (_req, res) => { //faz devolver a lista inteira
    res.json(alimentos);
});

app.post("/alimentos", (req, res) => {
    const {nome, quantidade, unidade, validade} = req.body;
        if (!nome || typeof nome !== "string" || nome.trim() === "") {
            return res.status(400).json({ erro: "Nome é obrigatorio." });
        }
        if (typeof quantidade !== "number" || quantidade <= 0) {
            return res.status(400).json({ erro: "Quantidade precisa ser maior que zero." });
        }
        if (!unidade || !validade) {
            return res.status(400).json({ erro: "Unidade e validade são obrigatórias." })
        }

    const novo: Alimento = {
        id: randomUUID(),
        nome: nome.trim(),
        quantidade,
        unidade,
        validade,
    };

    alimentos.push(novo);
    res.status(201).json(novo);
});

app.put("/alimentos/:id", (req, res) => {
    const {id} = req.params;
    const {nome, quantidade, unidade, validade } = req.body;
    const posicao = alimentos.findIndex((a) => a.id === id); //procura o alimento, se não achar devolve -1
    if (posicao === -1) {
        return res.status(404).json({ erro: "Alimento não encontrado. "});
    }
    if (!nome || typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({ erro: "Quantidade precisa ser maior que zero." });
    }
    if (typeof quantidade !== "number" || quantidade <= 0) {
        return res.status(400).json({ erro: "Quantidade precisa ser maior que zero." });
    }
    if (!unidade || !validade) {
        return res.status(400).json({ erro: "Unidade e validade são obrigatórias." });
    }

    alimentos[posicao] = { id, nome: nome.trim(), quantidade, unidade, validade };
  res.json(alimentos[posicao]);
});

app.delete("/alimentos/:id", (req, res) => {
    const {id} =  req.params;
    const existe = alimentos.some((a) => a.id === id);
    if (!existe) {
        return res.status(404).json({ erro: "Alimento não encontrado." });
    }

    alimentos = alimentos.filter((a) => a.id !== id);
    res.status(204).send();
});

const PORT = 3333;
app.listen(PORT, () =>{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});