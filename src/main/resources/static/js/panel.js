(function () {
  const el = (id) => document.getElementById(id);

  // Saludo según el rol
  try {
    const u = JSON.parse(localStorage.getItem("manayuda_usuario"));
    if (u) {
      el("banner-titulo").textContent = `Hola, ${u.nombre} 👋`;
      const textos = {
        DONANTE: "Gracias por donar. Registra tus donaciones y mira cómo llegan a los comedores.",
        COMEDOR: "Registra tu comedor y recibe donaciones de tu comunidad."
      };
      el("banner-texto").textContent =
        textos[u.rol] || "Conectamos donantes con comedores populares de Villa El Salvador.";
    }
  } catch {}

  // Números de las tarjetas
  async function cargarStats() {
    try {
      const [don, ent, com] = await Promise.all([
        fetch("/api/donaciones").then((r) => r.json()),
        fetch("/api/entregas").then((r) => r.json()),
        fetch("/api/comedores").then((r) => r.json())
      ]);
      const kg = ent
        .filter((e) => e.unidad === "kg")
        .reduce((suma, e) => suma + Number(e.cantidadEntregada), 0);

      el("stat-donaciones").textContent = don.filter((d) => d.estado !== "ENTREGADA").length;
      el("stat-comedores").textContent = com.length;
      el("stat-entregas").textContent = ent.length;
      el("stat-kg").textContent = kg.toLocaleString("es-PE", { maximumFractionDigits: 1 });
    } catch {}
  }

  cargarStats();

  // Se actualizan después de registrar algo
  ["form-comedor", "form-donacion", "form-entrega"].forEach((id) => {
    el(id).addEventListener("submit", () => setTimeout(cargarStats, 800));
  });
})();