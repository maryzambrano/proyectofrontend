document.addEventListener("DOMContentLoaded", function () {
  const productos = JSON.parse(sessionStorage.getItem("productos")) || [];
  const total = parseFloat(sessionStorage.getItem("total")) || 0;

  const resumenDiv = document.getElementById("detalle");
  let resumenTextoHTML = "<h3>Resumen de tu Compra:</h3><br>";

  if (productos.length === 0) {
    resumenTextoHTML += "<p>No se encontraron productos.</p>";
  } else {
    resumenTextoHTML += `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align:left; border-bottom: 1px solid #ccc;">Producto</th>
            <th style="text-align:right; border-bottom: 1px solid #ccc;">Cantidad</th>
            <th style="text-align:right; border-bottom: 1px solid #ccc;">Precio unitario</th>
            <th style="text-align:right; border-bottom: 1px solid #ccc;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
    `;

    productos.forEach(producto => {
      const cantidad = producto.cantidad || 1;
      const precioUnitario = parseFloat(producto.precio) / cantidad;
      const subtotal = parseFloat(producto.precio);

      resumenTextoHTML += `
        <tr>
          <td>${producto.nombre}</td>
          <td style="text-align:right;">${cantidad}</td>
          <td style="text-align:right;">$${precioUnitario.toFixed(2)}</td>
          <td style="text-align:right;">$${subtotal.toFixed(2)}</td>
        </tr>
      `;
    });

    resumenTextoHTML += `
        </tbody>
      </table>
      <br><strong>Total a pagar: $${total.toFixed(2)}</strong>
    `;
  }

  resumenDiv.innerHTML = resumenTextoHTML;

  function enviarFormulario(event) {
    event.preventDefault();

    const nombreContacto = document.getElementById("nombre").value.trim();
    const emailContacto = document.getElementById("contactoEmail").value.trim();
    const telefonoContacto = document.getElementById("telefono").value.trim();

    if (!nombreContacto || !emailContacto) {
      alert("Por favor, completá tu nombre completo y correo electrónico.");
      return;
    }

    let detallesCarritoParaEnvio = productos.map(prod => {
      const cantidad = prod.cantidad || 1;
      const precioUnitario = parseFloat(prod.precio) / cantidad;
      return `${prod.nombre} - ${cantidad} x $${precioUnitario.toFixed(2)} = $${(precioUnitario * cantidad).toFixed(2)}`;
    }).join("\n");

    document.getElementById("carritoData").value = detallesCarritoParaEnvio;
    document.getElementById("totalCarrito").value = `$${total.toFixed(2)}`;

    document.getElementById("formulario").submit();
  }

  const botonEnviar = document.getElementById("botonEnviar");
  if (botonEnviar) {
    botonEnviar.addEventListener("click", enviarFormulario);
  } else {
    console.warn("No se encontró el botón con ID 'botonEnviar'.");
  }
});


window.limpiarDespuesEnvio = function () {
  localStorage.removeItem("carrito");
  sessionStorage.clear();
};
