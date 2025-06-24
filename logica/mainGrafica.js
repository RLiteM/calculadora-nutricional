import { cargarTabla } from './lectortabla.js';

const ZCOLS = ["-3SD", "-2SD", "-1SD", "0SD", "1SD", "2SD", "3SD"];
const COLORS = ["#8b0000", "#e60000", "#ffa500", "#008000", "#00bfff", "#4169e1", "#4b0082"];
let chart = null;
let originalZoom = null;

const canvas = document.getElementById("grafica");
const titulo = document.getElementById("tituloGrafica");

document.querySelectorAll(".botones button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!chart) return;

    if (btn.textContent.includes("Zoom +")) zoomAlPunto(1.2);
    else if (btn.textContent.includes("Zoom -")) zoomAlPunto(0.8);
    else if (btn.id === "btnResetZoom" && originalZoom) {
      chart.options.scales.x.min = originalZoom.xMin;
      chart.options.scales.x.max = originalZoom.xMax;
      chart.options.scales.y.min = originalZoom.yMin;
      chart.options.scales.y.max = originalZoom.yMax;

      if (chart.resetZoom) chart.resetZoom();

      chart.update();
    }
  });
});

const datos = JSON.parse(localStorage.getItem("datosGrafica") || "{}");

if (!datos.indicador || !datos.sexo || typeof datos.edadMeses !== "number") {
  titulo.textContent = "❌ Datos insuficientes para graficar";
  throw new Error("Faltan datos necesarios para graficar.");
}

titulo.textContent = `Curva ${datos.indicador} – ${datos.sexo === "M" ? "Niño" : "Niña"}`;
dibujar(datos.indicador, datos.sexo, datos.edadMeses, datos);

function zoomAlPunto(factor = 1.2) {
  if (!chart) return;

  const punto = chart.data.datasets.find(d => d.label === "Evaluado")?.data[0];
  if (!punto) return;

  const xRange = chart.options.scales.x;
  const yRange = chart.options.scales.y;

  const xSpan = (xRange.max - xRange.min) / factor;
  const ySpan = (yRange.max - yRange.min) / factor;

  xRange.min = punto.x - xSpan / 2;
  xRange.max = punto.x + xSpan / 2;
  yRange.min = punto.y - ySpan / 2;
  yRange.max = punto.y + ySpan / 2;

  chart.update();
}

async function dibujar(indicador, sexo, ref, puntoUsuario) {
  const tabla = await cargarTabla(indicador, sexo, ref);
  if (!tabla?.length) return;

  const colX = Object.keys(tabla[0]).find(k => /meses|mes|cm/i.test(k));
  if (!colX) return;

  const STEP = 500;
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
    tension: 0.8,
    fill: false,
    pointRadius: 0
  }));

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

  const scaleX = {
    type: "linear",
    title: {
      display: true,
      text: (indicador === "PE") ? "Edad (meses)" :
            (indicador === "PT") ? "Talla (cm)" : "Edad (meses)"
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

  originalZoom = {
    xMin: scaleX.min,
    xMax: scaleX.max,
    yMin: scaleY.min,
    yMax: scaleY.max
  };

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
  if (item.dataset.label === "Evaluado") {
    const z = puntoUsuario.z != null ? puntoUsuario.z.toFixed(2) : "N/A";
    const unidadX = (indicador === "PT") ? "cm" : "meses";
    const unidadY = (indicador === "TE") ? "cm" : "kg";
    return [
      `Z-Score: ${z}`,
      `X (${unidadX}): ${item.raw.x}`,
      `Y (${unidadY}): ${item.raw.y}`
      
    ];
  }

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
        x: { ...scaleX, ticks: { precision: 2 } },
        y: { ...scaleY, ticks: { precision: 2 } }
      }
    }
  });
}
