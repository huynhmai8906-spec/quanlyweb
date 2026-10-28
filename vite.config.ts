import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// The Vercel ⇄ Supabase marketplace integration injects NEXT_PUBLIC_* / SUPABASE_* vars;
// expose them under the VITE_* names src/lib/supabase.ts reads (Vite picks up VITE_* from process.env).
const env = process.env;
env.VITE_SUPABASE_URL ||= env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '';
env.VITE_SUPABASE_PUBLISHABLE_KEY ||=
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY ||
  '';
if (!env.VITE_SUPABASE_URL) delete env.VITE_SUPABASE_URL;
if (!env.VITE_SUPABASE_PUBLISHABLE_KEY) delete env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
