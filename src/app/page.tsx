import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Food Proyect</h1>
      <p className="max-w-lg text-muted leading-relaxed">
        Empezá por el inventario: cargá lo que tenés en la heladera y el
        despensa para después descontarlo con recetas.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/inventario"
          className="inline-flex w-fit rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          Inventario
        </Link>
        <Link
          href="/recetas"
          className="inline-flex w-fit rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:bg-stone-50"
        >
          Recetas
        </Link>
      </div>
    </div>
  );
}
