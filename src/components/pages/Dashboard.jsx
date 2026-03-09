import { useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'
import { RotateCcw } from 'lucide-react'

import ChartCard from '../molecules/ChartCard'
import InlineInput from '../atoms/InlineInput'
import SkinTypeModal from '../molecules/SkinTypeModal'
import ExposureModal, { exposure_label } from '../molecules/ExposureModal'
import { LABELS } from '../atoms/SkinTypeOption'
import { get_day_solar_data } from '../../modules/solar'
import { minutes_for_target_iu, time_to_erythema } from '../../modules/vitd'


const Page = styled.div`
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xl) var(--space-m);
`

const Container = styled.div`
    max-width: 720px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-l);
`

const SettingsText = styled.p`
    max-width: 65ch;
    width: 100%;
    line-height: 1.8;
    text-align: center;
    color: var(--text);
`

const ButtonRow = styled.div`
    display: flex;
    gap: var(--space-m);
    flex-wrap: wrap;
    justify-content: center;
`

const IconButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-s) var(--space-m);
    border: 2px solid var(--border);
    border-radius: 0.5rem;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.85em;
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--accent);
        color: var(--text);
    }
`

const SkinTypeLink = styled.button`
    display: inline;
    font-weight: 700;
    color: var(--accent-dark);
    background: none;
    border: none;
    border-bottom: 2px dashed var(--accent);
    padding: 0 var(--space-xs);
    font-size: inherit;
    line-height: inherit;
    cursor: pointer;
    transition: border-color 0.2s ease;

    &:hover {
        border-bottom-style: solid;
        border-color: var(--accent-dark);
    }
`

const SolarNoonHeading = styled.h2`
    text-align: center;
    font-weight: 500;
`

const InlineTimeInput = styled.input.attrs( { type: `time` } )`
    font-weight: 700;
    color: var(--accent-dark);
    background: none;
    border: none;
    border-bottom: 2px dashed var(--accent);
    padding: 0 var(--space-xs);
    font-size: inherit;
    font-family: inherit;
    line-height: inherit;
    cursor: pointer;
    transition: border-color 0.2s ease;

    &:hover, &:focus {
        border-bottom-style: solid;
        border-color: var(--accent-dark);
        outline: none;
    }

    /* Hide the clock icon in WebKit browsers */
    &::-webkit-calendar-picker-indicator {
        opacity: 0.5;
        cursor: pointer;
    }
`

const SolarNoonSub = styled.p`
    text-align: center;
    color: var(--text);
    line-height: 1.8;
`

const MoreLabel = styled.strong`
    color: var(--safe);
`

const LessLabel = styled.strong`
    color: var(--erythema);
