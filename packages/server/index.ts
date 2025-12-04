import express from 'express';
import dotenv from 'dotenv';
import { chatController } from './controllers/chat.controllers';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',  // your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true                 // if you need cookies/auth
  }))

// Middleware
app.use(express.json());

// Routes pour le chat
app.post('/api/chat', chatController.handleChat);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});