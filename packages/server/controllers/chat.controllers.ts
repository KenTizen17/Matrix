import type { Request, Response } from 'express';
import { chatService } from '../services/chat.services';
import * as z from "zod";

const chatSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(100, "Prompt is too long"),
  conversationId: z.string().min(1, "Conversation ID is required"),
});

export const chatController = {
  async handleChat(req: Request, res: Response) {
    // Input validation
    const parseResult = chatSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      const info: Record<string, any> = {
        message: firstError?.message,
        minimum: undefined,
        maximum: undefined,
      };

      if (firstError) {
        if ("minimum" in firstError) info.minimum = firstError.minimum;
        if ("maximum" in firstError) info.maximum = firstError.maximum;
    }

      return res.status(400).json({
        error: "Invalid request body",
        details: info.message,
        maximum: info.maximum,
        minimum: info.minimum,
      });
    }

    const { prompt, conversationId } = req.body;

    try {
      const result = await chatService.sendMessage(prompt, conversationId);
      res.json(result);
    } catch (error: any) {
      console.error("Error handling /api/chat:", error);
      
      if (error.status) {
        res.status(error.status || 500).json({ 
          error: "Failed to communicate with the API",
          details: error.message 
        });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
};