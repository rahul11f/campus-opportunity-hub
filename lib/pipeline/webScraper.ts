import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { chromium } from 'playwright';
import { fetchWithSsrfProtection, expandUrl } from './urlExpander';
import { extractMainContent, truncateText } from './textCleaner';

type ScrapeResult = {
  text: string;
  title: string;
  isJsRendered: boolean;
};

async function scrapeWithPlaywright(url: string): Promise<ScrapeResult> {
  const safeUrl = await expandUrl(url);
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
    });

    await page.goto(safeUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    });

    await page.waitForTimeout(2500);

    const html = await page.content();
    const title = await page.title();

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const articleText = article?.textContent?.trim() || '';

    if (articleText.length > 0) {
      return {
        text: truncateText(articleText, 12000),
        title: article?.title || title,
        isJsRendered: true,
      };
    }

    const bodyText = await page.locator('body').innerText();

    return {
      text: truncateText(bodyText, 12000),
      title,
      isJsRendered: true,
    };
  } finally {
    await browser.close();
  }
}

async function scrapeStatic(url: string): Promise<ScrapeResult> {
  const response = await fetchWithSsrfProtection(url, {
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/pdf')) {
    throw new Error('PDF_REDIRECT');
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const title =
    $('title').text().trim() ||
    $('h1').first().text().trim() ||
    '';

  const isLikelyJs =
    html.includes('__NEXT_DATA__') ||
    html.includes('data-reactroot') ||
    html.includes('window.__') ||
    ($('noscript').text().length > 100 &&
      $('body').text().trim().length < 500);

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const articleText = article?.textContent?.trim() || '';

  if (articleText.length > 200) {
    return {
      text: truncateText(articleText, 12000),
      title: article?.title || title,
      isJsRendered: false,
    };
  }

  $(
    'script, style, nav, footer, header, iframe, form,' +
      '.cookie-banner, .ad, .advertisement,' +
      '[class*="cookie"], [class*="popup"], [class*="modal"], [id*="cookie"]'
  ).remove();

  const mainContent =
    $('main, article, [role="main"], .content, #content, .post-content, .job-description')
      .first()
      .html() ||
    $('body').html() ||
    '';

  return {
    text: truncateText(extractMainContent(mainContent), 12000),
    title,
    isJsRendered: isLikelyJs,
  };
}

export async function scrapeWithCheerio(
  url: string
): Promise<ScrapeResult> {
  try {
    const staticResult = await scrapeStatic(url);

    if (
      staticResult.isJsRendered &&
      staticResult.text.trim().length < 500
    ) {
      return await scrapeWithPlaywright(url);
    }

    return staticResult;
  } catch (err) {
    if (
      err instanceof Error &&
      err.message !== 'PDF_REDIRECT'
    ) {
      try {
        return await scrapeWithPlaywright(url);
      } catch {
        throw err;
      }
    }

    throw err;
  }
}

export async function scrapeGoogleDoc(
  url: string
): Promise<string> {
  const exportUrl = url
    .replace(/\/edit.*$/, '/export?format=txt')
    .replace(/\/pub.*$/, '/export?format=txt')
    .replace(/\/view.*$/, '/export?format=txt');

  const response = await fetchWithSsrfProtection(exportUrl);

  if (!response.ok) {
    throw new Error(
      `Could not fetch Google Doc: ${response.status}`
    );
  }

  const text = await response.text();

  return truncateText(text, 12000);
}

export async function fetchPdfText(url: string): Promise<{
  text: string;
  pageCount: number;
  title: string;
  isImageOnly: boolean;
}> {
  const response = await fetchWithSsrfProtection(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const nodeBuffer = Buffer.from(buffer);

  return parsePdfBuffer(nodeBuffer);
}

export async function parsePdfBuffer(
  nodeBuffer: Buffer
): Promise<{
  text: string;
  pageCount: number;
  title: string;
  isImageOnly: boolean;
}> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(nodeBuffer);

    const extracted = data.text?.trim() || '';

    return {
      text: truncateText(extracted, 12000),
      pageCount: data.numpages || 0,
      title: data.info?.Title || '',
      isImageOnly: extracted.length < 100,
    };
  } catch {
    return {
      text: '',
      pageCount: 0,
      title: '',
      isImageOnly: true,
    };
  }
}

export async function expandTelegramUrl(
  url: string
): Promise<string> {
  const embedUrl = url
    .replace('https://t.me/', 'https://t.me/s/')
    .replace('https://telegram.me/', 'https://t.me/s/');

  try {
    const result = await scrapeWithCheerio(embedUrl);
    return result.text;
  } catch {
    return '';
  }
}