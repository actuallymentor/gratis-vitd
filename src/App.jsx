import { use_settings } from './hooks/use_settings'
import { I18nProvider } from './i18n/use_i18n'
import LanguageSelector from './components/atoms/LanguageSelector'
import Onboarding from './components/pages/Onboarding'
import Dashboard from './components/pages/Dashboard'


export default function App() {

    const { settings, update_settings, has_settings, reset_settings } = use_settings()

    return <I18nProvider>

        { /* Floating language globe — always visible */ }
        <LanguageSelector />

        { /* Show dashboard when location + skin type are configured */ }
        { has_settings
            ? <Dashboard
                settings={ settings }
                update_settings={ update_settings }
                reset_settings={ reset_settings }
            />
            : <Onboarding
                settings={ settings }
                update_settings={ update_settings }
            /> }

    </I18nProvider>

}
