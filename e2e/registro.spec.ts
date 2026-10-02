import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { prisma } from "@/lib/db";

/**
 * Datos reservados para los tests: el prefijo en `nombre` y el documento
 * 9999999999 nunca los usa una persona real. La limpieza exige LAS DOS
 * condiciones, así que nunca toca un registro de una persona.
 */
const DOCUMENTO_E2E = "9999999999";
const PREFIJO = "E2E-";

/** Horas fijas: las escribe la persona, así que no dependen del reloj. */
const HORA_INGRESO = "08:00";
const HORA_SALIDA = "17:30";
const HORA_SALIDA_INVALIDA = "07:00";

const marca = () => `${PREFIJO}${Date.now()}`;

const filtroE2E = {
  nombre: { startsWith: PREFIJO },
  documento: DOCUMENTO_E2E,
};

async function borrarSobrantes() {
  await prisma.registro.deleteMany({ where: filtroE2E });
}

async function llenarComunes(page: Page, nombre: string) {
  await page.getByLabel("Nombre y apellidos").fill(nombre);
  await page.getByLabel("Cédula de ciudadanía").fill(DOCUMENTO_E2E);
  await page.getByLabel("Teléfono (celular)").fill("300 123 4567");
  await page.getByLabel("Hora de ingreso").fill(HORA_INGRESO);
}

