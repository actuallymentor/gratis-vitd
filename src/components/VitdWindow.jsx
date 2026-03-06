import { SunAngle } from './SunAngle'

/**
 * Displays today's vitamin D synthesis window — no card wrapper, intended for hero-right
 * @param {{ window: object|null, exposure: object|null, current_elevation: number|null }} props
 */
export function VitdWindow( { window: vitd_window, exposure, current_elevation } ) {

    if( !vitd_window ) return null

    const { start, end, max_elevation } = vitd_window
    const has_window = start && end

    // Format time as localized HH:MM
    const format_time = ( date ) => date.toLocaleTimeString( [], { hour: `2-digit`, minute: `2-digit` } )

    return <div className="vitd-window-content">

        { /* Live sun angle gauge */ }
        { current_elevation !== null && <SunAngle elevation={ current_elevation } max_elevation={ max_elevation } /> }

        { has_window ? <>

            { /* Time range */ }
            <p className="big-time">
                { format_time( start ) } &rarr; { format_time( end ) }
            </p>

            { /* Duration */ }
            <p className="muted" style={ { marginBlockStart: `var(--space-xs)` } }>
                { Math.round( ( end - start ) / 60_000 ) } min of vitamin D potential
            </p>

        </> : <>

            { /* No window today */ }
            <p className="result-heading">
                Not possible today
            </p>
            <p className="muted" style={ { marginBlockStart: `var(--space-xs)` } }>
                Max solar elevation: { max_elevation.toFixed( 1 ) }° (need 45°+)
            </p>
            <div className="warning">
                The sun won't reach a high enough angle today for vitamin D synthesis. Consider supplementation.
            </div>

        </> }

    </div>
}
