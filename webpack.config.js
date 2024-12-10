const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/hedera.ts',
  output: {
    filename: 'hedera.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'HederaJS',
      type: 'umd', // Permette di esportare come UMD, CommonJS o ES module
      export: 'default',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.wasm$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: Infinity, // Converte tutto in Base64
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
    fallback: {
      crypto: false,
      fs: false,
      path: false,
    },
  },
  devtool: 'source-map',
  mode: 'development', // Usa 'production' per la versione finale ottimizzata
  plugins: [
    new CopyPlugin({
      patterns: ['LICENSE', 'package.json', 'README.md'],
    }),
  ],
};
