

# Zod Deep Partial

[![NPM Version](https://img.shields.io/npm/v/zod-deep-partial?style=flat-square&logo=npm&logoColor=white&color=blue)](https://www.npmjs.com/package/zod-deep-partial)
[![NPM Downloads](https://img.shields.io/npm/dm/zod-deep-partial?style=flat-square&logo=icloud&logoColor=white&color=blue)](https://www.npmjs.com/package/zod-deep-partial)
[![NPM License](https://img.shields.io/npm/l/zod-deep-partial?style=flat-square&logo=spdx&logoColor=white&color=blue)](https://www.npmjs.com/package/zod-deep-partial)
[![NPM Type Definitions](https://img.shields.io/npm/types/zod-deep-partial?style=flat-square&logo=typescript&logoColor=white&color=blue)](https://www.npmjs.com/package/zod-deep-partial)
[![NPM Last Update](https://img.shields.io/npm/last-update/zod-deep-partial?style=flat-square&logo=clockify&logoColor=white&color=blue)](https://www.npmjs.com/package/zod-deep-partial)

Una utilidad para convertir recursivamente todas las propiedades de un esquema de Zod en opcionales.

## Descripción

`zod-deep-partial` es un paquete ligero y sin dependencias que proporciona una única función, `zodDeepPartial`. Esta función toma cualquier esquema de Zod y devuelve un nuevo esquema donde cada propiedad en cada nivel de anidación es opcional. Esto es particularmente útil para crear esquemas para actualizaciones parciales (patch) o para manejar estructuras de datos incompletas sin sacrificar los beneficios de la validación de Zod.

## Características

- **Parcial Profundo:** Convierte todas las propiedades de un esquema de Zod en opcionales, incluidos los objetos anidados.
- **Seguro con Tipos:** Preserva la potente inferencia de tipos de Zod.
- **Soporte Integral:** Funciona con una amplia gama de tipos de Zod:
  - Objetos (`z.object`)
  - Arrays (`z.array`)
  - Uniones (`z.union`)
  - Uniones Discriminadas (`z.discriminatedUnion`)
  - Intersecciones (`z.intersection`)
  - Tuplas (`z.tuple`)
  - Registros (`z.record`)
  - Mapas (`z.map`)
  - Conjuntos (`z.set`)
  - Promesas (`z.promise`)
  - Esquemas perezosos (`z.lazy`)
  - Solo lectura (`z.readonly`)
  - Valores predeterminados (`z.default`)
  - Valores de captura (`z.catch`)
  - Valores prefault (`z.prefault`)
  - No opcionales (`z.nonoptional`)
  - Transformaciones/Pipes (`z.pipe`, `.transform()`)
  - Todos los tipos primitivos (string, number, boolean, date, etc.)
- **Cero Dependencias:** Depende únicamente de `zod` como dependencia entre pares (peer dependency).

## Instalación

Instala el paquete utilizando tu administrador de paquetes favorito:

### npm

```bash
npm install zod-deep-partial
```

### yarn

```bash
yarn add zod-deep-partial
```

### pnpm

```bash
pnpm add zod-deep-partial
```

## Uso

Aquí tienes un ejemplo sencillo de cómo usar `zodDeepPartial`:

```typescript
import { z } from "zod";
import { zodDeepPartial } from "zod-deep-partial";

// 1. Define tu esquema base
const userSchema = z.object({
  name: z.string(),
  email: z.email(),
  profile: z.object({
    bio: z.string(),
    avatar: z.url(),
  }),
  tags: z.array(z.string()),
});

// 2. Crea el esquema parcial profundo
const partialUserSchema = zodDeepPartial(userSchema);

// 3. Utiliza el esquema parcial para la validación

// Todas estas son ahora válidas:
partialUserSchema.parse({});
partialUserSchema.parse({ name: "John Doe" });
partialUserSchema.parse({ profile: {} });
partialUserSchema.parse({ profile: { bio: "A developer" } });
partialUserSchema.parse({ tags: ["developer"] });

// La inferencia de tipos se mantiene
type PartialUser = z.infer<typeof partialUserSchema>;
/*
{
  name?: string | undefined;
  email?: string | undefined;
  profile?: {
    bio?: string | undefined;
    avatar?: string | undefined;
  } | undefined;
  tags?: (string | undefined)[] | undefined;
}
*/
```

## Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o envía un pull request en el [repositorio de GitHub](https://github.com/amirfarzamnia/zod-deep-partial).

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
