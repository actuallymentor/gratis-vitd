import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'
import { RotateCcw } from 'lucide-react'

import ChartCard from '../molecules/ChartCard'
import InlineInput from '../atoms/InlineInput'
import SkinTypeDropdown from '../atoms/SkinTypeDropdown'


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

const LocationLabel = styled.p`
    font-size: 0.85em;
    color: var(--text-muted);
`

// NIH daily recommended IU for adults
const DAILY_RECOMMENDED_IU = 600


/**
 * Main dashboard: chart + inline settings sentence.
 * @param {{ settings: Object, update_settings: Function, reset_settings: Function }} props
 */
export default function Dashboard( { settings, update_settings, reset_settings } ) {

    const { lat, lng, skin_type, percent_exposed, target_iu, location_name } = settings

    // Local state for responsive inputs — debounce persistence
    const [ local_exposed, set_local_exposed ] = useState( percent_exposed )
    const [ local_skin, set_local_skin ] = useState( skin_type )
    const [ local_iu, set_local_iu ] = useState( target_iu )

    // Sync local state when settings change externally (e.g. reset)
    useEffect( () => {
        set_local_exposed( percent_exposed )
        set_local_skin( skin_type )
        set_local_iu( target_iu )
    }, [ percent_exposed, skin_type, target_iu ] )

    // Debounced save — 3 seconds
    const debounced_save = useDebouncedCallback( ( updates ) => {
        update_settings( updates )
    }, 3000 )

    // Flush any pending debounced save on unmount (prevents lost changes)
    useEffect( () => () => debounced_save.flush(), [ debounced_save ] )

    const change_exposed = useCallback( ( val ) => {
        const clamped = Math.max( 1, Math.min( 100, val ) )
        set_local_exposed( clamped )
        debounced_save( { percent_exposed: clamped } )
    }, [ debounced_save ] )

    const change_skin = useCallback( ( val ) => {
        const clamped = Math.max( 1, Math.min( 6, Math.round( val ) ) )
        set_local_skin( clamped )
        debounced_save( { skin_type: clamped } )
    }, [ debounced_save ] )

    const change_iu = useCallback( ( val ) => {
        const clamped = Math.max( 100, Math.min( 10000, val ) )
        set_local_iu( clamped )
        debounced_save( { target_iu: clamped } )
    }, [ debounced_save ] )

    const daily_percent = Math.round( local_iu / DAILY_RECOMMENDED_IU * 100 )

    return <Page>
        <Container>

            { location_name && <LocationLabel>{ location_name }</LocationLabel> }

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
                Assuming you are{ ` ` }
                <InlineInput value={ local_exposed } on_change={ change_exposed } min={ 1 } max={ 100 } width="3em" />% exposed to the sun, have skin type{ ` ` }
                <SkinTypeDropdown value={ local_skin } on_change={ change_skin } />, and want to get{ ` ` }
                <InlineInput value={ local_iu } on_change={ change_iu } min={ 100 } max={ 10000 } width="4em" /> IU of vitamin D which is{ ` ` }
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
    </Page>

}
