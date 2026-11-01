import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { questions } from "./questions.ts";

export const questionLikes = pgTable(
  "question_likes",
  {
    id: uuid().primaryKey().defaultRandom(),
    questionId: uuid()
      .references(() => questions.id)
      .notNull(),
    voterId: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [unique().on(table.questionId, table.voterId)]
);
