import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";

export const likeQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/questions/:questionId/likes",
    {
      schema: {
        params: z.object({
          questionId: z.string(),
        }),
        body: z.object({
          voterId: z.string().min(1),
        }),
      },
    },
    async (request, reply) => {
      const { questionId } = request.params;
      const { voterId } = request.body;

      await db
        .insert(schema.questionLikes)
        .values({ questionId, voterId })
        .onConflictDoNothing();

      return reply.status(204).send();
    }
  );
};
