import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { saveUserProfile, getUsersByGender, getMessages, saveMessage } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  users: router({
    saveProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        age: z.number().optional(),
        gender: z.enum(['male', 'female', 'other']).optional(),
        avatar: z.string().optional(),
        bio: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await saveUserProfile(ctx.user.id, input);
        return { success: true };
      }),
    
    getByGender: publicProcedure
      .input(z.enum(['male', 'female', 'other']))
      .query(async ({ input }) => {
        return await getUsersByGender(input);
      }),
  }),

  messages: router({
    save: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await saveMessage(ctx.user.id, input.receiverId, input.content);
        return { success: true };
      }),
    
    getMessages: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        return await getMessages(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
