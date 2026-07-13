---
    name: Lovable TanStack devtools inject-source hydration mismatch
    description: Bundled TanStack Devtools JSX-source-tagging plugin in @lovable.dev/vite-tanstack-config causes noisy (harmless) React hydration warnings.
    ---

    The Lovable vite-tanstack-config package always enables `@tanstack/devtools-vite`'s
    `injectSource` plugin in dev mode (adds `data-tsd-source="file:line:col"` attributes
    to JSX elements for click-to-source). On some projects it computes different
    line:col for the SSR render vs. the client render, causing a React hydration
    mismatch warning on every page load. It's cosmetic only — doesn't affect
    production builds (dev-only) or app behavior.

    **Why:** LovableViteTanstackOptions exposes no toggle for this specific plugin
    (only `nitro`, `tanstackStart`, `react`, `hmrGate`, etc.), so it can't be
    disabled through documented config.

    **How to apply:** Wrap the exported `defineConfig(...)` result in an async
    function, await it, then recursively walk `config.plugins` (Vite plugins can be
    nested arrays) and drop the entry named `"@tanstack/devtools:inject-source"`.
    Restart the dev workflow fully (not just HMR) afterward — cached plugin lists
    persist across HMR reloads.
    