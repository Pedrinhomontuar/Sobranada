import { useState } from "react";
import type { FormEvent } from "react";
import { requisicao, salvarSessao } from "./api";
import type { Usuario } from "./api";


type Props = {
  onEntrar: (usuario: Usuario) => void;
};

function Login({ onEntrar }: Props) {
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (modo === "cadastro" && nome.trim() === "") {
      setErro("Digite seu nome.");
      return;
    }
    if (!email.includes("@")) {
      setErro("Digite um e-mail válido.");
      return;
    }
    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setCarregando(true);
    try {
      const caminho = modo === "login" ? "/auth/login" : "/auth/cadastro";
      const corpo = modo === "login" ? { email, senha } : { nome: nome.trim(), email, senha };
      const resposta = await requisicao(caminho, {
        method: "POST",
        body: JSON.stringify(corpo),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || "Algo deu errado. Tente de novo.");
        return;
      }

      salvarSessao(dados.token, dados.usuario);
      onEntrar(dados.usuario);
    } catch {
      setErro("Não foi possível conectar ao servidor. Ele está ligado?");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="container">
      <h1 className="titulo">Sobranada 🥕</h1>

      <form className="auth-card" onSubmit={enviar}>
        <h2>{modo === "login" ? "Entrar" : "Criar conta"}</h2>

        {modo === "cadastro" && (
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha (mínimo 8 caracteres)"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        {erro && <p className="erro">{erro}</p>}

        <button type="submit" className="btn btn-principal" disabled={carregando}>
          {carregando ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
        </button>

        <button
          type="button"
          className="link-botao"
          onClick={() => {
            setModo(modo === "login" ? "cadastro" : "login");
            setErro("");
          }}
        >
          {modo === "login"
            ? "Não tem conta? Criar conta"
            : "Já tem conta? Entrar"}
        </button>
      </form>
    </div>
  );
}

export default Login;