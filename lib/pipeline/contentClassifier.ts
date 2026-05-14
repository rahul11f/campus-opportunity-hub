export type ContentType =
  | 'pdf'
  | 'image'
  | 'html'
  | 'google_doc'
  | 'telegram'
  | 'linkedin'
  | 'google_drive'
  | 'plain_text'
  | 'unknown';

const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.bmp',
];

export function classifyUrl(url: string): ContentType {
  const lower = url.toLowerCase();

  if (
    lower.includes('docs.google.com/document')
  ) {
    return 'google_doc';
  }

  if (
    lower.includes('drive.google.com')
  ) {
    return 'google_drive';
  }

  if (
    lower.includes('linkedin.com')
  ) {
    return 'linkedin';
  }

  if (
    lower.includes('t.me/') ||
    lower.includes('telegram.me/')
  ) {
    return 'telegram';
  }

  if (
    lower.endsWith('.pdf') ||
    lower.includes('.pdf?')
  ) {
    return 'pdf';
  }

  if (
    IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))
  ) {
    return 'image';
  }

  if (
    lower.endsWith('.txt')
  ) {
    return 'plain_text';
  }

  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://')
  ) {
    return 'html';
  }

  return 'unknown';
}

export function classifyContentType(
  contentType: string
): ContentType {
  const lower = contentType.toLowerCase();

  if (lower.includes('application/pdf')) {
    return 'pdf';
  }

  if (lower.startsWith('image/')) {
    return 'image';
  }

  if (lower.includes('text/plain')) {
    return 'plain_text';
  }

  if (
    lower.includes('text/html') ||
    lower.includes('application/xhtml+xml')
  ) {
    return 'html';
  }

  return 'unknown';
}