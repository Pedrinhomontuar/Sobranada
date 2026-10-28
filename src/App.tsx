import {useState} from 'react';
import type {FormEvent} from 'react';
import {alimentosfake} from './dados';
import type { Alimento } from './types';
import { diasParaVencer, corDaValidade, textoDaValidade } from './utils';


function App() {
  const [alimentos, setAlimentos] = useState<Alimento[]>(alimentosfake);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("un");
  const [validade, setValidade] = useState("");
  const [erro, setErro] = useState("");   // estado da mensagem erro, se tiver vazio = sem erro.
  const [editandoId, setEditandoId] = useState<string | null>(null); // estado para armazenar o ID do alimento

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


  function salvarAlimento(e: FormEvent) {
    e.preventDefault();
      if (nome.trim() === "") {
        setErro("Digite o nome do alimento.");
        return;
      }
      if (Number(quantidade) <= 0) {
        setErro("Digite uma quantidade maior que zero.");
        return;
      }
      if (validade === "") {
        setErro("Digite a data de validade.");
        return;
      }

      if (editandoId) { // Atualiza o alimento existente
        setAlimentos(
          alimentos.map((alimento) =>
            alimento.id === editandoId
              ? { ...alimento, nome: nome.trim(), quantidade: Number(quantidade), unidade, validade }
              : alimento
        )
        );
      } else{
        const novoAlimento: Alimento = { // Cria um novo alimento
          id: crypto.randomUUID(),
          nome: nome.trim(),
          quantidade: Number(quantidade),
          unidade,
          validade,
        };
        setAlimentos([...alimentos, novoAlimento]);
      }
  limparFormulario();
    }

  function excluirAlimento(id: string) {
    const confirmou = window.confirm("Quer excluir este alimento?");
    if (!confirmou) return;
    setAlimentos(alimentos.filter((alimento) => alimento.id !== id));
    if (editandoId === id) {
      limparFormulario(); // limpa o formulário se o alimento em edição for excluído
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