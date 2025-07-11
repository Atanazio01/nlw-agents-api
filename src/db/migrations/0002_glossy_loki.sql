ALTER TABLE "questions" ALTER COLUMN "answer" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "question" text NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" DROP COLUMN "questions";