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
import { minutes_for_target_iu } from '../../modules/vitd'


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

const SolarNoonText = styled.p`
    text-align: center;
    font-size: 0.95em;
    color: var(--text-muted);
    line-height: 1.6;
`

const Highlight = styled.strong`
    color: var(--accent-dark);
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
        const clamped = Math.max( 100, Math.min( 10000, val ) )
        set_local_iu( clamped )
        debounced_save( { target_iu: clamped } )
    }, [ debounced_save ] )

    const daily_percent = Math.round( local_iu / DAILY_RECOMMENDED_IU * 100 )

    // Solar noon = point with lowest SZA (sun highest in sky)
    const solar_noon = useMemo( () => {
        const solar_data = get_day_solar_data( lat, lng )
        if( !solar_data.length ) return null
        const peak = solar_data.reduce( ( best, s ) => s.sza_degrees < best.sza_degrees ? s : best )
        const noon_label = peak.time.toLocaleTimeString( [], { hour: `2-digit`, minute: `2-digit`, hour12: false } )
        const noon_minutes = Math.round( minutes_for_target_iu( peak.sza_degrees, local_iu, local_skin, local_exposed ) )
        return { time: noon_label, minutes: noon_minutes }
    }, [ lat, lng, local_iu, local_skin, local_exposed ] )

    return <Page>
        <Container>

            { /* Solar noon summary */ }
            { solar_noon && <SolarNoonText>
                Solar noon is at <Highlight>{ solar_noon.time }</Highlight> — at that time it takes <Highlight>{ solar_noon.minutes } min</Highlight> of tanning to get your vitamin D.
            </SolarNoonText> }

            { /* Chart */ }
            <ChartCard
                lat={ lat }
                lng={ lng }
                skin_type={ local_skin }
                percent_exposed={ local_exposed }
                target_iu={ local_iu }
            />

            { /* Inline settings sentence */ }
            <SettingsText>
                Assuming{ ` ` }
                <SkinTypeLink onClick={ () => set_show_exposure_modal( true ) }>
                    { exposure_label( local_exposed ) }
                </SkinTypeLink>{ ` ` }exposed to the sun, skin type{ ` ` }
                <SkinTypeLink onClick={ () => set_show_skin_modal( true ) }>
                    { LABELS[ local_skin ] }
                </SkinTypeLink>, and a target of{ ` ` }
                <InlineInput value={ local_iu } on_change={ change_iu } min={ 100 } max={ 10000 } width="4em" /> IU which is{ ` ` }
                <strong>{ daily_percent }%</strong> of the daily recommended amount.
            </SettingsText>

            { /* Actions */ }
            <ButtonRow>
                <IconButton onClick={ reset_settings }>
                    <RotateCcw size={ 14 } />
                    Change location
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
