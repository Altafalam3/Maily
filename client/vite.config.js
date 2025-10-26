import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    proxy:{
     '/api':{
      target:'http://localhost:3000', //whenever you usee api add this to the start
      secure:false,
    },
  },
},
  plugins: [react()],
})
