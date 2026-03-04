import { SunAngle } from './SunAngle'

/**
 * Displays today's vitamin D synthesis window and exposure recommendation
 * @param {{ window: object|null, exposure: object|null, current_elevation: number|null }} props
 */
export function VitdWindow( { window: vitd_window, exposure, current_elevation } ) {

    if( !vitd_window ) return null

    const { start, end, max_elevation } = vitd_window
    const has_window = start && end

    // Format time as localized HH:MM
    const format_time = ( date ) => date.toLocaleTimeString( [], { hour: `2-digit`, minute: `2-digit` } )

    return <div className="card">

        <h2>Today's Window</h2>

        { /* Live sun angle gauge */ }
        { current_elevation !== null && <SunAngle elevation={ current_elevation } /> }

        { has_window ? <>

            { /* Time range */ }
            <p className="big-time">
                { format_time( start ) } &rarr; { format_time( end ) }
            </p>

            { /* Duration */ }
            <p className="muted" style={ { marginTop: `0.25rem` } }>
                { Math.round( ( end - start ) / 60_000 ) } minutes of vitamin D potential
            </p>

            { /* Exposure recommendation */ }
            { exposure && <div className="warning" style={ { background: `#ecfdf5`, borderColor: `#a7f3d0` } }>
                ~{ exposure.minutes } min exposure recommended for { exposure.label } skin (arms + face)
            </div> }

        </> : <>

            { /* No window today */ }
            <p style={ { fontSize: `1.1rem`, fontWeight: 600 } }>
                Not possible today
            </p>
            <p className="muted" style={ { marginTop: `0.25rem` } }>
                Max solar elevation: { max_elevation.toFixed( 1 ) }° (need 45°+)
            </p>
            <div className="warning">
                The sun won't reach a high enough angle today for vitamin D synthesis. Consider supplementation.
            </div>

        </> }

    </div>
}
