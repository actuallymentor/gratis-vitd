import { useMemo } from 'react'
import { get_vitd_window } from '../modules/solar'
import { find_vitd_season, get_exposure_time } from '../modules/vitd'

/**
 * Combines location + skin type into computed vitamin D results
 * @param {number|null} latitude
 * @param {number|null} longitude
 * @param {number} skin_type_index - Zero-based index into skin_types
 * @returns {{ window: object|null, season: object|null, exposure: object|null }}
 */
export const use_vitd_data = ( latitude, longitude, skin_type_index ) => {

    const today_window = useMemo( () => {
        if( latitude === null || longitude === null ) return null
        return get_vitd_window( new Date(), latitude, longitude )
    }, [ latitude, longitude ] )

    const season = useMemo( () => {
        if( latitude === null || longitude === null ) return null
        return find_vitd_season( latitude, longitude, new Date().getFullYear() )
    }, [ latitude, longitude ] )

    const exposure = useMemo( () => {
        return get_exposure_time( skin_type_index )
    }, [ skin_type_index ] )

    return { window: today_window, season, exposure }
}
