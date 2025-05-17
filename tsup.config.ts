import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/api/index.ts", "src/utils/index.ts"],
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  outDir: "dist",
  minify: true,
  splitting: true,
  treeshake: true,
  esbuildOptions(options) {
    options.banner = {
      js: "// Creatify API TypeScript Client - MIT License",
    };
  },
});