const $ = (id) => document.getElementById(id);
const CLAVE_SESION = "manayuda_usuario";

// Si ya hay sesión, no tiene sentido ver el login
try {
  if (localStorage.getItem(CLAVE_SESION)) {
    window.location.replace("/panel.html");
  }
} catch {}

function mostrarMensaje(texto, tipo, id) {
  const p = $(id);
  p.textContent = texto;
  p.className = tipo;
}

// ---------- Panel izquierdo según el tipo de cuenta ----------
const MARCA = {
  DONANTE: {
    lema: "Donar alimentos, compartir esperanza.",
    items: [
      ["Dona en minutos", "Registra alimentos con su cantidad y fecha de vencimiento."],
      ["Apoya a tu comunidad", "Tus donaciones llegan a comedores populares de Villa El Salvador."],
      ["Sigue cada entrega", "Mira cuánto se entregó y cuánto queda por repartir."]
    ]
  },
  COMEDOR: {
    lema: "Recibe ayuda para tu comunidad.",
    items: [
      ["Registra tu comedor", "Cuéntanos dónde estás y cuántas personas atiendes."],
      ["Recibe donaciones", "Los donantes de tu zona pueden ayudarte con alimentos."],
      ["Lleva el control", "Registra cada entrega y mira cuánto has recibido."]
    ]
  }
};

function itemBeneficio([titulo, detalle]) {
  const li = document.createElement("li");
  const check = document.createElement("span");
  check.className = "check";
  const caja = document.createElement("div");
  const fuerte = document.createElement("strong");
  const chico = document.createElement("small");
  fuerte.textContent = titulo;
  chico.textContent = detalle;
  caja.append(fuerte, chico);
  li.append(check, caja);
  return li;
}

function aplicarMarca(rol) {
  const m = MARCA[rol] || MARCA.DONANTE;
  if (rol === "COMEDOR") {
    document.documentElement.dataset.rol = "COMEDOR";
  } else {
    delete document.documentElement.dataset.rol;
  }
  $("brand-lema").textContent = m.lema;
  $("beneficios").replaceChildren(...m.items.map(itemBeneficio));
}

function rolElegido() {
  return document.querySelector('input[name="rol"]:checked').value;
}

// ---------- Pestañas ----------
function mostrarVista(vista) {
  const esLogin = vista === "login";
  $("form-login").hidden = !esLogin;
  $("form-registro").hidden = esLogin;
  $("tab-login").classList.toggle("activa", esLogin);
  $("tab-registro").classList.toggle("activa", !esLogin);
  $("tab-login").setAttribute("aria-selected", String(esLogin));
  $("tab-registro").setAttribute("aria-selected", String(!esLogin));
  aplicarMarca(esLogin ? "DONANTE" : rolElegido());
}

$("tab-login").addEventListener("click", () => mostrarVista("login"));
$("tab-registro").addEventListener("click", () => mostrarVista("registro"));
$("ir-registro").addEventListener("click", (e) => { e.preventDefault(); mostrarVista("registro"); });
$("ir-login").addEventListener("click", (e) => { e.preventDefault(); mostrarVista("login"); });

document.querySelectorAll('input[name="rol"]').forEach((radio) => {
  radio.addEventListener("change", () => aplicarMarca(radio.value));
});

// Desde la página de inicio: #registro o #registro-comedor
if (location.hash === "#registro" || location.hash === "#registro-comedor") {
  if (location.hash === "#registro-comedor") {
    document.querySelector('input[name="rol"][value="COMEDOR"]').checked = true;
  }
  mostrarVista("registro");
}

// ---------- Mostrar / ocultar contraseña ----------
document.querySelectorAll(".ver").forEach((btn) => {
  btn.addEventListener("click", () => {
    const campo = $(btn.dataset.objetivo);
    const oculto = campo.type === "password";
    campo.type = oculto ? "text" : "password";
    btn.textContent = oculto ? "Ocultar" : "Mostrar";
  });
});

// ---------- Mensajes de error ----------
const ERRORES_LOGIN = {
  400: "Completa tu email y contraseña.",
  401: "Email o contraseña incorrectos."
};

const ERRORES_REGISTRO = {
  400: "Revisa los datos: la contraseña debe tener al menos 8 caracteres.",
  403: "Ese tipo de cuenta no se puede crear desde aquí.",
  409: "Ese email ya está registrado."
};

// ---------- Login ----------
$("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: $("login-email").value.trim(),
        password: $("login-password").value
      })
    });

    if (!res.ok) {
      mostrarMensaje(ERRORES_LOGIN[res.status] || "Ocurrió un error inesperado.",
        "error", "mensaje-login");
      return;
    }

    const usuario = await res.json();
    try { localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario)); } catch {}
    window.location.replace("/panel.html");
  } catch {
    mostrarMensaje("No se pudo conectar con el servidor.", "error", "mensaje-login");
  }
});

// ---------- Registro ----------
$("form-registro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("reg-email").value.trim();
  try {
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: $("reg-nombre").value.trim(),
        email: email,
        password: $("reg-password").value,
        rol: rolElegido()
      })
    });

    if (!res.ok) {
      mostrarMensaje(ERRORES_REGISTRO[res.status] || "Ocurrió un error inesperado.",
        "error", "mensaje-registro");
      return;
    }

    e.target.reset();
    mostrarMensaje("", "", "mensaje-registro");
    mostrarVista("login");
    $("login-email").value = email;
    mostrarMensaje("Cuenta creada. Ingresa tu contraseña para continuar.", "ok", "mensaje-login");
    $("login-password").focus();
  } catch {
    mostrarMensaje("No se pudo conectar con el servidor.", "error", "mensaje-registro");
  }
});