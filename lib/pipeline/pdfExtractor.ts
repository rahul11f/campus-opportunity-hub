import { fetchPdfText } from './webScraper';

export async function extractPdfFromUrl(url: string): Promise<{
  text: string;
  pageCount: number;
  title: string;
  isImageOnly: boolean;
  error?: string;
}> {
  try {
    return await fetchPdfText(url);
  } catch (err) {
    return {
      text: '',
      pageCount: 0,
      title: '',
      isImageOnly: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function extractPdfFromBuffer(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
  title: string;
  isImageOnly: boolean;
}> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);

    const isImageOnly = data.text.trim().length < 100 && data.numpages > 0;

    return {
      text: data.text.substring(0, 12000),
      pageCount: data.numpages,
      title: data.info?.Title || '',
      isImageOnly,
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
