/**
 * Astro Configuration
 * 
 * @see https://astro.build/config
 */
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';

export default defineConfig({
  // Enable React for interactive islands
  integrations: [
    react(),      // React components with client:load directive
    tailwind(),   // Tailwind CSS for styling
  ],
  
  // Static site generation for Vercel
  adapter: vercel(),
  
  // Production URL
  site: 'https://curlconverter.net',
  
  // Build configuration
  build: {
    inlineStylesheets: 'auto',
  },
  
  // Development server
  server: {
    port: 4321,
  },
});
