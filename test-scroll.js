const quoteEntriesLength = 3;
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function resolveHeldSlideIndex(progressIndex, maxSlides) {
  const base = Math.floor(progressIndex);
  const fraction = progressIndex - base;
  return fraction < 0.85 ? base : Math.min(base + 1, maxSlides - 1);
}
const getBasePreSlideIndex = (virtualIndex) => {
    if (virtualIndex <= 0) return 0;
    if (virtualIndex <= quoteEntriesLength) return 1;
    return 2;
};

const effectivePreSlideCount = 3 + Math.max(0, quoteEntriesLength - 1); // 5

for (let i = 0; i <= 4; i += 0.2) {
    const preProgressIndex = i;
    const activeVirtualPreSlideIndex = resolveHeldSlideIndex(preProgressIndex, effectivePreSlideCount);
    const activePreSlideIndex = getBasePreSlideIndex(activeVirtualPreSlideIndex);
    const activeQuoteIndex = Math.round(clamp(preProgressIndex - 1, 0, quoteEntriesLength - 1));
    console.log(`preProgress: ${preProgressIndex.toFixed(2)} | virtual: ${activeVirtualPreSlideIndex} | base: ${activePreSlideIndex} | quote: ${activeQuoteIndex}`);
}
