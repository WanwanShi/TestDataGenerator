import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  TextField,
  Switch,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';
import type { FieldConfig, FieldType } from '@test-data-generator/shared';

interface FieldConfigListProps {
  fields: FieldConfig[];
  onChange: (fields: FieldConfig[]) => void;
  fieldTypes: { type: FieldType; label: string; description: string }[];
}

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'uuid', label: 'UUID' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'fullName', label: 'Full Name' },
  { value: 'address', label: 'Address' },
  { value: 'city', label: 'City' },
  { value: 'country', label: 'Country' },
  { value: 'zipCode', label: 'Zip Code' },
  { value: 'company', label: 'Company' },
  { value: 'lorem', label: 'Lorem Text' },
  { value: 'enum', label: 'Enum' },
  { value: 'array', label: 'Array' },
  { value: 'object', label: 'Object' },
];

interface FieldRowProps {
  field: FieldConfig;
  index: number;
  onUpdate: (index: number, field: FieldConfig) => void;
  depth?: number;
}

function FieldRow({ field, index, onUpdate, depth = 0 }: FieldRowProps) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = <K extends keyof FieldConfig>(key: K, value: FieldConfig[K]) => {
    onUpdate(index, { ...field, [key]: value });
  };

  // Check for nested object fields OR array with nested object items
  const hasNestedObject = field.type === 'object' && field.nestedFields && field.nestedFields.length > 0;
  const hasNestedArray = field.type === 'array' && field.arrayItemConfig?.type === 'object' &&
    field.arrayItemConfig?.nestedFields && field.arrayItemConfig.nestedFields.length > 0;
  const hasNested = hasNestedObject || hasNestedArray;

  // Get the nested fields to display (either from object or array item)
  const nestedFieldsToShow = hasNestedObject
    ? field.nestedFields!
    : hasNestedArray
      ? field.arrayItemConfig!.nestedFields!
      : [];

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell sx={{ pl: depth * 3 + 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasNested && (
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            <Typography variant="body2" fontFamily="monospace">
              {field.name}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Select
            size="small"
            value={field.type}
            onChange={(e) => handleChange('type', e.target.value as FieldType)}
            sx={{ minWidth: 110 }}
          >
            {FIELD_TYPE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </TableCell>

        <TableCell>
          <TextField
            size="small"
            placeholder="e.g., site code, temperature"
            value={field.hint ?? ''}
            onChange={(e) => handleChange('hint', e.target.value || undefined)}
            sx={{ minWidth: 160 }}
          />
        </TableCell>

        <TableCell align="center">
          <Tooltip title="Required field">
            <Switch
              size="small"
              checked={field.required}
              onChange={(e) => handleChange('required', e.target.checked)}
            />
          </Tooltip>
        </TableCell>

        <TableCell align="center">
          <Tooltip title="Can be null">
            <Switch
              size="small"
              checked={field.nullable}
              onChange={(e) => handleChange('nullable', e.target.checked)}
            />
          </Tooltip>
        </TableCell>

        <TableCell>
          {field.type === 'string' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                type="number"
                label="Min"
                value={field.minLength ?? ''}
                onChange={(e) => handleChange('minLength', e.target.value ? Number(e.target.value) : undefined)}
                sx={{ width: 70 }}
              />
              <TextField
                size="small"
                type="number"
                label="Max"
                value={field.maxLength ?? ''}
                onChange={(e) => handleChange('maxLength', e.target.value ? Number(e.target.value) : undefined)}
                sx={{ width: 70 }}
              />
            </Box>
          )}

          {field.type === 'number' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                type="number"
                label="Min"
                value={field.min ?? ''}
                onChange={(e) => handleChange('min', e.target.value ? Number(e.target.value) : undefined)}
                sx={{ width: 70 }}
              />
              <TextField
                size="small"
                type="number"
                label="Max"
                value={field.max ?? ''}
                onChange={(e) => handleChange('max', e.target.value ? Number(e.target.value) : undefined)}
                sx={{ width: 70 }}
              />
            </Box>
          )}

          {field.type === 'enum' && (
            <TextField
              size="small"
              label="Values (comma-separated)"
              value={field.enumValues?.join(', ') ?? ''}
              onChange={(e) =>
                handleChange(
                  'enumValues',
                  e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
                )
              }
              sx={{ minWidth: 200 }}
            />
          )}

          {field.type === 'array' && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                type="number"
                label="Min Items"
                value={field.arrayMinLength ?? ''}
                onChange={(e) => handleChange('arrayMinLength', e.target.value ? Number(e.target.value) : undefined)}
                sx={{ width: 80 }}
              />
              <TextField
                size="small"
                type="number"
                label="Max Items"
                value={field.arrayMaxLength ?? ''}
                onChange={(e) => handleChange('arrayMaxLength', e.target.value ? Number(e.target.value) : undefined)}
                sx={{ width: 80 }}
              />
              {hasNestedArray && (
                <Typography variant="caption" color="text.secondary">
                  (Object[])
                </Typography>
              )}
            </Box>
          )}
        </TableCell>
      </TableRow>

      {hasNested && (
        <TableRow>
          <TableCell colSpan={6} sx={{ p: 0 }}>
            <Collapse in={expanded}>
              <Box sx={{ bgcolor: depth % 2 === 0 ? 'grey.50' : 'grey.100', py: 1 }}>
                <Table size="small">
                  <TableBody>
                    {nestedFieldsToShow.map((nestedField, nestedIndex) => (
                      <FieldRow
                        key={nestedField.name}
                        field={nestedField}
                        index={nestedIndex}
                        depth={depth + 1}
                        onUpdate={(idx, updated) => {
                          if (hasNestedObject) {
                            // Update nested fields directly on object
                            const newNested = [...field.nestedFields!];
                            newNested[idx] = updated;
                            handleChange('nestedFields', newNested);
                          } else if (hasNestedArray) {
                            // Update nested fields on array item config
                            const newNested = [...field.arrayItemConfig!.nestedFields!];
                            newNested[idx] = updated;
                            handleChange('arrayItemConfig', {
                              ...field.arrayItemConfig!,
                              nestedFields: newNested,
                            });
                          }
                        }}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function FieldConfigList({ fields, onChange }: Omit<FieldConfigListProps, 'fieldTypes'>) {
  const handleUpdateField = (index: number, updatedField: FieldConfig) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    onChange(newFields);
  };

  if (fields.length === 0) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        2. Configure Field Types & Constraints
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Adjust the data types and constraints for each field. Add hints (e.g., "site code", "sensor model")
        to generate more realistic data.
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Field Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Hint (for realistic data)</TableCell>
              <TableCell align="center">Req</TableCell>
              <TableCell align="center">Null</TableCell>
              <TableCell>Constraints</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <FieldRow
                key={field.name}
                field={field}
                index={index}
                onUpdate={handleUpdateField}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
