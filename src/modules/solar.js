import SunCalc from 'suncalc'

/**
 * Compute the solar zenith angle for every 15-minute slot across a given day.
 * Only returns slots where the sun is above the horizon (SZA < 90°).
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Date} [date] - The date to compute for (defaults to today)
 * @returns {Array<{ time: Date, sza_degrees: number, hour_label: string }>}
 */
export function get_day_solar_data( lat, lng, date = new Date() ) {

    // Start at midnight local time
    const day_start = new Date( date )
    day_start.setHours( 0, 0, 0, 0 )

    const slots = []

    // 96 slots × 15 min = 24 hours
    for( let i = 0; i < 96; i++ ) {

        const time = new Date( day_start.getTime() + i * 15 * 60 * 1000 )
        const position = SunCalc.getPosition( time, lat, lng )

        // suncalc returns altitude in radians — zenith = 90° - altitude
        const altitude_degrees = position.altitude * ( 180 / Math.PI )
        const sza_degrees = 90 - altitude_degrees

        // Only include slots where sun is above horizon
        if( sza_degrees >= 90 ) continue

        const hour_label = time.toLocaleTimeString( [], { hour: `2-digit`, minute: `2-digit`, hour12: false } )

        slots.push( { time, sza_degrees, hour_label } )

    }

    return slots

}
