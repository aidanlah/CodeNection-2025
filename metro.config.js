const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)
 
/* // Enable CSS support and make sure it's processed by NativeWind
config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
  }; */

module.exports = withNativeWind(config, { input: './global.css' })