import { useState } from 'react'

/**
 * Location picker with automatic detection and manual lat/lng entry
 * @param {{ latitude: number|null, longitude: number|null, loading: boolean, error: string|null, detect: Function, set_manual: Function }} props
 */
export function LocationPicker( { latitude, longitude, loading, error, detect, set_manual } ) {

    const [ show_manual, set_show_manual ] = useState( false )
    const [ lat_input, set_lat_input ] = useState( `` )
    const [ lng_input, set_lng_input ] = useState( `` )

    const apply_manual = () => {
        const lat = parseFloat( lat_input )
        const lng = parseFloat( lng_input )
        if( isNaN( lat ) || isNaN( lng ) || lat < -90 || lat > 90 || lng < -180 || lng > 180 ) return
        set_manual( lat, lng )
        set_show_manual( false )
    }

    // Format coordinate as human-readable string
    const format_coord = ( val, pos_label, neg_label ) => {
        const abs = Math.abs( val ).toFixed( 1 )
        return `${ abs }°${ val >= 0 ? pos_label : neg_label }`
    }

    return <div className="card">

        <h2>Location</h2>

        { /* Show current location if available */ }
        { latitude !== null && longitude !== null && <p style={ { marginBottom: `0.75rem`, fontSize: `1.1rem` } }>
            { format_coord( latitude, `N`, `S` ) }, { format_coord( longitude, `E`, `W` ) }
        </p> }

        { /* Detection + manual toggle buttons */ }
        <div style={ { display: `flex`, gap: `0.5rem`, flexWrap: `wrap` } }>
            <button onClick={ detect } disabled={ loading }>
                { loading ? `Detecting...` : `Detect my location` }
            </button>
            <button onClick={ () => set_show_manual( !show_manual ) }>
                Enter manually
            </button>
        </div>

        { /* Manual input fields */ }
        { show_manual && <div style={ { marginTop: `0.75rem`, display: `flex`, gap: `0.5rem`, alignItems: `flex-end` } }>
            <div style={ { flex: 1 } }>
                <label className="muted" style={ { display: `block`, marginBottom: `0.25rem` } }>Latitude</label>
                <input
                    type="number"
                    placeholder="51.5"
                    step="0.1"
                    min="-90"
                    max="90"
                    value={ lat_input }
                    onChange={ e => set_lat_input( e.target.value ) }
                />
            </div>
            <div style={ { flex: 1 } }>
                <label className="muted" style={ { display: `block`, marginBottom: `0.25rem` } }>Longitude</label>
                <input
                    type="number"
                    placeholder="-0.1"
                    step="0.1"
                    min="-180"
                    max="180"
                    value={ lng_input }
                    onChange={ e => set_lng_input( e.target.value ) }
                />
            </div>
            <button onClick={ apply_manual } style={ { whiteSpace: `nowrap` } }>Set</button>
        </div> }

        { /* Error message */ }
        { error && <p style={ { color: `var(--color-danger)`, fontSize: `0.85rem`, marginTop: `0.5rem` } }>{ error }</p> }

    </div>
}
