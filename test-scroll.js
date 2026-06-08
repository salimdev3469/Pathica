const PRE_PRICING_SLIDE_IDS_length = 3;
const quote_entries_length = 3;
const effectivePreSlideCount = PRE_PRICING_SLIDE_IDS_length + Math.max(0, quote_entries_length - 1);

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function resolveHeldSlideIndex(progressIndex, maxSlides) {
  const base = Math.floor(progressIndex);
  const fraction = progressIndex - base;
  return fraction < 0.85 ? base : Math.min(base + 1, maxSlides - 1);
}

const getBasePreSlideIndex = (virtualIndex) => {
  if (virtualIndex <= 0) return 0;
  if (virtualIndex <= quote_entries_length) return 1;
  return 2;
};

for (let i = 0; i <= 4; i += 0.2) {
    const preProgressIndex = i;
    const virtualIndex = resolveHeldSlideIndex(preProgressIndex, effectivePreSlideCount);
    const activePreSlideIndex = getBasePreSlideIndex(virtualIndex);
    console.log(`preProgress: ${preProgressIndex.toFixed(2)} | virtual: ${virtualIndex} | base: ${activePreSlideIndex}`);
}
