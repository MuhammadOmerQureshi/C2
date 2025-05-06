import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwind(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})



// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       // allow `@/` to map to `src/`
//       '@': path.resolve(__dirname, 'src'),
//     }
//   }
// });




