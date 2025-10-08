import OpenAI from 'openai';
import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.ORANGEAI_API_KEY,
    baseURL: "https://management.llmproxy.ai.orange"
});

const app = express();
const prisma = new PrismaClient();
// Fonction Middleware 
app.use(express.json());
const port = process.env.PORT || 3000;

app.post('/api/chat', async (req: Request, res: Response) => {
    
        const { prompt, conversationId } = req.body;

        // On verifie que l'ID de la conv existe; si oui on fait rien
        await prisma.conversation.upsert({
            where: { conversationId },
            update: {}, // On fait rien
            create: { conversationId } // On cree le nouvel ID
        });

        // On récupère l'historique de la conversation en fonction de l'ID
        const history = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "desc" },
            take: 3, // 3 Max pour test
        });


        // Construction prompt + historique
        let fullPrompt = `You are having a conversation. Here is the recent conversation history, read it in reverse order:\n\n`;

        if (history.length > 0) {
            history.forEach((message) => {
                const role = message.role === "user" ? "Human" : "Assistant";
                fullPrompt += `${role}: ${message.text}\n`;
            });
            fullPrompt += `\n`;
        }

        // Instruction pour le model
        fullPrompt += `Based on the conversation history above, respond to this new message:\n`;
        fullPrompt += `Human: ${prompt}\n`;
        fullPrompt += `Assistant:`;

        console.log("Full prompt:", fullPrompt); // Affichage pour debug 

    
        const response = await client.responses.create({
            model: "openai/gpt-5-nano",
            input: fullPrompt,
            max_output_tokens: 50000,
        });


        // Adapter l'output en fonction du modèle
        const outputText =response.output_text; // format output gpt-5-nano

        // Sauvegarde des messages dans la DB
        await prisma.message.createMany({
            data: [
                {
                    conversationId,
                    role: "user",
                    text: prompt
                },
                {
                    conversationId, 
                    role: "assistant",
                    text: outputText
                }
            ]
        });

        res.json({ 
            message: outputText,
            conversationId 
        });

    
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});