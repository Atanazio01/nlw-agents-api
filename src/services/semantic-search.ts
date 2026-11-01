import { and, desc, eq, gt, isNotNull, isNull, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "../db/connection.ts";
import { schema } from "../db/schema/index.ts";
import { generateAnswer } from "./gemini.ts";

const minSimilarity = 0.7;
const maxContextChunks = 3;

function similarity(column: AnyPgColumn, embeddings: number[]) {
  const vector = `[${embeddings.join(",")}]`;
  return sql<number>`1 - (${column} <=> ${vector}::vector)`;
}

async function findRelevantTranscriptions(
  roomId: string,
  embeddings: number[]
) {
  const chunkSimilarity = similarity(schema.audioChunks.embeddings, embeddings);

  const chunks = await db
    .select({ transcription: schema.audioChunks.transcription })
    .from(schema.audioChunks)
    .where(
      and(
        eq(schema.audioChunks.roomId, roomId),
        gt(chunkSimilarity, minSimilarity)
      )
    )
    .orderBy(desc(chunkSimilarity))
    .limit(maxContextChunks);

  return chunks.map((chunk) => chunk.transcription);
}

export async function answerFromRoomContent(
  roomId: string,
  question: string,
  embeddings: number[]
) {
  const transcriptions = await findRelevantTranscriptions(roomId, embeddings);

  if (transcriptions.length === 0) {
    return null;
  }

  return generateAnswer(question, transcriptions);
}

export async function findUnansweredQuestionsRelatedTo(
  roomId: string,
  chunkEmbeddings: number[]
) {
  const questions = await db
    .select({
      id: schema.questions.id,
      question: schema.questions.question,
      embeddings: schema.questions.embeddings,
    })
    .from(schema.questions)
    .where(
      and(
        eq(schema.questions.roomId, roomId),
        isNull(schema.questions.answer),
        isNotNull(schema.questions.embeddings),
        gt(
          similarity(schema.questions.embeddings, chunkEmbeddings),
          minSimilarity
        )
      )
    );

  return questions.flatMap(({ embeddings, ...question }) =>
    embeddings ? [{ ...question, embeddings }] : []
  );
}
