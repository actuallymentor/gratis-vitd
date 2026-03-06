import { useEffect } from 'react'
import styled from 'styled-components'
import { Sun } from 'lucide-react'

import { use_geolocation } from '../../hooks/use_geolocation'
import LocationPicker from '../molecules/LocationPicker'
import SkinTypeSelector from '../molecules/SkinTypeSelector'


const Page = styled.div`
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xl) var(--space-m);
`

const Container = styled.div`
    max-width: 540px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-l);
    text-align: center;
`

const IconWrap = styled.div`
    color: var(--accent);
`

const Title = styled.h1`
    font-weight: 700;
`

const Subtitle = styled.p`
    color: var(--text-muted);
    max-width: 40ch;
    line-height: 1.6;
`

const SectionLabel = styled.h3`
    font-size: 0.95em;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: var(--space-m);
`


/**
 * Onboarding page: location + skin type selection.
 * @param {{ settings: Object, update_settings: Function }} props
 */
export default function Onboarding( { settings, update_settings } ) {

    const { lat, lng, loading, error, request_location } = use_geolocation()

    // When geolocation succeeds, save and move on
    useEffect( () => {
        if( lat !== null && lng !== null ) {
            update_settings( { lat, lng, location_name: `My location` } )
        }
    }, [ lat, lng, update_settings ] )

    const select_location = ( lat, lng, name ) => {
        update_settings( { lat, lng, location_name: name } )
    }

    const select_skin_type = ( type ) => {
        update_settings( { skin_type: type } )
    }

    return <Page>
        <Container>

            <IconWrap><Sun size={ 48 } strokeWidth={ 1.5 } /></IconWrap>

            <Title>Vitamin D Calculator</Title>

            <Subtitle>
                Check at what times of the day the sun is strong enough for you to generate vitamin D.
            </Subtitle>

            { /* Location section */ }
            <SectionLabel>Your location</SectionLabel>

            { settings.location_name && <LocationConfirmed>{ settings.location_name }</LocationConfirmed> }

            { !settings.location_name && <LocationPicker
                on_select={ select_location }
                geo_loading={ loading }
                geo_error={ error }
                request_location={ request_location }
            /> }

            { /* Skin type section */ }
            <SectionLabel>Your skin type</SectionLabel>

            <SkinTypeSelector
                selected={ settings.skin_type }
                on_select={ select_skin_type }
            />

        </Container>
    </Page>

}


const LocationConfirmed = styled.p`
    font-weight: 600;
    color: var(--accent-dark);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
`
