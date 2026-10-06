// Los tests escriben en la base real, así que necesitan las variables de entorno.
import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

// El formulario se usa desde el celular escaneando el QR,
// así que las pruebas corren en viewport de móvil.
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const esProduccion = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  // Los tests escriben en la base real (crean y borran registros de prueba).
  // Nunca deben correr contra producción.
  globalSetup: esProduccion ? "./e2e/bloquear-produccion.ts" : undefined,
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
    // Los tests e2e no deben enviar correos reales ni a la encargada ni a nadie.
    // El objeto `env` del proceso hijo sobrescribe el entorno, así que este
    // valor gana sobre el que pueda tener el `.env`.
    env: { ...process.env, MAIL_MODE: "test" },
  },
});
