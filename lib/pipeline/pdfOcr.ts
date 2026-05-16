import { createCanvas } from 'canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { extractTextFromImageBuffer } from './ocrExtractor';
import { truncateText } from './textCleaner';

export async function extractTextFromScannedPdf(
  pdfBuffer: Buffer
): Promise<{
  text: string;
  pagesProcessed: number;
}> {
  const loadingTask = (pdfjsLib as any).getDocument({
    data: new Uint8Array(pdfBuffer),
    disableWorker: true,
    useWorkerFetch: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;

  let mergedText = '';
  let processed = 0;
  const maxPages = Math.min(pdf.numPages, 5);

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);

    const viewport = page.getViewport({
      scale: 2,
    });

    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height)
    );

    const ctx = canvas.getContext('2d');

    await page.render({
      canvasContext: ctx as any,
      viewport,
    }).promise;

    const imageBuffer = canvas.toBuffer('image/png');

    const ocr =
      await extractTextFromImageBuffer(
        imageBuffer
      );

    if (ocr.text?.trim()) {
      mergedText += `\n${ocr.text}`;
      processed++;
    }
  }

  return {
    text: truncateText(mergedText, 12000),
    pagesProcessed: processed,
  };
}