const { createElement } = require('react');
const { renderToString } = require('react-dom/server');

// Just mock enough to verify QuoteSlide rendering
const QuoteSlide = ({ quote, activeQuoteIndex }) => {
  const displayIndex = activeQuoteIndex;
  const activeEntry = quote.entries[displayIndex] ?? quote.entries[0];
  return createElement('div', { className: "quote-slide" }, activeEntry.text);
};

const quote = {
    label: 'HIRED',
    entries: [
    { text: 'Quote 1', author: 'A' },
    { text: 'Quote 2', author: 'B' },
    { text: 'Quote 3', author: 'C' }
    ]
};

console.log(renderToString(QuoteSlide({ quote, activeQuoteIndex: 1 })));
