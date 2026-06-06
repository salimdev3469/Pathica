module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root.find(j.CallExpression, { callee: { name: 't' } }).replaceWith(path => path.node.arguments[0]);
  root.find(j.VariableDeclarator, { id: { name: 't' } }).remove();
  root.find(j.VariableDeclarator, { id: { name: 'locale' } }).remove();
  root.find(j.VariableDeclarator, { id: { name: 'isTr' } }).remove();
  root.find(j.JSXAttribute, { name: { name: 'locale' } }).remove();
  root.find(j.ObjectProperty, { value: { name: 'locale' } }).filter(path => {
    let p = path.parent;
    while (p) {
      if (['FunctionDeclaration', 'ArrowFunctionExpression', 'FunctionExpression'].includes(p.node.type)) return true;
      p = p.parent;
    }
    return false;
  }).remove();
  root.find(j.TSPropertySignature, { key: { name: 'locale' } }).remove();

  return root.toSource();
};
