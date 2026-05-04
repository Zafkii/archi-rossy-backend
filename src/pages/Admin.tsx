export default function Admin() {
  const token = localStorage.getItem("token")

  if (!token) {
    window.location.href = "/login"
    return null
  }

  return (
    <div>
      <h2>Panel Admin</h2>

      <a href="/" target="_blank">
        Ir a la web
      </a>

      <br />
      <br />

      <button
        onClick={() => {
          localStorage.removeItem("token")
          window.location.href = "/login"
        }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}
