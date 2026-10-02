import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";

const guardarRegistro = vi.fn();

vi.mock("@/lib/registro", () => ({ guardarRegistro }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const { registrar } = await import("./actions");

function formDataDe(campos: Record<string, string>): FormData {
  const datos = new FormData();
  for (const [clave, valor] of Object.entries(campos)) {
    datos.append(clave, valor);
  }
  return datos;
}

const camposValidos = {
  tipo: "trabajador",
  nombre: "Ana María López",
  documento: "1.234.567.890",
  telefono: "300 123 4567",
  horaIngreso: "08:00",
  horaSalida: "",
  consentimiento: "true",
  campoTrampa: "",
};

beforeEach(() => {
  guardarRegistro.mockReset();
  guardarRegistro.mockResolvedValue({ ok: true, hora: "08:21", fecha: "2026-09-30" });
  vi.mocked(redirect).mockReset();
});

describe("registrar", () => {
  it("redirige a la página de gracias con la hora del registro", async () => {
    await registrar(formDataDe(camposValidos));

    expect(guardarRegistro).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(vi.mocked(redirect).mock.calls[0]![0]).toBe("/gracias?hora=08%3A21");
  });

  it("normaliza el teléfono antes de guardar", async () => {
    await registrar(formDataDe(camposValidos));
    expect(guardarRegistro.mock.calls[0]![0].telefono).toBe("3001234567");
  });

  it("omite los campos vacíos, sin mandar 'undefined'", async () => {
    // Sin visitaA: el texto "undefined" no debe aparecer en ninguna parte.
    await registrar(formDataDe(camposValidos));
    const enviado = guardarRegistro.mock.calls[0]![0] as Record<string, unknown>;
    expect(enviado).not.toHaveProperty("visitaA");
    for (const [campo, valor] of Object.entries(enviado)) {
      expect(valor, `el campo ${campo} no debe ser "undefined"`).not.toBe("undefined");
      expect(valor, `el campo ${campo} no debe ser "null"`).not.toBe("null");
    }
    // El campo trampa vacío sí viaja como texto vacío: es lo que espera el
    // esquema y no se guarda nada.
    expect(enviado.campoTrampa).toBe("");
  });

  it("no manda horaSalida cuando el campo viene vacío", async () => {
    await registrar(formDataDe(camposValidos));
    const enviado = guardarRegistro.mock.calls[0]![0] as Record<string, unknown>;
    expect(enviado.horaSalida).toBeUndefined();
  });

  it("guarda la hora de salida cuando viene informada", async () => {
    await registrar(formDataDe({ ...camposValidos, horaSalida: "17:30" }));
    const enviado = guardarRegistro.mock.calls[0]![0] as Record<string, unknown>;
    expect(enviado.horaSalida).toBe("17:30");
  });

  it("no redirige si los datos son inválidos", async () => {
    const resultado = await registrar(formDataDe({ ...camposValidos, telefono: "123" }));

    expect(resultado.errores?.telefono).toContain("10 dígitos");
    expect(guardarRegistro).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("rechaza el consentimiento enviado como texto vacío", async () => {
    const resultado = await registrar(formDataDe({ ...camposValidos, consentimiento: "" }));
    expect(resultado.errores?.consentimiento).toContain("autorizar");
    expect(guardarRegistro).not.toHaveBeenCalled();
  });

  it("rechaza el consentimiento ausente", async () => {
    const sinConsentimiento: Record<string, string> = { ...camposValidos };
    delete sinConsentimiento.consentimiento;

    const resultado = await registrar(formDataDe(sinConsentimiento));
    expect(resultado.errores?.consentimiento).toContain("autorizar");
    expect(guardarRegistro).not.toHaveBeenCalled();
  });

  it("rechaza 'on', el valor por defecto de un checkbox HTML", async () => {
    const resultado = await registrar(formDataDe({ ...camposValidos, consentimiento: "on" }));
    expect(resultado.errores?.consentimiento).toContain("autorizar");
    expect(guardarRegistro).not.toHaveBeenCalled();
  });

  it("solo convierte a booleano el campo consentimiento", async () => {
    await registrar(formDataDe({ ...camposValidos, consentimient2: "true" }));

    expect(guardarRegistro).toHaveBeenCalledTimes(1);
    const enviado = guardarRegistro.mock.calls[0]![0] as Record<string, unknown>;
    expect(enviado.consentimiento).toBe(true);
    expect(enviado).not.toHaveProperty("consentimient2");
  });

  it("pide la persona a quien visita cuando el tipo es visitante", async () => {
    const resultado = await registrar(formDataDe({ ...camposValidos, tipo: "visitante" }));
    expect(resultado.errores?.visitaA).toBeTruthy();
    expect(guardarRegistro).not.toHaveBeenCalled();
  });

  it("con el campo trampa lleno responde sin errores y sin guardar", async () => {
    const resultado = await registrar(
      formDataDe({ ...camposValidos, campoTrampa: "http://spam.example" }),
    );

    expect(resultado.errores).toBeUndefined();
    expect(resultado.errorGeneral).toBeUndefined();
    expect(guardarRegistro).not.toHaveBeenCalled();
  });

  it("devuelve los errores por campo de la base sin redirigir", async () => {
    guardarRegistro.mockResolvedValue({
      ok: false,
      errores: { horaSalida: "La hora de salida debe ser posterior a la de ingreso." },
    });

    const resultado = await registrar(formDataDe({ ...camposValidos, horaSalida: "07:00" }));

    expect(resultado.errores?.horaSalida).toContain("posterior");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("devuelve el mensaje genérico si falla la base", async () => {
    guardarRegistro.mockResolvedValue({
      ok: false,
      errorGeneral: "No pudimos guardar tu registro.",
    });

    const resultado = await registrar(formDataDe(camposValidos));

    expect(resultado.errorGeneral).toBe("No pudimos guardar tu registro.");
    expect(redirect).not.toHaveBeenCalled();
  });
});
