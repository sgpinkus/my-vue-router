import VuePlugin from "rollup-plugin-vue";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "dist/index.mjs",
      format: "es",
    },
  ],
  plugins: [
    typescript(),
    nodeResolve({ preferBuiltins: true, browser: true }),
    VuePlugin({
      css: false,
    }),
  ],
  external: ["vue", "path-to-regexp"],
};
