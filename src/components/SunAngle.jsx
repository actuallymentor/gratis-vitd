import { useState, useEffect } from 'react'

// SVG dimensions and geometry — compact for hero context
const SIZE = 200
const CX = SIZE / 2
const CY = SIZE - 16
const RADIUS = 75

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

// Horizontal chord across the dome at a given elevation angle
const chord_at = ( degrees ) => {
    const clamped = Math.max( 0, Math.min( 90, degrees ) )
    const rad = clamped * ( Math.PI / 180 )
    const y = CY - RADIUS * Math.sin( rad )
    const half_width = RADIUS * Math.cos( rad )
    return { x1: CX - half_width, y, x2: CX + half_width }
}

/**
 * Compact animated SVG sun gauge — dome, sun disc, angle readout
 * @param {{ elevation: number, max_elevation: number }} props
 */
export function SunAngle( { elevation, max_elevation } ) {

    // Animate from 0 to real elevation on mount / change
    const [ animated, set_animated ] = useState( 0 )

    useEffect( () => {
        const frame = requestAnimationFrame( () => set_animated( elevation ) )
        return () => cancelAnimationFrame( frame )
    }, [ elevation ] )

    const clamped = Math.max( 0, Math.min( 90, animated ) )
    const above_threshold = clamped >= 45
    const display_angle = Math.round( elevation )

    // 45° threshold chord
    const vitd_chord = chord_at( 45 )

    return <svg
        viewBox={ `0 0 ${ SIZE } ${ SIZE - 16 }` }
        width="100%"
        className="sun-gauge"
        role="img"
        aria-label={ `Sun elevation: ${ display_angle }°` }
    >

        { /* Sky dome */ }
        <path
            d={ wedge_path( 0, 180 ) }
            fill="var(--color-dome-fill)"
            stroke="var(--color-dome-stroke)"
            strokeWidth="1"
        />

        { /* Green zone above 45° */ }
        <path
            d={ wedge_path( 45, 135 ) }
            fill="var(--color-vitd-tint)"
            opacity="0.6"
        />

        { /* 45° threshold — subtle dashed line */ }
        <line
            x1={ vitd_chord.x1 } y1={ vitd_chord.y }
            x2={ vitd_chord.x2 } y2={ vitd_chord.y }
            stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
        />

        { /* Horizon line */ }
        <line
            x1={ CX - RADIUS - 6 } y1={ CY }
            x2={ CX + RADIUS + 6 } y2={ CY }
            stroke="var(--color-dome-stroke)" strokeWidth="1"
        />

        { /* Sun group — rotated for animation */ }
        <g style={ {
            transform: `rotate(${ -clamped }deg)`,
            transformOrigin: `${ CX }px ${ CY }px`,
            transition: `transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)`,
        } }
        >

            { /* Sun rays — only when above threshold */ }
            { above_threshold && [ ...Array( 8 ) ].map( ( _, i ) => {

                const ray_angle =  i * 45  * ( Math.PI / 180 )
                const inner = 10
                const outer = 15

                return <line
                    key={ i }
                    x1={ CX + RADIUS + inner * Math.cos( ray_angle ) }
                    y1={ CY - inner * Math.sin( ray_angle ) }
                    x2={ CX + RADIUS + outer * Math.cos( ray_angle ) }
                    y2={ CY - outer * Math.sin( ray_angle ) }
                    stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"
                    opacity="0.6"
                />
            } ) }

            { /* Sun glow + disc */ }
            <circle cx={ CX + RADIUS } cy={ CY } r="11" fill="#f59e0b" opacity="0.15" />
            <circle cx={ CX + RADIUS } cy={ CY } r="6" fill="#f59e0b" />

        </g>

        { /* Angle readout — centered */ }
        <text
            x={ CX } y={ CY - 8 }
            fontSize="18" fontWeight="700" fill="#d97706" textAnchor="middle"
        >
            { display_angle }°
        </text>

    </svg>
}
