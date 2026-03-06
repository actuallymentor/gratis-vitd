import { useState, useEffect, useCallback } from 'react'

/**
 * Overlay modal for manual latitude/longitude entry
 * Escape key and backdrop click close the modal; body scroll is locked while open
 * @param {{ on_close: Function, on_set: Function }} props
 */
export function CoordModal( { on_close, on_set } ) {

    const [ lat_input, set_lat_input ] = useState( `` )
    const [ lng_input, set_lng_input ] = useState( `` )
    const [ error, set_error ] = useState( null )

    // Apply coordinates after validation
    const apply = () => {
        const lat = parseFloat( lat_input )
        const lng = parseFloat( lng_input )

        if( isNaN( lat ) || isNaN( lng ) || lat < -90 || lat > 90 || lng < -180 || lng > 180 ) {
            set_error( `Enter valid coordinates (lat: -90 to 90, lng: -180 to 180)` )
            return
        }

        on_set( lat, lng )
        on_close()
    }

    // Close on Escape
    const handle_keydown = useCallback( ( e ) => {
        if( e.key === `Escape` ) on_close()
    }, [ on_close ] )

    useEffect( () => {
        document.addEventListener( `keydown`, handle_keydown )
        document.body.style.overflow = `hidden`

        return () => {
            document.removeEventListener( `keydown`, handle_keydown )
            document.body.style.overflow = ``
        }
    }, [ handle_keydown ] )

    // Close on backdrop click (not on modal card itself)
    const handle_backdrop = ( e ) => {
        if( e.target === e.currentTarget ) on_close()
    }

    return <div className="modal-overlay" onClick={ handle_backdrop }>

        <div className="modal-card">

            <h3>Enter Coordinates</h3>

            <div className="modal-inputs">
                <div className="input-group">
                    <label className="muted">Latitude</label>
                    <input
                        type="number"
                        placeholder="51.5"
                        step="0.1"
                        min="-90"
                        max="90"
                        value={ lat_input }
                        onChange={ e => set_lat_input( e.target.value ) }
                        autoFocus
                    />
                </div>
                <div className="input-group">
                    <label className="muted">Longitude</label>
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
            </div>

            { error && <p className="error-text">{ error }</p> }

            <div className="modal-actions">
                <button onClick={ on_close }>Cancel</button>
                <button className="btn-detect" onClick={ apply }>Set Location</button>
            </div>

        </div>

    </div>
}
