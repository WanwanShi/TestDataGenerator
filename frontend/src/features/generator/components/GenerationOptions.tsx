import {
  Box,
  Paper,
  Typography,
  Slider,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { ExportFormat } from '@test-data-generator/shared';

interface GenerationOptionsProps {
  count: number;
  onCountChange: (count: number) => void;
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  sequentialIdPrefix: string;
  onSequentialIdPrefixChange: (prefix: string) => void;
  onGenerate: (preview: boolean) => void;
  isLoading: boolean;
  disabled: boolean;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'sql', label: 'SQL INSERT' },
  { value: 'xml', label: 'XML' },
];

const QUICK_COUNTS = [10, 50, 100, 500, 1000, 10000];

export function GenerationOptions({
  count,
  onCountChange,
  format,
  onFormatChange,
  sequentialIdPrefix,
  onSequentialIdPrefixChange,
  onGenerate,
  isLoading,
  disabled,
}: GenerationOptionsProps) {
  const handleSliderChange = (_: Event, value: number | number[]) => {
    // Use logarithmic scale for better UX
    const logValue = Math.pow(10, (value as number) / 25);
    onCountChange(Math.round(logValue));
  };

  const sliderValue = Math.log10(count) * 25;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        3. Generation Options
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Record Count */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Number of Records: <strong>{count.toLocaleString()}</strong>
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {QUICK_COUNTS.map((quickCount) => (
              <Chip
                key={quickCount}
                label={quickCount.toLocaleString()}
                onClick={() => onCountChange(quickCount)}
                variant={count === quickCount ? 'filled' : 'outlined'}
                color={count === quickCount ? 'primary' : 'default'}
                size="small"
              />
            ))}
          </Box>

          <Slider
            value={sliderValue}
            onChange={handleSliderChange}
            min={0}
            max={125}
            step={1}
            marks={[
              { value: 0, label: '1' },
              { value: 50, label: '100' },
              { value: 75, label: '1K' },
              { value: 100, label: '10K' },
              { value: 125, label: '100K' },
            ]}
          />

          <TextField
            type="number"
            size="small"
            label="Exact count"
            value={count}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val >= 1 && val <= 100000) {
                onCountChange(val);
              }
            }}
            inputProps={{ min: 1, max: 100000 }}
            sx={{ mt: 2, width: 150 }}
          />
        </Box>

        {/* Format Selection */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Output Format</InputLabel>
          <Select
            value={format}
            label="Output Format"
            onChange={(e) => onFormatChange(e.target.value as ExportFormat)}
          >
            {FORMAT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sequential ID Prefix */}
        <TextField
          label="Sequential ID Prefix (Optional)"
          placeholder="e.g., USER, ORDER, REF"
          value={sequentialIdPrefix}
          onChange={(e) => onSequentialIdPrefixChange(e.target.value)}
          size="small"
          helperText="Custom prefix for all ID fields. Leave empty to use field-based prefixes"
          sx={{ maxWidth: 300 }}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            variant="outlined"
            onClick={() => onGenerate(true)}
            disabled={disabled || isLoading}
            startIcon={<VisibilityIcon />}
          >
            Preview (10 records)
          </Button>

          <Button
            variant="contained"
            onClick={() => onGenerate(false)}
            disabled={disabled || isLoading}
            startIcon={<DownloadIcon />}
            size="large"
          >
            {isLoading ? 'Generating...' : `Generate ${count.toLocaleString()} Records`}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
