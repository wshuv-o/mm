const { getDefaultConfig } = require('@expo/metro-config');
const { mergeConfig } = require('metro-config');

const config = getDefaultConfig(__dirname);

// Remove 'svg' from assetExts and add it to sourceExts
const assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
const sourceExts = [...config.resolver.sourceExts, 'svg', 'cjs'];

module.exports = {
  ...config,
  transformer: {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    ...config.resolver,
    assetExts,
    sourceExts,
    unstable_enablePackageExports: false,
  },
};
