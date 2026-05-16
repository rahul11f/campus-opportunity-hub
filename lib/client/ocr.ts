import Tesseract from 'tesseract.js';

async function preprocessImage(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context unavailable');
  }

  const scale = 2;

  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;

  ctx.scale(scale, scale);
  ctx.drawImage(bitmap, 0, 0);

  const imageData = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    const threshold = gray > 160 ? 255 : 0;

    data[i] = threshold;
    data[i + 1] = threshold;
    data[i + 2] = threshold;
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

export async function extractTextFromImage(
  file: File,
  onProgress?: (msg: string) => void
) {
  const processedCanvas = await preprocessImage(file);

  const result = await Tesseract.recognize(
    processedCanvas,
    'eng',
    {
      workerPath: '/tesseract/worker.min.js',
      corePath: '/tesseract/tesseract-core.wasm.js',
      langPath: '/tesseract/lang',
      logger: (m) => {
        if (m.status) {
          onProgress?.(
            `${m.status} ${Math.round((m.progress || 0) * 100)}%`
          );
        }
      },
    }
  );

  return result.data.text || '';
}