`

// NIH daily recommended IU for adults
const DAILY_RECOMMENDED_IU = 600


/**
 * Main dashboard: chart + inline settings sentence.
 * @param {{ settings: Object, update_settings: Function, reset_settings: Function }} props
 */
export default function Dashboard( { settings, update_settings, reset_settings } ) {

    const { lat, lng, skin_type, percent_exposed, target_iu } = settings

    // Local state for responsive inputs — debounce persistence
    const [ local_exposed, set_local_exposed ] = useState( percent_exposed )
    const [ local_skin, set_local_skin ] = useState( skin_type )
    const [ local_iu, set_local_iu ] = useState( target_iu )
    const [ show_skin_modal, set_show_skin_modal ] = useState( false )
    const [ show_exposure_modal, set_show_exposure_modal ] = useState( false )

    // Sync local state when settings change externally (e.g. reset)
    useEffect( () => {
        set_local_exposed( percent_exposed )
        set_local_skin( skin_type )
        set_local_iu( target_iu )
    }, [ percent_exposed, skin_type, target_iu ] )

    // Debounced save — 500ms
    const debounced_save = useDebouncedCallback( ( updates ) => {
        update_settings( updates )
    }, 500 )

    // Flush any pending debounced save on unmount (prevents lost changes)
    useEffect( () => () => debounced_save.flush(), [ debounced_save ] )

    // Exposure changes via modal — save immediately
    const change_exposed = useCallback( ( val ) => {
        set_local_exposed( val )
        update_settings( { percent_exposed: val } )
    }, [ update_settings ] )

    // Skin type changes via modal — save immediately (no debounce needed)
    const change_skin = useCallback( ( val ) => {
        set_local_skin( val )
        update_settings( { skin_type: val } )
    }, [ update_settings ] )

    const change_iu = useCallback( ( val ) => {
        set_local_iu( val )
        if( val >= 100 && val <= 10000 ) debounced_save( { target_iu: val } )
    }, [ debounced_save ] )

    const commit_iu = useCallback( ( val ) => {
        const clamped = Math.max( 100, Math.min( 10000, val ) )
        set_local_iu( clamped )
        debounced_save.flush()
        update_settings( { target_iu: clamped } )
    }, [ update_settings, debounced_save ] )

    const daily_percent = Math.round( local_iu / DAILY_RECOMMENDED_IU * 100 )

    // Editable time — null means "use solar noon"
    const [ selected_time, set_selected_time ] = useState( null )

    const change_time = useCallback( ( e ) => {
        set_selected_time( e.target.value )
    }, [] )

    // Full solar data for the day (memoize once per location)
    const solar_data = useMemo( () => get_day_solar_data( lat, lng ), [ lat, lng ] )

    // Solar noon = point with lowest SZA (sun highest in sky)
    const noon_time = useMemo( () => {
        if( !solar_data.length ) return null
        const peak = solar_data.reduce( ( best, s ) => s.sza_degrees < best.sza_degrees ? s : best )
        return peak.time.toLocaleTimeString( [], { hour: `2-digit`, minute: `2-digit`, hour12: false } )
    }, [ solar_data ] )

    // Effective time: user-selected or solar noon
    const effective_time = selected_time || noon_time

    // Derive minutes / burn / ratio for the selected time
    const selected_data = useMemo( () => {
        if( !solar_data.length || !effective_time ) return null

        // Find closest data point to the selected time
        const to_mins = ( hhmm ) => {
            const [ h, m ] = hhmm.split( `:` ).map( Number )
            return h * 60 + m
        }
        const target_mins = to_mins( effective_time )
        const target = solar_data.reduce( ( best, s ) =>
            Math.abs( to_mins( s.hour_label ) - target_mins ) < Math.abs( to_mins( best.hour_label ) - target_mins )
                ? s : best
        )

        const minutes = Math.round( minutes_for_target_iu( target.sza_degrees, local_iu, local_skin, local_exposed ) )
        const burn = Math.round( time_to_erythema( target.sza_degrees, local_skin ) )

        // Ratio semantics: "more" when burn > vitd time, "less" when reversed
        const is_more = burn >= minutes
        const ratio = minutes > 0 && burn > 0
            ? ( is_more ? burn / minutes : minutes / burn ).toFixed( 1 )
            : `∞`

        return { time: effective_time, matched_time: target.hour_label, minutes, burn, ratio, is_more }
    }, [ solar_data, effective_time, local_iu, local_skin, local_exposed ] )

    return <Page>
        <Container>

            { /* Solar noon summary */ }
            { selected_data && <>
                <SolarNoonHeading>
                    Target: { selected_data.minutes } min at{ ` ` }
                    <InlineTimeInput value={ effective_time } onChange={ change_time } />
                </SolarNoonHeading>
                <SolarNoonSub>
                    At { effective_time } estimated burn time is { selected_data.burn } minutes.
                    That means your { selected_data.minutes } minutes sun gives{ ` ` }
                    { selected_data.is_more
                        ? <><MoreLabel>{ selected_data.ratio }x more</MoreLabel> vitamin D than burn risk</>
                        : <><LessLabel>{ selected_data.ratio }x less</LessLabel> vitamin D than burn risk</> }.
                </SolarNoonSub>
            </> }

            { /* Inline settings sentence */ }
            <SettingsText>
                This assumes{ ` ` }
                <SkinTypeLink onClick={ () => set_show_exposure_modal( true ) }>
                    { exposure_label( local_exposed ) }
                </SkinTypeLink>{ ` ` }exposed to the sun, skin type{ ` ` }
                <SkinTypeLink onClick={ () => set_show_skin_modal( true ) }>
                    { LABELS[ local_skin ] }
                </SkinTypeLink>, and a target of{ ` ` }
                <InlineInput value={ local_iu } on_change={ change_iu } on_blur={ commit_iu } min={ 100 } max={ 10000 } width="4em" /> IU which is{ ` ` }
                <strong>{ daily_percent }%</strong> of the daily recommended amount.
            </SettingsText>

            { /* Chart */ }
            <ChartCard
                lat={ lat }
                lng={ lng }
                skin_type={ local_skin }
                percent_exposed={ local_exposed }
                target_iu={ local_iu }
                selected_time={ selected_data?.matched_time }
            />

            { /* Actions */ }
            <ButtonRow>
                <IconButton onClick={ reset_settings }>
                    <RotateCcw size={ 14 } />
                    Reset location & settings
                </IconButton>
            </ButtonRow>

        </Container>

        { /* Exposure selection modal */ }
        { show_exposure_modal && <ExposureModal
            selected={ local_exposed }
            on_select={ change_exposed }
            on_close={ () => set_show_exposure_modal( false ) }
        /> }

        { /* Skin type selection modal */ }
        { show_skin_modal && <SkinTypeModal
            selected={ local_skin }
            on_select={ change_skin }
            on_close={ () => set_show_skin_modal( false ) }
        /> }

    </Page>

}
