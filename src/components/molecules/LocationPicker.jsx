import { useState, useMemo } from 'react'
import styled from 'styled-components'
import { MapPin, Globe, X, Search } from 'lucide-react'

import { log } from 'mentie'
import { LOCATIONS } from '../../modules/locations'
import { use_i18n } from '../../i18n/use_i18n'


/* ── Styled components ──────────────────────────── */

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: var(--space-m);
`

const Modal = styled.div`
    background: var(--surface);
    border-radius: 1rem;
    padding: var(--space-xl);
    max-width: 480px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    gap: var(--space-m);
    position: relative;
`

const CloseButton = styled.button`
    position: absolute;
    top: var(--space-m);
    right: var(--space-m);
    background: none;
    border: none;
    color: var(--text-muted);
    padding: var(--space-xs);

    &:hover { color: var(--text); }
`

const TabRow = styled.div`
    display: flex;
    gap: var(--space-s);
`

const Tab = styled.button`
    flex: 1;
    padding: var(--space-s) var(--space-m);
    border: 2px solid ${ ( { $active } ) => $active ? `var(--accent)` : `var(--border)` };
    border-radius: 0.5rem;
    background: ${ ( { $active } ) => $active ? `color-mix(in srgb, var(--accent) 10%, white)` : `transparent` };
    font-weight: ${ ( { $active } ) => $active ? 600 : 400 };
    color: var(--text);
    transition: all 0.2s ease;

    &:hover { border-color: var(--accent); }
`

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);

    label {
        font-size: 0.85em;
        color: var(--text-muted);
        font-weight: 600;
    }

    input {
        padding: var(--space-s) var(--space-m);
        border: 2px solid var(--border);
        border-radius: 0.5rem;
        outline: none;
        transition: border-color 0.2s ease;

        &:focus { border-color: var(--accent); }
    }
`

const CoordRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-s);
`

const CityList = styled.div`
    overflow-y: auto;
    max-height: 240px;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
`

const CityItem = styled.button`
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-s) var(--space-m);
    border: none;
    background: transparent;
    text-align: left;
    font-size: 0.9em;
    color: var(--text);
    cursor: pointer;

    &:hover { background: color-mix(in srgb, var(--accent) 10%, white); }
    & + & { border-top: 1px solid var(--border); }
`

const LocationIcon = styled.span`
    font-size: 0.85em;
    flex-shrink: 0;
