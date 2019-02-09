// @ts-ignore
import json from "rollup-plugin-json";
// @ts-ignore
import resolve from "rollup-plugin-node-resolve";
import { ts, dts } from "rollup-plugin-dts";
import pkg from "./package.json";

const external = ["react"];

/**
 * @type {Array<import("rollup").RollupWatchOptions>}
 */
const config = [
  {
    input: "./src/index.ts",
    output: [
      {
        exports: "named",
        name: "Rendez",
        file: pkg.browser,
        format: "umd",
        globals: {
          "react": "React",
        },
      },
      {
        exports: "named",
        file: pkg.main,
        format: "cjs",
      },
      { file: pkg.module, format: "es" },
    ],

    external,
    // @ts-ignore: this option is not in the @types
    treeshake: {
      pureExternalModules: true,
    },

    plugins: [
      resolve({
        jsnext: true,
        extensions: [".ts"],
      }),
      json({
        preferConst: true,
        indent: "  ",
      }),
      ts(),
    ],
  },
  {
    input: "./src/index.ts",
    output: [{ file: pkg.types, format: "es" }],

    external,

    plugins: [dts()],
  },
];

export default config;