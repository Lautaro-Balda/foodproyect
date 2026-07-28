import type { ReactNode } from "react";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.ComponentProps<"input">) {
  return <input className={inputClass} {...props} />;
}

export function SelectInput(props: React.ComponentProps<"select">) {
  return <select className={inputClass} {...props} />;
}

export function SubmitButton({
  children,
  variant = "primary",
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
}) {
  const variants = {
    primary:
      "bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent/40",
    ghost:
      "border border-border bg-card text-foreground hover:bg-stone-100 focus-visible:ring-stone-300",
    danger:
      "border border-red-200 bg-red-50 text-danger hover:bg-red-100 focus-visible:ring-red-200",
  };

  return (
    <button
      type="submit"
      className={`rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}
