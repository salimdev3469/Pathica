require('@babel/register')({
  presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }], '@babel/preset-typescript'],
  extensions: ['.js', '.jsx', '.ts', '.tsx']
});
const React = require('react');
const { renderToString } = require('react-dom/server');
const { HomeCinematicExperience } = require('./components/home/HomeCinematicExperience');

console.log("Imports succeeded.");
