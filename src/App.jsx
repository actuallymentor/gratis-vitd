import { useState } from 'react'
import { use_geolocation } from './hooks/use_geolocation'
import { use_vitd_data } from './hooks/use_vitd_data'
import { LocationPicker } from './components/LocationPicker'
import { SkinTypeSelector } from './components/SkinTypeSelector'
import { VitdWindow } from './components/VitdWindow'
import { VitdSeason } from './components/VitdSeason'
import { VitdMap } from './components/VitdMap'

export default function App() {

    // Location state from geolocation hook
    const { latitude, longitude, error, loading, detect, set_manual } = use_geolocation()

    // Skin type selection (default to type II — fair)
    const [ skin_type, set_skin_type ] = useState( 1 )

    // Computed vitamin D data
    const { window: vitd_window, season, exposure, current_elevation, latitude_bands } = use_vitd_data( latitude, longitude, skin_type )

    return <>

        { /* Header */ }
        <header style={ {
            textAlign: `center`,
            padding: `1.5rem 0 1rem`,
            maxWidth: `var(--max-width)`,
            width: `100%`,
        } }
        >
            <h1 style={ { fontSize: `1.6rem`, fontWeight: 800, color: `var(--color-sun-dark)` } }>
                gratis vit d
            </h1>
            <p className="muted">free vitamin d calculator</p>
        </header>

        { /* Card grid — 2 columns when viewport is wide enough */ }
        <div className="card-grid">

            { /* Location */ }
            <LocationPicker
                latitude={ latitude }
                longitude={ longitude }
                loading={ loading }
                error={ error }
                detect={ detect }
                set_manual={ set_manual }
            />

            { /* Skin type */ }
            <SkinTypeSelector selected={ skin_type } on_select={ set_skin_type } />

            { /* Today's window */ }
            <VitdWindow window={ vitd_window } exposure={ exposure } current_elevation={ current_elevation } />

            { /* Annual season */ }
            <VitdSeason season={ season } />

            { /* World vitamin D map — spans full width */ }
            <VitdMap latitude_bands={ latitude_bands } user_lat={ latitude } user_lng={ longitude } />

        </div>

        { /* Disclaimer */ }
        <p className="disclaimer">
            This tool provides estimates only and is not medical advice.
            UV exposure depends on many factors including cloud cover, altitude, and sunscreen use.
            Consult a healthcare provider for personalised vitamin D recommendations.
        </p>

    </>
}
