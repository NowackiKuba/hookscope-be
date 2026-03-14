/**
 * Builds a Content-Disposition header value for file download.
 * Ensures the value is valid for HTTP headers (no newlines, control chars, or
 * unescaped double-quotes). Uses RFC 5987 filename* for UTF-8 filenames when needed.
 */
export function contentDispositionAttachment(filename: string): string {
  const clean =
    filename
      .replace(/[\x00-\x1f\x7f\r\n]/g, '')
      .replace(/"/g, "'")
      .trim() || 'download';
  const asciiOnly =
    clean.replace(/[^\x20-\x7e]/g, '_').replace(/[/\\?%*:|"<>]/g, '_') ||
    'download';
  const encoded = encodeURIComponent(clean);
  if (asciiOnly === encoded || clean === asciiOnly) {
    return `attachment; filename="${asciiOnly}"`;
  }
  return `attachment; filename="${asciiOnly}"; filename*=UTF-8''${encoded}`;
}
