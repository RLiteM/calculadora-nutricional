export async function cargarTabla(nombreArchivo) {
  const response = await fetch(`data/${nombreArchivo}`);
  const texto = await response.text();

  const [cabecera, ...lineas] = texto.trim().split("\n");
  const columnas = cabecera.replace("\uFEFF", "").split(";");

  return lineas.map(linea => {
    const valores = linea.split(";").map(celda => celda.trim().replace(",", "."));
    return Object.fromEntries(columnas.map((col, i) => [col.trim(), valores[i]]));
  });
}
