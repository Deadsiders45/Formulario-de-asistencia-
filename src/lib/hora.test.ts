import { describe, expect, it } from "vitest";
import {
  MENSAJE_HORA_SALIDA,
  fechaComoDate,
  fechaEnBogota,
  horaEnBogota,
  horaEsPosterior,
} from "./hora";

describe("fechaEnBogota", () => {
  it("devuelve AAAA-MM-DD", () => {
    // 2026-09-30T15:30:00Z son las 10:30 en Bogotá.
    expect(fechaEnBogota(new Date("2026-09-30T15:30:00Z"))).toBe("2026-09-30");
  });

  it("cuenta hacia atrás al cruzar la medianoche en Bogotá", () => {
    // 2026-09-30T03:30:00Z son las 22:30 del día anterior en Bogotá.
    expect(fechaEnBogota(new Date("2026-09-30T03:30:00Z"))).toBe("2026-09-29");
  });

  it("cuenta hacia adelante al pasar la medianoche en Bogotá", () => {
    // 2026-10-01T02:10:00Z son las 21:10 del 30 de septiembre en Bogotá.
    expect(fechaEnBogota(new Date("2026-10-01T02:10:00Z"))).toBe("2026-09-30");
  });
});

describe("fechaComoDate", () => {
  it("devuelve un Date a medianoche UTC con la fecha de Bogotá", () => {
    // Prisma exige un DateTime ISO completo aunque la columna sea DATE.
    const fecha = fechaComoDate(new Date("2026-09-30T15:30:00Z"));
    expect(fecha).toBeInstanceOf(Date);
    expect(fecha.toISOString()).toBe("2026-09-30T00:00:00.000Z");
  });

  it("usa la fecha de Bogotá, no la de UTC", () => {
    // En UTC es 30 de septiembre a las 03:30, pero en Bogotá todavía es el 29.
    expect(fechaComoDate(new Date("2026-09-30T03:30:00Z")).toISOString()).toBe(
      "2026-09-29T00:00:00.000Z",
    );
  });
});

describe("horaEnBogota", () => {
  it("devuelve HH:MM en 24 h", () => {
    expect(horaEnBogota(new Date("2026-09-30T15:30:00Z"))).toBe("10:30");
  });

  it("descuenta cinco horas", () => {
    expect(horaEnBogota(new Date("2026-09-30T13:05:00Z"))).toBe("08:05");
  });

  it("usa 24 h, no 12 h, para la medianoche", () => {
    expect(horaEnBogota(new Date("2026-09-30T05:00:00Z"))).toBe("00:00");
  });

  it("usa 24 h, no 12 h, para el mediodía", () => {
    expect(horaEnBogota(new Date("2026-09-30T17:00:00Z"))).toBe("12:00");
  });
});

describe("horaEsPosterior", () => {
  it("acepta una salida posterior al ingreso", () => {
    expect(horaEsPosterior("08:00", "17:30")).toBe(true);
  });

  it("rechaza una salida igual al ingreso", () => {
    expect(horaEsPosterior("08:00", "08:00")).toBe(false);
  });

  it("rechaza una salida anterior al ingreso", () => {
    expect(horaEsPosterior("08:00", "07:59")).toBe(false);
  });

  it("rechaza el cruce de medianoche", () => {
    // Entrada 23:50 con salida 00:30: la regla es estricta y se rechaza.
    expect(horaEsPosterior("23:50", "00:30")).toBe(false);
  });

  it("acepta minutos siguientes cerca de medianoche", () => {
    expect(horaEsPosterior("23:50", "23:59")).toBe(true);
  });

  it("rechaza una salida de la madrugada cuando el ingreso fue de la tarde", () => {
    // Turno nocturno: el ingreso es de la tarde, la salida de la madrugada
    // siguiente. Con la regla estricta no se puede expresar, así que se rechaza.
    expect(horaEsPosterior("00:10", "00:05")).toBe(false);
    expect(horaEsPosterior("22:00", "00:00")).toBe(false);
  });

  it("el mensaje menciona dejar el campo vacío", () => {
    expect(MENSAJE_HORA_SALIDA).toContain("posterior");
    expect(MENSAJE_HORA_SALIDA).toContain("déjala en blanco");
  });
});
