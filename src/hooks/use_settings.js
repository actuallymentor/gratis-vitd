import { useState, useCallback, useMemo } from 'react'

import { load_settings, save_settings } from '../modules/storage'

const DEFAULTS = {
    lat: null,
    lng: null,
    skin_type: 2,
    percent_exposed: 27,
    target_iu: 1000,
    location_name: ``,
}


/**
 * Manage user settings with localStorage persistence.
 * @returns {{ settings: Object, update_settings: Function, has_settings: boolean, reset_settings: Function }}
 */
export function use_settings() {

    const [ settings, set_settings ] = useState( () => {
        const saved = load_settings()
        return { ...DEFAULTS, ...saved }
    } )

    // User has completed onboarding if lat/lng and skin_type are set
    const has_settings = useMemo(
        () => settings.lat !== null && settings.lng !== null && settings.skin_type !== null,
        [ settings.lat, settings.lng, settings.skin_type ]
    )

    const update_settings = useCallback( ( updates ) => {
        set_settings( prev => {
            const next = { ...prev, ...updates }
            save_settings( next )
            return next
        } )
    }, [] )

    const reset_settings = useCallback( () => {
        set_settings( DEFAULTS )
        save_settings( DEFAULTS )
    }, [] )

    return { settings, update_settings, has_settings, reset_settings }

}
