// ---------- ATAJO PARA BUSCAR ELEMENTOS ----------
// $("#correo") es lo mismo que document.querySelector("#correo")
const $ = selector => document.querySelector(selector);

// ---------- GUARDAR Y LEER DATOS (localStorage) ----------
// localStorage guarda datos en el navegador aunque cierres la página

// Lee un dato guardado. Si no existe, devuelve "defecto" (una lista vacía)
const obtener = (clave, defecto = []) => {
    try {
        return JSON.parse(localStorage.getItem(clave)) ?? defecto;
    } catch {
        return defecto;
    }
};

// Guarda un dato en el navegador
const guardar = (clave, valor) => {
    localStorage.setItem(clave, JSON.stringify(valor));
    /* Cada vez que cambian los productos (venta, entrada, salida, producto nuevo)
       se revisa si alguno llegó al mínimo para hacer la recompra solo */
    if (clave === "sm_productos") revisarRecompras();
};

// Atajos para leer cada tipo de dato
const usuario = () => obtener("sm_usuario", {});
const empresa = () => obtener("sm_empresa", {});
const productos = () => obtener("sm_productos");
const compras = () => obtener("sm_compras");
const ventas = () => obtener("sm_ventas");
const proveedores = () => obtener("sm_proveedores");
const movimientos = () => obtener("sm_movimientos");

// ---------- RUTAS (direcciones de las páginas) ----------

// Si estás dentro de /pages/ no hace falta escribir "pages/"
const ruta = archivo => {
    const enPages = location.pathname.includes("/pages/");
    return (enPages ? "" : "pages/") + archivo;
};

// Te lleva a otra página
const ir = archivo => {
    location.href = ruta(archivo);
};

// NUEVO: dirección del Inicio según dónde estés
// (dentro de /pages/ hay que subir una carpeta con ../)
const urlInicio = () =>
    location.pathname.includes("/pages/") ? "../index.html?panel=1" : "index.html?panel=1";

// NUEVO: dirección correcta de la carpeta img/
const imagen = nombre =>
    (location.pathname.includes("/pages/") ? "../img/" : "img/") + nombre;

// NUEVO: crea una etiqueta <img> con una imagen de la carpeta img/
const iconoImg = (nombre, texto = "", tam = 24) =>
    `<img src="${imagen(nombre)}" alt="${texto}" width="${tam}" height="${tam}" style="object-fit:contain;">`;

// ---------- FORMATO ----------

// Convierte 1500 en $1,500.00
const dinero = cantidad =>
    Number(cantidad || 0).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN"
    });

