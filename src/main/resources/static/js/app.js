(function () {
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
    window.location.replace("/paginas/login.html");
    return;
  }

  const esDonante = usuario.rol === "DONANTE";
  const esComedor = usuario.rol === "COMEDOR";
  document.documentElement.dataset.rol = usuario.rol;

  $("btn-salir").addEventListener("click", () => {
    try { localStorage.removeItem(CLAVE_SESION); } catch {}
    window.location.replace("/");
  });

  // ---------- Textos según el rol ----------
  const TEXTOS = {
    DONANTE: {
      chip: "Panel de donante",
      texto: "Registra tus donaciones y mira cómo llegan a los comedores.",
      stats: ["Mis donaciones", "Kg que doné", "Kg ya entregados", "Comedores en la red"],
      tDonaciones: "Mis donaciones",
      tEntregas: "Entregas de mis donaciones",
      tComedores: "Comedores de la red",
      vacioDonaciones: "Aún no registras donaciones. Usa el formulario para crear la primera.",
      vacioEntregas: "Todavía no hay entregas de tus donaciones.",
      vacioComedores: "Aún no hay comedores registrados."
    },
    COMEDOR: {
      chip: "Panel de comedor popular",
      texto: "Registra tu comedor y gestiona las donaciones que recibes.",
      stats: ["Mis comedores", "Entregas recibidas", "Kg recibidos", "Donaciones por recibir"],
      tDonaciones: "Donaciones por recibir",
      tEntregas: "Entregas recibidas",
      tComedores: "Mis comedores",
      vacioDonaciones: "Aún no hay donaciones por recibir.",
      vacioEntregas: "Todavía no registras entregas.",
      vacioComedores: "Aún no registras tu comedor. Usa el formulario de la izquierda."
    }
  };
  const T = TEXTOS[usuario.rol] || TEXTOS.DONANTE;

  $("seccion-donacion").hidden = !esDonante;
  $("seccion-comedor").hidden = !esComedor;
  $("seccion-entrega").hidden = !esComedor;
  $("saludo").textContent = `Hola, ${usuario.nombre}`;
  $("rol-chip").textContent = T.chip;
  $("banner-titulo").textContent = `Hola, ${usuario.nombre}`;
  $("banner-texto").textContent = T.texto;
  T.stats.forEach((texto, i) => { $(`stat-${i + 1}-t`).textContent = texto; });
  $("titulo-donaciones").textContent = T.tDonaciones;
  $("titulo-entregas").textContent = T.tEntregas;
  $("titulo-comedores").textContent = T.tComedores;

  // ---------- Utilidades ----------
  const ERRORES = {
    400: "Revisa los datos ingresados.",
    403: "Solo los usuarios con rol DONANTE pueden donar.",
    404: "Tu usuario ya no existe. Vuelve a ingresar."
  };

  const ERRORES_EDICION = {
    400: "Revisa los datos ingresados.",
    403: "Solo quien registró la donación puede modificarla.",
    404: "La donación ya no existe.",
    409: "No se puede: la donación ya tiene entregas registradas."
  };

  const ETIQUETAS = {
    DISPONIBLE: "Disponible",
    ASIGNADA: "En entrega",
    ENTREGADA: "Entregada"
  };

  const fmt = (n) => Number(n).toLocaleString("es-PE", { maximumFractionDigits: 1 });

  // Pinta una lista usando textContent (evita inyectar HTML por error)
  // armar() devuelve [titulo, detalle, estado, acciones]
  // acciones es opcional: [{ texto, clase, accion }]
  function pintar(ul, datos, armar, vacio) {
    ul.replaceChildren();
    if (datos.length === 0) {
      const li = document.createElement("li");
      li.textContent = vacio;
      ul.append(li);
      return;
    }
    for (const dato of datos) {
      const [titulo, detalle, estado, acciones] = armar(dato);
      const li = document.createElement("li");
      const strong = document.createElement("strong");
      const small = document.createElement("small");
      strong.textContent = titulo;
      small.textContent = detalle;

      if (estado) {
        const badge = document.createElement("span");
        badge.className = `badge badge-${estado.toLowerCase()}`;
        badge.textContent = ETIQUETAS[estado] || estado;
        li.append(badge);
      }

      li.append(strong, small);

      if (acciones && acciones.length > 0) {
        const barra = document.createElement("div");
        barra.className = "acciones";
        for (const a of acciones) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = `btn-mini ${a.clase || ""}`.trim();
          b.textContent = a.texto;
          b.addEventListener("click", a.accion);
          barra.append(b);
        }
        li.append(barra);
      }

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

  // ---------- Datos y pintado del panel ----------
  let datos = { donaciones: [], comedores: [], entregas: [] };

  async function pedir(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url);
    return res.json();
  }

  function pintarTodo() {
    const misComedores = datos.comedores.filter((c) => c.idUsuario === usuario.id);
    const misDonaciones = datos.donaciones.filter((d) => d.idUsuario === usuario.id);
    const idsMisComedores = new Set(misComedores.map((c) => c.id));
    const idsMisDonaciones = new Set(misDonaciones.map((d) => d.id));
    const porRecibir = datos.donaciones.filter((d) => d.estado !== "ENTREGADA");
    const entregasMias = esDonante
      ? datos.entregas.filter((e) => idsMisDonaciones.has(e.idDonacion))
      : datos.entregas.filter((e) => idsMisComedores.has(e.idComedor));

    const kg = (lista, campo) => lista
      .filter((x) => x.unidad === "kg")
      .reduce((suma, x) => suma + Number(x[campo]), 0);

    // Tarjetas de números
    const valores = esDonante
      ? [misDonaciones.length, fmt(kg(misDonaciones, "cantidad")),
         fmt(kg(entregasMias, "cantidadEntregada")), datos.comedores.length]
      : [misComedores.length, entregasMias.length,
         fmt(kg(entregasMias, "cantidadEntregada")), porRecibir.length];
    valores.forEach((v, i) => { $(`stat-${i + 1}`).textContent = v; });

    // Donaciones: el donante ve las suyas, el comedor las que puede recibir
    pintar($("lista-donaciones"), esDonante ? misDonaciones : porRecibir,
      (d) => {
        const acciones = esDonante && d.estado === "DISPONIBLE"
          ? [
              { texto: "Editar", accion: () => empezarEdicion(d) },
              { texto: "Eliminar", clase: "peligro", accion: () => eliminarDonacion(d) }
            ]
          : null;
        return [
          `${d.producto} — ${d.cantidad} ${d.unidad}`,
          d.fechaVencimiento ? `Vence: ${d.fechaVencimiento}` : "Sin fecha de vencimiento",
          d.estado,
          acciones
        ];
      },
      T.vacioDonaciones);

    // Entregas
    pintar($("lista-entregas"), entregasMias,
      (e) => [
        `${e.producto} — ${e.cantidadEntregada} ${e.unidad}`,
        `Entregado a ${e.comedor}` + (e.observaciones ? ` · ${e.observaciones}` : "")
      ],
      T.vacioEntregas);

    // Comedores: el donante ve todos, el comedor solo los suyos
    pintar($("lista-comedores"), esDonante ? datos.comedores : misComedores,
      (c) => [
        c.nombre,
        `${c.direccion}, ${c.distrito} · ${c.personasAtendidas} personas atendidas`
      ],
      T.vacioComedores);

    // Desplegables del formulario de entrega
    llenarSelect($("entrega-donacion"), porRecibir,
      (d) => `${d.producto} — ${d.cantidad} ${d.unidad} (${ETIQUETAS[d.estado] || d.estado})`,
      "No hay donaciones por recibir");
    llenarSelect($("entrega-comedor"), misComedores,
      (c) => c.nombre, "Primero registra tu comedor");
  }

  async function cargarTodo() {
    try {
      const [donaciones, comedores, entregas] = await Promise.all([
        pedir("/api/donaciones"),
        pedir("/api/comedores"),
        pedir("/api/entregas")
      ]);
      datos = { donaciones, comedores, entregas };
      pintarTodo();
    } catch {
      for (const id of ["lista-donaciones", "lista-entregas", "lista-comedores"]) {
        pintar($(id), [], () => [], "No se pudieron cargar los datos. Revisa que el servidor esté encendido.");
      }
    }
  }

  // ---------- Formulario de donación (crear y editar) ----------
  const formDonacion = $("form-donacion");
  const btnDonar = formDonacion.querySelector('button[type="submit"]');
  let editandoId = null;

  // Botón "Cancelar edición": solo se ve mientras se edita
  const btnCancelar = document.createElement("button");
  btnCancelar.type = "button";
  btnCancelar.className = "secundario";
  btnCancelar.textContent = "Cancelar edición";
  btnCancelar.hidden = true;
  btnDonar.after(btnCancelar);

  function salirDeEdicion() {
    editandoId = null;
    btnDonar.textContent = "Donar";
    btnCancelar.hidden = true;
    formDonacion.reset();
  }

  function empezarEdicion(d) {
    editandoId = d.id;
    $("producto").value = d.producto;
    $("cantidad").value = d.cantidad;
    $("unidad").value = d.unidad;
    $("fechaVencimiento").value = d.fechaVencimiento || "";
    btnDonar.textContent = "Guardar cambios";
    btnCancelar.hidden = false;
    mostrarMensaje("", "", "mensaje");
    formDonacion.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btnCancelar.addEventListener("click", () => {
    salirDeEdicion();
    mostrarMensaje("", "", "mensaje");
  });

  async function eliminarDonacion(d) {
    if (!confirm(`¿Eliminar la donación "${d.producto}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/donaciones/${d.id}?idUsuario=${usuario.id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        mostrarMensaje(ERRORES_EDICION[res.status] || "Ocurrió un error inesperado.", "error");
        return;
      }
      if (editandoId === d.id) salirDeEdicion();
      mostrarMensaje("Donación eliminada.", "ok");
      cargarTodo();
    } catch {
      mostrarMensaje("No se pudo conectar con el servidor.", "error");
    }
  }

  formDonacion.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      idUsuario: usuario.id,
      producto: $("producto").value.trim(),
      cantidad: Number($("cantidad").value),
      unidad: $("unidad").value,
      fechaVencimiento: $("fechaVencimiento").value || null
    };

    const editando = editandoId !== null;

    try {
      const res = await fetch(editando ? `/api/donaciones/${editandoId}` : "/api/donaciones", {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errores = editando ? ERRORES_EDICION : ERRORES;
        mostrarMensaje(errores[res.status] || "Ocurrió un error inesperado.", "error");
        return;
      }

      mostrarMensaje(editando ? "Donación actualizada." : "¡Gracias por tu donación!", "ok");
      salirDeEdicion();
      cargarTodo();
    } catch {
      mostrarMensaje("No se pudo conectar con el servidor.", "error");
    }
  });

  // ---------- Formulario de comedor ----------
  const ERRORES_COMEDOR = {
    400: "Revisa los datos del comedor.",
    403: "Solo los usuarios con rol COMEDOR pueden registrar un comedor.",
    404: "Tu usuario ya no existe. Vuelve a ingresar."
  };

  $("form-comedor").addEventListener("submit", async (e) => {
    e.preventDefault();

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
      cargarTodo();
    } catch {
      mostrarMensaje("No se pudo conectar con el servidor.", "error", "mensaje-comedor");
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
      mostrarMensaje("Elige una donación y tu comedor.", "error", "mensaje-entrega");
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
      cargarTodo();
    } catch {
      mostrarMensaje("No se pudo conectar con el servidor.", "error", "mensaje-entrega");
    }
  });

  // ---------- Carga inicial ----------
  cargarTodo();
})();