`

const ConfirmButton = styled.button`
    padding: var(--space-s) var(--space-l);
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: background 0.2s ease;

    &:hover { background: var(--accent-dark); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const SearchRow = styled.div`
    position: relative;

    input { width: 100%; padding-left: 2.5rem; }

    svg {
        position: absolute;
        left: var(--space-s);
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        width: 1.2em;
        height: 1.2em;
    }
`


/**
 * Location picker: "Use my location" button + "Choose manually" modal
 * with coordinate input and city search.
 * @param {{ on_select: Function, geo_loading: boolean, geo_error: string|null, request_location: Function }} props
 */
export default function LocationPicker( { on_select, geo_loading, geo_error, request_location } ) {

    const { t } = use_i18n()

    const [ modal_open, set_modal_open ] = useState( false )
    const [ tab, set_tab ] = useState( `city` )
    const [ search, set_search ] = useState( `` )
    const [ coord_lat, set_coord_lat ] = useState( `` )
    const [ coord_lng, set_coord_lng ] = useState( `` )

    // Filter locations by search query — countries first, then cities
    const filtered_locations = useMemo( () => {
        const sorted = [ ...LOCATIONS ].sort( ( a, b ) => {
            if( a.type !== b.type ) return a.type === `country` ? -1 : 1
            return a.name.localeCompare( b.name )
        } )
        if( !search.trim() ) return sorted
        const q = search.toLowerCase()
        return sorted.filter( loc => loc.name.toLowerCase().includes( q ) )
    }, [ search ] )

    const select_location = ( loc ) => {
        log.info( `Location selected:`, loc.name, loc.lat, loc.lng )
        on_select( loc.lat, loc.lng, loc.name )
        set_modal_open( false )
    }

    const confirm_coords = () => {
        const lat = parseFloat( coord_lat )
        const lng = parseFloat( coord_lng )
        if( isNaN( lat ) || isNaN( lng ) ) return
        log.info( `Manual coords:`, lat, lng )
        on_select( lat, lng, `${ lat.toFixed( 1 ) }°, ${ lng.toFixed( 1 ) }°` )
        set_modal_open( false )
    }

    return <>

        { /* Use my location button */ }
        <PrimaryButton onClick={ request_location } disabled={ geo_loading }>
            <MapPin size={ 18 } />
            { geo_loading ? t( `location.detecting` ) : t( `location.use_mine` ) }
        </PrimaryButton>

        { geo_error && <ErrorText>{ geo_error }</ErrorText> }

        { /* Choose manually link */ }
        <SubtleLink onClick={ () => set_modal_open( true ) }>
            <Globe size={ 14 } />
            { t( `location.choose_manually` ) }
        </SubtleLink>

        { /* Modal */ }
        { modal_open && <Overlay onClick={ () => set_modal_open( false ) }>
            <Modal onClick={ e => e.stopPropagation() }>

                <CloseButton onClick={ () => set_modal_open( false ) }>
                    <X size={ 20 } />
                </CloseButton>

                <h2>{ t( `location.choose_title` ) }</h2>

                <TabRow>
                    <Tab $active={ tab === `city` } onClick={ () => set_tab( `city` ) }>{ t( `location.tab_city` ) }</Tab>
                    <Tab $active={ tab === `coords` } onClick={ () => set_tab( `coords` ) }>{ t( `location.tab_coords` ) }</Tab>
                </TabRow>

                { tab === `city` && <>
                    <SearchRow>
                        <Search />
                        <input
                            type="text"
                            placeholder={ t( `location.search_placeholder` ) }
                            value={ search }
                            onChange={ e => set_search( e.target.value ) }
                            autoFocus
                        />
                    </SearchRow>
                    <CityList>
                        { filtered_locations.map( loc =>
                            <CityItem key={ `${ loc.type }-${ loc.name }` } onClick={ () => select_location( loc ) }>
                                <LocationIcon>{ loc.type === `country` ? `🌍` : `📍` }</LocationIcon>
                                { loc.name }
                            </CityItem>
                        ) }
                    </CityList>
                </> }

                { tab === `coords` && <>
                    <CoordRow>
                        <InputGroup>
                            <label>{ t( `location.latitude` ) }</label>
                            <input
                                type="number"
                                placeholder="e.g. 52.37"
                                value={ coord_lat }
                                onChange={ e => set_coord_lat( e.target.value ) }
                                min={ -90 }
                                max={ 90 }
                                step="any"
                            />
                        </InputGroup>
                        <InputGroup>
                            <label>{ t( `location.longitude` ) }</label>
                            <input
                                type="number"
                                placeholder="e.g. 4.90"
                                value={ coord_lng }
                                onChange={ e => set_coord_lng( e.target.value ) }
                                min={ -180 }
                                max={ 180 }
                                step="any"
                            />
                        </InputGroup>
                    </CoordRow>
                    <ConfirmButton
                        onClick={ confirm_coords }
                        disabled={ !coord_lat || !coord_lng }
                    >
                        { t( `location.confirm` ) }
                    </ConfirmButton>
                </> }

            </Modal>
        </Overlay> }

    </>

}


/* ── Shared styled elements ─────────────────────── */

const PrimaryButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-s);
    padding: var(--space-m) var(--space-xl);
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 1.05em;
    transition: background 0.2s ease;
    min-height: 48px;

    &:hover { background: var(--accent-dark); }
    &:disabled { opacity: 0.6; cursor: wait; }
`

const SubtleLink = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 0.9em;
    padding: var(--space-xs);
    transition: color 0.2s ease;

    &:hover { color: var(--accent-dark); }
`

const ErrorText = styled.p`
    color: var(--erythema);
    font-size: 0.85em;
`
