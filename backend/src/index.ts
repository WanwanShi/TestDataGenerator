import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import generatorRoutes from './routes/generator.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for big schemas

// API Routes
app.use('/api', generatorRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  console.log(`Frontend path: ${frontendPath}`);
  console.log(`Current working directory: ${process.cwd()}`);
  console.log(`__dirname: ${__dirname}`);

  // Check if frontend exists
  const frontendExists = fs.existsSync(frontendPath);
  const indexExists = fs.existsSync(path.join(frontendPath, 'index.html'));
  console.log(`Frontend directory exists: ${frontendExists}`);
  console.log(`index.html exists: ${indexExists}`);

  if (frontendExists && indexExists) {
    console.log('Frontend directory found, serving static files');
    app.use(express.static(frontendPath));

    // SPA fallback - must be after API routes
    app.get('*', (_req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.warn(`Frontend not properly deployed at: ${frontendPath}`);
    // List what's actually in the parent directories
    try {
      const parentDir = path.join(__dirname, '../..');
      const parentContents = fs.readdirSync(parentDir);
      console.log(`Contents of ${parentDir}:`, parentContents);
    } catch (e) {
      console.error('Error listing parent directory:', e);
    }

    app.get('/', (_req, res) => {
      res.json({
        error: 'Frontend not found',
        frontendPath,
        cwd: process.cwd(),
        dirname: __dirname,
        frontendExists,
        indexExists
      });
    });
  }
}

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
