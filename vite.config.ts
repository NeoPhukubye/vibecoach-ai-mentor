// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const baseConfig = defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Build a plain Node server (not the Cloudflare Worker default) so the app
  // can run as a normal Node process on Replit's autoscale deployments.
  nitro: {
    preset: "node-server",
  },
  vite: {
    server: {
      host: "0.0.0.0",
      port: 5000,
      strictPort: true,
      allowedHosts: true,
    },
  },
});

// The Lovable config always wires up TanStack Devtools' JSX source-tagging
// plugin (`data-tsd-source` attributes) in dev, with no toggle exposed. It
// computes source locations independently for the SSR and client builds,
// which drift out of sync on this project and trigger a (harmless but
// noisy) React hydration-mismatch warning on every page load. Since there's
// no supported option to disable it, drop the plugin here instead.
function dropPlugin(pluginOrGroup: unknown, pluginName: string): unknown {
  if (Array.isArray(pluginOrGroup)) {
    return pluginOrGroup
      .map((p) => dropPlugin(p, pluginName))
      .filter((p) => !(Array.isArray(p) && p.length === 0));
  }
  return (pluginOrGroup as { name?: string } | null)?.name === pluginName ? null : pluginOrGroup;
}

export default async (env: Parameters<typeof baseConfig>[0]) => {
  const config = await baseConfig(env);
  if (Array.isArray(config.plugins)) {
    config.plugins = (dropPlugin(config.plugins, "@tanstack/devtools:inject-source") as typeof config.plugins).filter(
      (p) => p != null,
    );
  }
  return config;
};
