const RUTADATA = "data/"; 

function fileName(indicador, sexo, edadMeses = 0) {
  indicador = indicador.toUpperCase();
  sexo = sexo.toUpperCase();

  let file;
  switch (indicador) {
    case "PE": file = `${RUTADATA}PE_${sexo}_0_5.csv`; break;
    case "PT": file = `${RUTADATA}PT_${sexo}_${edadMeses < 24 ? "0_2" : "2_5"}.csv`; break;
    case "TE": file = `${RUTADATA}TE_${sexo}_${edadMeses < 24 ? "0_2" : "2_5"}.csv`; break;
    default: throw new Error("Indicador inválido (usa PE | PT | TE)");
  }
  return file;
}

export async function cargarTabla(indicador, sexo, edadMeses = 0) {
  const archivo = fileName(indicador, sexo, edadMeses);

  try {
    const response = await fetch(archivo);
    if (!response.ok) {
      throw new Error(`Error al cargar el archivo ${archivo}: ${response.status} ${response.statusText}`);
    }

    const txt = await response.text();
    const [cab, ...rows] = txt.trim().split("\n");
    const columnas = cab.replace(/\uFEFF/g, "").split(";").map(c => c.trim().replace(/\s+/g, ''));

    if (rows.length === 0) return [];

    const parsedData = rows.map(r => {
      const celdas = r.split(";").map(c => c.trim().replace(",", "."));
      const fila = {};
      columnas.forEach((k, i) => {
        const value = celdas[i];
        fila[k] = isNaN(value) ? value : parseFloat(value);
      });
      delete fila["Femenino"];
      delete fila["Masculino"];
      delete fila["Gender"];
      return fila;
    });

    return parsedData;

  } catch (error) {
    throw error;
  }
}

export function filaMasCercana(tabla, eje, valor) {
  if (!tabla || tabla.length === 0) return null;

  return tabla.reduce((a, b) => {
    const valA = parseFloat(a[eje]);
    const valB = parseFloat(b[eje]);
    if (isNaN(valA) || isNaN(valB)) return a;
    return Math.abs(valB - valor) < Math.abs(valA - valor) ? b : a;
  });
}
