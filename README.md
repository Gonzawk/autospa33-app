# AutoSpa #33 Frontend

React + Vite conectado a `AutoSpa33.Api`.

## Desarrollo

1. Copiar `.env.example` a `.env`.
2. Ajustar `VITE_API_URL` si la API usa otro puerto.
3. Ejecutar `npm install` y `npm run dev`.

El carrito y el tema se mantienen en `localStorage`; los datos comerciales y operativos viven en PostgreSQL mediante la API.
El código administrativo se valida en `/api/admin/auth/verify` y se conserva solo durante la sesión del navegador.

La carga de imágenes de producto usa `/api/admin/images/upload`; la clave de ImgBB nunca se expone en Vite.
