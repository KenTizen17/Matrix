import express from 'express';
import dotenv from 'dotenv';
import { chatController } from './controllers/chat.controllers';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes pour le chat
app.post('/api/chat', chatController.handleChat);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});