import * as fs from 'fs';
import * as path from 'path';

export type TemplateVariable = {
  name: string;
  label: string;
  type: string;
  required: boolean;
};

export type TemplateMetadata = {
  id: string;
  name: string;
  category: string;
  description: string;
  variables: TemplateVariable[];
};

export type ParsedTemplateFile = {
  metadata: TemplateMetadata;
  content: string;
};

const METADATA_REGEX = /^# Metadata\s*\n```json\s*([\s\S]*?)```/m;
const CONTENT_SEPARATOR = '\n---\n';

/**
 * Parses a template .md file: extracts metadata JSON and document content (after ---).
 */
export function parseTemplateFile(markdown: string): ParsedTemplateFile {
  const metadataMatch = markdown.match(METADATA_REGEX);
  if (!metadataMatch) {
    throw new Error('Template file missing Metadata section with json block');
  }
  const metadata: TemplateMetadata = JSON.parse(metadataMatch[1].trim());
  const afterMetadata = markdown.slice(metadataMatch[0].length);
  const separatorIndex = afterMetadata.indexOf(CONTENT_SEPARATOR);
  const content =
    separatorIndex >= 0
      ? afterMetadata.slice(separatorIndex + CONTENT_SEPARATOR.length).trim()
      : afterMetadata.trim();
  return { metadata, content };
}

/**
 * Reads and parses a template file from the given directory.
 */
export function readAndParseTemplateFile(
  filesDir: string,
  filename: string,
): ParsedTemplateFile {
  const filePath = path.join(filesDir, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return parseTemplateFile(raw);
}

export type CatalogTemplateEntry = {
  filename: string;
  id: string;
  name: string;
  description: string;
  variables_count: number;
};

export type Catalog = {
  title: string;
  version: string;
  date: string;
  total_templates: number;
  categories: Record<string, CatalogTemplateEntry[]>;
};

/**
 * Returns a flat list of all template entries from the catalog.
 */
export function getTemplateEntriesFromCatalog(catalog: Catalog): CatalogTemplateEntry[] {
  return Object.values(catalog.categories).flat();
}
