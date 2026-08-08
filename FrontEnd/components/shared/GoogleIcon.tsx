interface GoogleIconProps {
  className?: string;
}

export default function GoogleIcon({ className }: GoogleIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.51h3.15c1.84-1.69 2.9-4.18 2.9-7.28Z"
      />
      <path
        fill="#34A853"
        d="M12 21.74c2.63 0 4.84-.87 6.45-2.23L15.3 17c-.87.58-1.98.92-3.3.92-2.54 0-4.69-1.72-5.46-4.02H3.29v2.59A9.75 9.75 0 0 0 12 21.74Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.9a5.87 5.87 0 0 1 0-3.8V7.51H3.29a9.75 9.75 0 0 0 0 8.98l3.25-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.08c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.18 14.62 2.26 12 2.26a9.75 9.75 0 0 0-8.71 5.25l3.25 2.59C7.31 7.8 9.46 6.08 12 6.08Z"
      />
    </svg>
  );
}
