"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTemplates = searchTemplates;
const mongo_1 = require("./mongo");
const embeddings_1 = require("./embeddings");
__exportStar(require("./mongo"), exports);
__exportStar(require("./embeddings"), exports);
__exportStar(require("./ingestor"), exports);
async function searchTemplates(query, limit = 5) {
    // Ensure connection
    try {
        await (0, mongo_1.initMongo)();
    }
    catch (e) {
        console.warn("Skipping vector search: MongoDB not available.");
        return [];
    }
    const collection = (0, mongo_1.getCollection)();
    const vector = await (0, embeddings_1.generateEmbedding)(query);
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
    }
    catch (error) {
        console.error("Vector search failed:", error);
        return [];
    }
}
