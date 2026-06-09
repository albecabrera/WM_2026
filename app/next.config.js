/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático: el build genera HTML/JS puro servido por Apache;
  // el backend vive en /api (PHP) en el mismo dominio.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

module.exports = nextConfig
