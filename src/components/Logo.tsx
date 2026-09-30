"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Logo de la empresa, 56 px de alto y centrado, según docs/diseno.md.
 * Si el archivo no carga, se muestra el nombre como texto.
 */
export function Logo() {
  const [fallo, setFallo] = useState(false);

  if (fallo) {
    return (
      <p className="text-center text-lg font-semibold text-foreground">
        TranSuperior S.A.S.
      </p>
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="TranSuperior S.A.S."
      width={56}
      height={56}
      onError={() => setFallo(true)}
      className="mx-auto h-14 w-14 object-contain"
      priority
    />
  );
}
