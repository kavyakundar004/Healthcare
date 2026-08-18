import crypto from 'crypto';

export class MedicalTextCleaner {
  /**
   * Cleans and sanitizes raw medical text for reliable vector indexing
   */
  public clean(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') {
      return '';
    }

    let text = rawText;

    // 1. Strip HTML tags if present
    text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    text = text.replace(/<[^>]+>/g, ' ');

    // 2. Remove common web tracking, cookies, and boilerplate phrases
    const boilerplatePatterns = [
      /cookie policy/gi,
      /all rights reserved/gi,
      /terms of use/gi,
      /privacy policy/gi,
      /subscribe to our newsletter/gi,
      /advertisement/gi,
      /sponsored content/gi,
    ];
    for (const pattern of boilerplatePatterns) {
      text = text.replace(pattern, '');
    }

    // 3. Normalize non-standard whitespace and tabs
    text = text.replace(/\r\n/g, '\n');
    text = text.replace(/\t/g, ' ');
    text = text.replace(/[ \t]+/g, ' ');

    // 4. Preserve paragraph breaks while collapsing excessive newlines
    text = text.replace(/\n\s*\n\s*\n+/g, '\n\n');

    // 5. Standardize common medical symbols and characters
    text = text.replace(/[\u2018\u2019]/g, "'");
    text = text.replace(/[\u201C\u201D]/g, '"');
    text = text.replace(/[\u2013\u2014]/g, '-');
    text = text.replace(/\u00A0/g, ' '); // non-breaking space

    return text.trim();
  }

  /**
   * Generates a deterministic content hash for duplicate document detection
   */
  public computeHash(content: string): string {
    const normalized = content.toLowerCase().replace(/\s+/g, ' ').trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }
}

export const medicalTextCleaner = new MedicalTextCleaner();
