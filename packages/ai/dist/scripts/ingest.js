"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_1 = require("../mongo");
const embeddings_1 = require("../embeddings");
const scraper_1 = require("../scraper");
// Example URLs to scrape (User can add more)
const TARGET_URLS = [
    'https://reactnative.dev/docs/view',
    'https://reactnative.dev/docs/text',
    'https://reactnative.dev/docs/image',
    'https://reactnative.dev/docs/textinput',
    'https://reactnative.dev/docs/scrollview',
    'https://reactnative.dev/docs/stylesheet',
];
// Mock data for seeding
const SEED_TEMPLATES = [
    {
        name: 'Login Screen',
        description: 'A standard login screen with email, password, and a "Sign In" button.',
        category: 'Auth',
        code_snippet: `<Container padding={20}><Text text="Welcome" /><Input placeholder="Email" /><Input placeholder="Password" /><Button title="Login" /></Container>`,
        source_url: 'seed'
    },
    {
        name: 'Hero Section',
        description: 'A hero section with a headline, subheadline, and a call to action button.',
        category: 'Marketing',
        code_snippet: `<Container padding={40}><Text text="Build Faster" size="header" /><Text text="The best way to build apps." /><Button title="Get Started" /></Container>`,
        source_url: 'seed'
    },
    {
        name: 'Pricing Table',
        description: 'A pricing table showing different plans.',
        category: 'Marketing',
        code_snippet: `<Container><Text text="Pricing" size="header" /><Container><Text text="Basic" /><Text text="$10/mo" /><Button title="Choose" /></Container><Container><Text text="Pro" /><Text text="$29/mo" /><Button title="Choose" /></Container></Container>`,
        source_url: 'seed'
    }
];
async function run() {
    console.log('Initializing MongoDB...');
    await (0, mongo_1.initMongo)();
    const collection = (0, mongo_1.getCollection)();
    let allComponents = [...SEED_TEMPLATES];
    // Run Scraper
    if (TARGET_URLS.length > 0) {
        console.log('Starting scraper...');
        for (const url of TARGET_URLS) {
            // Check if already ingested
            const existing = await collection.findOne({ source_url: url });
            if (existing) {
                console.log(`Skipping ${url} (already ingested)`);
                continue;
            }
            const scraped = await (0, scraper_1.scrapeDocs)(url);
            allComponents = [...allComponents, ...scraped];
        }
    }
    else {
        console.log('No target URLs provided. Using seed data only.');
    }
    console.log(`Generating embeddings for ${allComponents.length} items...`);
    const data = [];
    for (const comp of allComponents) {
        try {
            // Generate embedding using Gemini
            const embedding = await (0, embeddings_1.generateEmbedding)(`${comp.name} ${comp.description} ${comp.category}`);
            data.push({
                ...comp,
                embedding: embedding, // Field name must match Atlas Search Index
                created_at: new Date()
            });
            console.log(`Processed: ${comp.name}`);
        }
        catch (err) {
            console.error(`Failed to embed ${comp.name}:`, err);
        }
    }
    if (data.length > 0) {
        console.log(`Inserting ${data.length} items into MongoDB...`);
        // Optional: Clear existing data for clean slate
        // await collection.deleteMany({}); 
        await collection.insertMany(data);
        console.log('Ingestion complete!');
    }
    else {
        console.log('No data to ingest.');
    }
    process.exit(0);
}
run().catch(console.error);
