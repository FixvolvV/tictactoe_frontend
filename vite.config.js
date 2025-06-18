import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs';
import path from 'path'; // <- Обратите внимание на path


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
});
