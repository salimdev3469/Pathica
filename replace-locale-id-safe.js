module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Replace `isTr` with `false`
  root.find(j.Identifier, { name: 'isTr' }).forEach(path => {
    const pNode = path.parent.node;
    const parentType = pNode.type;
    
    if (parentType === 'Property' || parentType === 'ObjectProperty') return;
    if (parentType === 'MemberExpression' && pNode.property === path.node && !pNode.computed) return;
    if (parentType === 'VariableDeclarator' && pNode.id === path.node) return;
    if (parentType === 'FunctionDeclaration' || parentType === 'ArrowFunctionExpression') return;
    if (parentType === 'ArrayPattern') return;
    if (parentType === 'AssignmentPattern') return;

    j(path).replaceWith(j.booleanLiteral(false));
  });

  // Replace `locale` with `'en'`
  root.find(j.Identifier, { name: 'locale' }).forEach(path => {
    const pNode = path.parent.node;
    const parentType = pNode.type;

    if (parentType === 'Property' || parentType === 'ObjectProperty') return;
    if (parentType === 'MemberExpression' && pNode.property === path.node && !pNode.computed) return;
    if (parentType === 'VariableDeclarator' && pNode.id === path.node) return;
    if (parentType === 'FunctionDeclaration' || parentType === 'ArrowFunctionExpression') return;
    if (parentType === 'ArrayPattern') return;
    if (parentType === 'AssignmentPattern') return;
    if (parentType === 'TSTypeAnnotation' || parentType === 'TSPropertySignature') return;
    if (parentType === 'ImportSpecifier') return;

    j(path).replaceWith(j.stringLiteral('en'));
  });

  return root.toSource();
};
