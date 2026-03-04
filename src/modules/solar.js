import SunCalc from 'suncalc'

// Register 45° as a named solar event for vitamin D synthesis threshold
SunCalc.addTime( 45, `vitdRise`, `vitdSet` )

/**
 * Get the maximum solar elevation for a given date and location.
 * Solar noon gives the highest elevation of the day.
 * @param {Date} date - The date to check
 * @param {number} lat - Latitude in degrees
 * @param {number} lng - Longitude in degrees
 * @returns {number} Maximum elevation in degrees
 */
export const get_max_elevation = ( date, lat, lng ) => {

    const times = SunCalc.getTimes( date, lat, lng )
    const solar_noon = times.solarNoon

    // getPosition returns altitude in radians — convert to degrees
    const position = SunCalc.getPosition( solar_noon, lat, lng )
    return position.altitude * ( 180 / Math.PI )
}

/**
 * Get the current solar elevation angle right now for a given location.
 * @param {number} lat - Latitude in degrees
 * @param {number} lng - Longitude in degrees
 * @returns {number} Current elevation in degrees (negative = below horizon)
 */
export const get_current_elevation = ( lat, lng ) => {

    const position = SunCalc.getPosition( new Date(), lat, lng )
    return position.altitude * ( 180 / Math.PI )
}

/**
 * Get the vitamin D synthesis window for a given date and location.
 * UVB sufficient for vitamin D only reaches the surface when solar elevation > 45°.
 * @param {Date} date - The date to check
 * @param {number} lat - Latitude in degrees
 * @param {number} lng - Longitude in degrees
 * @returns {{ start: Date|null, end: Date|null, max_elevation: number }}
 */
export const get_vitd_window = ( date, lat, lng ) => {

    const times = SunCalc.getTimes( date, lat, lng )
    const start = times.vitdRise
    const end = times.vitdSet

    // suncalc returns NaN dates when the sun never reaches the threshold
    const valid_start = start instanceof Date && !isNaN( start.getTime() )
    const valid_end = end instanceof Date && !isNaN( end.getTime() )

    return {
        start: valid_start ? start : null,
        end: valid_end ? end : null,
        max_elevation: get_max_elevation( date, lat, lng ),
    }
}
