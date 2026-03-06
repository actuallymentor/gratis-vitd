/**
 * Displays today's vitamin D status — icon-based indicator with time range
 * @param {{ window: object|null, exposure: object|null, current_elevation: number|null }} props
 */
export function VitdWindow( { window: vitd_window, exposure, current_elevation } ) {

    if( !vitd_window ) return null

    const { start, end, max_elevation } = vitd_window
    const has_window = start && end

    // Is the sun currently high enough for vitamin D synthesis?
    const is_active = current_elevation !== null && current_elevation >= 45

    // Format time as localized HH:MM
    const format_time = ( date ) => date.toLocaleTimeString( [], { hour: `2-digit`, minute: `2-digit` } )

    return <div className="vitd-window-content">

        { has_window ? <>

            { /* Status icon + label */ }
            <div className={ `vitd-status${ is_active ? ` vitd-status--active` : `` }` }>
                <span className="vitd-status-icon">{ is_active ? `\u{2600}\u{FE0F}` : `\u{1F324}\u{FE0F}` }</span>
                <span className="vitd-status-label">
                    { is_active ? `Vitamin D available now` : `Available today` }
                </span>
            </div>

            { /* Time range */ }
            <p className="big-time">
                { format_time( start ) } &rarr; { format_time( end ) }
            </p>

            { /* Duration */ }
            <p className="muted">
                { Math.round( ( end - start ) / 60_000 ) } min window
            </p>

            { /* Exposure recommendation */ }
            { exposure && <p className="muted">
                ~{ exposure.minutes } min for { exposure.label } skin
            </p> }

        </> : <>

            { /* Not available */ }
            <div className="vitd-status vitd-status--none">
                <span className="vitd-status-icon">{ `\u{2601}\u{FE0F}` }</span>
                <span className="vitd-status-label">Not possible today</span>
            </div>

            <p className="muted">
                Peak sun angle: { max_elevation.toFixed( 1 ) }° (need 45°+)
            </p>

            <p className="muted">
                Consider supplementation.
            </p>

        </> }

    </div>
}
