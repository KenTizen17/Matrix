import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const conversationRepository = {
  // Upsert conversation
  async upsertConversation(conversationId: string) {
    await prisma.conversation.upsert({
      where: { conversationId },
      update: {},
      create: { conversationId }
    });
  },

  // Get conversation history
  async getConversationHistory(conversationId: string, limit: number = 3) {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  // Save messages
  async saveMessages(messages: { conversationId: string; role: string; text: string }[]) {
    await prisma.message.createMany({
      data: messages
    });
  },
  
};