"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeDocs = scrapeDocs;
const puppeteer_1 = __importDefault(require("puppeteer"));
async function scrapeDocs(url, selector = 'pre code') {
    console.log(`Scraping ${url}...`);
    const browser = await puppeteer_1.default.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        // Set a longer timeout and use a less strict wait condition
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Wait for the code blocks to actually appear
        try {
            await page.waitForSelector(selector, { timeout: 10000 });
        }
        catch (e) {
            console.log("Selector not found immediately, proceeding anyway...");
        }
        const components = await page.evaluate((sel) => {
            const results = [];
            const codeBlocks = document.querySelectorAll(sel);
            codeBlocks.forEach((block) => {
                const code = block.textContent || '';
                // Try to find a preceding heading to use as the name
                let element = block.parentElement;
                let name = 'Unknown Component';
                let description = '';
                // Walk up and previous to find a heading
                while (element && element.tagName !== 'BODY') {
                    let sibling = element.previousElementSibling;
                    while (sibling) {
                        if (['H1', 'H2', 'H3', 'H4'].includes(sibling.tagName)) {
                            name = sibling.textContent || name;
                            break;
                        }
                        if (sibling.tagName === 'P' && !description) {
                            description = sibling.textContent || '';
                        }
                        sibling = sibling.previousElementSibling;
                    }
                    if (name !== 'Unknown Component')
                        break;
                    element = element.parentElement;
                }
                if (code.length > 50) { // Filter out tiny snippets
                    results.push({
                        name: name.trim(),
                        description: description.trim(),
                        code_snippet: code.trim(),
                        category: 'UI',
                        source_url: document.URL
                    });
                }
            });
            return results;
        }, selector);
        console.log(`Found ${components.length} components.`);
        return components;
    }
    catch (error) {
        console.error('Scraping failed:', error);
        return [];
    }
    finally {
        await browser.close();
    }
}
