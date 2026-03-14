import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import { builtinModules } from "module";

export default {
  input: "src/plugin.ts",
  output: {
    file: "com.jochenissing.vpn-toggle.sdPlugin/bin/plugin.js",
    format: "esm",
    sourcemap: true,
  },
  external: [
    ...builtinModules,
    ...builtinModules.map((m) => `node:${m}`),
    /node_modules/,
  ],
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
      declaration: false,
    }),
    nodeResolve({
      preferBuiltins: true,
    }),
  ],
};
