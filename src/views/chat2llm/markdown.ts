// @ts-ignore
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
// @ts-ignore
import markdownStyle from "markdown-it-style";

const markdownit = new MarkdownIt({
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      // console.log(hljs.getLanguage(lang))
      try {
        return '<pre><code class="hljs">' +
          hljs.highlight(str, {language: lang}).value
          + '</code></pre>';
      } catch (__) {
        return '<pre><code class="hljs">' +
          str
          + '</code></pre>';
      }
    }
    return str; // use external default escaping
  }
});

markdownit.use(markdownStyle, {
  table: 'border-collapse: collapse;' +
    'border-width: 1px;' +
    'border-style: solid;' +
    'background-color: #f0f0;' +
    'display: block;' +
    'overflow: auto;',
  // 'width: 100%;',
  th: 'padding: 6px 13px;' +
    'border: 1px solid rgba(49, 51, 63, 0.2);' +
    'background-color: rgba(49, 51, 63, 0.2);' +
    'font-weight: bold;' +
    'white-space: nowrap;',
  td: 'padding: 6px 13px;' +
    'border: 1px solid rgba(49, 51, 63, 0.2);' +
    'text-align: center;',
  blockquote: 'padding: 5px 0 5px 10px;' +
    'border-left: 3px solid #cacaca;' +
    'margin: 5px 0;' +
    'background-color: #f3f3f3;',
  code: 'color: #000;' +
    'background-color: #f8f9fa;' +
    'border: 1px solid #eaecf0;' +
    'border-radius: 2px;' +
    'padding: 1px 4px;'
});

export default markdownit;
