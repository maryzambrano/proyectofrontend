let productosDB = [];

function mostrarNotificacion(mensaje, tipo = 'exito') {
    alert(mensaje); 
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const totalCantidad = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const contador = document.getElementById("contador-carrito");
    contador.textContent = totalCantidad > 9 ? "9+" : totalCantidad;
    contador.style.display = totalCantidad > 0 ? "flex" : "none";
}

function agregarAlCarrito(idProducto) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const index = carrito.findIndex(p => p.id === idProducto);

    if (index === -1) {
        carrito.push({ id: idProducto, cantidad: 1 });
    } else {
        carrito[index].cantidad += 1;
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();

    const producto = productosDB.find(p => p.id === idProducto);
    if (producto) {
        mostrarNotificacion(`${producto.title} añadido al carrito`);

        const botones = document.querySelectorAll(`button[data-id='${idProducto}']`);
        botones.forEach(boton => {
            boton.textContent = "Agregado ✅";
            boton.disabled = true;
            boton.classList.add("agregado");
        });
    }
}

function mostrarModalCarrito() {
    const modal = document.getElementById("modal-carrito");
    const listaCarrito = document.getElementById("lista-carrito");
    const totalCarrito = document.getElementById("total-carrito");
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<p>No hay productos en el carrito.</p>";
        totalCarrito.textContent = "Total: $0.00";
    } else {
        let totalPrecio = 0;

        carrito.forEach(({ id, cantidad }) => {
            const producto = productosDB.find(p => p.id === id);
            if (!producto) return;

            const subtotal = producto.price * cantidad;
            totalPrecio += subtotal;

            const item = document.createElement("div");
            item.className = "item-carrito";
            item.innerHTML = `
                <span><strong>${producto.title}</strong></span>
                <span>
                    $${producto.price.toFixed(2)} x ${cantidad} = $${subtotal.toFixed(2)}
                    <button class="btn-cantidad" data-id="${id}" data-action="aumentar">+</button>
                    <button class="btn-cantidad" data-id="${id}" data-action="reducir">−</button>
                    <button class="btn-eliminar" data-id="${id}">🗑</button>
                </span>
            `;
            listaCarrito.appendChild(item);
        });

        totalCarrito.textContent = `Total: $${totalPrecio.toFixed(2)}`;
    }

    modal.style.display = "block";

    document.querySelectorAll('.btn-cantidad').forEach(btn => {
        btn.addEventListener('click', cambiarCantidad);
    });
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', eliminarDelCarrito);
    });
}

function cerrarModal() {
    document.getElementById("modal-carrito").style.display = "none";
}

function manejarClicksModal(event) {
    const modal = document.getElementById("modal-carrito");
    if (event.target === modal || event.target.classList.contains("cerrar-modal")) {
        cerrarModal();
    }
}

function vaciarCarrito() {
    localStorage.removeItem("carrito");
    actualizarContadorCarrito();
    cerrarModal();
    mostrarNotificacion("Carrito vaciado");
}

function cambiarCantidad(e) {
    const id = e.target.dataset.id;
    const accion = e.target.dataset.action;
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const index = carrito.findIndex(p => p.id === id);
    if (index !== -1) {
        if (accion === "aumentar") {
            carrito[index].cantidad += 1;
        } else if (accion === "reducir") {
            carrito[index].cantidad -= 1;
            if (carrito[index].cantidad <= 0) {
                carrito.splice(index, 1);
            }
        }
        localStorage.setItem("carrito", JSON.stringify(carrito));
        mostrarModalCarrito();
        actualizarContadorCarrito();
    }
}

function eliminarDelCarrito(e) {
    const id = e.target.dataset.id;
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito = carrito.filter(p => p.id !== id);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarModalCarrito();
    actualizarContadorCarrito();
}

function pagar() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        mostrarNotificacion("El carrito está vacío", "error");
        return;
    }

    const productosCompra = [];
    let totalCompra = 0;

    carrito.forEach(({ id, cantidad }) => {
        const producto = productosDB.find(p => p.id === id);
        if (producto) {
            productosCompra.push({
                nombre: producto.title,
                precio: producto.price * cantidad,
                cantidad: cantidad
            });

    



            totalCompra += producto.price * cantidad;
        }
    });

    sessionStorage.setItem('productos', JSON.stringify(productosCompra));
    sessionStorage.setItem('total', totalCompra.toFixed(2));

    cerrarModal();
    window.location.href = 'compra.html';
}

document.addEventListener("DOMContentLoaded", () => {
    const contenedorLibros = document.getElementById("libros-container");

    fetch("https://openlibrary.org/search.json?q=educacion+didactica")
        .then(res => res.json())
        .then(data => {
            const libros = data.docs.slice(0, 12);
            libros.forEach((libro, index) => {
                const idLibro = `libro-${libro.key.replace("/works/", "")}`;
                const titulo = libro.title;
                const precio = 200 + (index * 15);

                productosDB.push({ id: idLibro, title: titulo, price: precio });

                const portada = libro.cover_i
                    ? `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`
                    : "https://via.placeholder.com/150x220.png?text=Sin+portada";

                const div = document.createElement("div");
                div.className = "item_flex";
                div.innerHTML = `
                    <img src="${portada}" alt="Portada del libro">
                    <h4>${titulo}</h4>
                    <p><strong>Autor:</strong> ${libro.author_name ? libro.author_name.join(", ") : "Desconocido"}</p>
                    <p><strong>Año:</strong> ${libro.first_publish_year ?? "N/D"}</p>
                    <p><strong>Precio:</strong> $${precio.toFixed(2)}</p>
                    <a href="https://openlibrary.org${libro.key}" target="_blank">Ver más</a>
                    <button class="comprar" data-id="${idLibro}" onclick="agregarAlCarrito('${idLibro}')">Agregar al carrito</button>
                `;

                contenedorLibros.appendChild(div);
            });

            actualizarContadorCarrito();
        })
        .catch(err => {
            console.error("Error al cargar libros:", err);
            contenedorLibros.innerHTML = "<p>No se pudieron cargar los libros recomendados.</p>";
        });

    document.getElementById("icono-carrito")?.addEventListener("click", mostrarModalCarrito);
    document.getElementById("vaciar-carrito")?.addEventListener("click", vaciarCarrito);

    setTimeout(() => {
        const btnPagar = document.getElementById("pagar");
        if (btnPagar) {
            btnPagar.addEventListener("click", pagar);
        } else {
            console.warn("❗ Botón 'pagar' no encontrado al cargar.");
        }
    }, 500);

    window.addEventListener("click", manejarClicksModal);
});
