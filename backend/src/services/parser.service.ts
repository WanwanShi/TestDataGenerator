import type { FieldConfig, FieldType, ParsedSchema } from '@test-data-generator/shared';

// Infer field type from a sample value
function inferFieldType(value: unknown): FieldType {
  if (value === null || value === undefined) {
    return 'string';
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'object') {
    return 'object';
  }

  // String type - try to detect specific formats
  const str = String(value);

  // UUID pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return 'uuid';
  }

  // Email pattern
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
    return 'email';
  }

  // URL pattern
  if (/^https?:\/\//.test(str)) {
    return 'url';
  }

  // Date pattern (ISO format or common formats)
  if (/^\d{4}-\d{2}-\d{2}/.test(str) || /^\d{2}\/\d{2}\/\d{4}/.test(str)) {
    return 'date';
  }

  // Phone pattern
  if (/^[\d\s\-+()]{10,}$/.test(str)) {
    return 'phone';
  }

  return 'string';
}

// Parse a single field from a key-value pair
function parseField(name: string, value: unknown): FieldConfig {
  const type = inferFieldType(value);
  const config: FieldConfig = {
    name,
    type,
    required: true,
    nullable: false,
  };

  // Add type-specific defaults
  switch (type) {
    case 'string': {
      const strValue = String(value);
      config.minLength = 1;
      config.maxLength = Math.max(strValue.length * 2, 50);
      break;
    }
    case 'number': {
      const numValue = Number(value);
      config.min = 0;
      config.max = Math.max(numValue * 10, 1000);
      config.precision = Number.isInteger(numValue) ? 0 : 2;
      break;
    }
    case 'array': {
      const arr = value as unknown[];
      config.arrayMinLength = 1;
      config.arrayMaxLength = Math.max(arr.length, 5);
      if (arr.length > 0) {
        const firstItem = arr[0];
        // Recursively parse the first item to get its structure
        const itemConfig = parseField('item', firstItem);

        // If the array contains objects, ensure we capture the nested structure
        if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
          itemConfig.type = 'object';
          itemConfig.nestedFields = Object.entries(firstItem as Record<string, unknown>)
            .map(([key, val]) => parseField(key, val));
        }

        config.arrayItemConfig = itemConfig;
      }
      break;
    }
    case 'object': {
      const obj = value as Record<string, unknown>;
      config.nestedFields = Object.entries(obj).map(([key, val]) => parseField(key, val));
      break;
    }
  }

  return config;
}

// Parse JSON input to extract schema
export function parseJsonInput(input: string): ParsedSchema {
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(input);

    // Handle array of objects - use first item as template
    const template = Array.isArray(parsed) ? parsed[0] : parsed;

    if (typeof template !== 'object' || template === null) {
      return {
        fields: [],
        originalInput: input,
        parseErrors: ['Input must be a JSON object or array of objects'],
      };
    }

    const fields = Object.entries(template).map(([key, value]) => parseField(key, value));

    return {
      fields,
      originalInput: input,
      parseErrors: errors.length > 0 ? errors : undefined,
    };
  } catch (e) {
    return {
      fields: [],
      originalInput: input,
      parseErrors: [`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`],
    };
  }
}

// Parse TypeScript interface/type to extract schema
export function parseTypeScriptInput(input: string): ParsedSchema {
  const errors: string[] = [];
  const fields: FieldConfig[] = [];

  // Simple regex-based parsing for common TS patterns
  // This handles basic interfaces and types
  const cleanInput = input
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/export\s+/g, ''); // Remove export keyword

  // Match interface or type body
  const bodyMatch = cleanInput.match(/(?:interface|type)\s+\w+\s*(?:=\s*)?\{([^}]+)\}/);

  if (!bodyMatch) {
    // Try to parse as plain object type
    const plainMatch = cleanInput.match(/\{([^}]+)\}/);
    if (!plainMatch) {
      return {
        fields: [],
        originalInput: input,
        parseErrors: ['Could not parse TypeScript input. Expected interface, type, or object type.'],
      };
    }
  }

  const body = bodyMatch ? bodyMatch[1] : cleanInput.match(/\{([^}]+)\}/)?.[1] || '';

  // Parse each property line
  const propertyRegex = /(\w+)(\?)?:\s*([^;,\n]+)/g;
  let match;

  while ((match = propertyRegex.exec(body)) !== null) {
    const [, name, optional, typeStr] = match;
    const trimmedType = typeStr.trim();

    const field: FieldConfig = {
      name,
      type: mapTypeScriptType(trimmedType),
      required: !optional,
      nullable: trimmedType.includes('null'),
    };

    // Handle array types
    if (trimmedType.endsWith('[]') || trimmedType.startsWith('Array<')) {
      field.type = 'array';
      field.arrayMinLength = 1;
      field.arrayMaxLength = 5;
      const itemType = trimmedType.replace('[]', '').replace(/Array<(.+)>/, '$1').trim();
      field.arrayItemConfig = {
        name: 'item',
        type: mapTypeScriptType(itemType),
        required: true,
        nullable: false,
      };
    }

    fields.push(field);
  }

  if (fields.length === 0) {
    errors.push('No fields found in TypeScript input');
  }

  return {
    fields,
    originalInput: input,
    parseErrors: errors.length > 0 ? errors : undefined,
  };
}

// Map TypeScript type string to FieldType
function mapTypeScriptType(typeStr: string): FieldType {
  const normalized = typeStr.toLowerCase().replace(/\s/g, '');

  if (normalized === 'string') return 'string';
  if (normalized === 'number') return 'number';
  if (normalized === 'boolean') return 'boolean';
  if (normalized === 'date') return 'date';
  if (normalized.includes('|')) return 'enum'; // Union types treated as enum

  return 'string'; // Default fallback
}

// Auto-detect input type and parse accordingly
export function parseInput(input: string, inputType: 'json' | 'typescript' | 'auto'): ParsedSchema {
  if (inputType === 'json') {
    return parseJsonInput(input);
  }

  if (inputType === 'typescript') {
    return parseTypeScriptInput(input);
  }

  // Auto-detect
  const trimmed = input.trim();

  // If it starts with { or [, try JSON first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const jsonResult = parseJsonInput(input);
    if (!jsonResult.parseErrors || jsonResult.fields.length > 0) {
      return jsonResult;
    }
  }

  // Try TypeScript if JSON failed or input looks like TS
  if (
    trimmed.includes('interface') ||
    trimmed.includes('type ') ||
    trimmed.includes(':')
  ) {
    return parseTypeScriptInput(input);
  }

  // Default to JSON
  return parseJsonInput(input);
}
