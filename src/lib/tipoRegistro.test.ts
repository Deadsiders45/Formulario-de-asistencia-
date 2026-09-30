import { describe, expect, it } from "vitest";
import {
  TipoRegistro,
  aTipoFormulario,
  aTipoPrisma,
} from "./tipoRegistro";

describe("conversión de tipo de registro", () => {
  it("pasa el tipo del formulario al enum de Prisma", () => {
    expect(aTipoPrisma("trabajador")).toBe(TipoRegistro.TRABAJADOR);
    expect(aTipoPrisma("visitante")).toBe(TipoRegistro.VISITANTE);
  });

  it("devuelve el enum al tipo del formulario", () => {
    expect(aTipoFormulario(TipoRegistro.TRABAJADOR)).toBe("trabajador");
    expect(aTipoFormulario(TipoRegistro.VISITANTE)).toBe("visitante");
  });

  it("la conversión ida y vuelta conserva el valor", () => {
    for (const tipo of ["trabajador", "visitante"] as const) {
      expect(aTipoFormulario(aTipoPrisma(tipo))).toBe(tipo);
    }
  });
});
