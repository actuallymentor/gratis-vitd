import { useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'
import { RotateCcw, Clock, Sun, Info } from 'lucide-react'
import { log } from 'mentie'

import ChartCard from '../molecules/ChartCard'
import InlineInput from '../atoms/InlineInput'
import SkinTypeModal from '../molecules/SkinTypeModal'
import ExposureModal, { exposure_label } from '../molecules/ExposureModal'
import { get_day_solar_data } from '../../modules/solar'
import { minutes_for_target_iu, time_to_erythema } from '../../modules/vitd'
import { reverse_geocode } from '../../modules/geocode'
import { use_i18n } from '../../i18n/use_i18n'


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

const LocationLabel = styled.p`
    font-size: 0.75em;
    color: var(--text-muted);
    opacity: 0.9;
    text-align: center;
    line-height: 1.4;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    text-align: center;
    font-weight: 500;
`

// Inline info trigger — shows the tooltip on hover, focus, or tap
const TooltipHost = styled.span`
    position: relative;
    display: inline-flex;
    align-items: center;
    color: var(--text-muted);
    cursor: help;

    &:hover,
    &:focus-visible { color: var(--accent-dark); }
`

const TooltipBubble = styled.span`
    position: absolute;
    bottom: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
    background: var(--text);
    color: var(--surface);
    padding: var(--space-xs) var(--space-s);
    border-radius: 0.4rem;
    font-size: 0.75rem;
    line-height: 1.4;
    font-weight: 400;
    width: max-content;
    max-width: 240px;
    text-align: center;
    pointer-events: none;
    z-index: 10;
`

// Single line of the heading — keeps inline runs of text + inputs aligned
const HeadingRow = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--space-xs);
`

const PillRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-s);
    flex-wrap: wrap;
    justify-content: center;
`

const PillLabel = styled.span`
    font-size: 0.85em;
    color: var(--text-muted);
`

// Active pill = filled accent; inactive = outlined and muted
const Pill = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-m);
    border: 2px solid ${ ( { $active } ) => $active ? `var(--accent)` : `var(--border)` };
    border-radius: 999px;
    background: ${ ( { $active } ) => $active ? `var(--accent)` : `transparent` };
    color: ${ ( { $active } ) => $active ? `var(--surface)` : `var(--text-muted)` };
    font-size: 0.85em;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--accent);
        color: ${ ( { $active } ) => $active ? `var(--surface)` : `var(--text)` };
    }
`

const InlineTimeInput = styled.input.attrs( { type: `text`, inputMode: `numeric`, maxLength: 5, placeholder: `HH:MM` } )`
    width: 5ch;
    text-align: center;
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

// Current local clock as HH:MM — used as the default time and by the "Now" pill
const get_now_time = () => {
    const now = new Date()
    return `${ String( now.getHours() ).padStart( 2, `0` ) }:${ String( now.getMinutes() ).padStart( 2, `0` ) }`
}

/**
 * Small info icon that reveals an explanatory bubble on hover, keyboard
 * focus, or tap. Tap-to-toggle keeps the affordance usable on touch devices
 * where hover doesn't fire.
 * @param {{ content: string }} props
 */
function InfoTooltip( { content } ) {

    const [ open, set_open ] = useState( false )

    return <TooltipHost
        tabIndex={ 0 }
        role="button"
        aria-label={ content }
        onMouseEnter={ () => set_open( true ) }
        onMouseLeave={ () => set_open( false ) }
        onFocus={ () => set_open( true ) }
        onBlur={ () => set_open( false ) }
        onClick={ () => set_open( ( prev ) => !prev ) }
    >
        <Info size={ 16 } />
        { open && <TooltipBubble>{ content }</TooltipBubble> }
    </TooltipHost>

}


/**
 * Main dashboard: chart + inline settings sentence.
 * @param {{ settings: Object, update_settings: Function, reset_settings: Function }} props
 */
