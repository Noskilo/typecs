import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    format: "umd",
    name: "typecs",
    sourcemap: true,
    file: "lib/index.umd.js",
  },
  external: ["util"],
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
    }),
  ],
};
