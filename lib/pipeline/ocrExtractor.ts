import Tesseract from 'tesseract.js';
import { createCanvas, loadImage } from 'canvas';
import { truncateText } from './textCleaner';

type OcrResult = {
  text: string;
  confidence: number;
};

const MAX_WIDTH = 1400;

async function bufferFromUrl(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OCR fetch failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function optimizeImage(
  buffer: Buffer
): Promise<Buffer> {
  const img = await loadImage(buffer);

  let width = img.width;
  let height = img.height;

  if (width > MAX_WIDTH) {
    const ratio = MAX_WIDTH / width;
    width = MAX_WIDTH;
    height = Math.floor(height * ratio);
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toBuffer('image/jpeg', {
    quality: 0.8,
  });
}

async function runOcr(
  buffer: Buffer
): Promise<OcrResult> {
  const optimized =
    await optimizeImage(buffer);

  const result = await Tesseract.recognize(
    optimized,
    'eng',
    {
      logger: () => {},
    }
  );

  return {
    text: truncateText(
      result.data.text || '',
      12000
    ),
    confidence:
      result.data.confidence || 0,
  };
}

export async function extractTextFromImageUrl(
  imageUrl: string
): Promise<OcrResult> {
  const buffer = await bufferFromUrl(
    imageUrl
  );

  return runOcr(buffer);
}

export async function extractTextFromImageBuffer(
  buffer: Buffer
): Promise<OcrResult> {
  return runOcr(buffer);
}