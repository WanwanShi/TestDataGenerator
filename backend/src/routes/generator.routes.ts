import { Router } from 'express';
import { z } from 'zod';
import type {
  ParseDtoRequest,
  ParseDtoResponse,
  GenerateDataRequest,
  GenerateDataResponse,
} from '@test-data-generator/shared';
import { parseInput } from '../services/parser.service.js';
import { generateData, getAvailableFieldTypes } from '../services/generator.service.js';
import { exportData, getAvailableFormats } from '../services/exporter.service.js';

const router = Router();

// Validation schemas
const parseDtoSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  inputType: z.enum(['json', 'typescript', 'auto']).default('auto'),
});

const generateDataSchema = z.object({
  schema: z.object({
    fields: z.array(z.any()),
    originalInput: z.string(),
    parseErrors: z.array(z.string()).optional(),
  }),
  count: z.number().int().min(1).max(100000),
  format: z.enum(['json', 'csv', 'sql', 'xml']),
  preview: z.boolean().optional(),
  sequentialIdPrefix: z.string().optional(),
});

// POST /api/parse - Parse DTO input
router.post('/parse', (req, res) => {
  try {
    const validation = parseDtoSchema.safeParse(req.body);

    if (!validation.success) {
      const response: ParseDtoResponse = {
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      };
      return res.status(400).json(response);
    }

    const { input, inputType } = validation.data as ParseDtoRequest;
    const schema = parseInput(input, inputType);

    const response: ParseDtoResponse = {
      success: !schema.parseErrors || schema.parseErrors.length === 0,
      schema,
      error: schema.parseErrors?.join(', '),
    };

    return res.json(response);
  } catch (error) {
    const response: ParseDtoResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return res.status(500).json(response);
  }
});

// POST /api/generate - Generate test data
router.post('/generate', (req, res) => {
  try {
    const validation = generateDataSchema.safeParse(req.body);

    if (!validation.success) {
      const response: GenerateDataResponse = {
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      };
      return res.status(400).json(response);
    }

    const { schema, count, format, preview, sequentialIdPrefix } = validation.data as GenerateDataRequest;

    // Generate the data
    const records = generateData(schema, count, preview, sequentialIdPrefix);

    // Export to requested format
    const exported = exportData(records, format);

    const response: GenerateDataResponse = {
      success: true,
      data: exported.content,
      recordCount: records.length,
    };

    return res.json(response);
  } catch (error) {
    const response: GenerateDataResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    return res.status(500).json(response);
  }
});

// GET /api/field-types - Get available field types
router.get('/field-types', (_req, res) => {
  return res.json(getAvailableFieldTypes());
});

// GET /api/formats - Get available export formats
router.get('/formats', (_req, res) => {
  return res.json(getAvailableFormats());
});

export default router;
