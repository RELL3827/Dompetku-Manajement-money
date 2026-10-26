/**
 * String and input sanitization utilities
 */

export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/[<>]/g, '') // strip potential HTML tags
    .slice(0, 500); // sensible max length
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
}
