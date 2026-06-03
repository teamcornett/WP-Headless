/** Wrap Gutenberg headings that use the editor class `secondary-text`. */
export function wrapSecondaryTextHeadings(html: string): string {
  return html.replace(
    /<h([1-6])(\s+[^>]*class="[^"]*\bsecondary-text\b[^"]*"[^>]*)>([\s\S]*?)<\/h\1>/gi,
    '<div class="secondary-text-wrap"><h$1$2>$3</h$1></div>',
  );
}
