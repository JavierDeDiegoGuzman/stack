import { Link } from "react-router";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
      {/* Título principal */}
      <h1>Gestión de Proyectos</h1>
      {/* Subtítulo explicativo */}
      <h2>Organiza tus proyectos y tareas fácilmente</h2>
      <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
        {/* Botón para ir a la página de login */}
        <Link to="/login">
          <button>Iniciar sesión</button>
        </Link>
        {/* Botón para ir a la página de registro */}
        <Link to="/register">
          <button>Registrarse</button>
        </Link>
      </div>
    </div>
  );
}
