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

// Date format options
export type DateFormat =
  | 'iso'           // 2024-01-15T10:30:00.000Z (ISO 8601)
  | 'iso-date'      // 2024-01-15
  | 'iso-time'      // 10:30:00
  | 'unix'          // 1705312200 (seconds)
  | 'unix-ms'       // 1705312200000 (milliseconds)
  | 'us'            // 01/15/2024
  | 'eu'            // 15/01/2024
  | 'short'         // Jan 15, 2024
  | 'long';         // January 15, 2024

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

  // Date/time constraints
  dateFormat?: DateFormat; // Output format for date/datetime/time/timestamp

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
  sequentialIdPrefix?: string; // Optional custom prefix for all sequential IDs
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

// Generation context passed during data generation (internal use only)
export interface GenerationContext {
  // Current record index (0-based)
  recordIndex: number;

  // Total number of records being generated
  totalRecords: number;

  // Unique random part for this top-level record (6-char alphanumeric)
  recordRandomId: string;

  // Parent context for nested structures (hierarchical IDs)
  parentContext?: {
    randomId: string;  // Parent's random ID
    sequence: string;  // Parent's sequence
    depth: number;     // Nesting depth (0 = root)
  };

  // Array item index (for items within arrays)
  arrayItemIndex?: number;

  // Custom prefix for sequential IDs (optional, overrides auto-extracted prefix)
  sequentialIdPrefix?: string;
}
