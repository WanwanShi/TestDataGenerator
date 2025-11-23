import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import type { ExportFormat } from '@test-data-generator/shared';

interface OutputPreviewProps {
  data: string | null;
  format: ExportFormat;
  recordCount: number;
  isPreview: boolean;
  error?: string | null;
}

const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  json: 'json',
  csv: 'csv',
  sql: 'sql',
  xml: 'xml',
};

const MIME_TYPES: Record<ExportFormat, string> = {
  json: 'application/json',
  csv: 'text/csv',
  sql: 'text/plain',
  xml: 'application/xml',
};

export function OutputPreview({ data, format, recordCount, isPreview, error }: OutputPreviewProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    if (data) {
      await navigator.clipboard.writeText(data);
      setCopySuccess(true);
    }
  };

  const handleDownload = () => {
    if (!data) return;

    const blob = new Blob([data], { type: MIME_TYPES[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-data-${Date.now()}.${FILE_EXTENSIONS[format]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          4. Output
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          4. Output {isPreview && '(Preview)'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', mr: 2 }}>
            {recordCount.toLocaleString()} records
          </Typography>

          <Tooltip title="Copy to clipboard">
            <IconButton onClick={handleCopy} size="small">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download .{FILE_EXTENSIONS[format]}
          </Button>
        </Box>
      </Box>

      {isPreview && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This is a preview showing the first 10 records. Click "Generate" to create the full
          dataset.
        </Alert>
      )}

      <Box
        sx={{
          bgcolor: 'grey.900',
          color: 'grey.100',
          p: 2,
          borderRadius: 1,
          overflow: 'auto',
          maxHeight: 400,
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {data}
      </Box>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Copied to clipboard!"
      />
    </Paper>
  );
}
