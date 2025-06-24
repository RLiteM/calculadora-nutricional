import { cargarTabla } from './csvLoader.js';

export async function evaluarIndicador(tipo, archivo, variable, valorUsuario, valorComparar, edadMeses = -1) {
  const tabla = await cargarTabla(archivo);

  const fila = tabla.reduce((prev, curr) => {
    const valCurr = parseFloat(curr[variable]);
    const valPrev = parseFloat(prev[variable]);
    return Math.abs(valCurr - valorUsuario) < Math.abs(valPrev - valorUsuario) ? curr : prev;
  });

  const columnas = Object.keys(fila).filter(key => key.includes("SD") || key === "0SD").sort((a, b) => {
    const orden = { "-3SD": -3, "-2SD": -2, "-1SD": -1, "0SD": 0, "1SD": 1, "2SD": 2, "3SD": 3 };
    return orden[a.replace(" ", "")] - orden[b.replace(" ", "")];
  });

  const valoresZ = columnas.map(key => parseFloat(fila[key]));

  let z = -4;

  if (tipo === "PT") {
    for (let i = 0; i < valoresZ.length; i++) {
      const actual = valoresZ[i];
      const siguiente = valoresZ[i + 1] ?? Infinity;

      switch (i) {
        case 0:
        case 1:
        case 2:
          if (valorComparar < actual) { z = i - 3; break; }
          break;
        case 3:
          if (valorComparar <= actual) { z = 0; break; }
          break;
        case 4:
          if (valorComparar > valoresZ[3] && valorComparar < siguiente) { z = 1; break; }
          break;
        case 5:
          if (valorComparar >= actual && valorComparar < siguiente) { z = 2; break; }
          break;
        case 6:
          if (valorComparar >= actual) { z = 3; break; }
          break;
      }
      if (z !== -4) break;
    }
  } else {
    for (let i = 1; i < valoresZ.length; i++) {
      if (valorComparar < valoresZ[i]) {
        z = i - 3;
        break;
      }
    }
    if (valorComparar < valoresZ[0]) z = -4;
  }

  const estado = interpretarZScore(tipo, z, edadMeses);

  let zScoreReal = null;
  for (let i = 0; i < valoresZ.length - 1; i++) {
    const val1 = valoresZ[i];
    const val2 = valoresZ[i + 1];
    const z1 = i - 3;
    if (valorComparar >= val1 && valorComparar <= val2) {
      zScoreReal = z1 + ((valorComparar - val1) / (val2 - val1));
      console.log("🔍 Interpolación Z:");
      console.log(`   valorComparar: ${valorComparar}`);
      console.log(`   Entre val1: ${val1} (z = ${z1}) y val2: ${val2} (z = ${z1 + 1})`);
      console.log(`   Resultado zScoreReal: ${zScoreReal.toFixed(4)}`);
      break;
    }
  }
  if (zScoreReal === null) {
    if (valorComparar < valoresZ[0]) zScoreReal = -3.5;
    else if (valorComparar > valoresZ[valoresZ.length - 1]) zScoreReal = 3.5;

    console.log("⚠️ valorComparar fuera de rango:");
    console.log(`   valorComparar: ${valorComparar}`);
    console.log(`   zScoreReal forzado: ${zScoreReal}`);
  }

  return {
    zScoreAproximado: z,
    estado,
    referencia: parseFloat(zScoreReal.toFixed(2))
  };
}

function interpretarZScore(indicador, z, edadMeses = -1) {
  if (indicador === "PE") {
    if (z < -2 && edadMeses >= 0 && edadMeses <= 5) return "Riesgo Nutricional";
    if (z <= -3) return "Peso Bajo Severo";
    if (z === -2) return "Peso Bajo Moderado";
    return "Normal";
  }
  if (indicador === "TE") {
    if (edadMeses >= 24) {
      if (z <= -3) return "Retardo de crecimiento Crónico Severo";
      if (z === -2) return "Retardo de crecimiento Crónico Moderado";
    } else {
      if (z <= -3) return "Retardo de crecimiento Severo";
      if (z === -2) return "Retardo de crecimiento Moderado";
    }
    return "Normal";
  }
  if (indicador === "PT") {
    switch (z) {
      case -4:
      case -3: return "Desnutrición Aguda Severa";
      case -2: return "Desnutrición Aguda Moderada";
      case -1: return "Tendencia a la baja";
      case 0:
      case 1: return "Normal";
      case 2: return "Sobrepeso";
      default: return "Obesidad";
    }
  }
  return "Sin clasificar";
}
