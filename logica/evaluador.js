import { evaluarIndicador } from './evaluarIndicador.js';

export async function evaluarCompleto({ sexo, edadMeses, peso, talla }) {
  const sexoMayus = sexo.toUpperCase();
  if (sexoMayus !== "M" && sexoMayus !== "F") throw new Error("Sexo inválido: use F o M");
  if (edadMeses < 0 || edadMeses > 60) throw new Error("Edad fuera de rango permitido (0 a 60 meses)");

  const archivoPE = `PE_${sexoMayus}_0_5.csv`;
  const archivoTE = edadMeses < 24 ? `TE_${sexoMayus}_0_2.csv` : `TE_${sexoMayus}_2_5.csv`;
  const archivoPT = edadMeses < 24 ? `PT_${sexoMayus}_0_2.csv` : `PT_${sexoMayus}_2_5.csv`;

  const pesoEdad = await evaluarIndicador("PE", archivoPE, "Meses", edadMeses, peso, edadMeses);
  const tallaEdad = await evaluarIndicador("TE", archivoTE, "Meses", edadMeses, talla, edadMeses);
  const pesoTalla = await evaluarIndicador("PT", archivoPT, "cm", talla, peso);

  return {
    pesoEdad,
    tallaEdad,
    pesoTalla
  };
}