// Protege la página: cambia símbolos peligrosos (< > &) por texto seguro
const escapar = texto => String(texto ?? "").replace(/[&<>"']/g, letra => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}[letra]));

// ---------- MENSAJES ----------
// Muestra un mensaje (ej. "Guardado correctamente").
// animate__bounceIn = el mensaje aparece con un rebote
const aviso = (mensaje, tipo = "success") => {
    const contenedor = $("#avisos");
    if (!contenedor) {
        alert(mensaje);
        return;
    }

    /* insertAdjacentHTML("beforeend") agrega el mensaje SIN borrar los anteriores */
    contenedor.insertAdjacentHTML("beforeend", `
        <div class="alert alert-${tipo} alert-dismissible fade show animate__animated animate__bounceIn" role="alert">
            ${escapar(mensaje)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`);
};

// ---------- INICIAR SESIÓN ----------
function iniciarSesion(evento) {
    evento.preventDefault(); // evita que el formulario recargue la página

    const correo = $("#correo").value.trim().toLowerCase();
    const password = $("#password").value;
    const usuarios = obtener("sm_usuarios");

    // Busca un usuario con ese correo y contraseña
    const encontrado = usuarios.find(
        u => u.correo.toLowerCase() === correo && u.password === password
    );

    if (!encontrado) {
        aviso("Correo o contraseña incorrectos.", "danger");
        return;
    }

    guardar("sm_usuario", encontrado); // recuerda quién inició sesión
    ir("empresa.html");
}

// ---------- REGISTRAR USUARIO ----------
function registrarUsuario(evento) {
    evento.preventDefault();

    const nombre = $("#nombre").value.trim();
    const correo = $("#correo").value.trim().toLowerCase();
    const password = $("#password").value;
    const telefono = $("#telefono").value.trim();
    const tipo = $("#tipoUsuario").value;
    const usuarios = obtener("sm_usuarios");

    // No permite dos cuentas con el mismo correo
    if (usuarios.some(u => u.correo.toLowerCase() === correo)) {
        aviso("Este correo ya está registrado.", "warning");
        return;
    }

    const nuevo = {
        id: Date.now(), // número único basado en la hora
        nombre,
        correo,
        password,
        telefono,
        tipo
    };

    usuarios.push(nuevo);
    guardar("sm_usuarios", usuarios);
    guardar("sm_usuario", nuevo);
    ir("empresa.html");
}

// ---------- REGISTRAR EMPRESA ----------
function registrarEmpresa(evento) {
    evento.preventDefault();

    const datos = {
        nombre: $("#nombreEmpresa").value.trim(),
        ubicacion: $("#ubicacion").value.trim(),
        tipo: $("#tipoEmpresa").value,
        rfc: $("#rfc").value.trim().toUpperCase(),
        telefono: $("#telefonoEmpresa").value.trim()
    };

    guardar("sm_empresa", datos);
    location.href = "../index.html?panel=1"; // va al panel principal
}

// ---------- CERRAR SESIÓN ----------
// CAMBIO: ahora funciona desde index.html y desde /pages/
function cerrarSesion() {
    localStorage.removeItem("sm_usuario");
    location.href = location.pathname.includes("/pages/") ? "../index.html" : "index.html";
}

// ---------- DATOS DE DEMOSTRACIÓN ----------
// Si no hay datos guardados, crea unos de ejemplo para que la página no se vea vacía
function prepararDemo() {
    // Usuario de prueba
    if (!obtener("sm_usuarios").length) {
        guardar("sm_usuarios", [{
            id: 1,
            nombre: "Usuario Demo",
            correo: "demo@stockmanager.mx",
            password: "demo123",
            telefono: "5551234567",
            tipo: "Administrador"
        }]);
    }

    // Productos de ejemplo
    if (!obtener("sm_productos").length) {
        guardar("sm_productos", [
            {
                id: 101,
                nombre: "Shampoo hidratante",
                categoria: "Belleza",
                proveedor: "Distribuidora Luna",
                existencia: 8,
                minimo: 5,
                maximo: 30,
                precio: 120,
                imagen: "",
                ventas: 24
            },
            {
                id: 102,
                nombre: "Crema corporal",
                categoria: "Belleza",
                proveedor: "Distribuidora Luna",
                existencia: 3,
                minimo: 8,
                maximo: 40,
                precio: 95,
                imagen: "",
                ventas: 18
            },
            {
                id: 103,
                nombre: "Jabón líquido",
                categoria: "Higiene",
                proveedor: "Comercial del Centro",
                existencia: 35,
                minimo: 10,
                maximo: 50,
                precio: 45,
                imagen: "",
                ventas: 12
            },
            {
                id: 104,
                nombre: "Aceite para masaje",
                categoria: "Belleza",
                proveedor: "Distribuidora Luna",
                existencia: 0,
                minimo: 5,
                maximo: 25,
                precio: 150,
                imagen: "",
                ventas: 8
            }
        ]);
    }

    // Proveedores de ejemplo
    if (!obtener("sm_proveedores").length) {
        guardar("sm_proveedores", [
            {
                id: 201,
                nombre: "Distribuidora Luna",
                telefono: "5551112233",
                correo: "ventas@luna.mx",
                empresa: "Distribuidora Luna"
            },
            {
                id: 202,
                nombre: "Comercial del Centro",
                telefono: "5554446677",
                correo: "contacto@centro.mx",
                empresa: "Comercial del Centro"
            }
        ]);
    }

    // Ventas de ejemplo (con la fecha de hoy)
    if (!obtener("sm_ventas").length) {
        guardar("sm_ventas", [
            { id: 301, producto: "Shampoo hidratante", cantidad: 12, total: 1440, fecha: new Date().toISOString().slice(0, 10) },
            { id: 302, producto: "Crema corporal", cantidad: 8, total: 760, fecha: new Date().toISOString().slice(0, 10) },
            { id: 303, producto: "Jabón líquido", cantidad: 5, total: 225, fecha: new Date().toISOString().slice(0, 10) }
        ]);
    }

    // Compras y movimientos empiezan vacíos
    if (!obtener("sm_compras").length) guardar("sm_compras", []);
    if (!obtener("sm_movimientos").length) guardar("sm_movimientos", []);
}

// ---------- DISEÑO GENERAL (menú lateral + encabezado) ----------
// Dibuja el menú, el encabezado y el contenido de cada página
function layout(titulo, contenido, activo) {
    const u = usuario();   // usuario que inició sesión
    const e = empresa();   // datos de la empresa

    // Menú lateral: [imagen, texto, enlace, id]
    // Cada imagen se llama como su sección + .jpeg (carpeta img/)
    const enlaces = [
        ["inicio.jpeg", "Inicio", urlInicio(), "inicio"],
        ["productos.jpeg", "Productos", ruta("productos.html"), "productos"],
        ["movimientos.jpeg", "Movimientos", ruta("movimientos.html"), "movimientos"],
        ["compras.jpeg", "Compras", ruta("compras.html"), "compras"],
        ["ventas.jpeg", "Ventas", ruta("ventas.html"), "ventas"],
        ["proveedores.jpeg", "Proveedores", ruta("proveedores.html"), "proveedores"],
        ["reportes.jpeg", "Reportes", ruta("reportes.html"), "reportes"],
        ["perfil.jpeg", "Mi perfil", ruta("perfil.html"), "perfil"]
    ];

    $("#app").innerHTML = `
        <div class="app-layout">
            <!-- La barra lateral NO lleva animación: en celular se oculta
                 con transform y Animate.css lo cancelaría -->
            <aside class="sidebar" id="sidebar">
                <a href="${urlInicio()}" class="sidebar-brand">
                    ${iconoImg("logo.jpeg", "StockManager", 30)} Stock<span>Manager</span>
                </a>
                <div class="sidebar-label">Menú principal</div>
                ${enlaces.map(([archivo, texto, url, id]) => `
                    <a class="sidebar-link ${activo === id ? "active" : ""}"
                       href="${url}">
                        <span class="nav-icon">${iconoImg(archivo)}</span>
                        <span>${texto}</span>
                    </a>
                `).join("")}
                <div class="sidebar-label mt-4">Sesión</div>
                <a class="sidebar-link" href="#" id="salir">
                    <span class="nav-icon">↪</span> Cerrar sesión
                </a>
            </aside>

            <div class="overlay" id="overlay"></div>

            <!-- animate__fadeIn = toda la página aparece poco a poco -->
            <main class="main-area animate__animated animate__fadeIn">
                <header class="topbar">
                    <div class="d-flex align-items-start gap-2">
                        <button class="btn btn-light mobile-menu-button"
                                id="abrirMenu" aria-label="Abrir menú">☰</button>
                        <div>
                            <h1>${titulo}</h1>
                            <div class="muted">Administra tu inventario de forma sencilla.</div>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">${escapar(e.nombre || "StockManager")}</div>
                        <div class="muted">${escapar(u.nombre || "Usuario")}</div>
                    </div>
                </header>

                <div id="avisos"></div>
                ${contenido}
            </main>
        </div>`;

    /* Si el sistema creó pedidos automáticos, avisa de cuáles productos */
    if (avisosRecompra.length) {
        aviso("Recompra automática: se generó pedido de " + avisosRecompra.join(", ") + ".", "info");
        avisosRecompra = [];
    }

    // --- ANIMACIONES (regla de clase: animate__animated + animate__EFECTO) ---
    // Tarjetas de números: entran con zoom. animate__faster = más rápido
    document.querySelectorAll(".stat-card").forEach(t =>
        t.classList.add("animate__animated", "animate__zoomIn", "animate__faster"));
    // Paneles y tablas: suben mientras aparecen
    document.querySelectorAll(".panel-card").forEach(t =>
        t.classList.add("animate__animated", "animate__fadeInUp", "animate__faster"));

    // Botón "Cerrar sesión"
    $("#salir").addEventListener("click", evento => {
        evento.preventDefault();
        cerrarSesion();
    });

    // Botón ☰ (celular): abre y cierra el menú
    $("#abrirMenu").addEventListener("click", () => {
        $("#sidebar").classList.toggle("open");
        $("#overlay").classList.toggle("show");
    });

    // Tocar fuera del menú lo cierra
    $("#overlay").addEventListener("click", () => {
        $("#sidebar").classList.remove("open");
        $("#overlay").classList.remove("show");
    });
}

// ---------- ETIQUETA DE ESTADO DEL STOCK ----------
// Agotado (0), Stock bajo (en o debajo del mínimo) o Disponible
function estadoStock(p) {
    if (Number(p.existencia) === 0) {
        return '<span class="badge-stock stock-out">Agotado</span>';
    }
    if (Number(p.existencia) <= Number(p.minimo)) {
        return '<span class="badge-stock stock-low">Stock bajo</span>';
    }
    return '<span class="badge-stock stock-ok">Disponible</span>';
}

// ---------- FOTO DEL PRODUCTO ----------
// Si el producto tiene foto la muestra; si no, usa productos.jpeg
function imagenProducto(p) {
    if (p.imagen) {
        return `<img class="product-image" src="${escapar(p.imagen)}" alt="${escapar(p.nombre)}">`;
    }
    return `<div class="product-placeholder">${iconoImg("productos.jpeg", "Producto", 32)}</div>`;
}

// ---------- PRODUCTOS: FILAS DE LA TABLA ----------
// Recibe la lista de productos y arma una fila (<tr>) por cada uno
function tablaProductos(lista) {
    // Si no hay productos, muestra un mensaje
    if (!lista.length) {
        return `<tr><td colspan="7">
            <div class="empty-state">${iconoImg("productos.jpeg", "Sin productos", 40)}<p>No hay productos registrados.</p></div>
        </td></tr>`;
    }

    return lista.map(p => `
        <tr>
            <td>${imagenProducto(p)}</td>
            <td class="fw-semibold">${escapar(p.nombre)}</td>
            <td>${escapar(p.categoria)}</td>
            <td>${p.existencia}</td>
            <td>${p.minimo}</td>
            <td>${estadoStock(p)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary"
                            onclick="editarProducto(${p.id})">Editar</button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="eliminarProducto(${p.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join("");
}

// ---------- PRODUCTOS: FORMULARIO (agregar o editar) ----------
// Si recibe un producto (p) lo está editando; si no, es uno nuevo
function formularioProducto(p = {}) {
    const editando = Boolean(p.id);

    $("#modalTitulo").textContent = editando ? "Editar producto" : "Agregar producto";

    // CAMBIO: escribimos dentro de #camposProducto (antes se borraba todo el formulario)
    $("#camposProducto").innerHTML = `
        <input type="hidden" id="productoId" value="${p.id || ""}">

        <div class="col-12">
            <label class="form-label">Nombre del producto</label>
            <input class="form-control" id="productoNombre" required
                   value="${escapar(p.nombre || "")}" placeholder="Ej. Shampoo hidratante">
        </div>

        <div class="col-md-6">
            <label class="form-label">Categoría</label>
            <select class="form-select" id="productoCategoria" required>
                ${["Belleza", "Higiene", "Alimentos", "Industrial", "Papelería", "Otro"]
                    .map(c => `<option ${p.categoria === c ? "selected" : ""}>${c}</option>`).join("")}
            </select>
        </div>

        <div class="col-md-6">
            <label class="form-label">Proveedor</label>
            <input class="form-control" id="productoProveedor"
                   value="${escapar(p.proveedor || "")}" placeholder="Nombre del proveedor">
        </div>

        <div class="col-md-4">
            <label class="form-label">Existencia actual</label>
            <input type="number" min="0" class="form-control" id="productoExistencia"
                   value="${p.existencia ?? 0}" required>
        </div>

        <div class="col-md-4">
            <label class="form-label">Stock mínimo</label>
            <input type="number" min="0" class="form-control" id="productoMinimo"
                   value="${p.minimo ?? 5}" required>
        </div>

        <div class="col-md-4">
            <label class="form-label">Stock máximo</label>
            <input type="number" min="1" class="form-control" id="productoMaximo"
                   value="${p.maximo ?? 30}" required>
        </div>

        <div class="col-md-6">
            <label class="form-label">Precio unitario (MXN)</label>
            <input type="number" min="0" step="0.01" class="form-control" id="productoPrecio"
                   value="${p.precio ?? 0}" required>
        </div>

        <div class="col-md-6">
            <label class="form-label">Imagen del producto (URL opcional)</label>
            <input class="form-control" type="url" id="productoImagen"
                   value="${escapar(p.imagen || "")}" placeholder="https://...">
        </div>

        <div class="col-12">
            <button class="btn btn-primary w-100" type="submit">
                ${editando ? "Guardar cambios" : "Agregar producto"}
            </button>
        </div>`;
}

// ---------- PRODUCTOS: GUARDAR ----------
function guardarProducto(evento) {
    evento.preventDefault();

    const lista = productos();
    const id = Number($("#productoId").value); // 0 si es un producto nuevo

    // Arma el producto con lo que se escribió en el formulario
    const p = {
        id: id || Date.now(),
        nombre: $("#productoNombre").value.trim(),
        categoria: $("#productoCategoria").value,
        proveedor: $("#productoProveedor").value.trim() || "Sin proveedor",
        existencia: Number($("#productoExistencia").value),
        minimo: Number($("#productoMinimo").value),
        maximo: Number($("#productoMaximo").value),
        precio: Number($("#productoPrecio").value),
        imagen: $("#productoImagen").value.trim(),
        ventas: (lista.find(x => x.id === id) || {}).ventas || 0
    };

    // Validación: el mínimo no puede ser mayor que el máximo
    if (p.minimo > p.maximo) {
        aviso("El stock mínimo no puede ser mayor que el máximo.", "warning");
        return;
    }

    if (id) {
        // Editando: reemplaza el producto anterior por el nuevo
        guardar("sm_productos", lista.map(x => x.id === id ? p : x));
    } else {
        // Nuevo: lo agrega a la lista
        lista.push(p);
        guardar("sm_productos", lista);
    }

    bootstrap.Modal.getInstance($("#modalProducto")).hide(); // cierra la ventana
    renderProductos();
    aviso(id ? "Producto actualizado." : "Producto agregado.");
}

// ---------- PRODUCTOS: EDITAR ----------
function editarProducto(id) {
    const p = productos().find(x => x.id === id);
    if (!p) return;

    formularioProducto(p);
    bootstrap.Modal.getOrCreateInstance($("#modalProducto")).show();
}

// ---------- PRODUCTOS: ELIMINAR ----------
function eliminarProducto(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    // Conserva todos los productos menos el que se eliminó
    guardar("sm_productos", productos().filter(p => p.id !== id));
    renderProductos();
    aviso("Producto eliminado.");
}

// ---------- PRODUCTOS: PÁGINA COMPLETA ----------
function renderProductos() {
    layout("Productos", `
        <div class="panel-card mb-4">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                    <h2 class="section-title mb-1">Inventario de productos</h2>
                    <div class="muted">Consulta y administra las existencias.</div>
                </div>
                <button class="btn btn-primary" id="nuevoProducto">+ Agregar producto</button>
            </div>
            <div class="mt-4">
                <input id="buscarProducto" class="form-control search-box"
                       placeholder="Buscar por nombre o categoría...">
            </div>
            <div class="table-responsive mt-3">
                <table class="table">
                    <thead><tr>
                        <th>Imagen</th><th>Producto</th><th>Categoría</th>
                        <th>Existencia</th><th>Mínimo</th><th>Estado</th><th>Acciones</th>
                    </tr></thead>
                    <tbody id="tablaProductos"></tbody>
                </table>
            </div>
        </div>

        <!-- Ventana (modal) para agregar o editar un producto -->
        <div class="modal fade" id="modalProducto" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 rounded-4">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalTitulo">Agregar producto</h5>
                        <button class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="formProducto">
                        <div class="modal-body">
                            <!-- Aquí formularioProducto() pone los campos -->
                            <div class="row g-3" id="camposProducto"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `, "productos");

    // Al enviar el formulario, se guarda el producto
    $("#formProducto").addEventListener("submit", guardarProducto);

    // Dibuja la tabla filtrando por lo que se escribe en el buscador
    const dibujar = () => {
        const busqueda = $("#buscarProducto").value.toLowerCase();
        const lista = productos().filter(p =>
            p.nombre.toLowerCase().includes(busqueda) ||
            p.categoria.toLowerCase().includes(busqueda)
        );
        $("#tablaProductos").innerHTML = tablaProductos(lista);
    };

    $("#buscarProducto").addEventListener("input", dibujar);
    $("#nuevoProducto").addEventListener("click", () => {
        formularioProducto();
        bootstrap.Modal.getOrCreateInstance($("#modalProducto")).show();
    });

    dibujar();
}

// ---------- MOVIMIENTOS (entradas y salidas) ----------
function renderMovimientos() {
    const lista = productos();

    layout("Movimientos de inventario", `
        <div class="panel-card">
            <h2 class="section-title">Registrar entrada o salida</h2>
            <form id="formMovimiento" class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Producto</label>
                    <select class="form-select" id="movProducto" required>
                        ${lista.map(p => `<option value="${p.id}">${escapar(p.nombre)} (${p.existencia} disponibles)</option>`).join("")}
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Tipo de movimiento</label>
                    <select class="form-select" id="movTipo">
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Cantidad</label>
                    <input type="number" class="form-control" id="movCantidad" min="1" required>
                </div>
                <div class="col-12">
                    <label class="form-label">Observaciones</label>
                    <input class="form-control" id="movNota" placeholder="Motivo del movimiento">
                </div>
                <div class="col-12">
                    <button class="btn btn-primary">Registrar movimiento</button>
                </div>
            </form>
        </div>
        <div class="panel-card mt-4">
            <h2 class="section-title">Historial de movimientos</h2>
            <div class="table-responsive">
                <table class="table">
                    <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Observaciones</th></tr></thead>
                    <tbody>
                        ${movimientos().slice().reverse().map(m => `
                            <tr>
                                <td>${m.fecha}</td>
                                <td>${escapar(m.producto)}</td>
                                <td>${m.tipo === "entrada" ? "Entrada" : "Salida"}</td>
                                <td>${m.cantidad}</td>
                                <td>${escapar(m.nota)}</td>
                            </tr>`).join("") || '<tr><td colspan="5">Sin movimientos registrados.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `, "movimientos"); // CAMBIO: antes decía "productos" y el menú marcaba mal la sección

    // Al enviar el formulario se registra el movimiento
    $("#formMovimiento").addEventListener("submit", evento => {
        evento.preventDefault();

        const lista = productos();
        const p = lista.find(x => x.id === Number($("#movProducto").value));
        const cantidad = Number($("#movCantidad").value);
        const tipo = $("#movTipo").value;

        if (!p || cantidad < 1) return;

        // No se puede sacar más de lo que hay
        if (tipo === "salida" && cantidad > p.existencia) {
            aviso("No hay suficiente existencia para esa salida.", "danger");
            return;
        }

        // Entrada suma, salida resta
        p.existencia += tipo === "entrada" ? cantidad : -cantidad;
        guardar("sm_productos", lista);

        // Guarda el movimiento en el historial
        const historial = movimientos();
        historial.push({
            fecha: new Date().toLocaleDateString("es-MX"),
            producto: p.nombre,
            tipo,
            cantidad,
            nota: $("#movNota").value.trim()
        });
        guardar("sm_movimientos", historial);

        aviso("Movimiento registrado correctamente.");
        renderMovimientos();
    });
}
/* ---------- RECOMPRA AUTOMÁTICA ----------
   Revisa todos los productos. Si uno llegó a su stock mínimo (o menos)
   y todavía no tiene un pedido pendiente, el sistema crea el pedido solo. */

// Guarda los nombres de los productos que se pidieron, para avisar en pantalla
let avisosRecompra = [];

function revisarRecompras() {
    const lista = productos();   // todos los productos
    const pedidos = compras();   // los pedidos que ya existen
    let nuevos = 0;              // cuántos pedidos se crean ahora

    lista.forEach(p => {
        // ¿Este producto ya tiene un pedido pendiente?
        const yaPedido = pedidos.some(c => c.productoId === p.id && c.estado === "Pendiente");

        // Cuánto falta para llegar al stock máximo
        const cantidad = Math.max(0, p.maximo - p.existencia);

        // Si llegó al mínimo, no tiene pedido pendiente y falta por comprar: crea el pedido
        if (p.existencia <= p.minimo && !yaPedido && cantidad > 0) {
            pedidos.push({
                id: Date.now() + nuevos,   // número único
                productoId: p.id,
                producto: p.nombre,
                proveedor: p.proveedor,
                cantidad,
                total: cantidad * p.precio,
                estado: "Pendiente",
                automatico: true           // marca que lo creó el sistema
            });
            avisosRecompra.push(p.nombre);
            nuevos++;
        }
    });

    // Solo guarda si se creó algún pedido
    if (nuevos > 0) guardar("sm_compras", pedidos);
}

/* ---------- COMPRAS ----------
   Los pedidos los crea solo revisarRecompras().
   Aquí solo se consultan y se marcan como recibidos. */
function renderCompras() {
    const lista = productos();
    const pedidos = compras();

    layout("Compras y recompras", `
        <div class="row g-3 mb-4">
            <div class="col-md-4"><div class="stat-card">
                <div class="stat-icon">${iconoImg("compras.jpeg", "Compras")}</div><div><p>Pedidos pendientes</p><h3>${pedidos.filter(c => c.estado === "Pendiente").length}</h3></div>
            </div></div>
            <div class="col-md-4"><div class="stat-card">
                <div class="stat-icon">${iconoImg("alerta.jpeg", "Alerta")}</div><div><p>Productos en stock mínimo</p><h3>${lista.filter(p => p.existencia <= p.minimo).length}</h3></div>
            </div></div>
            <div class="col-md-4"><div class="stat-card">
                <div class="stat-icon">${iconoImg("ventas.jpeg", "Ventas")}</div><div><p>Valor de pedidos</p><h3>${dinero(pedidos.filter(c => c.estado === "Pendiente").reduce((s,c) => s + c.total, 0))}</h3></div>
            </div></div>
        </div>

        <div class="panel-card mb-4">
            <h2 class="section-title">Recompra automática</h2>
            <p class="muted mb-0">Cuando un producto llega a su stock mínimo, el sistema genera el pedido solo, por la cantidad necesaria para llegar al stock máximo. Cuando llegue la mercancía, márcala como recibida.</p>
        </div>

        <div class="panel-card">
            <h2 class="section-title">Pedidos pendientes y recibidos</h2>
            <div class="table-responsive"><table class="table">
                <thead><tr><th>Producto</th><th>Proveedor</th><th>Cantidad</th><th>Total</th><th>Origen</th><th>Estado</th><th>Acción</th></tr></thead>
                <tbody>
                    ${pedidos.map(c => `<tr>
                        <td>${escapar(c.producto)}</td>
                        <td>${escapar(c.proveedor)}</td>
                        <td>${c.cantidad}</td>
                        <td>${dinero(c.total)}</td>
                        <td>${c.automatico ? "Automático" : "Manual"}</td>
                        <td>${c.estado}</td>
                        <td>${c.estado === "Pendiente" ? `<button class="btn btn-sm btn-success" onclick="recibirCompra(${c.id})">Recibir</button>` : "Completado"}</td>
                    </tr>`).join("") || '<tr><td colspan="7">Todavía no hay pedidos.</td></tr>'}
                </tbody>
            </table></div>
        </div>
    `, "compras");
}

// ---------- COMPRAS: SOLICITAR UN PEDIDO ----------
function solicitarCompra(id) {
    const p = productos().find(x => x.id === id);
    if (!p) return;
    /* Si ya hay un pedido pendiente de este producto (por ejemplo el automático), no se repite */
    if (compras().some(c => c.productoId === p.id && c.estado === "Pendiente")) {
        aviso("Este producto ya tiene un pedido pendiente.", "warning");
        return;
    }

    // Pide lo necesario para llegar al stock máximo
    const cantidad = Math.max(0, p.maximo - p.existencia);
    if (cantidad === 0) {
        aviso("El producto ya tiene suficientes existencias.", "warning");
        return;
    }

    const lista = compras();
    lista.push({
        id: Date.now(),
        productoId: p.id,
        producto: p.nombre,
        proveedor: p.proveedor,
        cantidad,
        total: cantidad * p.precio,
        estado: "Pendiente"
    });
    guardar("sm_compras", lista);

    // CAMBIO: si estás en Compras redibuja Compras; si estás en el Inicio, redibuja el Inicio
    if (document.body.dataset.page === "compras") renderCompras(); else renderInicio();
    aviso("Pedido agregado. Recuerda confirmar la compra con tu proveedor.");
}

// ---------- COMPRAS: RECIBIR UN PEDIDO ----------
function recibirCompra(id) {
    const pedidos = compras();
    const pedido = pedidos.find(c => c.id === id);
    if (!pedido || pedido.estado !== "Pendiente") return;

    // Suma lo recibido a la existencia del producto
    const lista = productos();
    const p = lista.find(x => x.id === pedido.productoId);

    if (p) {
        p.existencia += pedido.cantidad;
        guardar("sm_productos", lista);
    }

    pedido.estado = "Recibido";
    guardar("sm_compras", pedidos);

    // Lo anota como una entrada en el historial de movimientos
    const historial = movimientos();
    historial.push({
        fecha: new Date().toLocaleDateString("es-MX"),
        producto: pedido.producto,
        tipo: "entrada",
        cantidad: pedido.cantidad,
        nota: "Recepción de compra"
    });
    guardar("sm_movimientos", historial);

    renderCompras();
    aviso("Compra recibida y existencias actualizadas.");
}

// ---------- VENTAS ----------
function renderVentas() {
    const lista = productos();
    const historial = ventas();

    layout("Ventas", `
        <div class="row g-3 mb-4">
            <div class="col-md-6"><div class="stat-card">
                <div class="stat-icon">${iconoImg("ventas.jpeg", "Ventas")}</div><div><p>Ventas registradas</p><h3>${historial.length}</h3></div>
            </div></div>
            <div class="col-md-6"><div class="stat-card">
                <div class="stat-icon">${iconoImg("reportes.jpeg", "Reportes")}</div><div><p>Total vendido</p><h3>${dinero(historial.reduce((s,v) => s + v.total, 0))}</h3></div>
            </div></div>
        </div>

        <div class="panel-card mb-4">
            <h2 class="section-title">Registrar una venta</h2>
            <form id="formVenta" class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Producto</label>
                    <select class="form-select" id="ventaProducto" required>
                        ${lista.map(p => `<option value="${p.id}">${escapar(p.nombre)} — ${p.existencia} disponibles — ${dinero(p.precio)}</option>`).join("")}
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Cantidad</label>
                    <input class="form-control" type="number" min="1" id="ventaCantidad" required value="1">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Forma de pago</label>
                    <select class="form-select" id="ventaPago">
                        <option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option>
                    </select>
                </div>
                <div class="col-12"><button class="btn btn-primary">Registrar venta</button></div>
            </form>
        </div>

        <div class="panel-card">
            <h2 class="section-title">Historial de ventas</h2>
            <div class="table-responsive"><table class="table">
                <thead><tr><th>Fecha</th><th>Producto</th><th>Cantidad</th><th>Total</th><th>Pago</th></tr></thead>
                <tbody>
                    ${historial.slice().reverse().map(v => `<tr>
                        <td>${v.fecha}</td><td>${escapar(v.producto)}</td><td>${v.cantidad}</td>
                        <td>${dinero(v.total)}</td><td>${escapar(v.pago || "No especificado")}</td>
                    </tr>`).join("") || '<tr><td colspan="5">No hay ventas registradas.</td></tr>'}
                </tbody>
            </table></div>
        </div>
    `, "ventas");

    // Al enviar el formulario se registra la venta
    $("#formVenta").addEventListener("submit", evento => {
        evento.preventDefault();

        const lista = productos();
        const p = lista.find(x => x.id === Number($("#ventaProducto").value));
        const cantidad = Number($("#ventaCantidad").value);

        if (!p || cantidad < 1) return;

        // No se puede vender más de lo que hay
        if (cantidad > p.existencia) {
            aviso("No hay suficientes productos disponibles.", "danger");
            return;
        }

        // Resta del inventario y suma a las ventas del producto
        p.existencia -= cantidad;
        p.ventas = (p.ventas || 0) + cantidad;
        guardar("sm_productos", lista);

        // Guarda la venta en el historial
        const historial = ventas();
        historial.push({
            id: Date.now(),
            producto: p.nombre,
            cantidad,
            total: cantidad * p.precio,
            pago: $("#ventaPago").value,
            fecha: new Date().toISOString().slice(0, 10)
        });
        guardar("sm_ventas", historial);

        // También la anota como una salida en movimientos
        const movs = movimientos();
        movs.push({
            fecha: new Date().toLocaleDateString("es-MX"),
            producto: p.nombre,
            tipo: "salida",
            cantidad,
            nota: "Venta"
        });
        guardar("sm_movimientos", movs);

        renderVentas();
        aviso("Venta registrada y existencias actualizadas.");
    });
}

// ---------- PROVEEDORES ----------
function renderProveedores() {
    layout("Proveedores", `
        <div class="panel-card mb-4">
            <h2 class="section-title">Agregar proveedor</h2>
            <form id="formProveedor" class="row g-3">
                <div class="col-md-4">
                    <label class="form-label">Nombre del proveedor</label>
                    <input class="form-control" id="provNombre" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Teléfono</label>
                    <input class="form-control" id="provTelefono" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Correo electrónico</label>
                    <input class="form-control" type="email" id="provCorreo" required>
                </div>
                <div class="col-12"><button class="btn btn-primary">Guardar proveedor</button></div>
            </form>
        </div>

        <div class="panel-card">
            <h2 class="section-title">Directorio de proveedores</h2>
            <div class="table-responsive"><table class="table">
                <thead><tr><th>Proveedor</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr></thead>
                <tbody>
                    ${proveedores().map(p => `<tr>
                        <td>${escapar(p.nombre)}</td><td>${escapar(p.telefono)}</td>
                        <td>${escapar(p.correo)}</td>
                        <td><button class="btn btn-sm btn-outline-danger" onclick="eliminarProveedor(${p.id})">Eliminar</button></td>
                    </tr>`).join("") || '<tr><td colspan="4">Sin proveedores registrados.</td></tr>'}
                </tbody>
            </table></div>
        </div>
    `, "proveedores");
    // Al enviar el formulario se guarda el proveedor
    $("#formProveedor").addEventListener("submit", evento => {
        evento.preventDefault();
        const lista = proveedores();
        lista.push({
            id: Date.now(),
            nombre: $("#provNombre").value.trim(),
            telefono: $("#provTelefono").value.trim(),
            correo: $("#provCorreo").value.trim(),
            empresa: empresa().nombre || ""
        });
        guardar("sm_proveedores", lista);
        renderProveedores();
        aviso("Proveedor registrado.");
    });
}

// ---------- PROVEEDORES: ELIMINAR ----------
function eliminarProveedor(id) {
    if (!confirm("¿Eliminar este proveedor?")) return;
    guardar("sm_proveedores", proveedores().filter(p => p.id !== id));
    renderProveedores();
    aviso("Proveedor eliminado.");
}

// ---------- REPORTES (gráficas con Chart.js) ----------
function renderReportes() {
    layout("Reportes y estadísticas", `
        <div class="row g-3 mb-4">
            <div class="col-md-4"><div class="stat-card">
                <div class="stat-icon">${iconoImg("productos.jpeg", "Productos")}</div><div><p>Productos registrados</p><h3>${productos().length}</h3></div>
            </div></div>
            <div class="col-md-4"><div class="stat-card">
                <div class="stat-icon">${iconoImg("ventas.jpeg", "Ventas")}</div><div><p>Importe de ventas</p><h3>${dinero(ventas().reduce((s,v) => s + v.total, 0))}</h3></div>
            </div></div>
            <div class="col-md-4"><div class="stat-card">
                <div class="stat-icon">${iconoImg("alerta.jpeg", "Alerta")}</div><div><p>Alertas de inventario</p><h3>${productos().filter(p => p.existencia <= p.minimo).length}</h3></div>
            </div></div>
        </div>

        <div class="panel-card mb-4">
            <h2 class="section-title">Productos más vendidos</h2>
            <p class="muted">Unidades vendidas por producto según los registros del sistema.</p>
            <canvas id="graficaVentas" height="110"></canvas>
        </div>

        <div class="panel-card">
            <h2 class="section-title">Existencias actuales</h2>
            <canvas id="graficaStock" height="110"></canvas>
        </div>
    `, "reportes");

    // Si Chart.js no cargó (sin internet), avisa y se detiene
    if (typeof Chart === "undefined") {
        aviso("No se pudo cargar Chart.js. Comprueba tu conexión a internet.", "warning");
        return;
    }

    // Ordena los productos del más vendido al menos vendido
    const lista = productos().slice().sort((a, b) => (b.ventas || 0) - (a.ventas || 0));

    // Gráfica de barras: unidades vendidas
    new Chart($("#graficaVentas"), {
        type: "bar",
        data: {
            labels: lista.map(p => p.nombre),
            datasets: [{
                label: "Unidades vendidas",
                data: lista.map(p => p.ventas || 0),
                backgroundColor: "#7967e8",
                borderRadius: 7
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Gráfica de dona: disponibles, stock bajo y agotados
    new Chart($("#graficaStock"), {
        type: "doughnut",
        data: {
            labels: ["Disponibles", "Stock bajo", "Agotados"],
            datasets: [{
                data: [
                    productos().filter(p => p.existencia > p.minimo).length,
                    productos().filter(p => p.existencia > 0 && p.existencia <= p.minimo).length,
                    productos().filter(p => p.existencia === 0).length
                ],
                backgroundColor: ["#36b58a", "#f0b54b", "#e65367"]
            }]
        },
        options: { responsive: true }
    });
}
// ---------- PERFIL ----------
function renderPerfil() {
    const u = usuario();
    const e = empresa();

    layout("Mi perfil", `
        <div class="row g-4">
            <div class="col-lg-5">
                <div class="panel-card text-center">
                    <div class="profile-avatar mx-auto mb-3">${iconoImg("perfil.jpeg", "Perfil", 75)}</div>
                    <h2 class="section-title mb-1">${escapar(u.nombre || "")}</h2>
                    <p class="muted">${escapar(u.tipo || "Usuario")}</p>
                    <hr>
                    <p class="mb-1"><strong>Correo:</strong></p>
                    <p class="muted">${escapar(u.correo || "")}</p>
                    <p class="mb-1"><strong>Empresa:</strong></p>
                    <p class="muted">${escapar(e.nombre || "Sin registrar")}</p>
                </div>
            </div>

            <div class="col-lg-7">
                <div class="panel-card">
                    <h2 class="section-title">Actualizar datos</h2>
                    <form id="formPerfil" class="row g-3">
                        <div class="col-12">
                            <label class="form-label">Nombre completo</label>
                            <input class="form-control" id="perfilNombre" required value="${escapar(u.nombre || "")}">
                        </div>
                        <div class="col-12">
                            <label class="form-label">Teléfono</label>
                            <input class="form-control" id="perfilTelefono" value="${escapar(u.telefono || "")}">
                        </div>
                        <div class="col-12">
                            <label class="form-label">Correo electrónico</label>
                            <input class="form-control" value="${escapar(u.correo || "")}" disabled>
                        </div>
                        <div class="col-12"><button class="btn btn-primary">Guardar cambios</button></div>
                    </form>
                </div>
            </div>
        </div>
    `, "perfil");

    // Al enviar el formulario se actualizan los datos del usuario
    $("#formPerfil").addEventListener("submit", evento => {
        evento.preventDefault();

        const actualizado = {
            ...usuario(),
            nombre: $("#perfilNombre").value.trim(),
            telefono: $("#perfilTelefono").value.trim()
        };

        guardar("sm_usuario", actualizado);

        // También actualiza al usuario dentro de la lista de usuarios
        const lista = obtener("sm_usuarios").map(u =>
            u.correo === actualizado.correo ? actualizado : u
        );
        guardar("sm_usuarios", lista);

        renderPerfil();
        aviso("Perfil actualizado.");
    });
}

// ---------- INICIO (panel principal y alertas) ----------
function renderInicio() {
    const lista = productos();
    const historial = ventas();
    const pedidos = compras();
    // Alertas: productos con existencia igual o menor al mínimo
    const alertas = lista.filter(p => p.existencia <= p.minimo);
    const totalUnidades = lista.reduce((s, p) => s + p.existencia, 0);
    const ventasHoy = historial.filter(v => v.fecha === new Date().toISOString().slice(0, 10));
    const totalHoy = ventasHoy.reduce((s, v) => s + v.total, 0);

    layout("Panel principal", `
       ${/* ===== FILA DE 4 TARJETAS DEL PANEL =====
             row = fila de Bootstrap. g-3 = espacio entre tarjetas. mb-4 = espacio abajo */""}
        <div class="row g-3 mb-4">

            ${/* TARJETA 1: Ventas de hoy
                 col-sm-6 = 2 tarjetas por fila en pantallas medianas
                 col-xl-3 = 4 tarjetas por fila en pantallas grandes */""}
            <div class="col-sm-6 col-xl-3">
                ${/* stat-card = tarjeta blanca con borde (del CSS).
                     layout() le agrega después la animación zoomIn */""}
                <div class="stat-card tarjeta-inicio">
                    ${/* Cuadrito morado claro detrás de la imagen.
                         width/height = tamaño del cuadro (48px)
                         border-radius = esquinas redondeadas
                         display:flex + align/justify center = imagen centrada */""}
                    <div class="icono-fondo" style="width:48px;height:48px;min-width:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#f0edff;">
                        ${/* Imagen ventas.jpeg de la carpeta img/. El 30 es su tamaño en píxeles */""}
                        ${iconoImg("ventas.jpeg", "Ventas de hoy", 30)}
                    </div>
                    <div>
                        <p>Ventas de hoy</p>
                        ${/* Número grande: suma de lo vendido hoy, en pesos */""}
                        <h3>${dinero(totalHoy)}</h3>
                    </div>
                </div>
            </div>

            ${/* TARJETA 2: Productos diferentes (cuántos productos hay registrados) */""}
            <div class="col-sm-6 col-xl-3">
                <div class="stat-card tarjeta-inicio">
                    <div class="icono-fondo" style="width:48px;height:48px;min-width:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#f0edff;">
                        ${iconoImg("productos.jpeg", "Productos diferentes", 30)}
                    </div>
                    <div>
                        <p>Productos diferentes</p>
                        ${/* lista.length = cantidad de productos en la lista */""}
                        <h3>${lista.length}</h3>
                    </div>
                </div>
            </div>

            ${/* TARJETA 3: Unidades en stock (suma de la existencia de todos los productos) */""}
            <div class="col-sm-6 col-xl-3">
                <div class="stat-card tarjeta-inicio">
                    <div class="icono-fondo" style="width:48px;height:48px;min-width:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#f0edff;">
                        ${iconoImg("stock.jpeg", "Unidades en stock", 30)}
                    </div>
                    <div>
                        <p>Unidades en stock</p>
                        <h3>${totalUnidades}</h3>
                    </div>
                </div>
            </div>

            ${/* TARJETA 4: Alertas de stock (productos con pocas unidades o agotados) */""}
            <div class="col-sm-6 col-xl-3">
                <div class="stat-card tarjeta-inicio">
                    <div class="icono-fondo" style="width:48px;height:48px;min-width:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#f0edff;">
                        ${iconoImg("alerta.jpeg", "Alertas de stock", 30)}
                    </div>
                    <div>
                        <p>Alertas de stock</p>
                        ${/* alertas.length = cuántos productos están en el mínimo o abajo */""}
                        <h3>${alertas.length}</h3>
                    </div>
                </div>
            </div>

        </div>
        <div class="row g-4 mb-4">
            <div class="col-lg-7">
                <div class="panel-card h-100">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="section-title mb-0">Productos recientes</h2>
                        <a href="pages/productos.html">Ver todos</a>
                    </div>
                    <div class="table-responsive"><table class="table">
                        <thead><tr><th>Producto</th><th>Existencia</th><th>Estado</th></tr></thead>
                        <tbody>
                            ${lista.slice(0, 5).map(p => `<tr>
                                <td><div class="d-flex align-items-center gap-2">${imagenProducto(p)}<span>${escapar(p.nombre)}</span></div></td>
                                <td>${p.existencia}</td><td>${estadoStock(p)}</td>
                            </tr>`).join("")}
                        </tbody>
                    </table></div>
                    <div class="action-buttons mt-3">
                        <a href="pages/productos.html" class="btn btn-primary"> + Agregar producto</a>
                        <a href="pages/movimientos.html" class="btn btn-outline-primary">Registrar movimiento</a>
                    </div>
                </div>
            </div>

            <div class="col-lg-5">
                <div class="panel-card h-100">
                    <h2 class="section-title">Alertas de inventario</h2>
                    ${alertas.map(p => `
                        <!-- slideInLeft = la alerta entra desde la izquierda -->
                        <div class="alert-card animate__animated animate__slideInLeft">
                            <img class="circulo-alerta" src="${imagen("alerta.jpeg")}" alt="Alerta" width="24" height="24">
                            <div class="flex-grow-1">
                                <div class="fw-semibold">${escapar(p.nombre)}</div>
                                <div class="muted">Quedan ${p.existencia}; mínimo ${p.minimo}.</div>
                            </div>
                            <!-- Si está agotado, el botón palpita sin parar (pulse + infinite) -->
                            <button class="btn btn-sm btn-outline-primary ${p.existencia === 0 ? "animate__animated animate__pulse animate__infinite" : ""}"
                                    onclick="solicitarCompra(${p.id})">Reponer</button>
                        </div>
                    `).join("") || '<div class="empty-state"><div class="empty-icon">${iconoImg("stock.jpeg", "Sin alertas", 40)}</div><p>No hay alertas por ahora.</p></div>'}
                    <a class="btn btn-light w-100 mt-2" href="pages/compras.html">Ver compras</a>
                </div>
            </div>
        </div>

        <div class="panel-card">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div><h2 class="section-title mb-1">Pedidos pendientes</h2><p class="muted mb-0">Productos solicitados a tus proveedores.</p></div>
                <a href="pages/compras.html" class="btn btn-outline-primary">Consultar pedidos</a>
            </div>
            <div class="mt-3">
                ${pedidos.filter(c => c.estado === "Pendiente").map(c => `
                    <div class="d-flex justify-content-between align-items-center border-bottom py-3 gap-3">
                        <div><strong>${escapar(c.producto)}</strong><div class="muted">${escapar(c.proveedor)}</div></div>
                        <div class="text-end"><strong>${c.cantidad} unidades</strong><div class="muted">${dinero(c.total)}</div></div>
                    </div>
                `).join("") || '<p class="muted mb-0">No tienes pedidos pendientes.</p>'}
            </div>
        </div>
    `, "inicio");
}
// ---------- LOGIN (pantalla de inicio de sesión) ----------
function renderLogin() {
    $("#app").innerHTML = `
        <section class="login-page">
            <!-- animate__fadeIn = la tarjeta aparece poco a poco -->
            <div class="login-card animate__animated animate__fadeIn">
                <div class="brand-icon">${iconoImg("logo.jpeg", "StockManager", 32)}</div>
                <h1 class="h3 fw-bold">StockManager</h1>
                <p class="muted mb-4">Controla tu inventario de manera fácil y ordenada.</p>

                <div id="avisos"></div>

                <form id="formLogin">
                    <div class="mb-3">
                        <label class="form-label">Correo electrónico</label>
                        <input class="form-control" type="email" id="correo" required
                               placeholder="correo@ejemplo.com">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Contraseña</label>
                        <input class="form-control" type="password" id="password" required
                               placeholder="Ingresa tu contraseña">
                    </div>
                    <button class="btn btn-primary w-100 mt-2">Aceptar</button>
                </form>

                <p class="text-center mt-4 mb-0">
                    ¿No tienes una cuenta?
                    <a href="pages/registro.html" class="fw-bold text-purple">Regístrate</a>
                </p>

                <div class="alert alert-light small mt-4 mb-0">
                    <strong>Acceso de demostración</strong><br>
                    demo@stockmanager.mx<br>
                    demo123
                </div>
            </div>
        </section>
    `;

    $("#formLogin").addEventListener("submit", iniciarSesion);
}

// ---------- REGISTRO (crear cuenta) ----------
function renderRegistro() {
    $("#app").innerHTML = `
        <section class="login-page">
            <div class="login-card animate__animated animate__fadeIn">
                <a href="../index.html" class="text-purple">← Volver al inicio</a>
                <div class="brand-icon mt-3">${iconoImg("perfil.jpeg", "Registro", 32)}</div>
                <h1 class="h3 fw-bold">Crear cuenta</h1>
                <p class="muted mb-4">Registra tus datos para comenzar.</p>
                <div id="avisos"></div>

                <form id="formRegistro">
                    <div class="mb-3">
                        <label class="form-label">Nombre completo</label>
                        <input class="form-control" id="nombre" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Correo electrónico</label>
                        <input class="form-control" type="email" id="correo" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Contraseña</label>
                        <input class="form-control" type="password" id="password" minlength="6" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Teléfono</label>
                        <input class="form-control" type="tel" id="telefono" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label">Tipo de usuario</label>
                        <select class="form-select" id="tipoUsuario" required>
                            <option value="">Selecciona una opción</option>
                            <option>Administrador</option>
                            <option>Encargado de inventario</option>
                            <option>Empleado</option>
                        </select>
                    </div>
                    <button class="btn btn-primary w-100">Siguiente</button>
                </form>
            </div>
        </section>
    `;

    $("#formRegistro").addEventListener("submit", registrarUsuario);
}

// ---------- EMPRESA (datos del negocio) ----------
function renderEmpresa() {
    const e = empresa();

    $("#app").innerHTML = `
        <section class="login-page">
            <div class="login-card animate__animated animate__fadeIn">
                <div class="brand-icon">${iconoImg("inicio.jpeg", "Empresa", 32)}</div>
                <h1 class="h3 fw-bold">Datos de la empresa</h1>
                <p class="muted mb-4">Completa la información de tu negocio.</p>
                <div id="avisos"></div>

                <form id="formEmpresa">
                    <div class="mb-3">
                        <label class="form-label">Nombre de la empresa</label>
                        <input class="form-control" id="nombreEmpresa" required value="${escapar(e.nombre || "")}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Ubicación</label>
                        <input class="form-control" id="ubicacion" required value="${escapar(e.ubicacion || "")}" placeholder="Ciudad, estado">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Tipo de empresa</label>
                        <select class="form-select" id="tipoEmpresa" required>
                            <option value="">Selecciona el giro</option>
                            ${["Negocio", "Industrial", "Belleza", "Alimentos", "Papelería", "Tecnología", "Otro"].map(t =>
                                `<option ${e.tipo === t ? "selected" : ""}>${t}</option>`).join("")}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">RFC</label>
                        <input class="form-control" id="rfc" maxlength="13" value="${escapar(e.rfc || "")}" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label">Teléfono de la empresa</label>
                        <input class="form-control" type="tel" id="telefonoEmpresa" value="${escapar(e.telefono || "")}" required>
                    </div>
                    <button class="btn btn-primary w-100">Aceptar y continuar</button>
                </form>
            </div>
        </section>
    `;

    $("#formEmpresa").addEventListener("submit", registrarEmpresa);
}

// ---------- ARRANQUE: decide qué pantalla mostrar ----------
// Lee data-page del <body> (ej. data-page="ventas") y dibuja esa página
function iniciarAplicacion() {
    const pagina = document.body.dataset.page;
    prepararDemo(); // crea datos de ejemplo si no hay
    /* Al abrir cualquier página, revisa si algún producto ya está en el mínimo */
    revisarRecompras();

    // Página de login (index.html)
    if (pagina === "login") {
        // Con ?panel=1 y sesión iniciada muestra el panel; si no, el login
        if (new URLSearchParams(location.search).get("panel") === "1" && usuario().correo) {
            renderInicio();
        } else {
            renderLogin();
        }
        return;
    }

    // Si no hay sesión iniciada, regresa al login
    if (!usuario().correo) {
        location.href = "../index.html";
        return;
    }

    // Cada data-page se conecta con su función
    const paginas = {
        registro: renderRegistro,
        empresa: renderEmpresa,
        inicio: renderInicio,
        productos: renderProductos,
        movimientos: renderMovimientos,
        compras: renderCompras,
        ventas: renderVentas,
        proveedores: renderProveedores,
        reportes: renderReportes,
        perfil: renderPerfil
    };

    (paginas[pagina] || renderInicio)();
}

// Cuando la página termina de cargar, arranca la aplicación
document.addEventListener("DOMContentLoaded", iniciarAplicacion);