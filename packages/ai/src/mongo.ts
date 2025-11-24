import { MongoClient, Collection, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'appforge_ai';
const COLLECTION_NAME = 'ui_components';

let client: MongoClient;
let collection: Collection;

export async function initMongo() {
    if (client) return { client, collection };

    try {
        client = new MongoClient(MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DB_NAME);
        collection = db.collection(COLLECTION_NAME);

        // Automatically create Vector Search Index if possible
        try {
            const indexes = await collection.listSearchIndexes().toArray();
            const indexName = 'default';
            const indexExists = indexes.some(idx => idx.name === indexName);

            if (!indexExists) {
                console.log('Creating Atlas Vector Search Index...');
                await collection.createSearchIndex({
                    name: indexName,
                    definition: {
                        "mappings": {
                            "dynamic": true,
                            "fields": {
                                "embedding": {
                                    "dimensions": 384,
                                    "similarity": "cosine",
                                    "type": "vector"
                                }
                            }
                        }
                    }
                });
                console.log('Vector Search Index created. It may take a minute to sync.');
            }
        } catch (e) {
            console.warn('Failed to auto-create vector index (might not be on Atlas or insufficient permissions):', e);
        }

        return { client, collection };
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

export function getCollection() {
    if (!collection) {
        throw new Error('MongoDB not initialized. Call initMongo() first.');
    }
    return collection;
}

export { COLLECTION_NAME };

/*
 * IMPORTANT: For Vector Search to work in MongoDB Atlas, you must create a Search Index.
 * 
 * Index Definition (JSON Editor):
 * {
 *   "fields": [
 *     {
 *       "numDimensions": 768,
 *       "path": "embedding",
 *       "similarity": "cosine",
 *       "type": "vector"
 *     }
 *   ]
 * }
 * 
 * Note: Google Gemini embedding-001 dimension is 768.
 */
