import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pdfmake') || id.includes('vfs_fonts') || id.includes('src/logo') || id.includes('src/drapeau')) {
            return 'pdf-engine';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'charts';
          }
          if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design')) {
            return 'antd-vendor';
          }
        },
      },
    },
  },
});
