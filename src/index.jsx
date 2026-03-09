import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'

import App from './App'
import './index.css'

// Auto-update: when a new SW activates, reload to apply immediately
registerSW( { onNeedRefresh: () => location.reload() } )

createRoot( document.getElementById( `root` ) ).render( <App /> )
