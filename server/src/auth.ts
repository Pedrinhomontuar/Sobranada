import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";
import type { NextFunction, Request, Response } from "express";

const router = Router();

function gerarToken(usuarioId: string) {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) {
    throw new Error("JWT_SECRET não está definido no .env");
  }
  return jwt.sign({ sub: usuarioId }, segredo, { expiresIn: "7d" });
}

router.post("/cadastro", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || typeof nome !== "string" || nome.trim() === "") {
    return res.status(400).json({ erro: "Nome é obrigatório." });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ erro: "E-mail inválido." });
  }
  if (!senha || typeof senha !== "string" || senha.length < 8) {
    return res.status(400).json({ erro: "A senha precisa ter pelo menos 8 caracteres." });
  }

  const emailLimpo = email.trim().toLowerCase();

  const jaExiste = await prisma.usuario.findUnique({ where: { email: emailLimpo } });
  if (jaExiste) {
    return res.status(409).json({ erro: "Esse e-mail já está cadastrado." });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: { nome: nome.trim(), email: emailLimpo, senhaHash },
  });

  res.status(201).json({
    token: gerarToken(usuario.id),
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || typeof email !== "string" || !senha || typeof senha !== "string") {
    return res.status(400).json({ erro: "Informe e-mail e senha." });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  const senhaCorreta = usuario
    ? await bcrypt.compare(senha, usuario.senhaHash)
    : false;

  if (!usuario || !senhaCorreta) {
    return res.status(401).json({ erro: "E-mail ou senha incorretos." });
  }

  res.json({
    token: gerarToken(usuario.id),
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
});

export function autenticar(req: Request, res: Response, next: NextFunction) {
  const cabecalho = req.headers.authorization;
  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Faça login para continuar." });
  }
  const token = cabecalho.slice(7);
  try {
    const segredo = process.env.JWT_SECRET;
    if (!segredo) {
      throw new Error("JWT_SECRET não está definido no .env");
    }
    const dados = jwt.verify(token, segredo);
    if (typeof dados === "string" || !dados.sub) {
      throw new Error("Token inválido");
    }
    res.locals.usuarioId = dados.sub;
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada." });
  }
}

export default router;