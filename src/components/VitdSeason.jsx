/**
 * Annual vitamin D season display with visual year bar
 * @param {{ season: object|null }} props
 */
export function VitdSeason( { season } ) {

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
            <p style={ { fontSize: `1.1rem`, fontWeight: 600 } }>Year-round vitamin D</p>
            <p className="muted">Your location gets sufficient solar elevation throughout the year.</p>
        </> }

        { /* No season */ }
        { total_days === 0 && <>
            <p style={ { fontSize: `1.1rem`, fontWeight: 600 } }>No vitamin D season</p>
            <p className="muted">The sun never reaches 45° at your latitude. Year-round supplementation recommended.</p>
        </> }

        { /* Normal season with dates */ }
        { !year_round && total_days > 0 && <p style={ { fontSize: `1.1rem`, fontWeight: 600 } }>
            { format_date( first_day ) } &rarr; { format_date( last_day ) }
            <span className="muted" style={ { marginLeft: `0.5rem` } }>({ total_days } days)</span>
        </p> }

        { /* Visual year bar */ }
        { total_days > 0 && <div style={ { marginTop: `1rem` } }>

            { /* Bar container */ }
            <div style={ {
                position: `relative`,
                height: `24px`,
                background: `#e5e7eb`,
                borderRadius: `6px`,
                overflow: `hidden`,
            } }
            >

                { /* Season highlight */ }
                <div style={ {
                    position: `absolute`,
                    left: `${ year_round ? 0 : season_start_pct }%`,
                    width: `${ year_round ? 100 : season_end_pct - season_start_pct }%`,
                    height: `100%`,
                    background: `linear-gradient(90deg, var(--color-sun-light), var(--color-sun))`,
                    borderRadius: `6px`,
                } }
                />

                { /* Today marker */ }
                <div style={ {
                    position: `absolute`,
                    left: `${ today_pct }%`,
                    top: 0,
                    bottom: 0,
                    width: `2px`,
                    background: `var(--color-text)`,
                } }
                />

            </div>

            { /* Month labels */ }
            <div style={ {
                display: `flex`,
                justifyContent: `space-between`,
                marginTop: `0.25rem`,
                padding: `0 2px`,
            } }
            >
                { month_labels.map( ( label, i ) => <span
                    key={ i }
                    className="muted"
                    style={ { fontSize: `0.7rem`, width: `8.33%`, textAlign: `center` } }
                >{ label }</span> ) }
            </div>

        </div> }

        { /* Supplement warning */ }
        { !year_round && !in_season && total_days > 0 && <div className="warning">
            You're outside the vitamin D season. Consider supplementation until { format_date( first_day ) }.
        </div> }

    </div>
}
