import { useMemo } from 'react'
import { find_threshold_latitudes } from '../modules/vitd_map'

// -- Continent outlines for equirectangular projection -----------------------
// Coordinates: [ lng, lat ] pairs → projected as x = lng + 180, y = 90 - lat
// Simplified to ~3KB total for recognizability without competing with heatmap

const to_path = ( coords ) =>
    coords.map( ( [ lng, lat ], i ) =>
        `${ i === 0 ? `M` : `L` }${ lng + 180 },${ 90 - lat }`
    ).join( ` ` ) + ` Z`

const CONTINENTS = [

    // North America
    [ [ -130, 50 ], [ -125, 55 ], [ -120, 60 ], [ -130, 65 ], [ -140, 70 ],
        [ -155, 72 ], [ -165, 68 ], [ -165, 62 ], [ -150, 58 ], [ -130, 50 ],
        [ -125, 48 ], [ -125, 42 ], [ -118, 34 ], [ -110, 30 ], [ -105, 25 ],
        [ -100, 20 ], [ -95, 18 ], [ -88, 18 ], [ -82, 22 ], [ -80, 25 ],
        [ -82, 30 ], [ -90, 30 ], [ -95, 35 ], [ -90, 40 ], [ -82, 38 ],
        [ -75, 40 ], [ -70, 42 ], [ -68, 45 ], [ -65, 47 ], [ -60, 48 ],
        [ -65, 52 ], [ -70, 55 ], [ -80, 60 ], [ -90, 62 ], [ -95, 68 ],
        [ -105, 70 ], [ -115, 68 ], [ -120, 62 ], [ -130, 50 ] ],

    // South America
    [ [ -80, 10 ], [ -75, 10 ], [ -70, 12 ], [ -62, 10 ], [ -60, 5 ],
        [ -53, 4 ], [ -50, 0 ], [ -48, -5 ], [ -45, -10 ], [ -40, -14 ],
        [ -38, -18 ], [ -40, -22 ], [ -45, -25 ], [ -50, -30 ], [ -55, -35 ],
        [ -60, -40 ], [ -65, -45 ], [ -68, -50 ], [ -72, -48 ], [ -75, -45 ],
        [ -72, -35 ], [ -70, -28 ], [ -70, -20 ], [ -75, -12 ], [ -77, -5 ],
        [ -78, 0 ], [ -80, 5 ], [ -80, 10 ] ],

    // Europe
    [ [ -10, 36 ], [ -8, 38 ], [ -10, 42 ], [ -5, 44 ], [ 0, 44 ],
        [ 3, 43 ], [ 5, 46 ], [ 8, 48 ], [ 12, 46 ], [ 14, 48 ],
        [ 16, 50 ], [ 18, 55 ], [ 22, 58 ], [ 25, 60 ], [ 28, 62 ],
        [ 30, 65 ], [ 25, 68 ], [ 20, 70 ], [ 15, 68 ], [ 10, 62 ],
        [ 5, 58 ], [ 5, 52 ], [ 0, 50 ], [ -5, 48 ], [ -10, 44 ],
        [ -10, 36 ] ],

    // Africa
    [ [ -15, 30 ], [ -10, 35 ], [ -5, 36 ], [ 0, 36 ], [ 10, 37 ],
        [ 12, 33 ], [ 12, 30 ], [ 20, 32 ], [ 25, 30 ], [ 33, 30 ],
        [ 35, 28 ], [ 38, 22 ], [ 42, 15 ], [ 50, 12 ], [ 48, 8 ],
        [ 42, 3 ], [ 40, -2 ], [ 38, -8 ], [ 35, -15 ], [ 33, -22 ],
        [ 30, -28 ], [ 28, -32 ], [ 22, -34 ], [ 18, -34 ], [ 15, -30 ],
        [ 12, -20 ], [ 10, -10 ], [ 8, 0 ], [ 5, 5 ], [ 0, 5 ],
        [ -5, 5 ], [ -10, 8 ], [ -16, 12 ], [ -17, 15 ], [ -16, 20 ],
        [ -15, 25 ], [ -15, 30 ] ],

    // Asia (simplified mainland)
    [ [ 30, 65 ], [ 40, 60 ], [ 50, 55 ], [ 55, 50 ], [ 60, 42 ],
        [ 65, 38 ], [ 68, 25 ], [ 72, 20 ], [ 78, 10 ], [ 80, 15 ],
        [ 85, 20 ], [ 90, 22 ], [ 95, 18 ], [ 100, 15 ], [ 105, 10 ],
        [ 108, 18 ], [ 110, 22 ], [ 115, 30 ], [ 120, 35 ], [ 125, 40 ],
        [ 130, 42 ], [ 135, 45 ], [ 140, 50 ], [ 145, 55 ], [ 150, 60 ],
        [ 160, 62 ], [ 170, 65 ], [ 175, 68 ], [ 180, 68 ], [ 180, 72 ],
        [ 170, 70 ], [ 150, 68 ], [ 130, 68 ], [ 110, 65 ], [ 90, 65 ],
        [ 70, 68 ], [ 50, 68 ], [ 40, 68 ], [ 30, 65 ] ],

    // Australia
    [ [ 115, -15 ], [ 120, -14 ], [ 130, -12 ], [ 135, -12 ], [ 140, -15 ],
        [ 145, -15 ], [ 150, -22 ], [ 152, -28 ], [ 150, -33 ], [ 145, -38 ],
        [ 140, -36 ], [ 135, -34 ], [ 130, -32 ], [ 125, -34 ], [ 118, -35 ],
        [ 114, -33 ], [ 113, -28 ], [ 114, -22 ], [ 115, -15 ] ],

]

