import Tesseract from 'tesseract.js';
import { truncateText } from './textCleaner';

type OcrResult = {
  text: string;
  confidence: number;
};

async function bufferFromUrl(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OCR fetch failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function extractTextFromImageUrl(
  imageUrl: string
): Promise<OcrResult> {
  const buffer = await bufferFromUrl(imageUrl);

  const result = await Tesseract.recognize(
    buffer,
    'eng',
    {
      logger: () => {},
    }
  );

  return {
    text: truncateText(result.data.text || '', 12000),
    confidence: result.data.confidence || 0,
  };
}

export async function extractTextFromImageBuffer(
  buffer: Buffer
): Promise<OcrResult> {
  const result = await Tesseract.recognize(
    buffer,
    'eng',
    {
      logger: () => {},
    }
  );

  return {
    text: truncateText(result.data.text || '', 12000),
    confidence: result.data.confidence || 0,
  };
}