function enviar(page: Page) {
  return page.getByRole("button", { name: "Registrar asistencia" }).click();
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

    await expect(page.getByText("Registro de visitante")).toBeVisible();

    await llenarComunes(page, nombre);
    await page.getByLabel("Persona a quien visita").fill("Carlos Pérez");
    await page.getByLabel(/Acepto la política/).check();
    await enviar(page);

    await page.waitForURL(/\/gracias/);
    await expect(
      page.getByRole("heading", { name: "Tu asistencia fue registrada" }),
    ).toBeVisible();

    // El formato es HH:MM; el valor exacto depende de la hora del servidor.
    await expect(page.getByText(/^([01]\d|2[0-3]):[0-5]\d$/)).toBeVisible();

    const guardado = await prisma.registro.findFirst({ where: filtroE2E });
    expect(guardado, "el registro debe quedar guardado").not.toBeNull();
    expect(guardado?.estadoCorreo).toBe("PENDIENTE");
    expect(guardado?.visitaA).toBe("Carlos Pérez");
  });

  test("un trabajador se guarda sin visitaA y con el teléfono normalizado", async ({ page }) => {
    const nombre = marca();
    await page.goto("/?tipo=trabajador");

    await expect(page.getByText("Registro de trabajador")).toBeVisible();
    await expect(page.getByLabel("Persona a quien visita")).toHaveCount(0);

    await llenarComunes(page, nombre);
    await page.getByLabel(/Acepto la política/).check();
    await enviar(page);

    await page.waitForURL(/\/gracias/);
    await expect(
      page.getByRole("heading", { name: "Tu asistencia fue registrada" }),
    ).toBeVisible();

    const guardado = await prisma.registro.findFirst({
      where: { ...filtroE2E, nombre },
    });
    expect(guardado, "el registro debe quedar guardado").not.toBeNull();
    expect(guardado?.visitaA).toBeNull();
    // Se escribió "300 123 4567"; se guardan solo los 10 dígitos.
    expect(guardado?.telefono).toBe("3001234567");
    expect(guardado?.horaSalida).toBeNull();
  });

  test("guarda las horas de ingreso y salida tal como las escribió la persona", async ({
    page,
  }) => {
    const nombre = marca();
    await page.goto("/?tipo=trabajador");
    await llenarComunes(page, nombre);
    await page.getByLabel("Hora de salida estimada (opcional)").fill(HORA_SALIDA);
    await page.getByLabel(/Acepto la política/).check();
    await enviar(page);

    await page.waitForURL(/\/gracias/);
    const guardado = await prisma.registro.findFirst({
      where: { ...filtroE2E, nombre },
    });
    expect(guardado?.horaIngreso).toBe(HORA_INGRESO);
    expect(guardado?.horaSalida).toBe(HORA_SALIDA);
  });

  test("rechaza una hora de salida que no es posterior al ingreso", async ({ page }) => {
    const nombre = marca();
    await page.goto("/?tipo=trabajador");
    await llenarComunes(page, nombre);
    await page
      .getByLabel("Hora de salida estimada (opcional)")
      .fill(HORA_SALIDA_INVALIDA);
    await page.getByLabel(/Acepto la política/).check();
    await enviar(page);

    await expect(page.locator("#horaSalida-error")).toContainText(
      "debe ser posterior a la de ingreso",
    );
    await expect(page).toHaveURL(/\/\?/);

    const guardado = await prisma.registro.findFirst({
      where: { ...filtroE2E, nombre },
    });
    expect(guardado).toBeNull();
  });

  test("exige la hora de ingreso", async ({ page }) => {
    const nombre = marca();
    await page.goto("/?tipo=trabajador");
    await page.getByLabel("Nombre y apellidos").fill(nombre);
    await page.getByLabel("Cédula de ciudadanía").fill(DOCUMENTO_E2E);
    await page.getByLabel("Teléfono (celular)").fill("300 123 4567");
    await page.getByLabel(/Acepto la política/).check();
    await enviar(page);

    await expect(page.locator("#horaIngreso-error")).toContainText(
      "Escribe la hora de ingreso",
    );
    await expect(page).toHaveURL(/\/\?/);

    const guardado = await prisma.registro.findFirst({
      where: { ...filtroE2E, nombre },
    });
    expect(guardado).toBeNull();
  });

  test("el envío con la hora de salida vacía la deja en null", async ({ page }) => {
    const nombre = marca();
    await page.goto("/?tipo=trabajador");
    await llenarComunes(page, nombre);
    await page.getByLabel("Hora de salida estimada (opcional)").fill("");
    await page.getByLabel(/Acepto la política/).check();
    await enviar(page);

    await page.waitForURL(/\/gracias/);
    const guardado = await prisma.registro.findFirst({
      where: { ...filtroE2E, nombre },
    });
    expect(guardado?.horaSalida).toBeNull();
  });

  test("el doble clic no crea dos registros", async ({ page }) => {
    const nombre = marca();
    await page.goto("/?tipo=trabajador");
    await llenarComunes(page, nombre);
    await page.getByLabel(/Acepto la política/).check();

    const boton = page.getByRole("button", { name: "Registrar asistencia" });
    // Un clic normal: comprueba primero que el botón se deshabilita durante el envío.
    await boton.click();
    await expect(page.getByRole("button", { name: "Enviando…" })).toBeDisabled();
    await page.waitForURL(/\/gracias/, { timeout: 15_000 });

    // Ahora el doble clic de verdad, sobre un formulario limpio.
    await page.goto("/?tipo=trabajador");
    const nombre2 = marca();
    await llenarComunes(page, nombre2);
    await page.getByLabel(/Acepto la política/).check();
    await page.getByRole("button", { name: "Registrar asistencia" }).dblclick();
    await page.waitForURL(/\/gracias/, { timeout: 15_000 });

    const guardadosDoble = await prisma.registro.findMany({
      where: { ...filtroE2E, nombre: nombre2 },
    });
    expect(guardadosDoble, "el doble clic no debe crear dos registros").toHaveLength(1);

    const guardados = await prisma.registro.findMany({
      where: { ...filtroE2E, nombre },
    });
    expect(guardados, "un solo envío debe crear un registro").toHaveLength(1);
    expect(guardados[0]?.nombre).toBe(nombre);
  });

  test("no muestra el campo de fecha y sí el de hora de ingreso", async ({ page }) => {
    await page.goto("/?tipo=trabajador");
    await expect(page.getByText("Registro de trabajador")).toBeVisible();

    // La hora de ingreso la escribe la persona: tiene que estar visible.
    await expect(page.getByLabel("Hora de ingreso")).toBeVisible();
    await expect(page.getByLabel("Hora de salida estimada (opcional)")).toBeVisible();

    // La fecha la pone el servidor: no se pide.
    await expect(page.getByText(/^Fecha/)).toHaveCount(0);
    await expect(page.locator('input[type="date"]')).toHaveCount(0);
  });

  test("sin marcar la casilla de autorización no se guarda nada", async ({ page }) => {
    const nombre = marca();
    await page.goto("/?tipo=trabajador");

    await llenarComunes(page, nombre);
    await enviar(page);

    await expect(page.locator("#consentimiento-error")).toContainText(
      "Debes autorizar el tratamiento de tus datos personales",
    );
    await expect(page).toHaveURL(/\/\?/);

    const guardado = await prisma.registro.findFirst({
      where: { ...filtroE2E, nombre },
    });
    expect(guardado).toBeNull();
  });

  test("sin el parámetro tipo aparece el selector", async ({ page }) => {
    await page.goto("/");

    const selector = page.getByRole("group", { name: "Tipo de registro" });
    await expect(selector).toBeVisible();
    await expect(page.getByRole("radio", { name: "Trabajador" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Visitante" })).toBeVisible();

    await page.getByRole("radio", { name: "Visitante" }).check();
    await expect(page.getByLabel("Persona a quien visita")).toBeVisible();
  });

  test("con un tipo inválido aparece el selector", async ({ page }) => {
    await page.goto("/?tipo=INVITADO");
    await expect(page.getByRole("group", { name: "Tipo de registro" })).toBeVisible();
    await expect(page.getByLabel("Persona a quien visita")).toHaveCount(0);
  });

  test("el tipo en mayúsculas desde el QR se reconoce", async ({ page }) => {
    await page.goto("/?tipo=VISITANTE");
    await expect(page.getByText("Registro de visitante")).toBeVisible();
    await expect(page.getByLabel("Persona a quien visita")).toBeVisible();
  });

  test("el campo trampa llega vacío cuando llena una persona", async ({ page }) => {
    await page.goto("/?tipo=trabajador");

    const trampa = page.locator("#campoTrampa");
    await expect(trampa).toHaveCount(1);
    await expect(trampa).toHaveValue("");
    await expect(trampa).toHaveAttribute("tabindex", "-1");
  });

  test("un teléfono inválido muestra un error que dice cómo corregir", async ({ page }) => {
    await page.goto("/?tipo=trabajador");

    await page.getByLabel("Nombre y apellidos").fill(marca());
    await page.getByLabel("Cédula de ciudadanía").fill(DOCUMENTO_E2E);
    await page.getByLabel("Teléfono (celular)").fill("123");
    await page.getByLabel(/Acepto la política/).check();
    await enviar(page);

    await expect(page.locator("#telefono-error")).toContainText(
      "Escribe los 10 dígitos de tu celular, sin el +57",
    );
    await expect(page).toHaveURL(/\/\?/);
  });

  test("si se cae la red avisa y conserva lo que la persona escribió", async ({ page }) => {
    const nombre = marca();
    // Se aborta la petición de la Server Action antes de que llegue al servidor.
    await page.route("**/*", async (ruta) => {
      const peticion = ruta.request();
      if (peticion.method() === "POST") {
        await ruta.abort("failed");
        return;
      }
      await ruta.continue();
    });

    await page.goto("/?tipo=trabajador");
    await llenarComunes(page, nombre);
    await page.getByLabel(/Acepto la política/).check();
    await enviar(page);

    await expect(page.getByText("No pudimos enviar tus datos")).toBeVisible();
    // Nada de lo escrito se pierde.
    await expect(page.getByLabel("Nombre y apellidos")).toHaveValue(nombre);
    await expect(page.getByLabel("Cédula de ciudadanía")).toHaveValue(DOCUMENTO_E2E);
    await expect(page.getByLabel("Teléfono (celular)")).toHaveValue("300 123 4567");
    await expect(page).toHaveURL(/\/\?/);
  });
});

test.describe("accesibilidad", () => {
  /** Falla si hay violaciones de impacto critical o serious. */
  async function sinViolacionesGraves(page: Page, contexto: string) {
    const resultados = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Si Axe no corriera, `violations` estaría vacío y la prueba pasaría sin
    // revisar nada. Se afirma que sí se evaluaron nodos.
    expect(
      resultados.passes.length + resultados.violations.length,
      `Axe no evaluó ningún nodo en ${contexto}`,
    ).toBeGreaterThan(0);

    const graves = resultados.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    const ids = resultados.violations.map((v) => `[${v.impact}] ${v.id}`).join(", ");
    console.log(
      `Axe en ${contexto}: ${resultados.violations.length} violaciones (${ids || "ninguna"}), ${resultados.passes.length} reglas ok`,
    );

    if (graves.length > 0) {
      const detalle = graves
        .map((v) => `  - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodos)`)
        .join("\n");
      throw new Error(`Violaciones graves en ${contexto}:\n${detalle}`);
    }
  }

  test("el formulario vacío no tiene violaciones graves", async ({ page }) => {
    await page.goto("/?tipo=visitante");
    await sinViolacionesGraves(page, "formulario vacío");
  });

  test("el formulario con errores visibles no tiene violaciones graves", async ({ page }) => {
    await page.goto("/?tipo=visitante");
    await page.getByRole("button", { name: "Registrar asistencia" }).click();
    await expect(page.locator("#visitaA-error")).toBeVisible();
    await sinViolacionesGraves(page, "formulario con errores");
  });

  test("la página de gracias no tiene violaciones graves", async ({ page }) => {
    await page.goto("/gracias?hora=08%3A21");
    await sinViolacionesGraves(page, "página de gracias");
  });
});
