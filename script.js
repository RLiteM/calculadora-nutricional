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
  let weeks = 0

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


const toggleEdad = document.getElementById("toggleEdadCorregida");
const cajaEdad = document.getElementById("cajaEdadGestacional");
const textoEdad = document.getElementById("textoEdadGestacional");
const listaSemanas = document.getElementById("listaSemanas");
toggleEdad.checked = false;
cajaEdad.classList.add("oculto");

let semanaSeleccionada = null;

cajaEdad.classList.toggle("oculto", !toggleEdad.checked);

for (let i = 26; i <= 36; i++) {
  const li = document.createElement("li");
  li.textContent = `${i} semanas`;
  li.addEventListener("click", (e) => {
    e.stopPropagation(); 
    semanaSeleccionada = i;
    weeks = 40 - i;
    textoEdad.textContent = `${i} semanas (-${weeks})`;

    listaSemanas.classList.add("oculto");
    cajaEdad.classList.remove("activo");
    calcularEdad()
  });
  listaSemanas.appendChild(li);
}

toggleEdad.addEventListener("change", () => {
  cajaEdad.classList.toggle("oculto", !toggleEdad.checked);
  calcularEdad()
});


cajaEdad.addEventListener("click", (e) => {
  e.stopPropagation(); 
  if (!toggleEdad.checked) return; 
  listaSemanas.classList.toggle("oculto");
  cajaEdad.classList.toggle("activo");
});

document.addEventListener("click", (e) => {
  if (!cajaEdad.contains(e.target)) {
    listaSemanas.classList.add("oculto");
    cajaEdad.classList.remove("activo");
  }
});





function calcularEdad() {
  let correction = (toggleEdad.checked) ? weeks : 0
  const fn = new Date(form.fechaNacimiento.value);
  const fe = new Date(form.fechaEvaluacion.value);
  if (!form.fechaNacimiento.value || !form.fechaEvaluacion.value || isNaN(fn) || isNaN(fe)) {
    edadCalculada.textContent = "--";
    edadMesesFinal = null;
    return;
  }

  if (correction !=0){
    let days = correction* 7;
    let hours = days * 24;
    let seconds = hours *3600;
    let epochMilli = seconds * 1000;
    let newTime = fe.getTime() - epochMilli;
    fe.setTime(newTime)
  }



  let años = fe.getFullYear() - fn.getFullYear();
  let meses = fe.getMonth() - fn.getMonth();
  let dias = fe.getDate() - fn.getDate();

  if (dias < 0) {
    meses--;
    const ultimoDiaMesAnterior = new Date(fe.getFullYear(), fe.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }

  if (meses < 0) {
    años--;
    meses += 12;
  }

  edadMesesFinal = años * 12 + meses;

  edadCalculada.textContent =
    edadMesesFinal < 0 || edadMesesFinal > 60
      ? "❌ Edad fuera de rango"
      : `${años} años ${meses} meses ${dias} días (${edadMesesFinal})`;
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
    if (estado.includes("tendencia a la baja") || estado.includes("riesgo nutricional"))
      return "amarillo";
    if (estado.includes("normal"))
      return "normal";
    if (estado.includes("sobrepeso"))
      return "rosa";
    if (estado.includes("obesidad"))
      return "naranja";
    return "";
  }

function getAndClearContainer(idContenedor){
  const contenedor = document.getElementById(idContenedor);
  contenedor.innerHTML = "";
  return contenedor;
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

  const tituloDiv = document.createElement("div");
  tituloDiv.className = "titulo";
  tituloDiv.textContent = titulo;

  const estadoDiv = document.createElement("div");
  estadoDiv.className = "texto-estado";
  estadoDiv.textContent = `${estado} (${referencia})`;

  enlace.addEventListener("click", e => {
    e.preventDefault();

    const talla = parseFloat(form.talla.value) || 0;

    const textoZ = estadoDiv.textContent;
    const match = textoZ.match(/\(([^)]+)\)/);
    const zScore = match ? parseFloat(match[1]) : null;

    const datos = {
      edadMeses: edadMesesFinal,
      pesoKg: parseFloat(pesoKgCalculado.toFixed(2)),
      talla,
      sexo: sexoInput.value,
      indicador,
      z: zScore 
    };

    localStorage.setItem("datosGrafica", JSON.stringify(datos));

    window.open("grafica.html", "_blank");
  });

  div.appendChild(enlace);
  div.appendChild(tituloDiv);
  div.appendChild(estadoDiv);

  const contenedor = getAndClearContainer(idContenedor)
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
      getAndClearContainer("resultadoPE");
      getAndClearContainer("resultadoTE");
      getAndClearContainer("resultadoPT");
      const result = await evaluarCompleto(data);

      mostrarBloqueResultado("resultadoPE", "Peso para la Edad", result.pesoEdad.estado, result.pesoEdad.referencia, "PE");
      mostrarBloqueResultado("resultadoTE", "Talla para la Edad", result.tallaEdad.estado, result.tallaEdad.referencia, "TE");
      if (edadMesesFinal != 0)
      mostrarBloqueResultado("resultadoPT", "Peso para la Talla", result.pesoTalla.estado, result.pesoTalla.referencia, "PT");

    } catch (err) {
      resultadoDiv.innerHTML = `<span style="color:red">❌ ${err.message}</span>`;
    }
  });

  calcularEdad();
  calcularPesoKg();
});
