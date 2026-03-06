import { useState } from 'react'
import { use_geolocation } from './hooks/use_geolocation'
import { use_vitd_data } from './hooks/use_vitd_data'
import { use_theme } from './hooks/use_theme'
import { CoordModal } from './components/CoordModal'
import { SkinTypeSelector } from './components/SkinTypeSelector'
import { VitdWindow } from './components/VitdWindow'
import { VitdSeason } from './components/VitdSeason'
import { VitdMap } from './components/VitdMap'

// Format a single coordinate value as human-readable "52.5°N"
const format_coord = ( val, pos_label, neg_label ) => {
    const abs = Math.abs( val ).toFixed( 1 )
    return `${ abs }°${ val >= 0 ? pos_label : neg_label }`
}

export default function App() {

    // Location state from geolocation hook
    const { latitude, longitude, error, loading, detect, set_manual } = use_geolocation()

    // Skin type selection (default to type II — fair)
    const [ skin_type, set_skin_type ] = useState( 1 )

    // Theme toggle (light by default, persisted to localStorage)
    const { theme, toggle_theme } = use_theme()

    // Coordinate modal visibility
    const [ modal_open, set_modal_open ] = useState( false )

    // Computed vitamin D data
    const { window: vitd_window, season, exposure, current_elevation } = use_vitd_data( latitude, longitude, skin_type )

    const has_location = latitude !== null && longitude !== null

    return <>

        { /* Header — theme toggle only */ }
        <header className="app-header">
            <button className="theme-toggle" onClick={ toggle_theme } aria-label={ `Switch to ${ theme === `light` ? `dark` : `light` } mode` }>
                { theme === `light` ? `\u{263E}` : `\u{2600}` }
            </button>
        </header>

        { /* Hero section — full-width band */ }
        <section className={ `hero${ has_location ? `` : ` hero--solo` }` }>
            <div className="hero-inner">

                { /* Left column: title, description, detect, coords */ }
                <div className="hero-left">

                    <h1>Vitamin D Calculator</h1>

                    <p className="muted">
                        Find out when the sun is strong enough for your skin to make vitamin D,
                        based on your location, skin type, and time of year.
                    </p>

                    { /* Detect button */ }
                    <button className="btn-detect" onClick={ detect } disabled={ loading }>
                        { loading ? `Detecting...` : `Detect my location` }
                    </button>

                    { /* Manual entry link */ }
                    <button className="link-muted" onClick={ () => set_modal_open( true ) }>
                        or enter coordinates manually
                    </button>

                    { /* Current coordinates */ }
                    { has_location && <p className="coord-current">
                        { format_coord( latitude, `N`, `S` ) }, { format_coord( longitude, `E`, `W` ) }
                    </p> }

                    { /* Geolocation error */ }
                    { error && <p className="error-text">{ error }</p> }

                </div>

                { /* Right column: today's window (only when location is set) */ }
                { has_location && <div className="hero-right">
                    <VitdWindow window={ vitd_window } exposure={ exposure } current_elevation={ current_elevation } />
                </div> }

            </div>
        </section>

        { /* Skin type selector — standalone below hero */ }
        <SkinTypeSelector selected={ skin_type } on_select={ set_skin_type } compact />

        { /* Season card — standalone, full width */ }
        <VitdSeason season={ season } exposure={ exposure } />

        { /* Map card — standalone, full width */ }
        <VitdMap user_lat={ latitude } user_lng={ longitude } />

        { /* Disclaimer */ }
        <p className="disclaimer">
            This tool provides estimates only and is not medical advice.
            UV exposure depends on many factors including cloud cover, altitude, and sunscreen use.
            Consult a healthcare provider for personalised vitamin D recommendations.
        </p>

        { /* Coordinate entry modal */ }
        { modal_open && <CoordModal
            on_close={ () => set_modal_open( false ) }
            on_set={ set_manual }
        /> }

    </>
}
