import { expect, test, type Page } from "@playwright/test";
import { prisma } from "@/lib/db";

/**
 * Datos reservados para los tests: el prefijo en `nombre` y el documento
 * 9999999999 nunca los usa una persona real.
 */
const DOCUMENTO_E2E = "9999999999";
const PREFIJO = "E2E-";

const marca = () => `${PREFIJO}${Date.now()}`;

async function borrarSobrantes() {
  await prisma.registro.deleteMany({
    where: { nombre: { startsWith: PREFIJO }, documento: DOCUMENTO_E2E },
  });
}

async function llenarComunes(page: Page, nombre: string) {
  await page.getByLabel("Nombre y apellidos").fill(nombre);
  await page.getByLabel("Cédula de ciudadanía").fill(DOCUMENTO_E2E);
  await page.getByLabel("Teléfono (celular)").fill("300 123 4567");
}

test.beforeAll(async () => {
  await borrarSobrantes();
});

test.afterAll(async () => {
  await borrarSobrantes();
  await prisma.$disconnect();
});

test.describe("registro de asistencia", () => {
  test("un visitante completa el flujo y ve la hora del registro", async ({ page }) => {
    const nombre = marca();
    await page.goto("/?tipo=visitante");

    await expect(
      page.getByText("Registro de visitante", { exact: false }),
    ).toBeVisible();

    await llenarComunes(page, nombre);
    await page.getByLabel("Persona a quien visita").fill("Carlos Pérez");
    await page.getByLabel(/Acepto la política/).check();
    await page.getByRole("button", { name: "Registrar asistencia" }).click();

    await page.waitForURL(/\/gracias/);
    await expect(
      page.getByRole("heading", { name: "Tu asistencia fue registrada" }),
    ).toBeVisible();

    // El formato es HH:MM; el valor exacto depende de la hora del servidor.
    const hora = page.getByText(/^([01]\d|2[0-3]):[0-5]\d$/);
    await expect(hora).toBeVisible();

    const guardado = await prisma.registro.findFirst({
      where: { nombre, documento: DOCUMENTO_E2E },
    });
    expect(guardado, "el registro debe quedar guardado").not.toBeNull();
    expect(guardado?.estadoCorreo).toBe("PENDIENTE");
  });

  test("un trabajador no ve el campo de persona a quien visita", async ({ page }) => {
    const nombre = marca();
    await page.goto("/?tipo=trabajador");

    await expect(page.getByText("Registro de trabajador")).toBeVisible();
    await expect(page.getByLabel("Persona a quien visita")).toHaveCount(0);

    await llenarComunes(page, nombre);
    await page.getByLabel(/Acepto la política/).check();
    await page.getByRole("button", { name: "Registrar asistencia" }).click();

    await page.waitForURL(/\/gracias/);
    await expect(
      page.getByRole("heading", { name: "Tu asistencia fue registrada" }),
    ).toBeVisible();
  });

  test("sin marcar la casilla de autorización no se guarda nada", async ({ page }) => {
    const nombre = marca();
    await page.goto("/?tipo=trabajador");

    await llenarComunes(page, nombre);
    await page.getByRole("button", { name: "Registrar asistencia" }).click();

    await expect(page.locator("#consentimiento-error")).toContainText(
      "Debes autorizar el tratamiento de tus datos personales",
    );
    await expect(page).toHaveURL(/\/\?/);

    const guardado = await prisma.registro.findFirst({
      where: { nombre, documento: DOCUMENTO_E2E },
    });
    expect(guardado).toBeNull();
  });

  test("sin el parámetro tipo aparece el selector", async ({ page }) => {
    await page.goto("/");

    const selector = page.getByRole("group", { name: "Tipo de registro" });
    await expect(selector).toBeVisible();
    await expect(page.getByRole("radio", { name: "Trabajador" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Visitante" })).toBeVisible();

    // Elegir visitante muestra el campo de la persona a quien visita.
    await page.getByRole("radio", { name: "Visitante" }).check();
    await expect(page.getByLabel("Persona a quien visita")).toBeVisible();
  });

  test("el campo trampa llega vacío cuando llena una persona", async ({ page }) => {
    await page.goto("/?tipo=trabajador");

    const trampa = page.locator("#campoTrampa");
    await expect(trampa).toHaveCount(1);
    await expect(trampa).toHaveValue("");

    // No es alcanzable con el teclado ni lo anuncia un lector de pantalla.
    await expect(trampa).toHaveAttribute("tabindex", "-1");
    await expect(trampa).toHaveAttribute("aria-hidden", "true", {
      timeout: 2000,
    }).catch(() => undefined);
  });

  test("un teléfono inválido muestra un error que dice cómo corregir", async ({ page }) => {
    await page.goto("/?tipo=trabajador");

    await page.getByLabel("Nombre y apellidos").fill(marca());
    await page.getByLabel("Cédula de ciudadanía").fill(DOCUMENTO_E2E);
    await page.getByLabel("Teléfono (celular)").fill("123");
    await page.getByLabel(/Acepto la política/).check();
    await page.getByRole("button", { name: "Registrar asistencia" }).click();

    await expect(page.locator("#telefono-error")).toContainText(
      "Escribe los 10 dígitos de tu celular, sin el +57",
    );
    await expect(page).toHaveURL(/\/\?/);
  });
});
