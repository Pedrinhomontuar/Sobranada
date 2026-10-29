import { useEffect, useState } from "react";
import type {FormEvent} from 'react';
import type { Alimento } from './types';
import { diasParaVencer, corDaValidade, textoDaValidade } from './utils';

const API_URL = "http://localhost:3333";


function App() {
  const [alimentos, setAlimentos] = useState<Alimento[]>([]); //[] serve pra buscar só uma vez
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("un");
  const [validade, setValidade] = useState("");
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null); // estado para armazenar o ID do alimento

  useEffect(() => {
    async function carregarAlimento() {
      try {
        const resposta = await fetch(`${API_URL}/alimentos`);
        const dados = await resposta.json();
        setAlimentos(dados);
      } catch { //se der merda, vai cair aqui
        setErro("Não foi possivel conectar ao servidor. Ele está ligado?");
      }
    }

    carregarAlimento();
  }, []);

  function limparFormulario() {
    setNome("");
    setQuantidade("");
    setUnidade("un");
    setValidade("");
    setErro("");
    setEditandoId(null); // limpa o estado de edição
  }

  function iniciarEdicao(alimento: Alimento) {
    setEditandoId(alimento.id);
    setNome(alimento.nome);
    setQuantidade(String(alimento.quantidade));
    setUnidade(alimento.unidade);
    setValidade(alimento.validade);
    setErro("");
  }


async function salvarAlimento(e: FormEvent) {
  e.preventDefault();

    if (nome.trim() === "") {
      return;
    }
    if (Number(quantidade) <= 0) {
      setErro("A quantidade precisa ser maior que zero.");
      return;
    }
    if (validade === "") {
      setErro("Escolha a data de validade.");
      return;
    }

    const corpo = {
      nome: nome.trim(),
      quantidade: Number(quantidade),
      unidade,
      validade,
    };

    try {
      if (editandoId) {
        
        const resposta = await fetch(`${API_URL}/alimentos/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify(corpo), //transforma em JSON
        });
        const dados = await resposta.json();
        if (!resposta.ok) {
          setErro(dados.erro);
          return;
        }

        setAlimentos(alimentos.map((a) => (a.id === editandoId ? dados : a)));
      } else {
        const resposta = await fetch (`${API_URL}/alimentos`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(corpo),
        });

        const dados = await resposta.json();
        if (!resposta.ok) {
          setErro(dados.erro);
          return;
        }

        setAlimentos([...alimentos, dados]); //servidor devolve o alimento com o id gerado
      }

      limparFormulario();
    } catch {
      setErro("Não foi possivel conectar ao servidor. Ele está ligado?");
    }
}

  async function excluirAlimento(id: string) {
    const confirmou = window.confirm("Quer excluir este alimento?");
    if (!confirmou) return;
   
    try {
      const resposta = await fetch(`${API_URL}/alimentos/${id}`, {
        method: "DELETE",
      });
      if (!resposta.ok) {
        setErro("Não foi possiível excluir o alimento.");
        return;
      }

    setAlimentos(alimentos.filter((a) => a.id !== id));
    if (editandoId === id) {
      limparFormulario(); // limpa o formulário se o alimento em edição for excluído
    }
  } catch {
    setErro("Não foi possível conectar ao servidor. Ele está ligando?");
  }
}
  return (
    <div className="container">
      <h1 className="titulo">Sobranada</h1>

      <form className="formulario" onSubmit={salvarAlimento}>
        <input
          type="text"
          placeholder="Nome (ex: Tomate)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="number"
          placeholder="Qtd"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />

        <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
          <option value="un">Un</option>
          <option value="kg">Kg</option>
          <option value="g">g</option>
          <option value="L">L</option>
          <option value="ml">Ml</option>
          <option value="pct">Pct</option>
        </select>

        <input
          type="date"
          value={validade}
          onChange={(e) => setValidade(e.target.value)}
        />

        <button type="submit" className="btn btn-principal">{editandoId ? "Salvar alterações" : "Adicionar"}</button>
        {editandoId && (<button type="button" className="btn btn-cancelar" onClick={limparFormulario}>Cancelar</button>)}
      </form>

      {erro && <p className="erro">{erro}</p>}

      <ul className="lista">
        {alimentos.map((alimento) => {
          const dias = diasParaVencer(alimento.validade);
          const cor = corDaValidade(dias);

          return (
            <li key={alimento.id} className="item" style={{ borderLeftColor: cor }}>
              <div className="item-info">
                <strong>{alimento.nome}</strong>
                 <span>{alimento.quantidade} {alimento.unidade}</span>
                  <span className="validade" style={{ color: cor}}>{textoDaValidade(dias)}</span>
              </div>
              <div className='item-botoes'>
                <button className="btn btn-editar" onClick={() => iniciarEdicao(alimento)}>Editar</button>{" "}
                <button className="btn btn-excluir" onClick={() => excluirAlimento(alimento.id)}>Excluir</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;