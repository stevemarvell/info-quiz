import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes';
import { initializeSampleData } from './sampleData';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize sample data
initializeSampleData();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
