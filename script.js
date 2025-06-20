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

      const bloques = [
        { titulo: "Peso para la Edad", estado: result.pesoEdad.estado, referencia: result.pesoEdad.referencia },
        { titulo: "Talla para la Edad", estado: result.tallaEdad.estado, referencia: result.tallaEdad.referencia },
        { titulo: "Peso para la Talla", estado: result.pesoTalla.estado, referencia: result.pesoTalla.referencia }
      ];

      resultadoDiv.innerHTML = bloques.map(b => `
        <div class='bloque-resultado ${getColorClass("", b.estado)}'>
          <div class='titulo'>${b.titulo}</div>
          ${b.estado} (${b.referencia})
        </div>
      `).join("");
    } catch (err) {
      resultadoDiv.innerHTML = `<span style="color:red">❌ ${err.message}</span>`;
    }
  });

  const botonBasura = document.getElementById("botonBasura");

  botonBasura.addEventListener("click", () => {
    form.reset();
    edadCalculada.textContent = "--";
    pesoKgSpan.textContent = "0.00";
    resultadoDiv.innerHTML = "";
    contenedor.classList.remove("masculino", "femenino");
    sexoButtons.forEach(btn => btn.classList.remove("selected"));
    sexoInput.value = "";
    fechaEval.value = hoy;
    calcularEdad();
    calcularPesoKg();
  });

  calcularEdad();
  calcularPesoKg();
});
