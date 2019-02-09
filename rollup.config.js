import { ts, dts } from "rollup-plugin-dts";
import pkg from "./package.json";

const external = ["react"];

/** @type {Array<import("rollup").RollupWatchOptions>} */
const config = [
  {
    input: "./src/index.ts",
    output: [
      {
        name: "Rendez",
        file: pkg.browser,
        format: "umd",
        globals: {
          react: "React",
        },
      },
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
    ],

    external,

    plugins: [ts()],
  },
  {
    input: "./src/index.ts",
    output: [{ file: pkg.types, format: "es" }],

    external,

    plugins: [dts()],
  },
];

export default config;
