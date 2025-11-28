import { faker } from '@faker-js/faker';
import type { FieldConfig, FieldType, ParsedSchema, DateFormat, GenerationContext } from '@test-data-generator/shared';

// Format a date according to the specified format
function formatDate(date: Date, format: DateFormat = 'iso'): string | number {
  switch (format) {
    case 'iso':
      return date.toISOString();
    case 'iso-date':
      return date.toISOString().split('T')[0];
    case 'iso-time':
      return date.toISOString().split('T')[1].split('.')[0];
    case 'unix':
      return Math.floor(date.getTime() / 1000);
    case 'unix-ms':
      return date.getTime();
    case 'us':
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
    case 'eu':
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    case 'long':
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    default:
      return date.toISOString();
  }
}

// Hint patterns mapped to appropriate faker generators
// Keywords in hint/name -> generator function
const HINT_GENERATORS: Array<{
  patterns: RegExp[];
  generator: () => unknown;
  forType?: FieldType[];
}> = [
  // Identifiers & References
  {
    patterns: [/\b(id|identifier|ref|reference|code)\b/i, /Id$/],
    generator: () => faker.string.alphanumeric({ length: 8, casing: 'upper' }),
    forType: ['string'],
  },
  {
    patterns: [/\b(sku|product.?code|item.?code|part.?number)\b/i],
    generator: () => `${faker.string.alpha({ length: 3, casing: 'upper' })}-${faker.string.numeric(6)}`,
    forType: ['string'],
  },
  {
    patterns: [/\b(serial|serial.?number)\b/i],
    generator: () => faker.string.alphanumeric({ length: 12, casing: 'upper' }),
    forType: ['string'],
  },

  // Names & Labels
  {
    patterns: [/\b(sensor.?name|device.?name|equipment.?name)\b/i],
    generator: () => `${faker.science.chemicalElement().name}-${faker.string.numeric(3)}`,
    forType: ['string'],
  },
  {
    patterns: [/\b(site.?name|location.?name|place.?name|building.?name)\b/i],
    generator: () => `${faker.location.city()} ${faker.helpers.arrayElement(['Center', 'Station', 'Hub', 'Facility', 'Plant'])}`,
    forType: ['string'],
  },
  {
    patterns: [/\b(project.?name|campaign.?name)\b/i],
    generator: () => `${faker.word.adjective()} ${faker.word.noun()}`.replace(/^\w/, c => c.toUpperCase()),
    forType: ['string'],
  },
  {
    patterns: [/\b(title|heading|subject)\b/i],
    generator: () => faker.lorem.sentence({ min: 3, max: 6 }).replace(/\.$/, ''),
    forType: ['string'],
  },
  {
    patterns: [/\b(name)\b/i],
    generator: () => faker.person.fullName(),
    forType: ['string'],
  },
  {
    patterns: [/\b(first.?name|firstname|given.?name)\b/i],
    generator: () => faker.person.firstName(),
    forType: ['string'],
  },
  {
    patterns: [/\b(last.?name|lastname|surname|family.?name)\b/i],
    generator: () => faker.person.lastName(),
    forType: ['string'],
  },
  {
    patterns: [/\b(username|user.?name|login)\b/i],
    generator: () => faker.internet.userName(),
    forType: ['string'],
  },

  // Descriptions & Text
  {
    patterns: [/\b(description|desc|summary|overview|details)\b/i],
    generator: () => faker.lorem.paragraph({ min: 1, max: 3 }),
    forType: ['string'],
  },
  {
    patterns: [/\b(comment|note|remark|feedback)\b/i],
    generator: () => faker.lorem.sentence({ min: 5, max: 15 }),
    forType: ['string'],
  },
  {
    patterns: [/\b(function|purpose|role|type|category)\b/i],
    generator: () => faker.helpers.arrayElement([
      'Primary', 'Secondary', 'Backup', 'Monitoring', 'Control',
      'Analysis', 'Processing', 'Storage', 'Communication', 'Display'
    ]),
    forType: ['string'],
  },
  {
    patterns: [/\b(status|state)\b/i],
    generator: () => faker.helpers.arrayElement(['Active', 'Inactive', 'Pending', 'Completed', 'Failed', 'Running']),
    forType: ['string'],
  },

  // Location & Address
  {
    patterns: [/\b(address|street)\b/i],
    generator: () => faker.location.streetAddress(),
    forType: ['string'],
  },
  {
    patterns: [/\b(city|town)\b/i],
    generator: () => faker.location.city(),
    forType: ['string'],
  },
  {
    patterns: [/\b(state|province|region)\b/i],
    generator: () => faker.location.state(),
    forType: ['string'],
  },
  {
    patterns: [/\b(country)\b/i],
    generator: () => faker.location.country(),
    forType: ['string'],
  },
  {
    patterns: [/\b(zip|postal|postcode)\b/i],
    generator: () => faker.location.zipCode(),
    forType: ['string'],
  },
  {
    patterns: [/\b(lat|latitude)\b/i],
    generator: () => faker.location.latitude(),
    forType: ['number'],
  },
  {
    patterns: [/\b(lon|lng|longitude)\b/i],
    generator: () => faker.location.longitude(),
    forType: ['number'],
  },

  // Contact Information
  {
    patterns: [/\b(email|e-mail|mail)\b/i],
    generator: () => faker.internet.email(),
    forType: ['string'],
  },
  {
    patterns: [/\b(phone|telephone|mobile|cell)\b/i],
    generator: () => faker.phone.number(),
    forType: ['string'],
  },
  {
    patterns: [/\b(website|url|link|homepage)\b/i],
    generator: () => faker.internet.url(),
    forType: ['string'],
  },

  // Company & Organization
  {
    patterns: [/\b(company|organization|org|business|firm)\b/i],
    generator: () => faker.company.name(),
    forType: ['string'],
  },
  {
    patterns: [/\b(department|dept|division|team)\b/i],
    generator: () => faker.commerce.department(),
    forType: ['string'],
  },
  {
    patterns: [/\b(job.?title|position|occupation)\b/i],
    generator: () => faker.person.jobTitle(),
    forType: ['string'],
  },

  // Dates & Times
  {
    patterns: [/\b(created|created.?at|creation.?date)\b/i],
    generator: () => faker.date.past({ years: 2 }).toISOString(),
    forType: ['string', 'date'],
  },
  {
    patterns: [/\b(updated|modified|updated.?at|modified.?at)\b/i],
    generator: () => faker.date.recent({ days: 30 }).toISOString(),
    forType: ['string', 'date'],
  },
  {
    patterns: [/\b(timestamp|time|datetime)\b/i],
    generator: () => faker.date.recent({ days: 7 }).toISOString(),
    forType: ['string', 'date'],
  },
  {
    patterns: [/\b(date|day)\b/i],
    generator: () => faker.date.recent({ days: 365 }).toISOString().split('T')[0],
    forType: ['string', 'date'],
  },
  {
    patterns: [/\b(start|begin|from)\b/i],
    generator: () => faker.date.past({ years: 1 }).toISOString(),
    forType: ['string', 'date'],
  },
  {
    patterns: [/\b(end|finish|to|until)\b/i],
    generator: () => faker.date.future({ years: 1 }).toISOString(),
    forType: ['string', 'date'],
  },

  // Measurements & Values
  {
    patterns: [/\b(temperature|temp)\b/i],
    generator: () => faker.number.float({ min: -20, max: 45, fractionDigits: 1 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(humidity)\b/i],
    generator: () => faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(pressure)\b/i],
    generator: () => faker.number.float({ min: 900, max: 1100, fractionDigits: 2 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(speed|velocity)\b/i],
    generator: () => faker.number.float({ min: 0, max: 200, fractionDigits: 2 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(weight|mass)\b/i],
    generator: () => faker.number.float({ min: 0.1, max: 1000, fractionDigits: 2 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(height|length|width|depth|distance)\b/i],
    generator: () => faker.number.float({ min: 0.1, max: 500, fractionDigits: 2 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(price|cost|amount|total|fee)\b/i],
    generator: () => faker.number.float({ min: 1, max: 10000, fractionDigits: 2 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(count|quantity|qty|number|num)\b/i],
    generator: () => faker.number.int({ min: 1, max: 100 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(percent|percentage|rate)\b/i],
    generator: () => faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(reading|value|measurement|level)\b/i],
    generator: () => faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(age)\b/i],
    generator: () => faker.number.int({ min: 18, max: 80 }),
    forType: ['number'],
  },
  {
    patterns: [/\b(year)\b/i],
    generator: () => faker.number.int({ min: 2000, max: 2025 }),
    forType: ['number'],
  },

  // Product & Commerce
  {
    patterns: [/\b(product|item)\b/i],
    generator: () => faker.commerce.productName(),
    forType: ['string'],
  },
  {
    patterns: [/\b(brand|manufacturer)\b/i],
    generator: () => faker.company.name(),
    forType: ['string'],
  },
  {
    patterns: [/\b(color|colour)\b/i],
    generator: () => faker.color.human(),
    forType: ['string'],
  },
  {
    patterns: [/\b(model)\b/i],
    generator: () => `${faker.string.alpha({ length: 2, casing: 'upper' })}-${faker.string.numeric(4)}`,
    forType: ['string'],
  },
  {
    patterns: [/\b(version|ver)\b/i],
    generator: () => `${faker.number.int({ min: 1, max: 10 })}.${faker.number.int({ min: 0, max: 99 })}.${faker.number.int({ min: 0, max: 99 })}`,
    forType: ['string'],
  },

  // Technical & IT
  {
    patterns: [/\b(ip|ip.?address)\b/i],
    generator: () => faker.internet.ip(),
    forType: ['string'],
  },
  {
    patterns: [/\b(mac|mac.?address)\b/i],
    generator: () => faker.internet.mac(),
    forType: ['string'],
  },
  {
    patterns: [/\b(port)\b/i],
    generator: () => faker.internet.port(),
    forType: ['number'],
  },
  {
    patterns: [/\b(path|file.?path|directory)\b/i],
    generator: () => faker.system.filePath(),
    forType: ['string'],
  },
  {
    patterns: [/\b(filename|file.?name)\b/i],
    generator: () => faker.system.fileName(),
    forType: ['string'],
  },
];

// Patterns that indicate an ID/reference field
const ID_PATTERNS = [
  /^id$/i,                    // "id"
  /Id$/,                      // ends with "Id" (userId, orderId)
  /^.*_id$/i,                 // ends with "_id" (user_id)
  /reference$/i,              // ends with "reference"
  /^ref$/i,                   // "ref"
  /^.*_ref$/i,                // ends with "_ref"
  /^identifier$/i,            // "identifier"
  /^code$/i,                  // "code"
];

// Check if a field name indicates it should be an auto-generated ID
function isIdField(fieldName: string): boolean {
  return ID_PATTERNS.some(pattern => pattern.test(fieldName));
}

// Extract prefix from field name
// Examples: "userId" -> "USER", "orderId" -> "ORDER", "reference" -> "REF"
function extractPrefix(fieldName: string): string {
  // Remove common suffixes
  let baseName = fieldName
    .replace(/Id$/i, '')          // userId -> user
    .replace(/_id$/i, '')         // user_id -> user
    .replace(/Reference$/i, '')   // siteReference -> site
    .replace(/_ref$/i, '')        // site_ref -> site
    .replace(/Identifier$/i, '')  // userIdentifier -> user
    .replace(/Code$/i, '');       // orderCode -> order

  // If nothing left, use original name
  if (!baseName) {
    baseName = fieldName;
  }

  // Default prefixes for common generic names
  const defaultPrefixes: Record<string, string> = {
    'id': 'ID',
    'ref': 'REF',
    'reference': 'REF',
    'identifier': 'ID',
    'code': 'CODE',
  };

  const lowerBase = baseName.toLowerCase();
  if (defaultPrefixes[lowerBase]) {
    return defaultPrefixes[lowerBase];
  }

  // Split camelCase and take first word
  const words = baseName
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase -> spaces
    .replace(/_/g, ' ')                    // snake_case -> spaces
    .split(/\s+/);

  return (words[0] || baseName).toUpperCase();
}

// Generate a 6-character alphanumeric random ID
function generateRandomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// Format sequence number with appropriate zero-padding
function formatSequence(index: number, total: number): string {
  const digits = String(total).length;
  const sequence = index + 1;  // 1-based sequence
  return String(sequence).padStart(digits, '0');
}

// Generate an auto ID in format: PREFIX-RANDOM-SEQUENCE
function generateAutoId(
  fieldName: string,
  context: GenerationContext
): string {
  // Use custom prefix if provided, otherwise extract from field name
  const prefix = context.sequentialIdPrefix || extractPrefix(fieldName);
  const { recordRandomId, parentContext, arrayItemIndex, recordIndex, totalRecords } = context;

  if (parentContext) {
    // Nested ID: inherit parent's random ID and extend sequence
    const childSeq = formatSequence(
      arrayItemIndex ?? 0,
      10 // Assume max 10 nested items for padding
    );

    return `${prefix}-${parentContext.randomId}-${parentContext.sequence}-${childSeq}`;
  }

  // Top-level ID: use record's random ID and sequence
  const sequence = formatSequence(recordIndex, totalRecords);
  return `${prefix}-${recordRandomId}-${sequence}`;
}

// Try to generate value based on hint or field name
function generateFromHint(config: FieldConfig): unknown | null {
  // Split camelCase and snake_case for better matching
  // e.g., "siteReference" -> "site reference", "site_reference" -> "site reference"
  const normalizedName = config.name
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> spaces
    .replace(/_/g, ' ') // snake_case -> spaces
    .toLowerCase();

  const searchText = `${config.hint || ''} ${normalizedName}`;

  for (const { patterns, generator, forType } of HINT_GENERATORS) {
    // Check if type matches (if specified)
    if (forType && !forType.includes(config.type)) {
      continue;
    }

    // Check if any pattern matches
    for (const pattern of patterns) {
      if (pattern.test(searchText)) {
        return generator();
      }
    }
  }

  return null;
}

// Generate a single value based on field configuration
function generateValue(config: FieldConfig, context?: GenerationContext): unknown {
  // Handle nullable fields
  if (config.nullable && config.nullablePercent) {
    const roll = Math.random() * 100;
    if (roll < config.nullablePercent) {
      return null;
    }
  }

  // NEW: Auto ID generation - highest priority
  if (config.type === 'string' && context && isIdField(config.name)) {
    return generateAutoId(config.name, context);
  }

  // Use custom faker template if provided
  if (config.fakerTemplate) {
    try {
      return faker.helpers.fake(config.fakerTemplate);
    } catch {
      // Fall back to hint-based or type-based generation
    }
  }

  // Try hint-based generation first (for string and number types only)
  // Date types should always use generateByType to respect dateFormat setting
  if (config.type === 'string' || config.type === 'number') {
    const hintValue = generateFromHint(config);
    if (hintValue !== null) {
      return hintValue;
    }
  }

  return generateByType(config, context);
}

// Generate value based on field type
function generateByType(config: FieldConfig, context?: GenerationContext): unknown {
  const { type } = config;

  switch (type) {
    case 'string':
      return generateString(config);

    case 'number':
      return generateNumber(config);

    case 'boolean':
      return faker.datatype.boolean();

    case 'date':
      return formatDate(faker.date.recent({ days: 365 }), config.dateFormat || 'iso');

    case 'email':
      return faker.internet.email();

    case 'uuid':
      return faker.string.uuid();

    case 'phone':
      return faker.phone.number();

    case 'url':
      return faker.internet.url();

    case 'firstName':
      return faker.person.firstName();

    case 'lastName':
      return faker.person.lastName();

    case 'fullName':
      return faker.person.fullName();

    case 'address':
      return faker.location.streetAddress();

    case 'city':
      return faker.location.city();

    case 'country':
      return faker.location.country();

    case 'zipCode':
      return faker.location.zipCode();

    case 'company':
      return faker.company.name();

    case 'lorem':
      return faker.lorem.sentence();

    case 'enum':
      return generateEnum(config);

    case 'array':
      return generateArray(config, context);

    case 'object':
      return generateObject(config, context);

    default:
      return faker.lorem.word();
  }
}

// Generate string with constraints
function generateString(config: FieldConfig): string {
  const minLength = config.minLength ?? 1;
  const maxLength = config.maxLength ?? 50;

  // If pattern is provided, try to match it (simplified)
  if (config.pattern) {
    // For now, just generate alphanumeric of appropriate length
    const length = faker.number.int({ min: minLength, max: maxLength });
    return faker.string.alphanumeric(length);
  }

  // Generate lorem text of appropriate length
  const length = faker.number.int({ min: minLength, max: maxLength });
  let result = faker.lorem.words(Math.ceil(length / 5));

  // Trim or pad to fit constraints
  if (result.length > maxLength) {
    result = result.substring(0, maxLength);
  } else if (result.length < minLength) {
    result = result.padEnd(minLength, faker.string.alpha(1));
  }

  return result;
}

// Generate number with constraints
function generateNumber(config: FieldConfig): number {
  const min = config.min ?? 0;
  const max = config.max ?? 1000;
  const precision = config.precision ?? 0;

  if (precision === 0) {
    return faker.number.int({ min, max });
  }

  return Number(faker.number.float({ min, max, fractionDigits: precision }).toFixed(precision));
}

// Generate enum value
function generateEnum(config: FieldConfig): string {
  if (config.enumValues && config.enumValues.length > 0) {
    return faker.helpers.arrayElement(config.enumValues);
  }
  return faker.lorem.word();
}

// Generate array with constraints
function generateArray(config: FieldConfig, context?: GenerationContext): unknown[] {
  const minLength = config.arrayMinLength ?? 1;
  const maxLength = config.arrayMaxLength ?? 5;
  const length = faker.number.int({ min: minLength, max: maxLength });

  if (!config.arrayItemConfig) {
    // Default to string items
    return Array.from({ length }, () => faker.lorem.word());
  }

  // Generate array items with context for hierarchical IDs
  return Array.from({ length }, (_, index) => {
    const childContext: GenerationContext | undefined = context ? {
      recordIndex: context.recordIndex,
      totalRecords: context.totalRecords,
      recordRandomId: context.recordRandomId,
      parentContext: {
        randomId: context.recordRandomId,
        sequence: formatSequence(context.recordIndex, context.totalRecords),
        depth: (context.parentContext?.depth ?? -1) + 1,
      },
      arrayItemIndex: index,
    } : undefined;

    return generateValue(config.arrayItemConfig!, childContext);
  });
}

// Generate nested object
function generateObject(config: FieldConfig, context?: GenerationContext): Record<string, unknown> {
  if (!config.nestedFields || config.nestedFields.length === 0) {
    return {};
  }

  const result: Record<string, unknown> = {};
  for (const field of config.nestedFields) {
    if (!field.required && Math.random() > 0.7) {
      continue; // Skip optional fields 30% of the time
    }
    result[field.name] = generateValue(field, context);
  }

  return result;
}

// Generate a single record from schema
function generateRecord(
  schema: ParsedSchema,
  context: GenerationContext
): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  for (const field of schema.fields) {
    if (!field.required && Math.random() > 0.7) {
      continue; // Skip optional fields 30% of the time
    }
    record[field.name] = generateValue(field, context);
  }

  return record;
}

// Main function to generate multiple records
export function generateData(
  schema: ParsedSchema,
  count: number,
  preview: boolean = false,
  sequentialIdPrefix?: string
): Record<string, unknown>[] {
  // Enforce limits
  const actualCount = Math.min(Math.max(1, count), 100000);
  const recordCount = preview ? Math.min(actualCount, 10) : actualCount;

  const records: Record<string, unknown>[] = [];

  for (let i = 0; i < recordCount; i++) {
    // Create generation context for this record
    const context: GenerationContext = {
      recordIndex: i,
      totalRecords: recordCount,
      recordRandomId: generateRandomId(),
      sequentialIdPrefix,
    };

    records.push(generateRecord(schema, context));
  }

  return records;
}

// Get list of available date formats for UI
export function getAvailableDateFormats(): { format: DateFormat; label: string; example: string }[] {
  return [
    { format: 'iso', label: 'ISO 8601', example: '2024-01-15T10:30:00.000Z' },
    { format: 'iso-date', label: 'ISO Date', example: '2024-01-15' },
    { format: 'iso-time', label: 'ISO Time', example: '10:30:00' },
    { format: 'unix', label: 'Unix (seconds)', example: '1705312200' },
    { format: 'unix-ms', label: 'Unix (milliseconds)', example: '1705312200000' },
    { format: 'us', label: 'US Format', example: '01/15/2024' },
    { format: 'eu', label: 'EU Format', example: '15/01/2024' },
    { format: 'short', label: 'Short', example: 'Jan 15, 2024' },
    { format: 'long', label: 'Long', example: 'January 15, 2024' },
  ];
}

// Get list of available field types for UI
export function getAvailableFieldTypes(): { type: FieldType; label: string; description: string }[] {
  return [
    { type: 'string', label: 'Text', description: 'Generic text string' },
    { type: 'number', label: 'Number', description: 'Integer or decimal number' },
    { type: 'boolean', label: 'Boolean', description: 'True or false' },
    { type: 'date', label: 'Date/Time', description: 'Date, time, or timestamp (choose format)' },
    { type: 'email', label: 'Email', description: 'Email address' },
    { type: 'uuid', label: 'UUID', description: 'Unique identifier' },
    { type: 'phone', label: 'Phone', description: 'Phone number' },
    { type: 'url', label: 'URL', description: 'Web address' },
    { type: 'firstName', label: 'First Name', description: 'Person first name' },
    { type: 'lastName', label: 'Last Name', description: 'Person last name' },
    { type: 'fullName', label: 'Full Name', description: 'Full person name' },
    { type: 'address', label: 'Address', description: 'Street address' },
    { type: 'city', label: 'City', description: 'City name' },
    { type: 'country', label: 'Country', description: 'Country name' },
    { type: 'zipCode', label: 'Zip Code', description: 'Postal code' },
    { type: 'company', label: 'Company', description: 'Company name' },
    { type: 'lorem', label: 'Lorem', description: 'Lorem ipsum text' },
    { type: 'enum', label: 'Enum', description: 'Value from list' },
    { type: 'array', label: 'Array', description: 'List of items' },
    { type: 'object', label: 'Object', description: 'Nested object' },
  ];
}
