import { evaluarCompleto } from "./logica/evaluador.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario");
  const resultadoDiv = document.getElementById("resultado");
  const contenedor = document.getElementById("contenedorFormulario");
  const sexoButtons = document.querySelectorAll(".btn-sexo");
  const sexoInput = document.getElementById("sexo");
  const fechaEval = document.getElementById("fechaEvaluacion");
  const edadCalculada = document.getElementById("edadCalculada");
  const pesoKgSpan = document.getElementById("pesoKg");
  const boton = document.getElementById("botonPrincipal");

  const hoy = new Date().toISOString().split("T")[0];
  fechaEval.value = hoy;

  let edadMesesFinal = null;
  let pesoKgCalculado = 0;

  sexoButtons.forEach(btn =>
    btn.addEventListener("click", () => {
      sexoButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      sexoInput.value = btn.dataset.sexo;
      contenedor.classList.remove("masculino", "femenino");
      if (btn.dataset.sexo === "M") contenedor.classList.add("masculino");
      if (btn.dataset.sexo === "F") contenedor.classList.add("femenino");
    })
  );

  function calcularEdad() {
    const fn = new Date(form.fechaNacimiento.value);
    const fe = new Date(form.fechaEvaluacion.value);
    if (!form.fechaNacimiento.value || !form.fechaEvaluacion.value || isNaN(fn) || isNaN(fe)) {
      edadCalculada.textContent = "--";
      edadMesesFinal = null;
      return;
    }
    let años = fe.getFullYear() - fn.getFullYear();
    let meses = fe.getMonth() - fn.getMonth();
    let dias = fe.getDate() - fn.getDate();
    if (dias < 0) meses--;
    if (meses < 0) { años--; meses += 12; }
    edadMesesFinal = años * 12 + meses;
    edadCalculada.textContent = edadMesesFinal < 0 || edadMesesFinal > 60
      ? "❌ Edad fuera de rango"
      : `${años} años ${meses} meses (${edadMesesFinal})`;
  }

  function calcularPesoKg() {
    const lbs = parseFloat(form.libras.value) || 0;
    const oz = form.onzas.value === "" ? 0 : parseFloat(form.onzas.value) || 0;
    pesoKgCalculado = (lbs + (oz / 16)) / 2.2;
    pesoKgSpan.textContent = pesoKgCalculado > 0 ? pesoKgCalculado.toFixed(2) : "0.00";
  }

  function getColorClass(_, estado) {
    estado = estado.toLowerCase();
    if (estado.includes("retardo de crecimiento crónico severo") || estado.includes("desnutrición aguda severa") || estado.includes("peso bajo severo") || estado.includes("retardo de crecimiento severo"))
      return "severo";
    if (estado.includes("retardo de crecimiento crónico moderado") || estado.includes("desnutrición aguda moderada") || estado.includes("peso bajo moderado") || estado.includes("retardo de crecimiento moderado"))
      return "moderado";
    if (estado.includes("tendencia a la baja"))
      return "amarillo";
    if (estado.includes("normal"))
      return "normal";
    if (estado.includes("sobrepeso"))
      return "rosa";
    if (estado.includes("obesidad"))
      return "naranja";
    return "";
  }

function mostrarBloqueResultado(idContenedor, titulo, estado, referencia, indicador) {
  const claseColor = getColorClass("", estado);

  const div = document.createElement("div");
  div.className = `bloque-resultado ${claseColor}`;

  const enlace = document.createElement("a");
  enlace.href = "#";
  enlace.className = "boton-grafica";
  enlace.innerHTML = `
    <span class="texto-boton">Ver Gráfica</span>
    <img src="img/boton.png" alt="Gráfica" class="icono-boton" />
  `;

  enlace.addEventListener("click", e => {
    e.preventDefault();

    const talla = parseFloat(form.talla.value) || 0;
    const datos = {
      edadMeses: edadMesesFinal,
      pesoKg: parseFloat(pesoKgCalculado.toFixed(2)),
      talla,
      sexo: sexoInput.value,
      indicador
    };

    console.log("📦 Guardando en localStorage:", datos);
    localStorage.setItem("datosGrafica", JSON.stringify(datos));

    window.open("grafica.html", "_blank");
  });

  const tituloDiv = document.createElement("div");
  tituloDiv.className = "titulo";
  tituloDiv.textContent = titulo;

  const estadoDiv = document.createElement("div");
  estadoDiv.className = "texto-estado";
  estadoDiv.textContent = `${estado} (${referencia})`;

  div.appendChild(enlace);
  div.appendChild(tituloDiv);
  div.appendChild(estadoDiv);

  const contenedor = document.getElementById(idContenedor);
  contenedor.innerHTML = ""; 
  contenedor.appendChild(div);
}





  ["fechaNacimiento", "fechaEvaluacion", "libras", "onzas", "talla"].forEach(name => {
    form[name].addEventListener("input", () => {
      calcularEdad();
      calcularPesoKg();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!sexoInput.value || !form.fechaNacimiento.value || !form.fechaEvaluacion.value || edadMesesFinal === null) {
      alert("❗ Todos los campos son obligatorios.");
      return;
    }

    if (edadMesesFinal < 0 || edadMesesFinal > 60) {
      alert("❗ Edad fuera de rango.");
      return;
    }

    const data = {
      sexo: sexoInput.value,
      edadMeses: edadMesesFinal,
      peso: parseFloat(pesoKgCalculado.toFixed(2)),
      talla: parseFloat(form.talla.value)
    };

    try {
      const result = await evaluarCompleto(data);

      mostrarBloqueResultado("resultadoPE", "Peso para la Edad", result.pesoEdad.estado, result.pesoEdad.referencia, "PE");
      mostrarBloqueResultado("resultadoTE", "Talla para la Edad", result.tallaEdad.estado, result.tallaEdad.referencia, "TE");
      mostrarBloqueResultado("resultadoPT", "Peso para la Talla", result.pesoTalla.estado, result.pesoTalla.referencia, "PT");

    } catch (err) {
      resultadoDiv.innerHTML = `<span style="color:red">❌ ${err.message}</span>`;
    }
  });

  calcularEdad();
  calcularPesoKg();
});
