module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Replace `isTr` identifier with `false`
  root.find(j.Identifier, { name: 'isTr' }).forEach(path => {
    // Only replace if it's not a property key
    if (path.parent.node.type === 'Property' && path.parent.node.key === path.node) return;
    if (path.parent.node.type === 'MemberExpression' && path.parent.node.property === path.node && !path.parent.node.computed) return;
    if (path.parent.node.type === 'VariableDeclarator' && path.parent.node.id === path.node) return;
    j(path).replaceWith(j.booleanLiteral(false));
  });

  // Replace `locale` identifier with `'en'`
  root.find(j.Identifier, { name: 'locale' }).forEach(path => {
    if (path.parent.node.type === 'Property' && path.parent.node.key === path.node) return;
    if (path.parent.node.type === 'MemberExpression' && path.parent.node.property === path.node && !path.parent.node.computed) return;
    if (path.parent.node.type === 'VariableDeclarator' && path.parent.node.id === path.node) return;
    if (path.parent.node.type === 'FunctionDeclaration' || path.parent.node.type === 'ArrowFunctionExpression') return;
    j(path).replaceWith(j.stringLiteral('en'));
  });

  return root.toSource();
};
