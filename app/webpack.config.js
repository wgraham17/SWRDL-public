/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-var-requires */

const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);
    config.resolve = config.resolve || {};
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(new TsconfigPathsPlugin({}));
    return config;
};