const continent_paths = CONTINENTS.map( to_path )

// -- Zone colors -------------------------------------------------------------

const ZONE_COLORS = {
    vitd:     `rgba(34,197,94,0.3)`,
    marginal: `rgba(245,158,11,0.3)`,
    low:      `rgba(239,68,68,0.15)`,
}

const LEGEND = [
    { zone: `vitd`, color: `rgb(34,197,94)`, label: `Vitamin D possible` },
    { zone: `marginal`, color: `rgb(245,158,11)`, label: `Marginal` },
    { zone: `low`, color: `rgb(239,68,68)`, label: `Too low` },
]

// -- Component ---------------------------------------------------------------

/**
 * World heatmap showing vitamin D synthesis zones by latitude band
 * @param {{ latitude_bands: Array, user_lat: number|null, user_lng: number|null }} props
 */
export function VitdMap( { latitude_bands, user_lat, user_lng } ) {

    const thresholds = useMemo(
        () => find_threshold_latitudes( latitude_bands ),
        [ latitude_bands ]
    )

    const has_vitd_zone = thresholds.north !== null

    // Project lat/lng to SVG coordinates
    const user_x = user_lng !== null ? user_lng + 180 : null
    const user_y = user_lat !== null ? 90 - user_lat : null

    return <div className="card card-wide">

        <h2>World Vitamin D Map</h2>

        { /* SVG map */ }
        <svg
            viewBox="0 0 360 180"
            style={ { width: `100%`, height: `auto`, borderRadius: 8, background: `#e0f2fe` } }
            role="img"
            aria-label="World map showing vitamin D synthesis zones"
        >

            { /* Latitude band heatmap */ }
            { latitude_bands.map( ( { lat, zone } ) =>
                <rect
                    key={ lat }
                    x={ 0 }
                    y={ 90 - lat }
                    width={ 360 }
                    height={ 1 }
                    fill={ ZONE_COLORS[ zone ] }
                />
            ) }

            { /* Continent outlines */ }
            { continent_paths.map( ( d, i ) =>
                <path
                    key={ i }
                    d={ d }
                    fill="rgba(255,255,255,0.45)"
                    stroke="rgba(120,113,108,0.4)"
                    strokeWidth={ 0.5 }
                    strokeLinejoin="round"
                />
            ) }

            { /* Equator reference line */ }
            <line
                x1={ 0 } y1={ 90 } x2={ 360 } y2={ 90 }
                stroke="rgba(120,113,108,0.3)"
                strokeWidth={ 0.3 }
                strokeDasharray="3 2"
            />

            { /* 45° threshold lines */ }
            { has_vitd_zone && <>
                <line
                    x1={ 0 } y1={ 90 - thresholds.north }
                    x2={ 360 } y2={ 90 - thresholds.north }
                    stroke="rgb(34,197,94)"
                    strokeWidth={ 0.5 }
                    strokeDasharray="4 2"
                />
                <line
                    x1={ 0 } y1={ 90 - thresholds.south }
                    x2={ 360 } y2={ 90 - thresholds.south }
                    stroke="rgb(34,197,94)"
                    strokeWidth={ 0.5 }
                    strokeDasharray="4 2"
                />
            </> }

            { /* User location marker */ }
            { user_x !== null && user_y !== null && <circle
                cx={ user_x } cy={ user_y } r={ 3 }
                fill="var(--color-sun)"
                stroke="#fff"
                strokeWidth={ 0.8 }
            /> }

        </svg>

        { /* Legend */ }
        <div style={ { display: `flex`, gap: `0.75rem`, flexWrap: `wrap`, marginTop: `0.6rem`, fontSize: `0.78rem` } }>
            { LEGEND.map( ( { zone, color, label } ) =>
                <span key={ zone } style={ { display: `inline-flex`, alignItems: `center`, gap: `0.3rem` } }>
                    <span style={ {
                        width: 10, height: 10, borderRadius: 2,
                        background: color, display: `inline-block`,
                    } }
                    />
                    { label }
                </span>
            ) }
        </div>

        { /* Threshold callout */ }
        { has_vitd_zone && <p className="muted" style={ { marginTop: `0.4rem` } }>
            Sun reaches 45°+ between { Math.abs( thresholds.south ) }°{ thresholds.south < 0 ? `S` : `N` } and { Math.abs( thresholds.north ) }°{ thresholds.north < 0 ? `S` : `N` }
        </p> }

        { !has_vitd_zone && <p className="muted" style={ { marginTop: `0.4rem` } }>
            Sun does not reach 45° elevation anywhere today
        </p> }

    </div>

}
