---
name: Lovable vite-tanstack-config IPv6 bind
description: Why Lovable-imported TanStack Start projects fail to boot on Replit and how to fix it.
---

`@lovable.dev/vite-tanstack-config`'s `defineConfig` defaults the vite dev
server to `host: "::", port: 8080` whenever the consuming `vite.config.ts`
doesn't set `server.host`/`server.port` itself (this default applies even
outside its "sandbox" detection branch). Replit's environment doesn't support
binding to `::` (IPv6 any) and the dev server crashes immediately with
`EAFNOSUPPORT: address family not supported :::8080`.

**Why:** The package merges its own `{server:{host:"::",port:8080}}` as a
base config, with the user's `vite.config.ts` values taking precedence only
if explicitly set — so an unmodified Lovable import always tries to bind
IPv6-any first.

**How to apply:** In `vite.config.ts`, pass `vite: { server: { host:
"0.0.0.0", port: 5000, strictPort: true, allowedHosts: true } }` into
`defineConfig({...})` from `@lovable.dev/vite-tanstack-config`. This is the
standard fix for any freshly imported Lovable/TanStack Start project on
Replit — check for this symptom first when such a project's dev server won't
start.
