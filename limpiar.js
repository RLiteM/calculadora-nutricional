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
  const botonBasura = document.getElementById("botonBasura");

  function limpiarTodo() {
    form.reset();
    edadCalculada.textContent = "--";
    pesoKgSpan.textContent = "0.00";
    document.getElementById("resultadoPE").innerHTML = "";
document.getElementById("resultadoTE").innerHTML = "";
document.getElementById("resultadoPT").innerHTML = "";
    contenedor.classList.remove("masculino", "femenino");
    sexoButtons.forEach(btn => btn.classList.remove("selected"));
    sexoInput.value = "";
    fechaEval.value = hoy;
    boton.textContent = "Evaluar";
    boton.classList.remove("btn-limpiar");
    boton.classList.add("btn-evaluar");
  }

  if (botonBasura) {
    botonBasura.addEventListener("click", limpiarTodo);
  }
});
