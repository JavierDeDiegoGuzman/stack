# Etapa para dependencias de desarrollo
# Esta etapa instala las dependencias necesarias para desarrollo y construcción.
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .

# Etapa para dependencias de producción
# Solo instala las dependencias necesarias para producción.
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

# Etapa de construcción
# Compila la aplicación para producción.
FROM node:20-alpine AS build-env
WORKDIR /app
COPY --from=development-dependencies-env /app /app
RUN npm install -g pnpm && pnpm run build

# Etapa final
# Contenedor listo para producción, solo con lo necesario para correr la app.
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
COPY server.js ./
# Instalamos pnpm globalmente por si es necesario en producción
RUN npm install -g pnpm
CMD ["pnpm", "run", "start"]