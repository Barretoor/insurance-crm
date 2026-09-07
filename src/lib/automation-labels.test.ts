import { describe, expect, it } from "vitest";
import { renderTemplate } from "./automation-labels";

describe("renderTemplate", () => {
  it("substitutes known variables", () => {
    expect(renderTemplate("Hola {nombre}!", { nombre: "Ana" })).toBe("Hola Ana!");
  });

  it("substitutes multiple variables", () => {
    expect(
      renderTemplate("Hola {nombre}, tu póliza renueva el {fecha_renovacion}.", {
        nombre: "Ana",
        fecha_renovacion: "15 ene 2026",
      })
    ).toBe("Hola Ana, tu póliza renueva el 15 ene 2026.");
  });

  it("replaces an unknown/missing variable with an empty string", () => {
    expect(renderTemplate("Hola {nombre}, {no_existe}!", { nombre: "Ana" })).toBe(
      "Hola Ana, !"
    );
  });

  it("leaves text without variables unchanged", () => {
    expect(renderTemplate("Mensaje fijo sin variables.", {})).toBe(
      "Mensaje fijo sin variables."
    );
  });

  it("substitutes repeated occurrences of the same variable", () => {
    expect(renderTemplate("{nombre} {nombre}", { nombre: "Ana" })).toBe("Ana Ana");
  });
});
