/**
 * Counts words in plain text.
 * Splits on whitespace and filters empty strings.
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((s) => s.length > 0).length;
}

/**
 * Strips markdown syntax and counts words in the resulting text.
 * Removes code blocks, inline code, links, images, headers, emphasis, list markers, etc.
 */
function stripMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') return '';
  let s = markdown;

  // Fenced code blocks (```...``` or ~~~...~~~)
  s = s.replace(/```[\s\S]*?```/g, ' ');
  s = s.replace(/~~~[\s\S]*?~~~/g, ' ');

  // Inline code
  s = s.replace(/`[^`]+`/g, ' ');

  // Links: [text](url) or [text][ref]
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  s = s.replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1');

  // Images: ![alt](url)
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');

  // Headers (# ## ### etc.)
  s = s.replace(/^#{1,6}\s+/gm, ' ');

  // Bold/italic ** __ * _
  s = s.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');
  s = s.replace(/_{1,2}([^_]+)_{1,2}/g, '$1');

  // Strikethrough
  s = s.replace(/~~([^~]+)~~/g, '$1');

  // List markers - , -, *, +, 1.
  s = s.replace(/^\s*[-*+]\s+/gm, ' ');
  s = s.replace(/^\s*\d+\.\s+/gm, ' ');

  // Blockquotes
  s = s.replace(/^\s*>\s*/gm, ' ');

  // Horizontal rules (---, ***, ___)
  s = s.replace(/^[-*_]{3,}\s*$/gm, ' ');

  return s;
}

/**
 * Counts words in markdown content by stripping markdown syntax first.
 * Code blocks and link URLs are not counted; only visible text is.
 */
export function countWordsFromMarkdown(markdown: string): number {
  return countWords(stripMarkdown(markdown));
}
