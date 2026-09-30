import { defineConfig, devices } from "@playwright/test";

// El formulario se usa desde el celular escaneando el QR,
// así que las pruebas corren en viewport de móvil.
const MOBILE_VIEWPORT = { width: 390, height: 844 };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
        viewport: MOBILE_VIEWPORT,
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
