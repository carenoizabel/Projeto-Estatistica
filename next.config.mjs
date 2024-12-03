/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Ativa o modo estrito do React para detectar problemas no código
    pageExtensions: ['js', 'jsx'], // Suporta arquivos .js e .jsx como páginas
    experimental: {
      appDir: true, // Habilita o uso de 'src' como diretório principal
    },
  };
  
  export default nextConfig;
  