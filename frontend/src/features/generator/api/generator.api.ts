import type {
  ParseDtoRequest,
  ParseDtoResponse,
  GenerateDataRequest,
  GenerateDataResponse,
  FieldType,
  ExportFormat,
} from '@test-data-generator/shared';

const API_BASE = '/api';

export async function parseDto(request: ParseDtoRequest): Promise<ParseDtoResponse> {
  const response = await fetch(`${API_BASE}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function generateData(request: GenerateDataRequest): Promise<GenerateDataResponse> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getFieldTypes(): Promise<
  { type: FieldType; label: string; description: string }[]
> {
  const response = await fetch(`${API_BASE}/field-types`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getFormats(): Promise<{ format: ExportFormat; label: string }[]> {
  const response = await fetch(`${API_BASE}/formats`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
