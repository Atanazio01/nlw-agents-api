import { GoogleGenAI } from "@google/genai";
import { env } from "../env.ts";

const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const model = "gemini-3.5-flash-lite";
const embeddingModel = "gemini-embedding-2";
const embeddingDimensions = 768;

const noSpeechMarker = "SEM_FALA";
const noAnswerMarker = "SEM_RESPOSTA";
const nonSpeechTags = /<[^>]*>|\[[^\]]*\]/g;

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: `Transcreva o áudio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado. Se não houver fala inteligível (silêncio, ruído, música), responda apenas ${noSpeechMarker}.`,
      },
      {
        inlineData: {
          mimeType,
          data: audioAsBase64,
        },
      },
    ],
  });

  if (!response.text) {
    throw new Error("Não foi possível converter o áudio");
  }

  const transcription = response.text.replace(nonSpeechTags, "").trim();

  if (!transcription || transcription.includes(noSpeechMarker)) {
    return null;
  }

  return transcription;
}

async function generateEmbeddings(text: string) {
  const response = await gemini.models.embedContent({
    model: embeddingModel,
    contents: [{ text }],
    config: {
      outputDimensionality: embeddingDimensions,
    },
  });

  const values = response.embeddings?.[0]?.values;

  if (!values) {
    throw new Error("Não foi possível gerar os embeddings.");
  }

  return values;
}

// gemini-embedding-2 does not accept taskType; the task goes as a text prefix
export function generateDocumentEmbeddings(text: string) {
  return generateEmbeddings(`title: none | text: ${text}`);
}

export function generateQueryEmbeddings(text: string) {
  return generateEmbeddings(`task: question answering | query: ${text}`);
}

export async function generateAnswer(
  question: string,
  transcriptions: string[]
) {
  const context = transcriptions.join("\n\n");

  const prompt = `
    Com base no texto fornecido abaixo como contexto, responda a pergunta de forma clara e precisa em português do Brasil.

    CONTEXTO:
    ${context}

    PERGUNTA:
    ${question}

    INSTRUÇÕES:
    - Use apenas informações contidas no contexto enviado;
    - Se a resposta não for encontrada no contexto, responda apenas ${noAnswerMarker};
    - Seja objetivo;
    - Mantenha um tom educativo e profissional;
    - Cite trechos relevantes do contexto se apropriado;
    - Se for citar o contexto, utilize o termo "conteúdo da aula";
  `.trim();

  const response = await gemini.models.generateContent({
    model,
    contents: [{ text: prompt }],
  });

  if (!response.text) {
    throw new Error("Falha ao gerar resposta pelo Gemini");
  }

  return response.text.includes(noAnswerMarker) ? null : response.text;
}
