import { useState, useEffect } from 'react'

// SVG dimensions and geometry
const SIZE = 240
const CX = SIZE / 2
const CY = SIZE - 20
const RADIUS = 90

// Convert a solar elevation angle to SVG rotation (0° = right horizon, 90° = straight up)
const angle_to_rotation = ( degrees ) => -degrees

// Point on the arc at a given elevation angle
const arc_point = ( degrees, r = RADIUS ) => {
    const rad = degrees * ( Math.PI / 180 )
    return {
        x: CX + r * Math.cos( rad ),
        y: CY - r * Math.sin( rad ),
    }
}

// Build an SVG arc path for a wedge from start_deg to end_deg
const wedge_path = ( start_deg, end_deg, r = RADIUS ) => {
    const p1 = arc_point( start_deg, r )
    const p2 = arc_point( end_deg, r )
    const large_arc = end_deg - start_deg > 180 ? 1 : 0
    return `M ${ CX },${ CY } L ${ p1.x },${ p1.y } A ${ r } ${ r } 0 ${ large_arc } 0 ${ p2.x },${ p2.y } Z`
}

/**
 * Animated SVG sun gauge showing current solar elevation and 45° vitamin D threshold
 * @param {{ elevation: number }} props
 */
export function SunAngle( { elevation } ) {

    // Animate from 0 to real elevation on mount / change
    const [ animated, set_animated ] = useState( 0 )

    useEffect( () => {
        // Brief delay so the CSS transition kicks in after initial render at 0°
        const frame = requestAnimationFrame( () => set_animated( elevation ) )
        return () => cancelAnimationFrame( frame )
    }, [ elevation ] )

    const clamped = Math.max( 0, Math.min( 90, animated ) )
    const above_threshold = clamped >= 45
    const display_angle = Math.round( elevation )

    // 45° threshold line endpoints
    const threshold_end = arc_point( 45, RADIUS + 10 )

    // Tick marks
    const horizon_label = arc_point( 0, RADIUS + 16 )
    const zenith_label = arc_point( 90, RADIUS + 16 )

    return <svg
        viewBox={ `0 0 ${ SIZE } ${ SIZE - 20 }` }
        width="100%"
        style={ { maxWidth: `${ SIZE }px`, display: `block`, margin: `0 auto 0.5rem` } }
        role="img"
        aria-label={ `Sun elevation: ${ display_angle }°` }
    >

        { /* Sky dome arc — faint background */ }
        <path
            d={ wedge_path( 0, 180 ) }
            fill="#fef9ee"
            stroke="#e7e5e4"
            strokeWidth="1"
        />

        { /* Vitamin D zone wedge — green tint from 45° to 135° (mirrored) */ }
        <path
            d={ wedge_path( 45, 135 ) }
            fill="#dcfce7"
            opacity="0.6"
        />

        { /* 45° threshold lines — dashed */ }
        <line
            x1={ CX } y1={ CY }
            x2={ threshold_end.x } y2={ threshold_end.y }
            stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"
        />
        <line
            x1={ CX } y1={ CY }
            x2={ CX - ( threshold_end.x - CX ) } y2={ threshold_end.y }
            stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"
        />

        { /* 45° label */ }
        <text
            x={ arc_point( 45, RADIUS + 22 ).x + 2 }
            y={ arc_point( 45, RADIUS + 22 ).y }
            fontSize="9" fill="#22c55e" fontWeight="600" textAnchor="start"
        >
            45°
        </text>

        { /* Horizon arc line */ }
        <line
            x1={ CX - RADIUS - 10 } y1={ CY }
            x2={ CX + RADIUS + 10 } y2={ CY }
            stroke="#e7e5e4" strokeWidth="1"
        />

        { /* Tick labels */ }
        <text x={ horizon_label.x } y={ horizon_label.y + 4 } fontSize="9" fill="#78716c" textAnchor="middle">0°</text>
        <text x={ zenith_label.x } y={ zenith_label.y + 3 } fontSize="9" fill="#78716c" textAnchor="middle">90°</text>

        { /* Sun group — rotated around center for animation */ }
        <g style={ {
            transform: `rotate(${ angle_to_rotation( clamped ) }deg)`,
            transformOrigin: `${ CX }px ${ CY }px`,
            transition: `transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)`,
        } }
        >

            { /* Sun rays — only visible above threshold */ }
            { above_threshold && [ ...Array( 8 ) ].map( ( _, i ) => {

                const ray_angle =  i * 45  * ( Math.PI / 180 )
                const inner = 12
                const outer = 18

                return <line
                    key={ i }
                    x1={ CX + RADIUS + inner * Math.cos( ray_angle ) }
                    y1={ CY - inner * Math.sin( ray_angle ) }
                    x2={ CX + RADIUS + outer * Math.cos( ray_angle ) }
                    y2={ CY - outer * Math.sin( ray_angle ) }
                    stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"
                    opacity="0.7"
                />
            } ) }

            { /* Sun glow */ }
            <circle cx={ CX + RADIUS } cy={ CY } r="14" fill="#f59e0b" opacity="0.15" />
            <circle cx={ CX + RADIUS } cy={ CY } r="10" fill="#f59e0b" opacity="0.25" />

            { /* Sun disc */ }
            <circle cx={ CX + RADIUS } cy={ CY } r="7" fill="#f59e0b" />

        </g>

        { /* Angle readout */ }
        <text
            x={ CX } y={ CY - 10 }
            fontSize="16" fontWeight="700" fill="#d97706" textAnchor="middle"
        >
            { display_angle }°
        </text>

        <text
            x={ CX } y={ CY - 26 }
            fontSize="8" fill="#78716c" textAnchor="middle"
        >
            sun elevation
        </text>

    </svg>
}
