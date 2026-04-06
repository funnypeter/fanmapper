import wtf from 'wtf_wikipedia';

export interface InfoboxData {
  templateName: string;
  fields: Record<string, string>;
  image: string | null;
}

// Parse wikitext and extract infobox data
export function parseInfobox(wikitext: string, templateName?: string): InfoboxData | null {
  const doc = wtf(wikitext);
  const infoboxes = doc.infoboxes();

  if (infoboxes.length === 0) return null;

  // Find matching template or use first
  const infobox = templateName
    ? infoboxes.find((ib: any) => ib._type?.toLowerCase().includes(templateName.toLowerCase())) ?? infoboxes[0]
    : infoboxes[0];

  const json = infobox.json() as any;
  const fields: Record<string, string> = {};

  for (const [key, val] of Object.entries(json)) {
    if (key === 'template' || key === 'type') continue;
    if (typeof val === 'object' && val !== null && 'text' in (val as any)) {
      fields[key] = (val as any).text ?? '';
    } else if (typeof val === 'string') {
      fields[key] = val;
    }
  }

  // Extract image
  const images = doc.images();
  const image = images.length > 0 ? images[0].url() : null;

  return {
    templateName: json.template ?? json.type ?? 'Unknown',
    fields,
    image,
  };
}

// Parse wikitext into plain text sections
export function parseToSections(wikitext: string): { title: string; text: string }[] {
  const doc = wtf(wikitext);
  return doc.sections().map((s: any) => ({
    title: s.title() ?? '',
    text: s.text() ?? '',
  }));
}

// Extract all internal links from wikitext
export function extractLinks(wikitext: string): string[] {
  const doc = wtf(wikitext);
  return doc.links().map((l: any) => l.page?.() ?? l.text?.() ?? '').filter(Boolean);
}
