import { eq } from "drizzle-orm";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import {
  generateDocumentEmbeddings,
  transcribeAudio,
} from "../../services/gemini.ts";
import {
  answerFromRoomContent,
  findUnansweredQuestionsRelatedTo,
} from "../../services/semantic-search.ts";

async function answerPendingQuestions(roomId: string, embeddings: number[]) {
  const questions = await findUnansweredQuestionsRelatedTo(roomId, embeddings);

  await Promise.all(
    questions.map(async ({ id, question, embeddings: questionEmbeddings }) => {
      const answer = await answerFromRoomContent(
        roomId,
        question,
        questionEmbeddings
      );

      await db
        .update(schema.questions)
        .set({ answer })
        .where(eq(schema.questions.id, id));
    })
  );
}

export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/rooms/:roomId/audio",
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { roomId } = request.params;
      const audio = await request.file();

      if (!audio) {
        throw new Error("Audio is required.");
      }

      const audioBuffer = await audio.toBuffer();
      const audioAsBase64 = audioBuffer.toString("base64");

      const transcription = await transcribeAudio(
        audioAsBase64,
        audio.mimetype
      );

      if (!transcription) {
        return reply.status(204).send();
      }

      const embeddings = await generateDocumentEmbeddings(transcription);

      const result = await db
        .insert(schema.audioChunks)
        .values({ roomId, transcription, embeddings })
        .returning();

      const chunk = result[0];

      if (!chunk) {
        throw new Error("Erro ao salvar chunk de áudio");
      }

      await answerPendingQuestions(roomId, embeddings);

      return reply.status(201).send({ chunkId: chunk.id });
    }
  );
};
