import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

interface ChatMessage {
  user: string;
  message: string;
  id: number;
}

const messages: ChatMessage[] = [
  { user: "system", message: "Please enter a number", id: 1 },
];

let count = 0;

export const messageRouter = createTRPCRouter({
  addMessage: protectedProcedure
    .input(
      z.object({
        user: z.string(),
        message: z.string(),
        id: z.number(),
      })
    )
    .mutation(({ input }) => {
      messages.push(input);
      messages.push({
        user: "system",
        message: `Please enter a number ${count}`,
        id: count,
      });
      count++;
      return input;
    }),

  getMessages: protectedProcedure
    .input(z.number().default(10))
    .query(({ input }) => {
      return input > 0 ? messages.slice(-input) : messages;
    }),
});
