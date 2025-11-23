// Field types supported by the generator
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'uuid'
  | 'phone'
  | 'url'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'address'
  | 'city'
  | 'country'
  | 'zipCode'
  | 'company'
  | 'lorem'
  | 'enum'
  | 'array'
  | 'object';

// Configuration for a single field
export interface FieldConfig {
  name: string;
  type: FieldType;
  required: boolean;
  nullable: boolean;
  nullablePercent?: number; // 0-100, chance of being null

  // Description/hint for realistic data generation
  // e.g., "site reference code", "sensor model name", "temperature reading"
  hint?: string;

  // String constraints
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern

  // Number constraints
  min?: number;
  max?: number;
  precision?: number; // Decimal places

  // Enum constraints
  enumValues?: string[];

  // Array constraints
  arrayMinLength?: number;
  arrayMaxLength?: number;
  arrayItemConfig?: FieldConfig;

  // Object constraints (nested fields)
  nestedFields?: FieldConfig[];

  // Custom faker template (advanced)
  fakerTemplate?: string;
}

// Parsed schema from DTO input
export interface ParsedSchema {
  fields: FieldConfig[];
  originalInput: string;
  parseErrors?: string[];
}

// Request to parse a DTO
export interface ParseDtoRequest {
  input: string;
  inputType: 'json' | 'typescript' | 'auto';
}

// Response from parsing
export interface ParseDtoResponse {
  success: boolean;
  schema?: ParsedSchema;
  error?: string;
}

// Export format options
export type ExportFormat = 'json' | 'csv' | 'sql' | 'xml';

// Request to generate data
export interface GenerateDataRequest {
  schema: ParsedSchema;
  count: number; // 1 to 100000
  format: ExportFormat;
  preview?: boolean; // If true, only return first 10 records
}

// Response from generation
export interface GenerateDataResponse {
  success: boolean;
  data?: string; // Formatted output
  recordCount?: number;
  error?: string;
}

// API error response
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
