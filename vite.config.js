import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig( {
    plugins: [
        react(),
        VitePWA( {
            registerType: `autoUpdate`,
            manifest: {
                name: `Vitamin D Calculator`,
                short_name: `VitD Calc`,
                description: `Calculate how long you need in the sun to produce vitamin D`,
                theme_color: `#7ec0d0`,
                background_color: `#ffffff`,
                display: `standalone`,
                icons: [
                    { src: `/favicon.svg`, sizes: `any`, type: `image/svg+xml` },
                ],
            },
        } ),
    ],
} )
