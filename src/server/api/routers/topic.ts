import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

let counter = 0;
export const topicRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.topic.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.topic.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(({ ctx, input }) => {
      counter++;
      return ctx.prisma.topic.create({
        data: {
          title: `${input.title}_${counter}`,
          userId: ctx.session.user.id,
        },
      });
    }),
});
