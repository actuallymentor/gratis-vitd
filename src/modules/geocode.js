import { LOCATIONS } from './locations'


// Great-circle distance between two lat/lng points, in kilometres.
// Plain Haversine — accurate enough for ranking the nearest city.
function haversine_km( lat_a, lng_a, lat_b, lng_b ) {

    const R = 6371
    const to_rad = ( deg ) => deg * Math.PI / 180

    const dlat = to_rad( lat_b - lat_a )
    const dlng = to_rad( lng_b - lng_a )

    const a = Math.sin( dlat / 2 ) ** 2
            + Math.cos( to_rad( lat_a ) ) * Math.cos( to_rad( lat_b ) )
            * Math.sin( dlng / 2 ) ** 2

    return 2 * R * Math.asin( Math.sqrt( a ) )

}


/**
 * Estimate a human-friendly place name for given coordinates using a
 * fully-offline lookup against the static LOCATIONS catalogue. Picks the
 * nearest known city and returns its name when within ~150 km of the user
 * (roughly a metro area). Beyond that the estimate gets too vague to be
 * trustworthy, so we return null and let callers show raw coordinates.
 *
 * No network requests — works offline.
 *
 * @param {number} lat - Latitude in decimal degrees
 * @param {number} lng - Longitude in decimal degrees
 * @returns {string|null} City name like "Prague", or null when no nearby match
 */
export function reverse_geocode( lat, lng ) {

    // Only cities have meaningful coordinates — country entries are capital coords
    // and would mislabel users far from their capital (e.g. Munich → "Austria")
    const cities = LOCATIONS.filter( ( { type } ) => type === `city` )

    const nearest = cities.reduce( ( best, city ) => {
        const distance_km = haversine_km( lat, lng, city.lat, city.lng )
        return distance_km < best.distance_km ? { city, distance_km } : best
    }, { city: null, distance_km: Infinity } )

    // 150 km ≈ within a metro area or the next big city over — useful as a regional label
    return nearest.distance_km < 150 ? nearest.city.name : null

}
