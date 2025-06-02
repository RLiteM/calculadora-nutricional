    let sexoSeleccionado = null;

    document.getElementById("fecha_eval").value = new Date().toISOString().split('T')[0];

    function seleccionarSexo(elemento, sexo) {
      sexoSeleccionado = sexo;
      document.querySelectorAll('.sexo-button').forEach(btn => btn.classList.remove('selected'));
      elemento.classList.add('selected');
    }

    function calcularKilos() {
      const libras = parseFloat(document.getElementById("libras").value) || 0;
      const onzas = parseFloat(document.getElementById("onzas").value) || 0;
      const totalLibras = libras + (onzas / 16);
      return totalLibras / 2.2;
    }

    function calcularEdadTextoYDecimal(fechaNacimiento, fechaEvaluacion) {
      const nacimiento = new Date(fechaNacimiento);
      const evaluacion = new Date(fechaEvaluacion);

      let años = evaluacion.getFullYear() - nacimiento.getFullYear();
      let meses = evaluacion.getMonth() - nacimiento.getMonth();
      let dias = evaluacion.getDate() - nacimiento.getDate();

      if (dias < 0) {
        meses -= 1;
        const mesAnterior = new Date(evaluacion.getFullYear(), evaluacion.getMonth(), 0);
        dias += mesAnterior.getDate();
      }
      if (meses < 0) {
        años -= 1;
        meses += 12;
      }

      const msPorDia = 1000 * 60 * 60 * 24;
      const diferenciaDias = (evaluacion - nacimiento) / msPorDia;
      const edadDecimal = diferenciaDias / 365.25;

      const texto = `${años} años, ${meses} meses, ${dias} días`;
      return { texto, decimal: parseFloat(edadDecimal.toFixed(6)) };
    }

    function actualizarConversion() {
      const kilos = calcularKilos();
      document.getElementById("kilos").innerText = `Equivale a: ${kilos.toFixed(2)} kg`;

      const fechaNac = document.getElementById("fecha_nac").value;
      const fechaEval = document.getElementById("fecha_eval").value;

      if (fechaNac && fechaEval) {
        const { texto } = calcularEdadTextoYDecimal(fechaNac, fechaEval);
        document.getElementById("edad").innerText = `Edad: ${texto}`;
      } else {
        document.getElementById("edad").innerText = `Edad: --`;
      }
    }

    document.getElementById("libras").addEventListener("input", actualizarConversion);
    document.getElementById("onzas").addEventListener("input", actualizarConversion);
    document.getElementById("fecha_nac").addEventListener("input", actualizarConversion);
    document.getElementById("fecha_eval").addEventListener("input", actualizarConversion);

    function enviar() {
      const talla = parseFloat(document.getElementById("talla").value);
      const kilos = calcularKilos();
      const peso = parseFloat(kilos.toFixed(2));
      const fechaNac = document.getElementById("fecha_nac").value;
      const fechaEval = document.getElementById("fecha_eval").value;

      if (peso <= 0 || isNaN(talla) || !fechaNac || !fechaEval || !sexoSeleccionado) {
        alert("Por favor completa todos los campos correctamente, incluyendo sexo.");
        return;
      }

      const { decimal } = calcularEdadTextoYDecimal(fechaNac, fechaEval);

      const payload = {
        peso: peso,
        talla: talla,
        sexo: sexoSeleccionado === "masculino" ? "m" : "f",
        edad: decimal
      };

      console.log("📤 Enviando al backend:", payload);

      const spinner = document.getElementById("spinner");
      const resultado = document.getElementById("resultado");

      spinner.style.display = "block";
      resultado.style.display = "none";

      fetch("https://calculadoranin-production.up.railway.app/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        spinner.style.display = "none";
        resultado.style.display = "block";
        resultado.className = "resultado"; // reset classes

        const texto = data.resultado;
        resultado.textContent = `Resultado: ${texto}`;

        if (texto.includes("Severa")) resultado.classList.add("severa");
        else if (texto.includes("Moderada")) resultado.classList.add("moderada");
        else if (texto.includes("Riesgo")) resultado.classList.add("riesgo");
        else if (texto.includes("Normal")) resultado.classList.add("normal");
        else if (texto.includes("Sobrepeso")) resultado.classList.add("sobrepeso");
        else if (texto.includes("Obesidad")) resultado.classList.add("obesidad");

        console.log("✅ Respuesta del backend:", data);
      })
      .catch(() => {
        spinner.style.display = "none";
        alert("Error al conectar con el servidor.");
      });
    }

    function nuevoCalculo() {
      document.querySelectorAll('input').forEach(input => input.value = '');
      document.querySelectorAll('.sexo-button').forEach(btn => btn.classList.remove('selected'));
      sexoSeleccionado = null;
      document.getElementById("fecha_eval").value = new Date().toISOString().split('T')[0];
      document.getElementById("kilos").innerText = `Equivale a: 0.00 kg`;
      document.getElementById("edad").innerText = `Edad calculada: --`;
      document.getElementById("resultado").style.display = "none";
    }