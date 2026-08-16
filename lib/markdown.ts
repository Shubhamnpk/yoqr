import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

type TransformTag = NonNullable<sanitizeHtml.IOptions['transformTags']>[string];

export function renderMarkdownToHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown ?? '', {
    gfm: true,
    breaks: false,
  }) as string;

  return sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'span',
      'hr',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ]),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      th: ['align'],
      td: ['align'],
      '*': ['class'],
    },
    transformTags: {
      a: ((tagName: string, attribs: sanitizeHtml.Attributes) => {
        const href = attribs.href || '';
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: {
            ...attribs,
            target: isExternal ? '_blank' : attribs.target,
            rel: isExternal ? 'noopener noreferrer' : attribs.rel,
          },
        };
      }) as TransformTag,
      img: ((tagName: string, attribs: sanitizeHtml.Attributes) => {
        return {
          tagName,
          attribs: {
            ...attribs,
            loading: attribs.loading || 'lazy',
          },
        };
      }) as TransformTag,
    },
  });
}
