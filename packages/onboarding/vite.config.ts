import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const pRoot = path.resolve(__dirname, "../../");
  const env = loadEnv(mode, pRoot, "EXPO_PUBLIC_");
  return {
    define: Object.fromEntries(
      Object.entries(env).map(([key, val]) => [
        `import.meta.env.${key}`,
        JSON.stringify(val), // Inject as string literals
      ])
    ),
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@root": pRoot,
      },
    },

    build: {
      outDir: pRoot + "/dist/onboarding",
      emptyOutDir: true,
    },
    base: "/onboarding",
  };
});
