
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'sonner@2.0.3': 'sonner',
        'resend@2.0.0': 'resend',
        'react-hook-form@7.55.0': 'react-hook-form',
        'figma:asset/f0b40ab18f6b5d594a18db04f4234532b02a6636.png': path.resolve(__dirname, './src/assets/f0b40ab18f6b5d594a18db04f4234532b02a6636.png'),
        'figma:asset/e19de9b1a3313f261c0276da257bd631603f9688.png': path.resolve(__dirname, './src/assets/e19de9b1a3313f261c0276da257bd631603f9688.png'),
        'figma:asset/8c9a9782f822a04113fd7bff4f68f1bc0ac7a2af.png': path.resolve(__dirname, './src/assets/8c9a9782f822a04113fd7bff4f68f1bc0ac7a2af.png'),
        'figma:asset/5accdace6da916618370527ad4064a074fa02c28.png': path.resolve(__dirname, './src/assets/5accdace6da916618370527ad4064a074fa02c28.png'),
        'figma:asset/2dba3dabe7010b763ebec2a8f70edae4bf1041a6.png': path.resolve(__dirname, './src/assets/2dba3dabe7010b763ebec2a8f70edae4bf1041a6.png'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });