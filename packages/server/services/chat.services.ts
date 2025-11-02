import { conversationRepository } from '../repositories/conversation.repository';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.ORANGEAI_API_KEY!,
  baseURL: "https://management.llmproxy.ai.orange"
});

export class ChatService {
  async sendMessage(prompt: string, conversationId: string) {
    // Ensure conversation exists
    await conversationRepository.upsertConversation(conversationId);

    // Get conversation history
    const history = await conversationRepository.getConversationHistory(conversationId, 3);

    const fullPrompt = this.buildPrompt(prompt, history);

    console.log("Full prompt:", fullPrompt);

    // Generate AI response
    const response = await client.responses.create({
      model: "openai/gpt-5-nano",
      input: fullPrompt,
      max_output_tokens: 50000,
    });

    const outputText = response.output_text;


    await conversationRepository.saveMessages([
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
    ]);

    return {
      message: outputText,
      conversationId
    };
  }

  private buildPrompt(prompt: string, history: any[]): string {
    let fullPrompt = `You are having a conversation. Here is the recent conversation history, read it in reverse order:\n\n`;

    if (history.length > 0) {
      history.forEach((message) => {
        const role = message.role === "user" ? "Human" : "Assistant";
        fullPrompt += `${role}: ${message.text}\n`;
      });
      fullPrompt += `\n`;
    }

    fullPrompt += `Based on the conversation history above, respond to this new message:\n`;
    fullPrompt += `Human: ${prompt}\n`;
    fullPrompt += `Assistant:`;

    return fullPrompt;
  }
}

export const chatService = new ChatService();