import { cargarTabla } from './lectortabla.js'; // Asegúrate que esté correcto

const ZCOLS  = ["-3SD","-2SD","-1SD","0SD","1SD","2SD","3SD"];
const COLORS = ["#8b0000","#e60000","#ffa500","#008000","#00bfff",
                "#4169e1","#4b0082"];

const sexoSel = document.getElementById("sexo");
const edadIn  = document.getElementById("edadMeses");
const canvas  = document.getElementById("grafica");
let   chart;

document.getElementById("btnPE").onclick = () => dibujar("PE");
document.getElementById("btnPT").onclick = () => dibujar("PT");
document.getElementById("btnTE").onclick = () => dibujar("TE");

async function dibujar(indicador){
  const sexo = sexoSel.value;
  const ref  = +edadIn.value || 0;
  const tabla = await cargarTabla(indicador, sexo, ref);

  if (!tabla || tabla.length === 0) {
      console.error("No se pudieron cargar datos o la tabla está vacía.");
      if (chart) chart.destroy();
      return;
  }

  const colX = Object.keys(tabla[0]).find(k =>
                    /meses|mes|cm/i.test(k));

  if (!colX) {
      console.error("No se encontró una columna de referencia para el eje X (meses o cm).");
      if (chart) chart.destroy();
      return;
  }

  const STEP = 100;
  const interp = [];
  for (let i = 0; i < tabla.length - 1; i++){
    const a = tabla[i], b = tabla[i+1];
    const startX = parseFloat(a[colX]);
    const endX = parseFloat(b[colX]);

    for (let j = 0; j < STEP; j++){
      const t = j / STEP;
      const currentX = startX + (endX - startX) * t;
      const f = { x: currentX };
      ZCOLS.forEach(z => {
          const valA = parseFloat(a[z]);
          const valB = parseFloat(b[z]);
          f[z] = valA + (valB - valA) * t;
      });
      interp.push(f);
    }
  }
  interp.push({ x: parseFloat(tabla.at(-1)[colX]), ...Object.fromEntries(ZCOLS.map(z => [z, parseFloat(tabla.at(-1)[z])])) });

  const ds = ZCOLS.map((z,i)=>({
    label:z,
    data :interp.map(p=>({x:p.x,y:p[z]})),
    borderColor:COLORS[i],
    borderDash:(i===0 || i===6) ? [6,4] : undefined,
    tension:.4,
    fill:false,
    pointRadius:0
  }));

  let scaleXOptions = { type:"linear", title:{display:true,text:colX} };
  let scaleYOptions = { title:{display:true} };

  if (indicador === "PE" || indicador === "PT") {
      scaleYOptions.title.text = "Peso (kg)";
      scaleYOptions.min = 0;
      scaleYOptions.ticks = { stepSize: 2 };
      scaleXOptions.title.text = (indicador === "PE") ? "Edad (meses)" : "Talla (cm)";
      scaleXOptions.ticks = { stepSize: 5 };
  } else if (indicador === "TE") {
      scaleYOptions.title.text = "Talla (cm)";
      scaleYOptions.min = 40;
      scaleYOptions.ticks = { stepSize: 5 };
      scaleXOptions.title.text = "Edad (meses)";
      scaleXOptions.ticks = { stepSize: 5 };
  }

  const minXData = Math.min(...interp.map(p => p.x));
  const maxXData = Math.max(...interp.map(p => p.x));
  scaleXOptions.min = Math.floor(minXData / (scaleXOptions.ticks.stepSize || 1)) * (scaleXOptions.ticks.stepSize || 1);
  scaleXOptions.max = Math.ceil(maxXData / (scaleXOptions.ticks.stepSize || 1)) * (scaleXOptions.ticks.stepSize || 1);

  if (chart) chart.destroy();
  chart = new Chart(canvas,{
    type:"line",
    data:{datasets:ds},
    options:{
      responsive:true,
      plugins:{
          title:{
              display:true,
              text:`Curva ${indicador} – ${sexo==="M"?"Niño":"Niña"}`
          },
          tooltip: {
              mode: 'nearest',
              intersect: true,
              callbacks: {
                  title: function(tooltipItems) {
                      const xValue = parseFloat(tooltipItems[0].label);
                      const xUnit = colX.toLowerCase().includes('meses') || colX.toLowerCase().includes('mes') ? ' meses' : ' cm';
                      return xValue.toFixed(1) + xUnit;
                  },
                  label: function(tooltipItem) {
                      const yUnit = (indicador === "TE") ? " cm" : " kg";
                      return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}${yUnit}`;
                  }
              }
          }
      },
      hover: {
          mode: 'nearest',
          intersect: true
      },
      scales:{
        x: scaleXOptions,
        y: scaleYOptions
      }
    }
  });
}
