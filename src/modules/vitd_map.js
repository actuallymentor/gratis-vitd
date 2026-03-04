import { get_max_elevation } from './solar'

/**
 * Classifies a latitude into a vitamin D synthesis zone
 * @param {number} elevation - Solar noon elevation in degrees
 * @returns {'vitd'|'marginal'|'low'} Zone classification
 */
const classify = ( elevation ) => {

    if( elevation >= 45 ) return `vitd`
    if( elevation >= 30 ) return `marginal`
    return `low`

}

/**
 * Computes vitamin D synthesis zones for every latitude band on a given date.
 * Uses solar noon elevation at longitude 0 — noon elevation depends on
 * latitude and solar declination, not longitude.
 * @param {Date} date - The date to compute for
 * @returns {Array<{ lat: number, elevation: number, zone: string }>}
 */
export const compute_latitude_bands = ( date ) => {

    // Solar noon max elevation is longitude-independent for zone classification
    return Array.from( { length: 181 }, ( _, i ) => {

        const lat = 90 - i
        const elevation = get_max_elevation( date, lat, 0 )
        return { lat, elevation, zone: classify( elevation ) }

    } )

}

/**
 * Finds the northernmost and southernmost latitudes where vitamin D
 * synthesis is possible (solar noon elevation ≥ 45°).
 * @param {Array<{ lat: number, zone: string }>} bands - Output of compute_latitude_bands
 * @returns {{ north: number|null, south: number|null }} Threshold latitudes
 */
export const find_threshold_latitudes = ( bands ) => {

    const vitd_bands = bands.filter( ( { zone } ) => zone === `vitd` )

    if( !vitd_bands.length ) return { north: null, south: null }

    const north = Math.max( ...vitd_bands.map( b => b.lat ) )
    const south = Math.min( ...vitd_bands.map( b => b.lat ) )

    return { north, south }

}
