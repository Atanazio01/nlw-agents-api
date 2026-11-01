import { count, desc, eq, sql } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";

export const getRoomQuestions: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/rooms/:roomId/questions",
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
        querystring: z.object({
          voterId: z.string().default(""),
        }),
      },
    },
    async (request) => {
      const { roomId } = request.params;
      const { voterId } = request.query;

      const result = await db
        .select({
          id: schema.questions.id,
          question: schema.questions.question,
          answer: schema.questions.answer,
          createdAt: schema.questions.createdAt,
          likesCount: count(schema.questionLikes.id),
          likedByMe: sql<boolean>`coalesce(bool_or(${schema.questionLikes.voterId} = ${voterId}), false)`,
        })
        .from(schema.questions)
        .leftJoin(
          schema.questionLikes,
          eq(schema.questionLikes.questionId, schema.questions.id)
        )
        .where(eq(schema.questions.roomId, roomId))
        .groupBy(schema.questions.id)
        .orderBy(desc(schema.questions.createdAt));

      return result;
    }
  );
};
