import { useState, useMemo } from 'react'
import styled from 'styled-components'
import { MapPin, Globe, X, Search } from 'lucide-react'

import { log } from 'mentie'


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


/* ── Well-known city coordinates ────────────────── */

const CITY_COORDS = {
    'Europe/London': { lat: 51.51, lng: -0.13 },
    'Europe/Paris': { lat: 48.86, lng: 2.35 },
    'Europe/Berlin': { lat: 52.52, lng: 13.41 },
    'Europe/Madrid': { lat: 40.42, lng: -3.70 },
    'Europe/Rome': { lat: 41.90, lng: 12.50 },
    'Europe/Amsterdam': { lat: 52.37, lng: 4.90 },
    'Europe/Stockholm': { lat: 59.33, lng: 18.07 },
    'Europe/Oslo': { lat: 59.91, lng: 10.75 },
    'Europe/Helsinki': { lat: 60.17, lng: 24.94 },
    'Europe/Athens': { lat: 37.98, lng: 23.73 },
    'Europe/Istanbul': { lat: 41.01, lng: 28.98 },
    'Europe/Moscow': { lat: 55.76, lng: 37.62 },
    'Europe/Lisbon': { lat: 38.72, lng: -9.14 },
    'Europe/Vienna': { lat: 48.21, lng: 16.37 },
    'Europe/Zurich': { lat: 47.38, lng: 8.54 },
    'Europe/Warsaw': { lat: 52.23, lng: 21.01 },
    'Europe/Prague': { lat: 50.08, lng: 14.44 },
    'Europe/Budapest': { lat: 47.50, lng: 19.04 },
    'Europe/Dublin': { lat: 53.35, lng: -6.26 },
    'Europe/Brussels': { lat: 50.85, lng: 4.35 },
    'Europe/Copenhagen': { lat: 55.68, lng: 12.57 },
    'America/New_York': { lat: 40.71, lng: -74.01 },
    'America/Chicago': { lat: 41.88, lng: -87.63 },
    'America/Denver': { lat: 39.74, lng: -104.99 },
    'America/Los_Angeles': { lat: 34.05, lng: -118.24 },
    'America/Toronto': { lat: 43.65, lng: -79.38 },
    'America/Mexico_City': { lat: 19.43, lng: -99.13 },
    'America/Sao_Paulo': { lat: -23.55, lng: -46.63 },
    'America/Buenos_Aires': { lat: -34.60, lng: -58.38 },
    'America/Bogota': { lat: 4.71, lng: -74.07 },
    'America/Lima': { lat: -12.05, lng: -77.04 },
    'America/Santiago': { lat: -33.45, lng: -70.67 },
    'America/Anchorage': { lat: 61.22, lng: -149.90 },
    'Pacific/Honolulu': { lat: 21.31, lng: -157.86 },
    'Asia/Tokyo': { lat: 35.68, lng: 139.69 },
    'Asia/Shanghai': { lat: 31.23, lng: 121.47 },
    'Asia/Hong_Kong': { lat: 22.32, lng: 114.17 },
    'Asia/Singapore': { lat: 1.35, lng: 103.82 },
    'Asia/Dubai': { lat: 25.20, lng: 55.27 },
    'Asia/Kolkata': { lat: 22.57, lng: 88.36 },
    'Asia/Seoul': { lat: 37.57, lng: 126.98 },
    'Asia/Bangkok': { lat: 13.76, lng: 100.50 },
    'Asia/Jakarta': { lat: -6.21, lng: 106.85 },
    'Asia/Taipei': { lat: 25.03, lng: 121.57 },
    'Asia/Manila': { lat: 14.60, lng: 120.98 },
    'Asia/Karachi': { lat: 24.86, lng: 67.01 },
    'Asia/Tehran': { lat: 35.69, lng: 51.39 },
    'Asia/Riyadh': { lat: 24.71, lng: 46.67 },
    'Africa/Cairo': { lat: 30.04, lng: 31.24 },
    'Africa/Lagos': { lat: 6.52, lng: 3.38 },
    'Africa/Johannesburg': { lat: -26.20, lng: 28.04 },
    'Africa/Nairobi': { lat: -1.29, lng: 36.82 },
    'Africa/Casablanca': { lat: 33.57, lng: -7.59 },
    'Australia/Sydney': { lat: -33.87, lng: 151.21 },
    'Australia/Melbourne': { lat: -37.81, lng: 144.96 },
    'Pacific/Auckland': { lat: -36.85, lng: 174.76 },
}


/**
 * Extract a friendly city name from a timezone ID.
 * @param {string} tz - e.g. "America/New_York"
 * @returns {string} e.g. "New York"
 */
function tz_to_city( tz ) {
    return tz.split( `/` ).pop().replace( /_/g, ` ` )
}


/**
 * Location picker: "Use my location" button + "Choose manually" modal
 * with coordinate input and city search.
 * @param {{ on_select: Function, geo_loading: boolean, geo_error: string|null, request_location: Function }} props
 */
export default function LocationPicker( { on_select, geo_loading, geo_error, request_location } ) {

    const [ modal_open, set_modal_open ] = useState( false )
    const [ tab, set_tab ] = useState( `city` )
    const [ search, set_search ] = useState( `` )
    const [ coord_lat, set_coord_lat ] = useState( `` )
    const [ coord_lng, set_coord_lng ] = useState( `` )

    // Only show cities we have known coordinates for
    const city_keys = useMemo( () => Object.keys( CITY_COORDS ), [] )

    // Filter cities by search query
    const filtered_cities = useMemo( () => {
        if( !search.trim() ) return city_keys
        const q = search.toLowerCase()
        return city_keys.filter( tz => tz.toLowerCase().includes( q ) )
    }, [ search, city_keys ] )

    const select_city = ( tz ) => {
        const { lat, lng } = CITY_COORDS[ tz ]
        log.info( `City selected:`, tz, lat, lng )
        on_select( lat, lng, tz_to_city( tz ) )
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
            { geo_loading ? `Detecting location...` : `Use my location` }
        </PrimaryButton>

        { geo_error && <ErrorText>{ geo_error }</ErrorText> }

        { /* Choose manually link */ }
        <SubtleLink onClick={ () => set_modal_open( true ) }>
            <Globe size={ 14 } />
            Choose manually
        </SubtleLink>

        { /* Modal */ }
        { modal_open && <Overlay onClick={ () => set_modal_open( false ) }>
            <Modal onClick={ e => e.stopPropagation() }>

                <CloseButton onClick={ () => set_modal_open( false ) }>
                    <X size={ 20 } />
                </CloseButton>

                <h2>Choose location</h2>

                <TabRow>
                    <Tab $active={ tab === `city` } onClick={ () => set_tab( `city` ) }>City</Tab>
                    <Tab $active={ tab === `coords` } onClick={ () => set_tab( `coords` ) }>Coordinates</Tab>
                </TabRow>

                { tab === `city` && <>
                    <SearchRow>
                        <Search />
                        <input
                            type="text"
                            placeholder="Search cities..."
                            value={ search }
                            onChange={ e => set_search( e.target.value ) }
                            autoFocus
                        />
                    </SearchRow>
                    <CityList>
                        { filtered_cities.map( tz =>
                            <CityItem key={ tz } onClick={ () => select_city( tz ) }>
                                { tz_to_city( tz ) }
                            </CityItem>
                        ) }
                    </CityList>
                </> }

                { tab === `coords` && <>
                    <CoordRow>
                        <InputGroup>
                            <label>Latitude</label>
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
                            <label>Longitude</label>
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
                        Confirm
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
