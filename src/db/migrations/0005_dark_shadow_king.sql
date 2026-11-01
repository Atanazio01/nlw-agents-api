CREATE TABLE "question_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"voter_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "question_likes_questionId_voterId_unique" UNIQUE("question_id","voter_id")
);
--> statement-breakpoint
ALTER TABLE "question_likes" ADD CONSTRAINT "question_likes_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;