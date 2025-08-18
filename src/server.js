import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || '1.0.0';
const START_TIME = Date.now();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Jenkins CI/CD Node service', version: VERSION });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSec: Math.round((Date.now() - START_TIME) / 1000),
    version: VERSION
  });
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on ${PORT} (v${VERSION})`);
});

const shutdown = () => {
  // eslint-disable-next-line no-console
  console.log('Received shutdown signal, closing server...');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('Server closed. Exiting.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;

