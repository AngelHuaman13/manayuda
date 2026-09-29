const $ = (id) => document.getElementById(id);

const ERRORES = {
  400: "Revisa los datos ingresados.",
  403: "Solo los usuarios con rol DONANTE pueden donar.",
  404: "No existe un usuario con ese ID."
};

// Pinta una lista usando textContent (evita inyectar HTML por error)
function pintar(ul, datos, armar, vacio) {
  ul.replaceChildren();
  if (datos.length === 0) {
    const li = document.createElement("li");
    li.textContent = vacio;
    ul.append(li);
    return;
  }
  for (const dato of datos) {
    const [titulo, detalle] = armar(dato);
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    const small = document.createElement("small");
    strong.textContent = titulo;
    small.textContent = detalle;
    li.append(strong, small);
    ul.append(li);
  }
}

async function cargarDonaciones() {
  const res = await fetch("/api/donaciones?estado=DISPONIBLE");
  const datos = await res.json();
  pintar($("lista-donaciones"), datos,
    (d) => [
      `${d.producto} — ${d.cantidad} ${d.unidad}`,
      d.fechaVencimiento ? `Vence: ${d.fechaVencimiento}` : "Sin fecha de vencimiento"
    ],
    "Aún no hay donaciones disponibles.");
}

async function cargarComedores() {
  const res = await fetch("/api/comedores");
  const datos = await res.json();
  pintar($("lista-comedores"), datos,
    (c) => [
      c.nombre,
      `${c.direccion}, ${c.distrito} · ${c.personasAtendidas} personas atendidas`
    ],
    "Aún no hay comedores registrados.");
}

function mostrarMensaje(texto, tipo) {
  const p = $("mensaje");
  p.textContent = texto;
  p.className = tipo;
}

$("form-donacion").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    idUsuario: Number($("idUsuario").value),
    producto: $("producto").value.trim(),
    cantidad: Number($("cantidad").value),
    unidad: $("unidad").value,
    fechaVencimiento: $("fechaVencimiento").value || null
  };

  try {
    const res = await fetch("/api/donaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      mostrarMensaje(ERRORES[res.status] || "Ocurrió un error inesperado.", "error");
      return;
    }

    mostrarMensaje("¡Gracias por tu donación!", "ok");
    e.target.reset();
    cargarDonaciones();
  } catch {
    mostrarMensaje("No se pudo conectar con el servidor.", "error");
  }
});

cargarDonaciones();
cargarComedores();