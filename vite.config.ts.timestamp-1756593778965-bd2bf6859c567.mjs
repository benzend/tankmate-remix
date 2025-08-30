// vite.config.ts
import { vitePlugin as remix } from "file:///Users/benjaminscott/Projects/aquatrack-remix/node_modules/@remix-run/dev/dist/index.js";
import { sentryVitePlugin } from "file:///Users/benjaminscott/Projects/aquatrack-remix/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { glob } from "file:///Users/benjaminscott/Projects/aquatrack-remix/node_modules/glob/dist/esm/index.js";
import { flatRoutes } from "file:///Users/benjaminscott/Projects/aquatrack-remix/node_modules/remix-flat-routes/dist/index.js";
import { defineConfig } from "file:///Users/benjaminscott/Projects/aquatrack-remix/node_modules/vite/dist/node/index.js";
import { envOnlyMacros } from "file:///Users/benjaminscott/Projects/aquatrack-remix/node_modules/vite-env-only/dist/index.js";
var MODE = process.env.NODE_ENV;
var vite_config_default = defineConfig({
  build: {
    cssMinify: MODE === "production",
    rollupOptions: {
      external: [/node:.*/, "fsevents"]
    },
    assetsInlineLimit: (source) => {
      if (source.endsWith("sprite.svg") || source.endsWith("favicon.svg") || source.endsWith("apple-touch-icon.png")) {
        return false;
      }
    },
    sourcemap: true
  },
  server: {
    watch: {
      ignored: ["**/playwright-report/**"]
    }
  },
  plugins: [
    envOnlyMacros(),
    // it would be really nice to have this enabled in tests, but we'll have to
    // wait until https://github.com/remix-run/remix/issues/9871 is fixed
    process.env.NODE_ENV === "test" ? null : remix({
      ignoredRouteFiles: ["**/*"],
      serverModuleFormat: "esm",
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: [
            ".*",
            "**/*.css",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__*.*",
            // This is for server-side utilities you want to colocate
            // next to your routes without making an additional
            // directory. If you need a route that includes "server" or
            // "client" in the filename, use the escape brackets like:
            // my-route.[server].tsx
            "**/*.server.*",
            "**/*.client.*"
          ]
        });
      }
    }),
    process.env.SENTRY_AUTH_TOKEN ? sentryVitePlugin({
      disable: MODE !== "production",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      release: {
        name: process.env.COMMIT_SHA,
        setCommits: {
          auto: true
        }
      },
      sourcemaps: {
        filesToDeleteAfterUpload: await glob([
          "./build/**/*.map",
          ".server-build/**/*.map"
        ])
      }
    }) : null
  ],
  test: {
    include: ["./app/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup/setup-test-env.ts"],
    globalSetup: ["./tests/setup/global-setup.ts"],
    restoreMocks: true,
    coverage: {
      include: ["app/**/*.{ts,tsx}"],
      all: true
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYmVuamFtaW5zY290dC9Qcm9qZWN0cy9hcXVhdHJhY2stcmVtaXhcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9iZW5qYW1pbnNjb3R0L1Byb2plY3RzL2FxdWF0cmFjay1yZW1peC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYmVuamFtaW5zY290dC9Qcm9qZWN0cy9hcXVhdHJhY2stcmVtaXgvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSAnQHJlbWl4LXJ1bi9kZXYnXG5pbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSAnQHNlbnRyeS92aXRlLXBsdWdpbidcbmltcG9ydCB7IGdsb2IgfSBmcm9tICdnbG9iJ1xuaW1wb3J0IHsgZmxhdFJvdXRlcyB9IGZyb20gJ3JlbWl4LWZsYXQtcm91dGVzJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IGVudk9ubHlNYWNyb3MgfSBmcm9tICd2aXRlLWVudi1vbmx5J1xuXG5jb25zdCBNT0RFID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlZcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcblx0YnVpbGQ6IHtcblx0XHRjc3NNaW5pZnk6IE1PREUgPT09ICdwcm9kdWN0aW9uJyxcblxuXHRcdHJvbGx1cE9wdGlvbnM6IHtcblx0XHRcdGV4dGVybmFsOiBbL25vZGU6LiovLCAnZnNldmVudHMnXSxcblx0XHR9LFxuXG5cdFx0YXNzZXRzSW5saW5lTGltaXQ6IChzb3VyY2U6IHN0cmluZykgPT4ge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRzb3VyY2UuZW5kc1dpdGgoJ3Nwcml0ZS5zdmcnKSB8fFxuXHRcdFx0XHRzb3VyY2UuZW5kc1dpdGgoJ2Zhdmljb24uc3ZnJykgfHxcblx0XHRcdFx0c291cmNlLmVuZHNXaXRoKCdhcHBsZS10b3VjaC1pY29uLnBuZycpXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHNvdXJjZW1hcDogdHJ1ZSxcblx0fSxcblx0c2VydmVyOiB7XG5cdFx0d2F0Y2g6IHtcblx0XHRcdGlnbm9yZWQ6IFsnKiovcGxheXdyaWdodC1yZXBvcnQvKionXSxcblx0XHR9LFxuXHR9LFxuXHRwbHVnaW5zOiBbXG5cdFx0ZW52T25seU1hY3JvcygpLFxuXHRcdC8vIGl0IHdvdWxkIGJlIHJlYWxseSBuaWNlIHRvIGhhdmUgdGhpcyBlbmFibGVkIGluIHRlc3RzLCBidXQgd2UnbGwgaGF2ZSB0b1xuXHRcdC8vIHdhaXQgdW50aWwgaHR0cHM6Ly9naXRodWIuY29tL3JlbWl4LXJ1bi9yZW1peC9pc3N1ZXMvOTg3MSBpcyBmaXhlZFxuXHRcdHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAndGVzdCdcblx0XHRcdD8gbnVsbFxuXHRcdFx0OiByZW1peCh7XG5cdFx0XHRcdFx0aWdub3JlZFJvdXRlRmlsZXM6IFsnKiovKiddLFxuXHRcdFx0XHRcdHNlcnZlck1vZHVsZUZvcm1hdDogJ2VzbScsXG5cdFx0XHRcdFx0cm91dGVzOiBhc3luYyAoZGVmaW5lUm91dGVzKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmxhdFJvdXRlcygncm91dGVzJywgZGVmaW5lUm91dGVzLCB7XG5cdFx0XHRcdFx0XHRcdGlnbm9yZWRSb3V0ZUZpbGVzOiBbXG5cdFx0XHRcdFx0XHRcdFx0Jy4qJyxcblx0XHRcdFx0XHRcdFx0XHQnKiovKi5jc3MnLFxuXHRcdFx0XHRcdFx0XHRcdCcqKi8qLnRlc3Que2pzLGpzeCx0cyx0c3h9Jyxcblx0XHRcdFx0XHRcdFx0XHQnKiovX18qLionLFxuXHRcdFx0XHRcdFx0XHRcdC8vIFRoaXMgaXMgZm9yIHNlcnZlci1zaWRlIHV0aWxpdGllcyB5b3Ugd2FudCB0byBjb2xvY2F0ZVxuXHRcdFx0XHRcdFx0XHRcdC8vIG5leHQgdG8geW91ciByb3V0ZXMgd2l0aG91dCBtYWtpbmcgYW4gYWRkaXRpb25hbFxuXHRcdFx0XHRcdFx0XHRcdC8vIGRpcmVjdG9yeS4gSWYgeW91IG5lZWQgYSByb3V0ZSB0aGF0IGluY2x1ZGVzIFwic2VydmVyXCIgb3Jcblx0XHRcdFx0XHRcdFx0XHQvLyBcImNsaWVudFwiIGluIHRoZSBmaWxlbmFtZSwgdXNlIHRoZSBlc2NhcGUgYnJhY2tldHMgbGlrZTpcblx0XHRcdFx0XHRcdFx0XHQvLyBteS1yb3V0ZS5bc2VydmVyXS50c3hcblx0XHRcdFx0XHRcdFx0XHQnKiovKi5zZXJ2ZXIuKicsXG5cdFx0XHRcdFx0XHRcdFx0JyoqLyouY2xpZW50LionLFxuXHRcdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KSxcblx0XHRwcm9jZXNzLmVudi5TRU5UUllfQVVUSF9UT0tFTlxuXHRcdFx0PyBzZW50cnlWaXRlUGx1Z2luKHtcblx0XHRcdFx0XHRkaXNhYmxlOiBNT0RFICE9PSAncHJvZHVjdGlvbicsXG5cdFx0XHRcdFx0YXV0aFRva2VuOiBwcm9jZXNzLmVudi5TRU5UUllfQVVUSF9UT0tFTixcblx0XHRcdFx0XHRvcmc6IHByb2Nlc3MuZW52LlNFTlRSWV9PUkcsXG5cdFx0XHRcdFx0cHJvamVjdDogcHJvY2Vzcy5lbnYuU0VOVFJZX1BST0pFQ1QsXG5cdFx0XHRcdFx0cmVsZWFzZToge1xuXHRcdFx0XHRcdFx0bmFtZTogcHJvY2Vzcy5lbnYuQ09NTUlUX1NIQSxcblx0XHRcdFx0XHRcdHNldENvbW1pdHM6IHtcblx0XHRcdFx0XHRcdFx0YXV0bzogdHJ1ZSxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzb3VyY2VtYXBzOiB7XG5cdFx0XHRcdFx0XHRmaWxlc1RvRGVsZXRlQWZ0ZXJVcGxvYWQ6IGF3YWl0IGdsb2IoW1xuXHRcdFx0XHRcdFx0XHQnLi9idWlsZC8qKi8qLm1hcCcsXG5cdFx0XHRcdFx0XHRcdCcuc2VydmVyLWJ1aWxkLyoqLyoubWFwJyxcblx0XHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0pXG5cdFx0XHQ6IG51bGwsXG5cdF0sXG5cdHRlc3Q6IHtcblx0XHRpbmNsdWRlOiBbJy4vYXBwLyoqLyoudGVzdC57dHMsdHN4fSddLFxuXHRcdHNldHVwRmlsZXM6IFsnLi90ZXN0cy9zZXR1cC9zZXR1cC10ZXN0LWVudi50cyddLFxuXHRcdGdsb2JhbFNldHVwOiBbJy4vdGVzdHMvc2V0dXAvZ2xvYmFsLXNldHVwLnRzJ10sXG5cdFx0cmVzdG9yZU1vY2tzOiB0cnVlLFxuXHRcdGNvdmVyYWdlOiB7XG5cdFx0XHRpbmNsdWRlOiBbJ2FwcC8qKi8qLnt0cyx0c3h9J10sXG5cdFx0XHRhbGw6IHRydWUsXG5cdFx0fSxcblx0fSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlULFNBQVMsY0FBYyxhQUFhO0FBQzdWLFNBQVMsd0JBQXdCO0FBQ2pDLFNBQVMsWUFBWTtBQUNyQixTQUFTLGtCQUFrQjtBQUMzQixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLHFCQUFxQjtBQUU5QixJQUFNLE9BQU8sUUFBUSxJQUFJO0FBRXpCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLE9BQU87QUFBQSxJQUNOLFdBQVcsU0FBUztBQUFBLElBRXBCLGVBQWU7QUFBQSxNQUNkLFVBQVUsQ0FBQyxXQUFXLFVBQVU7QUFBQSxJQUNqQztBQUFBLElBRUEsbUJBQW1CLENBQUMsV0FBbUI7QUFDdEMsVUFDQyxPQUFPLFNBQVMsWUFBWSxLQUM1QixPQUFPLFNBQVMsYUFBYSxLQUM3QixPQUFPLFNBQVMsc0JBQXNCLEdBQ3JDO0FBQ0QsZUFBTztBQUFBLE1BQ1I7QUFBQSxJQUNEO0FBQUEsSUFFQSxXQUFXO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ04sU0FBUyxDQUFDLHlCQUF5QjtBQUFBLElBQ3BDO0FBQUEsRUFDRDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsY0FBYztBQUFBO0FBQUE7QUFBQSxJQUdkLFFBQVEsSUFBSSxhQUFhLFNBQ3RCLE9BQ0EsTUFBTTtBQUFBLE1BQ04sbUJBQW1CLENBQUMsTUFBTTtBQUFBLE1BQzFCLG9CQUFvQjtBQUFBLE1BQ3BCLFFBQVEsT0FBTyxpQkFBaUI7QUFDL0IsZUFBTyxXQUFXLFVBQVUsY0FBYztBQUFBLFVBQ3pDLG1CQUFtQjtBQUFBLFlBQ2xCO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBTUE7QUFBQSxZQUNBO0FBQUEsVUFDRDtBQUFBLFFBQ0QsQ0FBQztBQUFBLE1BQ0Y7QUFBQSxJQUNELENBQUM7QUFBQSxJQUNILFFBQVEsSUFBSSxvQkFDVCxpQkFBaUI7QUFBQSxNQUNqQixTQUFTLFNBQVM7QUFBQSxNQUNsQixXQUFXLFFBQVEsSUFBSTtBQUFBLE1BQ3ZCLEtBQUssUUFBUSxJQUFJO0FBQUEsTUFDakIsU0FBUyxRQUFRLElBQUk7QUFBQSxNQUNyQixTQUFTO0FBQUEsUUFDUixNQUFNLFFBQVEsSUFBSTtBQUFBLFFBQ2xCLFlBQVk7QUFBQSxVQUNYLE1BQU07QUFBQSxRQUNQO0FBQUEsTUFDRDtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1gsMEJBQTBCLE1BQU0sS0FBSztBQUFBLFVBQ3BDO0FBQUEsVUFDQTtBQUFBLFFBQ0QsQ0FBQztBQUFBLE1BQ0Y7QUFBQSxJQUNELENBQUMsSUFDQTtBQUFBLEVBQ0o7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNMLFNBQVMsQ0FBQywwQkFBMEI7QUFBQSxJQUNwQyxZQUFZLENBQUMsaUNBQWlDO0FBQUEsSUFDOUMsYUFBYSxDQUFDLCtCQUErQjtBQUFBLElBQzdDLGNBQWM7QUFBQSxJQUNkLFVBQVU7QUFBQSxNQUNULFNBQVMsQ0FBQyxtQkFBbUI7QUFBQSxNQUM3QixLQUFLO0FBQUEsSUFDTjtBQUFBLEVBQ0Q7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
