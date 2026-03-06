import { useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

import { get_day_solar_data } from '../../modules/solar'
import { minutes_for_target_iu, time_to_erythema } from '../../modules/vitd'


const Card = styled.div`
    width: 100%;
    background: var(--surface);
    border-radius: 1rem;
    padding: var(--space-l) var(--space-m);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`

const SolarNoonText = styled.p`
    margin-top: var(--space-m);
    text-align: center;
    font-size: 0.9em;
    color: var(--text-muted);
    line-height: 1.6;
`

const Highlight = styled.strong`
    color: var(--accent-dark);
`


/**
 * Line chart showing minutes-to-target-IU and time-to-erythema across the day.
 * @param {{ lat: number, lng: number, skin_type: number, percent_exposed: number, target_iu: number }} props
 */
export default function ChartCard( { lat, lng, skin_type, percent_exposed, target_iu } ) {

    const chart_data = useMemo( () => {

        const solar_data = get_day_solar_data( lat, lng )

        return solar_data.map( ( { sza_degrees, hour_label } ) => {

            const vitd_minutes = minutes_for_target_iu( sza_degrees, target_iu, skin_type, percent_exposed )
            const burn_minutes = time_to_erythema( sza_degrees, skin_type )

            return {
                time: hour_label,
                vitd_minutes: Math.min( vitd_minutes, 300 ),   // Cap at 5h for readability
                burn_minutes: Math.min( burn_minutes, 300 ),
            }

        } )

    }, [ lat, lng, skin_type, percent_exposed, target_iu ] )

    // Solar noon = point with lowest SZA (sun highest in sky)
    const solar_noon = useMemo( () => {

        const solar_data = get_day_solar_data( lat, lng )
        if( !solar_data.length ) return null

        const peak = solar_data.reduce( ( best, s ) => s.sza_degrees < best.sza_degrees ? s : best )
        const noon_label = peak.time.toLocaleTimeString( [], { hour: `2-digit`, minute: `2-digit`, hour12: false } )
        const noon_minutes = Math.round( minutes_for_target_iu( peak.sza_degrees, target_iu, skin_type, percent_exposed ) )

        return { time: noon_label, minutes: noon_minutes }

    }, [ lat, lng, target_iu, skin_type, percent_exposed ] )


    if( !chart_data.length ) return <Card>
        <p style={ { textAlign: `center`, color: `var(--text-muted)` } }>
            No sunlight data available for this location today.
        </p>
    </Card>


    // Track container width to adapt tick density
    const [ chart_width, set_chart_width ] = useState( 600 )
    const handle_resize = useCallback( ( w ) => {
        if( w ) set_chart_width( w ) 
    }, [] )

    // Fewer labels on narrow screens to prevent overlap
    const target_ticks = chart_width < 400 ? 4 : chart_width < 600 ? 6 : 12
    const tick_interval = Math.max( 1, Math.floor( chart_data.length / target_ticks ) )
    const tick_font_size = chart_width < 400 ? 10 : 12

    return <Card>

        <ResponsiveContainer width="100%" height={ 320 } onResize={ handle_resize }>
            <LineChart data={ chart_data } margin={ { top: 5, right: 20, left: 0, bottom: 5 } }>

                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

                <XAxis
                    dataKey="time"
                    interval={ tick_interval }
                    tick={ { fontSize: tick_font_size } }
                    stroke="var(--text-muted)"
                    angle={ chart_width < 400 ? -45 : 0 }
                    textAnchor={ chart_width < 400 ? `end` : `middle` }
                    height={ chart_width < 400 ? 50 : 30 }
                />

                <YAxis
                    label={ { value: `Minutes of tanning`, angle: -90, position: `insideLeft`, style: { fontSize: 12 } } }
                    tick={ { fontSize: 12 } }
                    stroke="var(--text-muted)"
                    domain={ [ 0, `auto` ] }
                />

                <Tooltip
                    contentStyle={ { borderRadius: `0.5rem`, fontSize: `0.85rem` } }
                    formatter={ ( value, name ) => [
                        `${ Math.round( value ) } min`,
                        name === `vitd_minutes` ? `Vitamin D` : `Sunburn`,
                    ] }
                />

                <Legend
                    formatter={ ( value ) => value === `vitd_minutes` ? `Minutes for vitamin D` : `Minutes to sunburn` }
                />

                { /* Vitamin D target line */ }
                <Line
                    type="monotone"
                    dataKey="vitd_minutes"
                    stroke="var(--accent)"
                    strokeWidth={ 2.5 }
                    dot={ false }
                    activeDot={ { r: 4 } }
                />

                { /* Erythema / sunburn line */ }
                <Line
                    type="monotone"
                    dataKey="burn_minutes"
                    stroke="var(--erythema)"
                    strokeWidth={ 2 }
                    strokeDasharray="6 3"
                    dot={ false }
                    activeDot={ { r: 4 } }
                />

            </LineChart>
        </ResponsiveContainer>

        { solar_noon && <SolarNoonText>
            Solar noon is at <Highlight>{ solar_noon.time }</Highlight> — at that time it takes <Highlight>{ solar_noon.minutes } min</Highlight> of tanning to get your vitamin D.
        </SolarNoonText> }

    </Card>

}