export default function Dashboard( { settings, update_settings, reset_settings } ) {

    const { t } = use_i18n()
    const { lat, lng, skin_type, percent_exposed, target_iu, location_name, auto_location } = settings

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

    // Auto-located users get a fresh GPS fix on mount + every 30 minutes while open.
    // Manual locations stay put — the user knows where they are.
    useEffect( () => {

        if( !auto_location || !navigator.geolocation ) return

        // Guard against the in-flight callback resolving after we unmount or the
        // user switches to manual location, which would clobber their new pick
        let cancelled = false

        const refresh_location = () => navigator.geolocation.getCurrentPosition(
            ( { coords } ) => {
                if( cancelled ) return
                update_settings( { lat: coords.latitude, lng: coords.longitude } )
            },
            ( err ) => log.warn( `Auto-refresh location failed:`, err.message ),
            { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
        )

        refresh_location()
        const interval = setInterval( refresh_location, 30 * 60 * 1000 )
        return () => {
            cancelled = true
            clearInterval( interval )
        }

    }, [ auto_location, update_settings ] )

    // Reverse-geocode coords into a city name whenever they change.
    // Offline static lookup — runs only for auto-located users.
    // Empty string when no match so the label falls back to coords (and
    // legacy "My location" strings from older versions get cleared out).
    useEffect( () => {

        if( !auto_location || lat === null || lng === null ) return

        const name = reverse_geocode( lat, lng ) || ``
        if( name !== location_name ) update_settings( { location_name: name } )

    }, [ lat, lng, auto_location, location_name, update_settings ] )

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

    // Selected time defaults to the current local clock; mode tracks which pill (if any) is active
    const [ selected_time, set_selected_time ] = useState( get_now_time )
    const [ time_mode, set_time_mode ] = useState( `now` )
    const [ time_draft, set_time_draft ] = useState( null )

    // Validate and apply a time string like "14:30" — manual edits become "custom" mode
    const commit_time = useCallback( ( raw ) => {
        const match = raw.match( /^(\d{1,2}):(\d{2})$/ )
        if( !match ) return set_time_draft( null )
        const [ , h, m ] = match.map( Number )
        if( h > 23 || m > 59 ) return set_time_draft( null )
        const formatted = `${ String( h ).padStart( 2, `0` ) }:${ String( m ).padStart( 2, `0` ) }`
        set_time_draft( null )
        set_selected_time( formatted )
        set_time_mode( `custom` )
    }, [] )

    // Pill: snap to current local time
    const select_now = useCallback( () => {
        set_selected_time( get_now_time() )
        set_time_mode( `now` )
    }, [] )

    // Chart click also counts as a manual override
    const select_from_chart = useCallback( ( time ) => {
        set_selected_time( time )
        set_time_mode( `custom` )
    }, [] )

    // Full solar data for the day (memoize once per location)
    const solar_data = useMemo( () => get_day_solar_data( lat, lng ), [ lat, lng ] )

    // Solar noon = point with lowest SZA (sun highest in sky)
    const noon_time = useMemo( () => {
        if( !solar_data.length ) return null
        const peak = solar_data.reduce( ( best, s ) => s.sza_degrees < best.sza_degrees ? s : best )
        return peak.time.toLocaleTimeString( [], { hour: `2-digit`, minute: `2-digit`, hour12: false } )
    }, [ solar_data ] )

    // Pill: snap to solar noon (depends on noon_time so it stays current after location change)
    const select_solar_noon = useCallback( () => {
        if( !noon_time ) return
        set_selected_time( noon_time )
        set_time_mode( `solar_noon` )
    }, [ noon_time ] )

    // Effective time: user-selected or fallback to solar noon (e.g. before solar_data is ready)
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
                    <HeadingRow>
                        <span>{ t( `dashboard.target_heading`, { minutes: selected_data.minutes } ) }</span>
                        <InlineTimeInput
                            value={ time_draft ?? effective_time }
                            onChange={ ( e ) => set_time_draft( e.target.value ) }
                            onBlur={ ( e ) => commit_time( e.target.value ) }
                            onKeyDown={ ( e ) => e.key === `Enter` && commit_time( e.target.value ) }
                        />
                    </HeadingRow>
                    <HeadingRow>
                        <span>{ t( `dashboard.for_iu` ) }</span>
                        <InlineInput value={ local_iu } on_change={ change_iu } on_blur={ commit_iu } min={ 100 } max={ 10000 } width="3.5em" />
                        <span>{ t( `dashboard.iu_vitamin_d` ) }</span>
                        <InfoTooltip content={ t( `dashboard.rda_tooltip`, { iu: local_iu, percent: daily_percent } ) } />
                    </HeadingRow>
                </SolarNoonHeading>
                <PillRow>
                    <PillLabel>{ t( `dashboard.sunbathing_time` ) }</PillLabel>
                    <Pill $active={ time_mode === `now` } onClick={ select_now }>
                        <Clock size={ 14 } />
                        { t( `dashboard.now` ) }
                    </Pill>
                    <Pill $active={ time_mode === `solar_noon` } onClick={ select_solar_noon }>
                        <Sun size={ 14 } />
                        { t( `dashboard.solar_noon` ) }
                    </Pill>
                </PillRow>
                <SolarNoonSub>
                    { t( `dashboard.at_time`, { time: effective_time } ) }
                    { ` ` }{ t( `dashboard.burn_time`, { minutes: selected_data.burn } ) }
                    { ` ` }{ t( `dashboard.your_minutes`, { minutes: selected_data.minutes } ) }{ ` ` }
                    { selected_data.is_more
                        ? <><MoreLabel>{ t( `dashboard.more_vitd`, { ratio: selected_data.ratio } ) }</MoreLabel> { t( `dashboard.than_burn` ) }</>
                        : <><LessLabel>{ t( `dashboard.less_vitd`, { ratio: selected_data.ratio } ) }</LessLabel> { t( `dashboard.than_burn` ) }</> }.
                </SolarNoonSub>
            </> }

            { /* Inline settings sentence */ }
            <SettingsText>
                { t( `dashboard.assumes` ) }{ ` ` }
                <SkinTypeLink onClick={ () => set_show_exposure_modal( true ) }>
                    { exposure_label( local_exposed, t ) }
                </SkinTypeLink>{ ` ` }{ t( `dashboard.exposed_to_sun` ) }{ ` ` }
                <SkinTypeLink onClick={ () => set_show_skin_modal( true ) }>
                    { t( `skin.type${ local_skin }` ) }
                </SkinTypeLink>.
            </SettingsText>

            { /* Chart */ }
            <ChartCard
                lat={ lat }
                lng={ lng }
                skin_type={ local_skin }
                percent_exposed={ local_exposed }
                target_iu={ local_iu }
                selected_time={ selected_data?.matched_time }
                on_select_time={ select_from_chart }
            />

            { /* Current location summary */ }
            <LocationLabel>
                { t( `dashboard.location_label`, {
                    value: location_name || `${ lat.toFixed( 2 ) }°, ${ lng.toFixed( 2 ) }°`,
                } ) }
            </LocationLabel>

            { /* Actions */ }
            <ButtonRow>
                <IconButton onClick={ reset_settings }>
                    <RotateCcw size={ 14 } />
                    { t( `dashboard.reset` ) }
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
