import OpenAI from 'openai';
import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import * as z from "zod";

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

const chatSchema = z.object({
    prompt: z.string().trim().min(1, "Prompt is required").max(100, "Prompt is too long"),
    conversationId: z.string().min(1, "Conversation ID is required"),
});

app.post('/api/chat', async (req: Request, res: Response) => {

    // Validation des données d'entrée
    const parseResult = chatSchema.safeParse(req.body);
    if (!parseResult.success) {
        // On récupère seulement la première erreur pour simplifier
        const firstError = parseResult.error.issues[0];

        const info: Record<string, any> = {
            message: firstError?.message,
            minimum: undefined,
            maximum: undefined,
        };

        if ("minimum" in firstError) info.minimum = firstError.minimum;
        if ("maximum" in firstError) info.maximum = firstError.maximum;

        return res.status(400).json({
            error: "Invalid request body",
            details: info.message,
            maximum: info.maximum,
            minimum: info.minimum,
        });
    }
    
    const { prompt, conversationId } = req.body;

    try {
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
    } catch (error) {
        if (error instanceof OpenAI.APIError) {
        console.error("API Error:", error.status, error.message);
        return res.status(error.status || 500).json({ 
            error: "Failed to communicate with the API",
            details: error.message 
        });
    }
        console.error("Error handling /api/chat:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});