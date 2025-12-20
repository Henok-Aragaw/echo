module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Required for Reanimated (MUST BE LAST)
      "react-native-reanimated/plugin",
    ],
  };
};