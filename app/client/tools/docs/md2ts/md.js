import MarkdownIt from 'markdown-it';
import dollarmath from 'markdown-it-dollarmath';
import katex from 'katex';
import hljs from 'highlight.js';

import { regexps } from './constants.js';
import { log } from './functions.js';

export const md = MarkdownIt({
  html: true,
  linkify: true,
  xhtmlOut: true,
  typographer: true,
  highlight(string, language) {
    // The Mermaid diagrams are rendered on the client side.
    if (language === 'mermaid') {
      return string;
    }

    if (hljs.getLanguage(language)) {
      try {
        return hljs.highlight(string, { language }).value;
      } catch (error) {
        log('error', error);
      }
    }

    try {
      return hljs.highlightAuto(string).value;
    } catch (error) {
      log('error', error);
    }

    return string;
  },
});

md.use(
  dollarmath,
  {
    allow_space: true,
    allow_digits: true,
    double_inline: true,
    allow_labels: true,
    renderer(content, { displayMode }) {
      return katex.renderToString(
        content,
        {
          displayMode,
          output: 'mathml',
          throwOnError: false,
        },
      );
    },
    labelNormalizer(label) {
      return label.replace(regexps.whitespaces, '-');
    },
    labelRenderer(label) {
      return `<a href="#${label}" class="mathlabel" title="Permalink to this equation">¶<a>`;
    },
  },
);
