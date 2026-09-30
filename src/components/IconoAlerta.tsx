/** Icono de alerta. Decorativo: el mensaje de error ya dice qué corregir. */
export function IconoAlerta({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM10 5a.9.9 0 0 1 .9.9v4.2a.9.9 0 0 1-1.8 0V5.9A.9.9 0 0 1 10 5Zm0 8.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
