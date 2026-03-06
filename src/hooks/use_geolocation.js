import { useState, useCallback } from 'react'

import { log } from 'mentie'


/**
 * Browser geolocation wrapper hook.
 * @returns {{ lat: number|null, lng: number|null, loading: boolean, error: string|null, request_location: Function }}
 */
export function use_geolocation() {

    const [ state, set_state ] = useState( {
        lat: null,
        lng: null,
        loading: false,
        error: null,
    } )

    const request_location = useCallback( () => {

        if( !navigator.geolocation ) {
            set_state( prev => ( { ...prev, error: `Geolocation is not supported by your browser` } ) )
            return
        }

        set_state( prev => ( { ...prev, loading: true, error: null } ) )

        navigator.geolocation.getCurrentPosition(
            ( { coords } ) => {
                log.info( `Geolocation acquired:`, coords.latitude, coords.longitude )
                set_state( { lat: coords.latitude, lng: coords.longitude, loading: false, error: null } )
            },
            ( err ) => {
                log.warn( `Geolocation error:`, err.message )
                set_state( prev => ( { ...prev, loading: false, error: err.message } ) )
            },
            { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
        )

    }, [] )

    return { ...state, request_location }

}
