import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Container, Typography, Box, LinearProgress, AppBar, Toolbar } from '@mui/material';
import DataObjectIcon from '@mui/icons-material/DataObject';
import type { FieldConfig, ParsedSchema, ExportFormat } from '@test-data-generator/shared';

import { DtoInput } from './features/generator/components/DtoInput';
import { FieldConfigList } from './features/generator/components/FieldConfigList';
import { GenerationOptions } from './features/generator/components/GenerationOptions';
import { OutputPreview } from './features/generator/components/OutputPreview';
import { parseDto, generateData } from './features/generator/api/generator.api';

function App() {
  // State
  const [schema, setSchema] = useState<ParsedSchema | null>(null);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState<ExportFormat>('json');
  const [sequentialIdPrefix, setSequentialIdPrefix] = useState('');
  const [output, setOutput] = useState<{ data: string; recordCount: number; isPreview: boolean } | null>(null);

  // Mutations
  const parseMutation = useMutation({
    mutationFn: parseDto,
    onSuccess: (response) => {
      if (response.success && response.schema) {
        setSchema(response.schema);
        setOutput(null);
      }
    },
  });

  const generateMutation = useMutation({
    mutationFn: generateData,
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        setOutput({
          data: response.data,
          recordCount: response.recordCount ?? 0,
          isPreview: variables.preview ?? false,
        });
      }
    },
  });

  // Handlers
  const handleParse = (input: string, inputType: 'json' | 'typescript' | 'auto') => {
    parseMutation.mutate({ input, inputType });
  };

  const handleFieldsChange = (fields: FieldConfig[]) => {
    if (schema) {
      setSchema({ ...schema, fields });
    }
  };

  const handleGenerate = (preview: boolean) => {
    if (schema) {
      generateMutation.mutate({
        schema,
        count,
        format,
        preview,
        sequentialIdPrefix: sequentialIdPrefix || undefined,
      });
    }
  };

  const isLoading = parseMutation.isPending || generateMutation.isPending;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <DataObjectIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="h1">
            Test Data Generator
          </Typography>
        </Toolbar>
      </AppBar>

      {isLoading && <LinearProgress />}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Generate realistic test data from your DTOs or examples. Paste your JSON or TypeScript
          interface, configure field types, and export in various formats.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Step 1: Input */}
          <DtoInput
            onParse={handleParse}
            isLoading={parseMutation.isPending}
            error={parseMutation.data?.error ?? (parseMutation.error as Error)?.message}
          />

          {/* Step 2: Configure Fields */}
          {schema && schema.fields.length > 0 && (
            <FieldConfigList
              fields={schema.fields}
              onChange={handleFieldsChange}
            />
          )}

          {/* Step 3: Generation Options */}
          {schema && schema.fields.length > 0 && (
            <GenerationOptions
              count={count}
              onCountChange={setCount}
              format={format}
              onFormatChange={setFormat}
              sequentialIdPrefix={sequentialIdPrefix}
              onSequentialIdPrefixChange={setSequentialIdPrefix}
              onGenerate={handleGenerate}
              isLoading={generateMutation.isPending}
              disabled={!schema || schema.fields.length === 0}
            />
          )}

          {/* Step 4: Output */}
          {(output || generateMutation.data?.error) && (
            <OutputPreview
              data={output?.data ?? null}
              format={format}
              recordCount={output?.recordCount ?? 0}
              isPreview={output?.isPreview ?? false}
              error={generateMutation.data?.error ?? (generateMutation.error as Error)?.message}
            />
          )}
        </Box>

        <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Internal Tool - Test Data Generator v1.0
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default App;
