import { initMongo, getCollection } from './mongo';
import { generateEmbedding } from './embeddings';
import { scrapeDocs } from './scraper';

export async function ingestUrl(url: string) {
    console.log(`Ingesting URL: ${url}`);
    await initMongo();
    const collection = getCollection();

    // 1. Check if already ingested
    // We check if any component exists with this source_url
    const existing = await collection.findOne({ source_url: url });
    if (existing) {
        console.log(`URL ${url} already ingested. Skipping.`);
        return { success: true, count: 0, message: 'URL already ingested.' };
    }

    // 2. Scrape
    const components = await scrapeDocs(url);
    if (components.length === 0) {
        return { success: false, message: 'No components found or scraping failed.' };
    }

    // 3. Store (With Embeddings)
    let count = 0;
    for (const comp of components) {
        try {
            const embedding = await generateEmbedding(`${comp.name} ${comp.description} ${comp.category}`);

            await collection.updateOne(
                { source_url: comp.source_url, name: comp.name }, // Upsert based on URL and Name
                {
                    $set: {
                        ...comp,
                        embedding,
                        updated_at: new Date()
                    },
                    $setOnInsert: {
                        created_at: new Date()
                    }
                },
                { upsert: true }
            );
            count++;
        } catch (error) {
            console.error(`Failed to process component ${comp.name}:`, error);
        }
    }

    return { success: true, count, message: `Successfully ingested ${count} components from ${url}` };
}
