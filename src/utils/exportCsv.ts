export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Exporte un tableau d'objets vers un fichier CSV compatible Microsoft Excel (UTF-8 avec BOM et séparateur ';')
 */
export function exportToCsv<T>(filename: string, rows: T[], columns: CsvColumn<T>[]) {
  const escapeCell = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = String(value).replace(/"/g, '""');
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str}"`;
    }
    return str;
  };

  const headerLine = columns.map((col) => escapeCell(col.header)).join(';');
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCell(col.accessor(row))).join(';')
  );

  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
