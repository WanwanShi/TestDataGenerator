import type { ExportFormat } from '@test-data-generator/shared';

// Base exporter interface for extensibility
interface Exporter {
  export(data: Record<string, unknown>[]): string;
  mimeType: string;
  fileExtension: string;
}

// JSON Exporter
const jsonExporter: Exporter = {
  mimeType: 'application/json',
  fileExtension: 'json',
  export(data: Record<string, unknown>[]): string {
    return JSON.stringify(data, null, 2);
  },
};

// CSV Exporter
const csvExporter: Exporter = {
  mimeType: 'text/csv',
  fileExtension: 'csv',
  export(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((record) =>
      headers
        .map((header) => {
          const value = record[header];
          const stringValue = formatCsvValue(value);
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  },
};

// SQL INSERT Exporter
const sqlExporter: Exporter = {
  mimeType: 'text/plain',
  fileExtension: 'sql',
  export(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';

    const tableName = 'generated_data';
    const columns = Object.keys(data[0]);

    const inserts = data.map((record) => {
      const values = columns.map((col) => formatSqlValue(record[col])).join(', ');
      return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values});`;
    });

    return inserts.join('\n');
  },
};

// XML Exporter
const xmlExporter: Exporter = {
  mimeType: 'application/xml',
  fileExtension: 'xml',
  export(data: Record<string, unknown>[]): string {
    const items = data.map((record) => {
      const fields = Object.entries(record)
        .map(([key, value]) => `    <${key}>${escapeXml(formatXmlValue(value))}</${key}>`)
        .join('\n');
      return `  <item>\n${fields}\n  </item>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n${items.join('\n')}\n</data>`;
  },
};

// Registry of all exporters
const exporters: Record<ExportFormat, Exporter> = {
  json: jsonExporter,
  csv: csvExporter,
  sql: sqlExporter,
  xml: xmlExporter,
};

// Helper functions
function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatSqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function formatXmlValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main export function
export function exportData(
  data: Record<string, unknown>[],
  format: ExportFormat
): { content: string; mimeType: string; fileExtension: string } {
  const exporter = exporters[format];

  if (!exporter) {
    throw new Error(`Unsupported export format: ${format}`);
  }

  return {
    content: exporter.export(data),
    mimeType: exporter.mimeType,
    fileExtension: exporter.fileExtension,
  };
}

// Get list of available formats for UI
export function getAvailableFormats(): { format: ExportFormat; label: string }[] {
  return [
    { format: 'json', label: 'JSON' },
    { format: 'csv', label: 'CSV' },
    { format: 'sql', label: 'SQL INSERT' },
    { format: 'xml', label: 'XML' },
  ];
}
