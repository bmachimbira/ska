const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the shared package to watchFolders
const sharedPath = path.resolve(__dirname, '../shared');
config.watchFolders = [sharedPath];

// Configure resolver to handle the shared package
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../shared/node_modules'),
];

// Add extraNodeModules to resolve @ska/shared
config.resolver.extraNodeModules = {
  '@ska/shared': sharedPath,
};

module.exports = config;
