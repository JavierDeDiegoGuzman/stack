# ¡Bienvenido a React Router!

Una plantilla moderna y lista para producción para construir aplicaciones React full-stack usando React Router.

## Características

- 🚀 Renderizado en el lado del servidor (SSR)
- ⚡️ Hot Module Replacement (HMR)
- 📦 Empaquetado y optimización de assets
- 🔄 Carga de datos y mutaciones con React Router
- 🤝 API End-to-end typesafe con **tRPC**
- 🔒 TypeScript por defecto
- 🎉 TailwindCSS para estilos
- 💾 PostgreSQL + DrizzleORM para la base de datos
- 📖 [Documentación de React Router](https://reactrouter.com/)

## Primeros Pasos

### Instalación

Instala las dependencias:

```bash
pnpm install
```

### Desarrollo

Copia `.env.example` a `.env` y proporciona tu `DATABASE_URL` con la cadena de conexión.

Ejecuta una migración inicial de la base de datos:

```bash
pnpm run db:migrate
```

Inicia el servidor de desarrollo con HMR:

```bash
pnpm run dev
```

Tu aplicación estará disponible en `http://localhost:5173`.

## Compilación para Producción

Crea una compilación para producción:

```bash
pnpm run build
```

## Despliegue

### Despliegue con Docker

Para construir y ejecutar usando Docker:

```bash
# Construir la imagen
docker build -t mi-app .

# Ejecutar el contenedor
docker run -p 3000:3000 mi-app
```

La aplicación en su contenedor puede ser desplegada en cualquier plataforma que soporte Docker, incluyendo:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### Despliegue Manual

Si estás familiarizado con el despliegue de aplicaciones Node, el servidor de la aplicación integrado está listo para producción.

Asegúrate de desplegar el resultado de `pnpm run build`:

```
├── package.json
├── pnpm-lock.yaml
├── server.js
├── build/
│   ├── client/    # Assets estáticos
│   └── server/    # Código del lado del servidor
```

## Estilos

Esta plantilla viene con [Tailwind CSS](https://tailwindcss.com/) ya configurado para una experiencia de inicio simple. Puedes usar cualquier framework de CSS que prefieras.

---

Construido con ❤️ usando React Router.
