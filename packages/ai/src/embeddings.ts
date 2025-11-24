import { pipeline } from '@xenova/transformers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Keep Gemini for text generation (chat)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Singleton for the embedding pipeline
let extractor: any = null;

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        if (!extractor) {
            // Load the model. 'feature-extraction' is the task for embeddings.
            // 'Xenova/all-MiniLM-L6-v2' is a small, fast, and popular model.
            console.log("Loading local embedding model (Xenova/all-MiniLM-L6-v2)...");
            extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }

        // Generate embedding
        const output = await extractor(text, { pooling: 'mean', normalize: true });

        // Convert Tensor to regular array
        const embedding = Array.from(output.data) as number[];
        return embedding;

    } catch (error) {
        console.error("Local embedding generation failed:", error);
        // Return a zero vector of dimension 384 (MiniLM dimension)
        return new Array(384).fill(0);
    }
}

export async function generateText(prompt: string): Promise<string> {
    if (!process.env.GOOGLE_API_KEY) {
        console.error("GOOGLE_API_KEY is missing in process.env");
        throw new Error("GOOGLE_API_KEY is not configured");
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini generation failed:", error);
        throw error;
    }
}
