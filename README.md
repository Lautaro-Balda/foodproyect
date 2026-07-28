# Food Proyect

App personal de inventario, recetas y compras. Primer módulo: **inventario** (Next.js + Prisma + SQLite).

## Requisitos

- Node.js 20+

## Instalación

```bash
npm install
npm run db:push
npm run dev
```

Abrí [http://localhost:3000/inventario](http://localhost:3000/inventario).

## Inventario

Cada ingrediente tiene:

| Campo    | Descripción                          |
| -------- | ------------------------------------ |
| Nombre   | Texto libre (único por ingrediente)  |
| Unidad   | `g`, `ml` o `unidad`                 |
| Cantidad | Stock actual (número ≥ 0)            |

Desde `/inventario` podés listar, agregar, editar y eliminar ingredientes.

## Recetas

Cada receta tiene nombre y líneas que referencian ingredientes del inventario con una cantidad (en la misma unidad del ingrediente).

- `/recetas` — listar, crear, editar y eliminar recetas.
- **Cociné esto** — valida stock, resta las cantidades del inventario y muestra error si falta algo.

```bash
npm run db:push   # aplicar modelos Recipe y RecipeItem
```

## Scripts útiles

- `npm run dev` — servidor de desarrollo
- `npm run db:push` — sincronizar schema con SQLite (`prisma/dev.db`)
- `npm run db:studio` — explorar la base con Prisma Studio
