import { useState } from "react";
import Login from "./Login";
import Despensa from "./Despensa";
import { limparSessao, pegarToken, pegarUsuario } from "./api";
import type { Usuario } from "./api";

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(() => pegarToken() ? pegarUsuario() : null);

  function sair() {
    limparSessao();
    setUsuario(null);
  }

  if (!usuario) {
    return <Login onEntrar={setUsuario} />;
  }

  return <Despensa usuario={usuario} onSair={sair} />;
}

export default App;