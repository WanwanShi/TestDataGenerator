import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface DtoInputProps {
  onParse: (input: string, inputType: 'json' | 'typescript' | 'auto') => void;
  isLoading: boolean;
  error?: string | null;
}

const EXAMPLE_JSON = `{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z"
}`;

const EXAMPLE_TYPESCRIPT = `interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: string;
}`;

export function DtoInput({ onParse, isLoading, error }: DtoInputProps) {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'json' | 'typescript' | 'auto'>('auto');

  const handleParse = () => {
    if (input.trim()) {
      onParse(input, inputType);
    }
  };

  const handleLoadExample = (type: 'json' | 'typescript') => {
    setInput(type === 'json' ? EXAMPLE_JSON : EXAMPLE_TYPESCRIPT);
    setInputType(type);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        1. Paste Your DTO or Example Data
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Input type:
        </Typography>
        <ToggleButtonGroup
          value={inputType}
          exclusive
          onChange={(_, value) => value && setInputType(value)}
          size="small"
        >
          <ToggleButton value="auto">Auto-detect</ToggleButton>
          <ToggleButton value="json">JSON</ToggleButton>
          <ToggleButton value="typescript">TypeScript</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => handleLoadExample('json')}>
            Load JSON Example
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleLoadExample('typescript')}>
            Load TS Example
          </Button>
        </Box>
      </Box>

      <TextField
        multiline
        rows={12}
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Paste your JSON object, array, or TypeScript interface here...

Examples:
- JSON: {"name": "John", "email": "john@example.com", "age": 30}
- TypeScript: interface User { name: string; email: string; age: number; }`}
        sx={{
          mb: 2,
          '& .MuiInputBase-root': {
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          },
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleParse}
        disabled={!input.trim() || isLoading}
        startIcon={<PlayArrowIcon />}
        size="large"
      >
        {isLoading ? 'Parsing...' : 'Parse & Configure Fields'}
      </Button>
    </Paper>
  );
}
