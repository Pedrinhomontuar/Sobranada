export const API_URL = "http://localhost:3333";
const CHAVE_TOKEN = "sobranada_token";
const CHAVE_USUARIO = "sobranada_usuario";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
};

export function pegarToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function pegarUsuario(): Usuario | null {
  const texto = localStorage.getItem(CHAVE_USUARIO);
  if (!texto) return null;
  try {
    return JSON.parse(texto) as Usuario;
  } catch {
    return null;
  }
}
export function salvarSessao(token: string, usuario: Usuario) {
  localStorage.setItem(CHAVE_TOKEN, token);
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}
export function limparSessao() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}

export async function requisicao(caminho: string, opcoes: RequestInit = {}) {
  const token = pegarToken();
  return fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });
}