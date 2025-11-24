"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = generateEmbedding;
exports.generateText = generateText;
const transformers_1 = require("@xenova/transformers");
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Keep Gemini for text generation (chat)
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
// Singleton for the embedding pipeline
let extractor = null;
async function generateEmbedding(text) {
    try {
        if (!extractor) {
            // Load the model. 'feature-extraction' is the task for embeddings.
            // 'Xenova/all-MiniLM-L6-v2' is a small, fast, and popular model.
            console.log("Loading local embedding model (Xenova/all-MiniLM-L6-v2)...");
            extractor = await (0, transformers_1.pipeline)('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
        // Generate embedding
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        // Convert Tensor to regular array
        const embedding = Array.from(output.data);
        return embedding;
    }
    catch (error) {
        console.error("Local embedding generation failed:", error);
        // Return a zero vector of dimension 384 (MiniLM dimension)
        return new Array(384).fill(0);
    }
}
async function generateText(prompt) {
    if (!process.env.GOOGLE_API_KEY) {
        console.error("GOOGLE_API_KEY is missing in process.env");
        throw new Error("GOOGLE_API_KEY is not configured");
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
    catch (error) {
        console.error("Gemini generation failed:", error);
        throw error;
    }
}
