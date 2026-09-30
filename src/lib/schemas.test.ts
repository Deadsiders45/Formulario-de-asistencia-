import { describe, expect, it } from "vitest";
import { registroSchema, type RegistroInput } from "./schemas";

/** Datos válidos de un trabajador, para variar un campo en cada test. */
const trabajadorValido = {
  tipo: "trabajador",
  nombre: "Ana María López",
  documento: "1234567890",
  telefono: "3001234567",
  horaSalida: "",
  consentimiento: true,
  web: "",
} satisfies RegistroInput;

describe("esquema del formulario", () => {
  it("acepta un trabajador válido sin visitaA", () => {
    const resultado = registroSchema.safeParse(trabajadorValido);
    expect(resultado.success).toBe(true);
  });

  it("acepta un visitante válido con visitaA", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      tipo: "visitante",
      visitaA: "Carlos Pérez",
    });
    expect(resultado.success).toBe(true);
  });

  it("exige visitaA para visitante", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      tipo: "visitante",
    });
    expect(resultado.success).toBe(false);
  });

  it("acepta visitaA de 2 caracteres como inválida, no la ignora", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      tipo: "visitante",
      visitaA: "Jo",
    });
    expect(resultado.success).toBe(false);
  });

  it("ignora visitaA para trabajador", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      tipo: "trabajador",
      visitaA: "Carlos Pérez",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).not.toHaveProperty("visitaA");
    }
  });

  it("no acepta tipo inválido ni ausente", () => {
    expect(
      registroSchema.safeParse({ ...trabajadorValido, tipo: "invitado" }).success,
    ).toBe(false);
    const sinTipo: Record<string, unknown> = { ...trabajadorValido };
    delete sinTipo.tipo;
    expect(registroSchema.safeParse(sinTipo).success).toBe(false);
  });

  it("no acepta fecha, horaIngreso, estadoCorreo ni creadoEn", () => {
    // Si alguno existiera en el esquema, Zod los dejaría pasar.
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      fecha: "2026-09-29",
      horaIngreso: "2026-09-29T08:00:00",
      estadoCorreo: "ENVIADO",
      creadoEn: "2026-09-29T08:00:00",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).not.toHaveProperty("fecha");
      expect(resultado.data).not.toHaveProperty("horaIngreso");
      expect(resultado.data).not.toHaveProperty("estadoCorreo");
      expect(resultado.data).not.toHaveProperty("creadoEn");
    }
  });
});

describe("consentimiento", () => {
  it("debe ser true", () => {
    expect(
      registroSchema.safeParse({ ...trabajadorValido, consentimiento: false })
        .success,
    ).toBe(false);
    expect(
      registroSchema.safeParse({ ...trabajadorValido, consentimiento: undefined })
        .success,
    ).toBe(false);
  });

  it("el mensaje dice que hay que autorizar", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      consentimiento: false,
    });
    expect(resultado.error?.issues[0].message).toContain("autorizar");
  });
});

describe("telefono", () => {
  it("normaliza espacios y guiones", () => {
    for (const entrada of ["300 123 4567", "300-123-4567"]) {
      const resultado = registroSchema.safeParse({
        ...trabajadorValido,
        telefono: entrada,
      });
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.telefono).toBe("3001234567");
      }
    }
  });

  it("rechaza el prefijo +57", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      telefono: "+57 300 1234567",
    });
    expect(resultado.success).toBe(false);
    expect(
      resultado.error?.issues.find((i) => i.path[0] === "telefono")?.message,
    ).toBe("Escribe los 10 dígitos de tu celular, sin el +57");
  });

  it("rechaza letras", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      telefono: "300abc4567",
    });
    expect(resultado.success).toBe(false);
  });

  it("rechaza 9 y 11 dígitos", () => {
    for (const telefono of ["300123456", "30012345678"]) {
      expect(
        registroSchema.safeParse({ ...trabajadorValido, telefono }).success,
      ).toBe(false);
    }
  });
});

describe("documento", () => {
  it("normaliza puntos y espacios", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      documento: "1.234.567.890",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.documento).toBe("1234567890");
    }
  });

  it("acepta 6 y 10 dígitos, los dos extremos", () => {
    for (const documento of ["123456", "1234567890"]) {
      expect(
        registroSchema.safeParse({ ...trabajadorValido, documento }).success,
      ).toBe(true);
    }
  });

  it("rechaza letras, 5 y 11 dígitos", () => {
    for (const documento of ["12a456", "12345", "12345678901"]) {
      expect(
        registroSchema.safeParse({ ...trabajadorValido, documento }).success,
      ).toBe(false);
    }
  });

  it("el mensaje dice cómo corregir", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      documento: "abc",
    });
    const mensaje = resultado.error?.issues.find(
      (i) => i.path[0] === "documento",
    )?.message;
    expect(mensaje).toContain("solo los números");
    expect(mensaje).toContain("sin puntos");
  });
});

describe("nombre", () => {
  it("recorta espacios sobrantes", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      nombre: "  Ana María López  ",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.nombre).toBe("Ana María López");
    }
  });

  it("rechaza un nombre de menos de 3 caracteres", () => {
    expect(
      registroSchema.safeParse({ ...trabajadorValido, nombre: "  An  " }).success,
    ).toBe(false);
  });
});

describe("horaSalida", () => {
  it("trata el string vacío como ausente", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      horaSalida: "",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.horaSalida).toBeUndefined();
    }
  });

  it("acepta las horas cercanas a medianoche", () => {
    for (const horaSalida of ["00:00", "23:59", "09:05", "12:00"]) {
      const resultado = registroSchema.safeParse({
        ...trabajadorValido,
        horaSalida,
      });
      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.horaSalida).toBe(horaSalida);
      }
    }
  });

  it("rechaza horas fuera de rango o mal formadas", () => {
    for (const horaSalida of ["24:00", "7:30", "12:60", "23:59:00", "abc"]) {
      expect(
        registroSchema.safeParse({ ...trabajadorValido, horaSalida }).success,
      ).toBe(false);
    }
  });

  it("el mensaje dice el formato esperado", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      horaSalida: "7:30",
    });
    const mensaje = resultado.error?.issues.find(
      (i) => i.path[0] === "horaSalida",
    )?.message;
    expect(mensaje).toContain("HH:MM");
  });
});

describe("honeypot", () => {
  it("acepta el campo trampa vacío", () => {
    expect(registroSchema.safeParse(trabajadorValido).success).toBe(true);
  });

  it("deja pasar el campo trampa lleno para que el servidor lo descarte", () => {
    const resultado = registroSchema.safeParse({
      ...trabajadorValido,
      web: "http://spam.example",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.web).toBe("http://spam.example");
    }
  });
});