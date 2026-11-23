(function () {
  const $ = (id) => document.getElementById(id);
  const ETIQUETAS = { DISPONIBLE: "Disponible", ASIGNADA: "En entrega", ENTREGADA: "Entregada" };
  const MAXIMO = 6;

    // Si ya hay sesión, se muestra el nombre, el panel y la opción de salir
  try {
    const u = JSON.parse(localStorage.getItem("manayuda_usuario"));
    if (u) {
      $("acciones-visitante").hidden = true;
      $("acciones-sesion").hidden = false;
      $("lp-nombre").textContent = u.nombre;
    }
  } catch {}

  $("lp-salir").addEventListener("click", () => {
    try { localStorage.removeItem("manayuda_usuario"); } catch {}
    window.location.reload();
  });

  function vacio(contenedor, texto) {
    const d = document.createElement("div");
    d.className = "lp-vacio";
    d.textContent = texto;
    contenedor.replaceChildren(d);
  }

  function tarjetaDonacion(d) {
    const a = document.createElement("article");
    a.className = "lp-card";

    const badge = document.createElement("span");
    badge.className = `badge badge-${d.estado.toLowerCase()}`;
    badge.textContent = ETIQUETAS[d.estado] || d.estado;

    const titulo = document.createElement("h3");
    titulo.textContent = d.producto;

    const cantidad = document.createElement("p");
    cantidad.className = "cant";
    cantidad.textContent = `${d.cantidad} ${d.unidad}`;

    const vence = document.createElement("p");
    vence.textContent = d.fechaVencimiento
      ? `Vence: ${d.fechaVencimiento}`
      : "Sin fecha de vencimiento";

    a.append(badge, titulo, cantidad, vence);
    return a;
  }

  function tarjetaComedor(c) {
    const a = document.createElement("article");
    a.className = "lp-card";

    const titulo = document.createElement("h3");
    titulo.textContent = c.nombre;

    const personas = document.createElement("p");
    personas.className = "cant";
    personas.textContent = `${c.personasAtendidas} personas atendidas`;

    const direccion = document.createElement("p");
    direccion.textContent = `${c.direccion}, ${c.distrito}`;

    a.append(titulo, personas, direccion);
    return a;
  }

  async function cargar() {
    try {
      const [don, com, ent] = await Promise.all([
        fetch("/api/donaciones").then((r) => r.json()),
        fetch("/api/comedores").then((r) => r.json()),
        fetch("/api/entregas").then((r) => r.json())
      ]);

      const activas = don.filter((d) => d.estado !== "ENTREGADA");
      const kg = ent
        .filter((e) => e.unidad === "kg")
        .reduce((suma, e) => suma + Number(e.cantidadEntregada), 0);

      $("ls-donaciones").textContent = activas.length;
      $("ls-comedores").textContent = com.length;
      $("ls-entregas").textContent = ent.length;
      $("ls-kg").textContent = kg.toLocaleString("es-PE", { maximumFractionDigits: 1 });

      if (activas.length === 0) {
        vacio($("lp-donaciones"), "Todavía no hay donaciones disponibles. ¡Sé la primera persona en donar!");
      } else {
        $("lp-donaciones").replaceChildren(...activas.slice(0, MAXIMO).map(tarjetaDonacion));
      }
      $("mas-donaciones").hidden = activas.length <= MAXIMO;

      if (com.length === 0) {
        vacio($("lp-comedores"), "Todavía no hay comedores registrados.");
      } else {
        $("lp-comedores").replaceChildren(...com.slice(0, MAXIMO).map(tarjetaComedor));
      }
      $("mas-comedores").hidden = com.length <= MAXIMO;
    } catch {
      vacio($("lp-donaciones"), "No pudimos cargar las donaciones en este momento.");
      vacio($("lp-comedores"), "No pudimos cargar los comedores en este momento.");
    }
  }

  cargar();
})();