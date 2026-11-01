import { and, eq } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";

export const unlikeQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/questions/:questionId/likes/:voterId",
    {
      schema: {
        params: z.object({
          questionId: z.string(),
          voterId: z.string().min(1),
        }),
      },
    },
    async (request, reply) => {
      const { questionId, voterId } = request.params;

      await db
        .delete(schema.questionLikes)
        .where(
          and(
            eq(schema.questionLikes.questionId, questionId),
            eq(schema.questionLikes.voterId, voterId)
          )
        );

      return reply.status(204).send();
    }
  );
};
