/* eslint-disable no-restricted-syntax,guard-for-in,@typescript-eslint/no-var-requires,import/extensions */
const tsconfig = require('./tsconfig.json');

const rawAlias = tsconfig.compilerOptions.paths;
const alias = {};

for (const x in rawAlias) {
    alias[x.replace('/*', '')] = rawAlias[x].map(p => p.replace('/*', ''));
}

module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./'],
                    extensions: ['.ts', '.tsx', '.js', '.jsx', '.png', '.json'],
                    alias,
                },
            ],
            'module:react-native-dotenv',
            'react-native-reanimated/plugin',
        ],
    };
};
