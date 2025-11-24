"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLLECTION_NAME = void 0;
exports.initMongo = initMongo;
exports.getCollection = getCollection;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'appforge_ai';
const COLLECTION_NAME = 'ui_components';
exports.COLLECTION_NAME = COLLECTION_NAME;
let client;
let collection;
async function initMongo() {
    if (client)
        return { client, collection };
    try {
        client = new mongodb_1.MongoClient(MONGODB_URI, {
            serverApi: {
                version: mongodb_1.ServerApiVersion.v1,
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
        }
        catch (e) {
            console.warn('Failed to auto-create vector index (might not be on Atlas or insufficient permissions):', e);
        }
        return { client, collection };
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}
function getCollection() {
    if (!collection) {
        throw new Error('MongoDB not initialized. Call initMongo() first.');
    }
    return collection;
}
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
