import { cargarTabla } from './lectortabla.js';

const ZCOLS = ["-3SD", "-2SD", "-1SD", "0SD", "1SD", "2SD", "3SD"];
const COLORS = ["#8b0000", "#e60000", "#ffa500", "#008000", "#00bfff", "#4169e1", "#4b0082"];
let chart = null;

const canvas = document.getElementById("grafica");
const titulo = document.getElementById("tituloGrafica");

// Leer datos desde localStorage
const datos = JSON.parse(localStorage.getItem("datosGrafica") || "{}");

if (!datos.indicador || !datos.sexo || typeof datos.edadMeses !== "number") {
  titulo.textContent = "❌ Datos insuficientes para graficar";
  throw new Error("Faltan datos necesarios para graficar.");
}

console.log("📦 Datos recibidos:", datos);

titulo.textContent = `Curva ${datos.indicador} – ${datos.sexo === "M" ? "Niño" : "Niña"}`;
dibujar(datos.indicador, datos.sexo, datos.edadMeses, datos);

async function dibujar(indicador, sexo, ref, puntoUsuario) {
  const tabla = await cargarTabla(indicador, sexo, ref);
  if (!tabla || tabla.length === 0) return;

  const colX = Object.keys(tabla[0]).find(k => /meses|mes|cm/i.test(k));
  if (!colX) return;

  // Interpolación
  const STEP = 200;
  const interp = [];

  for (let i = 0; i < tabla.length - 1; i++) {
    const a = tabla[i], b = tabla[i + 1];
    const startX = parseFloat(a[colX]), endX = parseFloat(b[colX]);

    for (let j = 0; j < STEP; j++) {
      const t = j / STEP;
      const x = startX + (endX - startX) * t;
      const f = { x };
      ZCOLS.forEach(z => {
        const valA = parseFloat(a[z]);
        const valB = parseFloat(b[z]);
        f[z] = valA + (valB - valA) * t;
      });
      interp.push(f);
    }
  }

  interp.push({
    x: parseFloat(tabla.at(-1)[colX]),
    ...Object.fromEntries(ZCOLS.map(z => [z, parseFloat(tabla.at(-1)[z])]))
  });

  const ds = ZCOLS.map((z, i) => ({
    label: z,
    data: interp.map(p => ({ x: p.x, y: p[z] })),
    borderColor: COLORS[i],
    borderDash: (i === 0 || i === 6) ? [6, 4] : undefined,
    tension: 0.4,
    fill: false,
    pointRadius: 0
  }));

  // Punto evaluado
  const punto = {
    label: "Evaluado",
    data: [{
      x: (indicador === "PE" || indicador === "TE") ? puntoUsuario.edadMeses : puntoUsuario.talla,
      y: (indicador === "TE") ? puntoUsuario.talla : puntoUsuario.pesoKg
    }],
    borderColor: "#000",
    backgroundColor: "#000",
    pointStyle: "circle",
    pointRadius: 6,
    pointHoverRadius: 7,
    showLine: false
  };

  ds.push(punto);

  // Configurar escalas dinámicas
  const scaleX = {
    type: "linear",
    title: {
      display: true,
      text: (indicador === "PE") ? "Edad (meses)" :
            (indicador === "PT") ? "Talla (cm)" :
            "Edad (meses)"
    },
    ticks: { stepSize: 5 }
  };

  const scaleY = {
    title: {
      display: true,
      text: (indicador === "TE") ? "Talla (cm)" : "Peso (kg)"
    },
    min: (indicador === "TE") ? 40 : 0,
    ticks: { stepSize: 2 }
  };

  scaleX.min = Math.floor(Math.min(...interp.map(p => p.x)) / 5) * 5;
  scaleX.max = Math.ceil(Math.max(...interp.map(p => p.x)) / 5) * 5;

  if (chart) chart.destroy();

  chart = new Chart(canvas, {
    type: "line",
    data: { datasets: ds },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: `Curva ${indicador} – ${sexo === "M" ? "Niño" : "Niña"} (OMS)`
        },
        tooltip: {
          mode: 'nearest',
          intersect: true,
          callbacks: {
            title: (items) => {
              const x = parseFloat(items[0].label);
              const unidad = colX.toLowerCase().includes("mes") ? " meses" : " cm";
              return `${x.toFixed(2)}${unidad}`;
            },
            label: (item) => {
              const unidadY = (indicador === "TE") ? " cm" : " kg";
              return `${item.dataset.label}: ${item.formattedValue}${unidadY}`;
            }
          }
        },
        zoom: {
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'xy'
          },
          pan: {
            enabled: true,
            mode: 'xy'
          },
          limits: {
            x: { min: scaleX.min, max: scaleX.max },
            y: { min: scaleY.min, max: scaleY.max }
          }
        }
      },
      hover: { mode: 'nearest', intersect: true },
      scales: {
        x: {
          ...scaleX,
          ticks: { precision: 2 }
        },
        y: {
          ...scaleY,
          ticks: { precision: 2 }
        }
      }
    }
  });
}
