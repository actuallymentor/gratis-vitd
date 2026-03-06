import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig( {
    plugins: [
        react(),
        VitePWA( {
            registerType: `autoUpdate`,
            manifest: {
                name: `Gratis Vit D`,
                short_name: `VitD`,
                description: `Free vitamin D calculator — know when sunlight can make vitamin D for your skin type`,
                theme_color: `#67a6b6`,
                background_color: `#f8f9fa`,
                display: `standalone`,
                icons: [
                    { src: `/logo192.png`, sizes: `192x192`, type: `image/png` },
                    { src: `/logo512.png`, sizes: `512x512`, type: `image/png`, purpose: `any maskable` },
                ],
            },
            workbox: {
                globPatterns: [ `**/*.{js,css,html,svg,png,woff2}` ],
            },
        } ),
    ],
} )
