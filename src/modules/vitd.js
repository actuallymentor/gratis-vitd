import { get_max_elevation } from './solar'

// Fitzpatrick skin types with exposure times (arms + face, at peak UV)
export const skin_types = [
    { type: 1, label: `Very Fair`, description: `Burns easily, never tans`, base_minutes: 5, color: `#fce4c0` },
    { type: 2, label: `Fair`, description: `Burns easily, tans minimally`, base_minutes: 8, color: `#f0d0a0` },
    { type: 3, label: `Medium`, description: `Burns moderately, tans gradually`, base_minutes: 12, color: `#d4a574` },
    { type: 4, label: `Olive`, description: `Burns minimally, tans well`, base_minutes: 20, color: `#b07840` },
    { type: 5, label: `Dark`, description: `Rarely burns, tans darkly`, base_minutes: 35, color: `#7a4a2a` },
    { type: 6, label: `Very Dark`, description: `Never burns, deeply pigmented`, base_minutes: 50, color: `#3d2010` },
]

/**
 * Get the recommended sun exposure time for a skin type
 * @param {number} skin_type_index - Zero-based index into skin_types array
 * @returns {{ minutes: number, label: string }}
 */
export const get_exposure_time = ( skin_type_index ) => {

    const skin = skin_types[ skin_type_index ]
    return { minutes: skin.base_minutes, label: skin.label }
}

/**
 * Find the vitamin D season boundaries for a given location and year.
 * The season is the contiguous period where max solar elevation >= 45°.
 * @param {number} lat - Latitude in degrees
 * @param {number} lng - Longitude in degrees
 * @param {number} year - The year to scan
 * @returns {{ first_day: Date|null, last_day: Date|null, total_days: number, year_round: boolean }}
 */
export const find_vitd_season = ( lat, lng, year ) => {

    // Check every day of the year for 45°+ solar elevation
    const qualifying_days = []

    for( let day_of_year = 0; day_of_year < 366; day_of_year++ ) {

        const date = new Date( year, 0, 1 + day_of_year )
        if( date.getFullYear() !== year ) break

        const max_el = get_max_elevation( date, lat, lng )
        if( max_el >= 45 ) qualifying_days.push( date )
    }

    // No days qualify — permanent vitamin D winter
    if( qualifying_days.length === 0 ) {
        return { first_day: null, last_day: null, total_days: 0, year_round: false }
    }

    // Year-round vitamin D (equatorial regions)
    const is_leap = new Date( year, 1, 29 ).getDate() === 29
    const days_in_year = is_leap ? 366 : 365

    if( qualifying_days.length >= days_in_year - 1 ) {
        return { first_day: qualifying_days[0], last_day: qualifying_days.at( -1 ), total_days: qualifying_days.length, year_round: true }
    }

    return {
        first_day: qualifying_days[0],
        last_day: qualifying_days.at( -1 ),
        total_days: qualifying_days.length,
        year_round: false,
    }
}
