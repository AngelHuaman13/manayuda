const $ = (id) => document.getElementById(id);

// ---------- Sesión ----------
const CLAVE_SESION = "manayuda_usuario";
let usuario = null;

try {
  usuario = JSON.parse(localStorage.getItem(CLAVE_SESION));
} catch {
  usuario = null;
}

if (!usuario) {
  // Sin sesión: se va al login
  window.location.replace("/paginas/login.html");
} else {
  $("seccion-donacion").hidden = usuario.rol !== "DONANTE";
  $("seccion-comedor").hidden = usuario.rol !== "COMEDOR";
  $("saludo").textContent = `Hola, ${usuario.nombre} (${usuario.rol})`;
}

$("btn-salir").addEventListener("click", () => {
  try { localStorage.removeItem(CLAVE_SESION); } catch {}
  window.location.replace("/paginas/login.html");
});

// ---------- Utilidades ----------
const ERRORES = {
  400: "Revisa los datos ingresados.",
  403: "Solo los usuarios con rol DONANTE pueden donar.",
  404: "Tu usuario ya no existe. Vuelve a ingresar."
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

function mostrarMensaje(texto, tipo, id = "mensaje") {
  const p = $(id);
  p.textContent = texto;
  p.className = tipo;
}

function llenarSelect(select, datos, etiqueta, vacio) {
  select.replaceChildren();
  if (datos.length === 0) {
    const o = document.createElement("option");
    o.value = "";
    o.textContent = vacio;
    select.append(o);
    return;
  }
  for (const d of datos) {
    const o = document.createElement("option");
    o.value = d.id;
    o.textContent = etiqueta(d);
    select.append(o);
  }
}

// ---------- Carga de datos ----------
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

async function cargarSelects() {
  const [disponibles, asignadas, comedores] = await Promise.all([
    fetch("/api/donaciones?estado=DISPONIBLE").then((r) => r.json()),
    fetch("/api/donaciones?estado=ASIGNADA").then((r) => r.json()),
    fetch("/api/comedores").then((r) => r.json())
  ]);
  llenarSelect($("entrega-donacion"), [...disponibles, ...asignadas],
    (d) => `${d.producto} — ${d.cantidad} ${d.unidad} (${d.estado})`,
    "No hay donaciones por entregar");
  llenarSelect($("entrega-comedor"), comedores,
    (c) => c.nombre, "No hay comedores registrados");
}

async function cargarEntregas() {
  const res = await fetch("/api/entregas");
  const datos = await res.json();
  pintar($("lista-entregas"), datos,
    (e) => [
      `${e.producto} — ${e.cantidadEntregada} ${e.unidad}`,
      `Entregado a ${e.comedor}` + (e.observaciones ? ` · ${e.observaciones}` : "")
    ],
    "Aún no hay entregas.");
}

// ---------- Formulario de comedor ----------
const ERRORES_COMEDOR = {
  400: "Revisa los datos del comedor.",
  403: "Solo los usuarios con rol COMEDOR pueden registrar un comedor.",
  404: "Tu usuario ya no existe. Vuelve a ingresar."
};

$("form-comedor").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!usuario) {
    mostrarMensaje("Inicia sesión para registrar tu comedor.", "error", "mensaje-comedor");
    return;
  }

  const body = {
    idUsuario: usuario.id,
    nombre: $("com-nombre").value.trim(),
    direccion: $("com-direccion").value.trim(),
    distrito: $("com-distrito").value.trim(),
    telefono: $("com-telefono").value.trim() || null,
    personasAtendidas: $("com-personas").value ? Number($("com-personas").value) : 0
  };

  try {
    const res = await fetch("/api/comedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      mostrarMensaje(ERRORES_COMEDOR[res.status] || "Ocurrió un error inesperado.",
        "error", "mensaje-comedor");
      return;
    }

    mostrarMensaje("Comedor registrado.", "ok", "mensaje-comedor");
    e.target.reset();
    $("com-distrito").value = "Villa El Salvador";
    cargarComedores();
    cargarSelects();
  } catch {
    mostrarMensaje("No se pudo conectar con el servidor.", "error", "mensaje-comedor");
  }
});

// ---------- Formulario de donación ----------
$("form-donacion").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!usuario) {
    mostrarMensaje("Inicia sesión para donar.", "error");
    return;
  }

  const body = {
    idUsuario: usuario.id,
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
    cargarSelects();
  } catch {
    mostrarMensaje("No se pudo conectar con el servidor.", "error");
  }
});

// ---------- Formulario de entrega ----------
const ERRORES_ENTREGA = {
  400: "Revisa los datos ingresados.",
  404: "La donación o el comedor ya no existe.",
  409: "No se pudo: la cantidad supera lo que queda, o la donación ya se entregó o venció."
};

$("form-entrega").addEventListener("submit", async (e) => {
  e.preventDefault();

  const idDonacion = $("entrega-donacion").value;
  const idComedor = $("entrega-comedor").value;
  if (!idDonacion || !idComedor) {
    mostrarMensaje("Elige una donación y un comedor.", "error", "mensaje-entrega");
    return;
  }

  const body = {
    idDonacion: Number(idDonacion),
    idComedor: Number(idComedor),
    cantidadEntregada: Number($("entrega-cantidad").value),
    observaciones: $("entrega-obs").value.trim() || null
  };

  try {
    const res = await fetch("/api/entregas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      mostrarMensaje(ERRORES_ENTREGA[res.status] || "Ocurrió un error inesperado.",
        "error", "mensaje-entrega");
      return;
    }

    mostrarMensaje("Entrega registrada.", "ok", "mensaje-entrega");
    e.target.reset();
    cargarDonaciones();
    cargarSelects();
    cargarEntregas();
  } catch {
    mostrarMensaje("No se pudo conectar con el servidor.", "error", "mensaje-entrega");
  }
});

// ---------- Carga inicial ----------
cargarDonaciones();
cargarComedores();
cargarSelects();
cargarEntregas();