import { use_settings } from './hooks/use_settings'
import Onboarding from './components/pages/Onboarding'
import Dashboard from './components/pages/Dashboard'


export default function App() {

    const { settings, update_settings, has_settings, reset_settings } = use_settings()

    // Show dashboard when location + skin type are configured
    if( has_settings ) return <Dashboard
        settings={ settings }
        update_settings={ update_settings }
        reset_settings={ reset_settings }
    />

    // Otherwise show onboarding
    return <Onboarding
        settings={ settings }
        update_settings={ update_settings }
    />

}
