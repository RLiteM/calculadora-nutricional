
function calcularEdad(fechaNacimientoInput, fechaEvaluacionInput, edadCalculadaSpan) {
    const fechaNac = new Date(fechaNacimientoInput.value);
    const fechaEval = new Date(fechaEvaluacionInput.value);

    if (isNaN(fechaNac.getTime()) || isNaN(fechaEval.getTime())) {
        edadCalculadaSpan.textContent = '--';
        return;
    }

    let diffMillis = fechaEval.getTime() - fechaNac.getTime();
    let edadSemanas = Math.floor(diffMillis / (1000 * 60 * 60 * 24 * 7));
    let edadDias = Math.floor((diffMillis % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));

    let meses = Math.floor(edadSemanas / 4.345);
    let semanasRestantes = edadSemanas % 4.345;
    let diasRestantes = edadDias;

    if (meses < 60) {
        edadCalculadaSpan.textContent = `${meses} meses ${Math.round(diasRestantes + semanasRestantes * 7)} días`;
    } else {
        edadCalculadaSpan.textContent = `> 5 años`;
    }
}

function calcularPesoKg(librasInput, onzasInput, pesoKgSpan) {
    const libras = parseFloat(librasInput.value) || 0;
    const onzas = parseFloat(onzasInput.value) || 0;
    const totalLibras = libras + (onzas / 16);
    const pesoKg = totalLibras * 0.453592;
    pesoKgSpan.textContent = pesoKg.toFixed(2);
}


// Lógica principal de inicialización del DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Inicializando la aplicación.");
    const formulario = document.getElementById('formulario');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    const fechaEvaluacionInput = document.getElementById('fechaEvaluacion');
    const edadCalculadaSpan = document.getElementById('edadCalculada');
    const librasInput = document.querySelector('input[name="libras"]');
    const onzasInput = document.querySelector('input[name="onzas"]');
    const pesoKgSpan = document.getElementById('pesoKg');
    const btnSexo = document.querySelectorAll('.btn-sexo');
    const sexoInput = document.getElementById('sexo');
    const botonBasura = document.getElementById('botonBasura');

    // Inicializar la ruleta
    window.ruletaGauge = new RuletaGaugeView('ruletaCanvas');

    // Event listeners para los cálculos del formulario
    fechaNacimientoInput.addEventListener('change', () => calcularEdad(fechaNacimientoInput, fechaEvaluacionInput, edadCalculadaSpan));
    fechaEvaluacionInput.addEventListener('change', () => calcularEdad(fechaNacimientoInput, fechaEvaluacionInput, edadCalculadaSpan));
    librasInput.addEventListener('input', () => calcularPesoKg(librasInput, onzasInput, pesoKgSpan));
    onzasInput.addEventListener('input', () => calcularPesoKg(librasInput, onzasInput, pesoKgSpan));

    btnSexo.forEach(button => {
        button.addEventListener('click', () => {
            btnSexo.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            sexoInput.value = button.dataset.sexo;
            const container = document.getElementById('contenedorFormulario');
            if (button.dataset.sexo === 'M') {
                container.classList.add('masculino');
                container.classList.remove('femenino');
            } else if (button.dataset.sexo === 'F') {
                container.classList.add('femenino');
                container.classList.remove('masculino');
            }
        });
    });

    botonBasura.addEventListener('click', () => {
        formulario.reset();
        edadCalculadaSpan.textContent = '--';
        pesoKgSpan.textContent = '0.00';
        btnSexo.forEach(btn => btn.classList.remove('selected'));
        sexoInput.value = '';
        const container = document.getElementById('contenedorFormulario');
        container.classList.remove('masculino', 'femenino');

        // Resetear la ruleta
        if (window.ruletaGauge) {
            window.ruletaGauge.anguloActual = 180; // Volver al estado inicial
            window.ruletaGauge.currentScore = null;
            window.ruletaGauge.draw();
        }
    });

    // Manejar el envío del formulario para actualizar la ruleta
    formulario.addEventListener('submit', (event) => {
        event.preventDefault();
        // Aquí es donde obtendrías el score Z ph fake
        // Por ahora, usamos un score aleatorio como ejemplo.
        const randomScore = (Math.random() * 7) - 3.5;
        window.ruletaGauge.girarAScore(randomScore);
    });
});