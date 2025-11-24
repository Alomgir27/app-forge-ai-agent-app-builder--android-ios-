import { initMongo, getCollection } from './mongo';
import { generateEmbedding } from './embeddings';

export * from './mongo';
export * from './embeddings';
export * from './ingestor';

export async function searchTemplates(query: string, limit = 5) {
    // Ensure connection
    try {
        await initMongo();
    } catch (e) {
        console.warn("Skipping vector search: MongoDB not available.");
        return [];
    }
    const collection = getCollection();

    const vector = await generateEmbedding(query);

    // MongoDB Atlas Vector Search Aggregation
    const pipeline = [
        {
            "$vectorSearch": {
                "index": "default",
                "path": "embedding",
                "queryVector": vector,
                "numCandidates": limit * 10,
                "limit": limit
            }
        },
        {
            "$project": {
                "_id": 0,
                "name": 1,
                "description": 1,
                "code_snippet": 1,
                "category": 1,
                "score": { "$meta": "vectorSearchScore" }
            }
        }
    ];

    try {
        const results = await collection.aggregate(pipeline).toArray();
        return results;
    } catch (error) {
        console.error("Vector search failed:", error);
        return [];
    }
}
