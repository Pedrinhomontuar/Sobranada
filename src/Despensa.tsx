import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Alimento } from "./types";
import { diasParaVencer, corDaValidade, textoDaValidade } from "./utils";
import { requisicao } from "./api";
import type { Usuario } from "./api";
import MenuUsuario from "./MenuUsuario";

type Props = {
  usuario: Usuario;
  onSair: () => void;
};

function Despensa({ usuario, onSair }: Props) {
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("un");
  const [validade, setValidade] = useState("");
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  function sessaoExpirou(status: number) {
    if (status === 401) {
      onSair();
      return true;
    }
    return false;
  }

  useEffect(() => {
    async function carregarAlimentos() {
      try {
        const resposta = await requisicao("/alimentos");
        if (sessaoExpirou(resposta.status)) return;

        const dados = await resposta.json();
        if (!resposta.ok) {
          setErro(dados.erro || "Não foi possível carregar os alimentos.");
          return;
        }
        setAlimentos(dados);
      } catch {
        setErro("Não foi possível conectar ao servidor. Ele está ligado?");
      }
    }

    carregarAlimentos();
  }, []);

  function limparFormulario() {
    setNome("");
    setQuantidade("");
    setUnidade("un");
    setValidade("");
    setErro("");
    setEditandoId(null);
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
      setErro("Digite o nome do alimento.");
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
        const resposta = await requisicao(`/alimentos/${editandoId}`, {
          method: "PUT",
          body: JSON.stringify(corpo),
        });
        if (sessaoExpirou(resposta.status)) return;

        const dados = await resposta.json();
        if (!resposta.ok) {
          setErro(dados.erro);
          return;
        }
        setAlimentos(alimentos.map((a) => (a.id === editandoId ? dados : a)));
      } else {
        const resposta = await requisicao("/alimentos", {
          method: "POST",
          body: JSON.stringify(corpo),
        });
        if (sessaoExpirou(resposta.status)) return;

        const dados = await resposta.json();
        if (!resposta.ok) {
          setErro(dados.erro);
          return;
        }
        setAlimentos([...alimentos, dados]);
      }

      limparFormulario();
    } catch {
      setErro("Não foi possível conectar ao servidor. Ele está ligado?");
    }
  }

  async function excluirAlimento(id: string) {
    const confirmou = window.confirm("Quer mesmo excluir esse alimento?");
    if (!confirmou) return;

    try {
      const resposta = await requisicao(`/alimentos/${id}`, { method: "DELETE" });
      if (sessaoExpirou(resposta.status)) return;

      if (!resposta.ok) {
        setErro("Não foi possível excluir o alimento.");
        return;
      }

      setAlimentos(alimentos.filter((a) => a.id !== id));

      if (editandoId === id) {
        limparFormulario();
      }
    } catch {
      setErro("Não foi possível conectar ao servidor. Ele está ligado?");
    }
  }

  return (
    <div className="container">
      <header className="topo">
        <h1 className="titulo">Sobranada</h1>
        <MenuUsuario usuario={usuario} onSair={onSair} />
      </header>
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
          <option value="un">Unidade</option>
          <option value="kg">Quilograma</option>
          <option value="g">Grama</option>
          <option value="L">Litro</option>
          <option value="ml">Mililitro</option>
          <option value="pct">Pacote</option>
        </select>

      <label className="campo-data">
        <span>Validade:</span>
        <input
          type="date"
          value={validade}
          onChange={(e) => setValidade(e.target.value)}
          />
      </label>

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

export default Despensa;