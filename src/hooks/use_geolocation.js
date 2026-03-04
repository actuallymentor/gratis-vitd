import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = `vitd_location`

/**
 * Hook for browser geolocation with manual fallback and localStorage persistence
 * @returns {{ latitude: number|null, longitude: number|null, error: string|null, loading: boolean, detect: Function, set_manual: Function }}
 */
export const use_geolocation = () => {

    // Restore last known location from localStorage (lazy — only runs on mount)
    const read_stored = () => {
        try {
            const raw = localStorage.getItem( STORAGE_KEY )
            return raw ? JSON.parse( raw ) : null
        } catch {
            return null
        }
    }

    const [ latitude, set_latitude ] = useState( () => read_stored()?.latitude ?? null )
    const [ longitude, set_longitude ] = useState( () => read_stored()?.longitude ?? null )
    const [ error, set_error ] = useState( null )
    const [ loading, set_loading ] = useState( false )

    // Persist location whenever it changes
    useEffect( () => {
        if( latitude !== null && longitude !== null ) {
            localStorage.setItem( STORAGE_KEY, JSON.stringify( { latitude, longitude } ) )
        }
    }, [ latitude, longitude ] )

    // Detect location via browser Geolocation API
    const detect = useCallback( () => {

        if( !navigator.geolocation ) {
            set_error( `Geolocation is not supported by your browser` )
            return
        }

        set_loading( true )
        set_error( null )

        navigator.geolocation.getCurrentPosition(
            ( { coords } ) => {
                set_latitude( coords.latitude )
                set_longitude( coords.longitude )
                set_loading( false )
            },
            ( err ) => {
                set_error( err.message )
                set_loading( false )
            },
            { enableHighAccuracy: false, timeout: 10_000 }
        )
    }, [] )

    // Manually set coordinates
    const set_manual = useCallback( ( lat, lng ) => {
        set_latitude( lat )
        set_longitude( lng )
        set_error( null )
    }, [] )

    return { latitude, longitude, error, loading, detect, set_manual }
}
