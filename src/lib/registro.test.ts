import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();

vi.mock("./db", () => ({
  prisma: {
    registro: {
      create: (...args: unknown[]) => create(...args),
    },
  },
}));

const { guardarRegistro } = await import("./registro");
const { registroSchema } = await import("./schemas");
const { TipoRegistro } = await import("./tipoRegistro");

/** Datos ya validados por el esquema, como los recibe `registro.ts`. */
function datosValidos(extra: Record<string, unknown> = {}) {
  return registroSchema.parse({
    tipo: "trabajador",
    nombre: "Ana María López",
    documento: "1234567890",
    telefono: "3001234567",
    horaIngreso: "08:00",
    horaSalida: "",
    consentimiento: true,
    campoTrampa: "",
    ...extra,
  });
}

/** Instantes en UTC que corresponden a una hora dada en Bogotá (UTC-5). */
function instanteDeHora(hora: string): Date {
  const [h, m] = hora.split(":").map(Number);
  const base = new Date("2026-09-30T00:00:00Z");
  base.setUTCHours((h ?? 0) + 5, m ?? 0, 0, 0);
  return base;
}

beforeEach(() => {
  create.mockReset();
  create.mockResolvedValue({ id: "registro-de-prueba" });
});

describe("guardarRegistro", () => {
  it("guarda la fecha como Date ISO, no como texto", async () => {
    await guardarRegistro(datosValidos(), instanteDeHora("08:21"));
    const fecha = create.mock.calls[0]![0].data.fecha as Date;
    expect(fecha).toBeInstanceOf(Date);
    expect(fecha.toISOString()).toBe("2026-09-30T00:00:00.000Z");
  });

  it("devuelve la hora de diligenciamiento, no la hora de ingreso", async () => {
    // La persona escribió 08:00, pero se diligenció a las 08:21.
    const resultado = await guardarRegistro(datosValidos(), instanteDeHora("08:21"));

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.hora).toBe("08:21");
      expect(resultado.fecha).toBe("2026-09-30");
    }
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("guarda la hora de ingreso tal como la escribió la persona", async () => {
    await guardarRegistro(
      datosValidos({ horaIngreso: "07:45" }),
      instanteDeHora("08:21"),
    );
    // Texto plano, no una fecha: la persona escribe HH:MM.
    expect(create.mock.calls[0]![0].data.horaIngreso).toBe("07:45");
  });

  it("convierte el tipo con el enum de Prisma", async () => {
    await guardarRegistro(datosValidos(), instanteDeHora("08:00"));
    expect(create.mock.calls[0]![0].data.tipo).toBe(TipoRegistro.TRABAJADOR);

    create.mockClear();
    await guardarRegistro(
      datosValidos({ tipo: "visitante", visitaA: "Carlos Pérez" }),
      instanteDeHora("08:00"),
    );
    expect(create.mock.calls[0]![0].data.tipo).toBe(TipoRegistro.VISITANTE);
  });

  it("guarda la persona a quien visita solo para visitante", async () => {
    await guardarRegistro(
      datosValidos({ tipo: "visitante", visitaA: "Carlos Pérez" }),
      instanteDeHora("08:00"),
    );
    expect(create.mock.calls[0]![0].data.visitaA).toBe("Carlos Pérez");

    create.mockClear();
    await guardarRegistro(datosValidos(), instanteDeHora("08:00"));
    expect(create.mock.calls[0]![0].data.visitaA).toBeNull();
  });

  it("deja horaSalida en null cuando no se indica", async () => {
    await guardarRegistro(datosValidos(), instanteDeHora("08:00"));
    expect(create.mock.calls[0]![0].data.horaSalida).toBeNull();
  });

  it("no manda estadoCorreo: lo pone el default del modelo", async () => {
    await guardarRegistro(datosValidos(), instanteDeHora("08:00"));
    expect(create.mock.calls[0]![0].data).not.toHaveProperty("estadoCorreo");
  });

  it("traduce un fallo de Prisma sin filtrar detalles", async () => {
    const secreto = "postgresql://usuario:clave@host.1234/db";
    create.mockRejectedValue(
      Object.assign(new Error(`Fallo al conectar con ${secreto}`), {
        code: "P1001",
      }),
    );

    const resultado = await guardarRegistro(datosValidos(), instanteDeHora("08:00"));

    expect(resultado.ok).toBe(false);
    if (!resultado.ok && "errorGeneral" in resultado) {
      expect(resultado.errorGeneral).toContain("No pudimos guardar");
      expect(resultado.errorGeneral).not.toContain(secreto);
      expect(resultado.errorGeneral).not.toContain("P1001");
    }
  });
});