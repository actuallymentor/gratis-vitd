/**
 * Annual vitamin D season display with visual year bar and exposure recommendation
 * @param {{ season: object|null, exposure: object|null }} props
 */
export function VitdSeason( { season, exposure } ) {

    if( !season ) return null

    const { first_day, last_day, total_days, year_round } = season
    const month_labels = [ `J`, `F`, `M`, `A`, `M`, `J`, `J`, `A`, `S`, `O`, `N`, `D` ]

    // Format date as "Mar 21"
    const format_date = ( date ) => date.toLocaleDateString( `en-US`, { month: `short`, day: `numeric` } )

    // Calculate position in year as percentage (0-100)
    const day_of_year = ( date ) => {
        const start_of_year = new Date( date.getFullYear(), 0, 0 )
        return Math.floor( ( date - start_of_year ) / 86_400_000 )
    }

    const today = new Date()
    const today_midnight = new Date( today.getFullYear(), today.getMonth(), today.getDate() )
    const today_pct =  day_of_year( today ) / 365  * 100

    // Season bar percentages
    const season_start_pct = first_day ?  day_of_year( first_day ) / 365  * 100 : 0
    const season_end_pct = last_day ?  day_of_year( last_day ) / 365  * 100 : 100

    // Compare at midnight to avoid time-of-day mismatch with season boundary dates
    const in_season = year_round ||  first_day && last_day && today_midnight >= first_day && today_midnight <= last_day

    return <div className="card">

        <h2>Vitamin D Season</h2>

        { /* Year-round message */ }
        { year_round && <>
            <p className="result-heading">Year-round vitamin D</p>
            <p className="muted">Your location gets sufficient solar elevation throughout the year.</p>
        </> }

        { /* No season */ }
        { total_days === 0 && <>
            <p className="result-heading">No vitamin D season</p>
            <p className="muted">The sun never reaches 45° at your latitude. Year-round supplementation recommended.</p>
        </> }

        { /* Normal season with dates */ }
        { !year_round && total_days > 0 && <p className="result-heading">
            { format_date( first_day ) } &rarr; { format_date( last_day ) }
            <span className="muted" style={ { marginInlineStart: `var(--space-s)` } }>({ total_days } days)</span>
        </p> }

        { /* Exposure recommendation — shown when in-season */ }
        { in_season && exposure && <div className="warning exposure-box" style={ { marginBlockStart: `var(--space-ms)` } }>
            ~{ exposure.minutes } min in midday sun for { exposure.label } skin (arms + face)
        </div> }

        { /* Visual year bar */ }
        { total_days > 0 && <div className="season-bar-container">

            { /* Bar */ }
            <div className="season-bar">

                { /* Season highlight */ }
                <div
                    className="season-bar-fill"
                    style={ {
                        left: `${ year_round ? 0 : season_start_pct }%`,
                        width: `${ year_round ? 100 : season_end_pct - season_start_pct }%`,
                    } }
                />

                { /* Today marker */ }
                <div className="season-bar-marker" style={ { left: `${ today_pct }%` } } />

            </div>

            { /* Month labels */ }
            <div className="month-labels">
                { month_labels.map( ( label, i ) => <span
                    key={ i }
                    className="muted month-label"
                >{ label }</span> ) }
            </div>

        </div> }

        { /* Supplement warning */ }
        { !year_round && !in_season && total_days > 0 && <div className="warning">
            You're outside the vitamin D season. Consider supplementation until { format_date( first_day ) }.
        </div> }

    </div>
}
