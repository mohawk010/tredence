import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

export interface ScrapedRole {
  title: string;
  url: string;
  description: string;
  location: string;
}

export async function scrapeCareersPage(url: string, selectorOrContext: string): Promise<ScrapedRole[]> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // RippleHire is an SPA, wait for network idle to ensure jobs load
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for internal content to render
    await page.waitForSelector('.joblist', { timeout: 10000 }).catch(() => console.log('Timeout waiting for .joblist, continuing...'));

    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);
    const roles: ScrapedRole[] = [];

    // The selector depends heavily on the DOM.
    // If the user didn't specify a perfect selector, we try to guess based on standard RippleHire markup
    const targetSelector = selectorOrContext || '.jobContent';

    $(targetSelector).each((_: number, el: any) => {
      const title = $(el).find('h3').text().trim() || $(el).find('.jobTitle').text().trim();
      const jobUrlPath = $(el).find('a').attr('href');
      const fullUrl = jobUrlPath ? new URL(jobUrlPath, url).href : url;
      const location = $(el).find('.location').text().trim() || 'Remote / Unknown';
      const description = $(el).find('.description').text().trim() || $(el).text().trim().substring(0, 200) + '...';

      if (title) {
        roles.push({
          title,
          url: fullUrl,
          description,
          location,
        });
      }
    });

    return roles;
  } catch (error) {
    console.error("Puppeteer Scraping Failed:", error);
    throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
