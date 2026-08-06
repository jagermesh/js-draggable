import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseConfig = {
  entry: path.resolve(__dirname, 'src/draggable.js'),
  target: ['web'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'Draggable',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
  },
  devtool: 'source-map',
};

const unminified = {
  ...baseConfig,
  mode: 'development',
  optimization: {
    minimize: false,
  },
  output: {
    ...baseConfig.output,
    filename: 'draggable.js',
  },
};

const minified = {
  ...baseConfig,
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          compress: false,
        },
      }),
    ],
  },
  output: {
    ...baseConfig.output,
    filename: 'draggable.min.js',
  },
};

export default [unminified, minified];
