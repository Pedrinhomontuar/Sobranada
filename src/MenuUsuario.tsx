import { useEffect, useRef, useState } from "react";
import type { Usuario } from "./api";

type Props = {
  usuario: Usuario;
  onSair: () => void;
};

function MenuUsuario({ usuario, onSair }: Props) {
  const [aberto, setAberto] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);

  const inicial = usuario.nome.trim().charAt(0).toUpperCase();
  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (caixaRef.current && !caixaRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }

    function aoApertarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoApertarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoApertarTecla);
    };
  }, []);

  return (
    <div className="menu-usuario" ref={caixaRef}>
      <button
        className="avatar"
        onClick={() => setAberto(!aberto)}
        aria-label="Abrir menu do perfil"
        aria-expanded={aberto}
      >
        {inicial}
      </button>
      {aberto && (
        <div className="menu-caixa">
          <div className="menu-info">
            <strong>{usuario.nome}</strong>
            <span>{usuario.email}</span>
          </div>

          <button className="menu-sair" onClick={onSair}>
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
export default MenuUsuario;