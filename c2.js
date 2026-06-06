module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  root.find(j.ImportDeclaration, { source: { value: '@/lib/locale' } }).remove();
  return root.toSource();
};
