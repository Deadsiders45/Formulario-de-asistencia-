import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Next bloquea por defecto las peticiones desde otros orígenes a los assets y
   * endpoints de desarrollo. Ya permite `localhost` y el hostname con el que
   * arrancó el servidor, pero la IP de la red local necesita una entrada.
   *
   * El matching es solo sobre el hostname de las cabeceras `Origin` o
   * `Referer`: se ignoran esquema, puerto, ruta y query. El `*` equivale a
   * exactamente una etiqueta, por eso se escribe `192.168.0.*` y no `192.168.*`.
   *
   * La IP se incluye como comodín porque cambia con el DHCP del router.
   * Solo aplica en desarrollo; en producción Next la ignora.
   */
  allowedDevOrigins: ["192.168.0.41", "192.168.0.*"],
};

export default nextConfig;
