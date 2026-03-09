import { useState, useMemo } from 'react'
import styled from 'styled-components'
import { MapPin, Globe, X, Search } from 'lucide-react'

import { log } from 'mentie'
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


/* ── Location entries: cities + countries ──────── */

// Each entry: { name, lat, lng, type }
// Countries use coordinates from their primary timezone capital
const LOCATIONS = [

    // ── Countries ────────────────────────────────
    { name: `Afghanistan`, lat: 34.53, lng: 69.17, type: `country` },
    { name: `Algeria`, lat: 36.75, lng: 3.04, type: `country` },
    { name: `Argentina`, lat: -34.60, lng: -58.38, type: `country` },
    { name: `Australia`, lat: -33.87, lng: 151.21, type: `country` },
    { name: `Austria`, lat: 48.21, lng: 16.37, type: `country` },
    { name: `Bangladesh`, lat: 23.81, lng: 90.41, type: `country` },
    { name: `Belgium`, lat: 50.85, lng: 4.35, type: `country` },
    { name: `Bolivia`, lat: -16.50, lng: -68.15, type: `country` },
    { name: `Brazil`, lat: -23.55, lng: -46.63, type: `country` },
    { name: `Canada`, lat: 43.65, lng: -79.38, type: `country` },
    { name: `Chile`, lat: -33.45, lng: -70.67, type: `country` },
    { name: `China`, lat: 31.23, lng: 121.47, type: `country` },
    { name: `Colombia`, lat: 4.71, lng: -74.07, type: `country` },
    { name: `Costa Rica`, lat: 9.93, lng: -84.08, type: `country` },
    { name: `Croatia`, lat: 45.81, lng: 15.98, type: `country` },
    { name: `Cuba`, lat: 23.11, lng: -82.37, type: `country` },
    { name: `Czech Republic`, lat: 50.08, lng: 14.44, type: `country` },
    { name: `Denmark`, lat: 55.68, lng: 12.57, type: `country` },
    { name: `Ecuador`, lat: -0.18, lng: -78.47, type: `country` },
    { name: `Egypt`, lat: 30.04, lng: 31.24, type: `country` },
    { name: `Ethiopia`, lat: 9.02, lng: 38.75, type: `country` },
    { name: `Finland`, lat: 60.17, lng: 24.94, type: `country` },
    { name: `France`, lat: 48.86, lng: 2.35, type: `country` },
    { name: `Germany`, lat: 52.52, lng: 13.41, type: `country` },
    { name: `Ghana`, lat: 5.56, lng: -0.19, type: `country` },
    { name: `Greece`, lat: 37.98, lng: 23.73, type: `country` },
    { name: `Guatemala`, lat: 14.63, lng: -90.51, type: `country` },
    { name: `Hungary`, lat: 47.50, lng: 19.04, type: `country` },
    { name: `Iceland`, lat: 64.15, lng: -21.94, type: `country` },
    { name: `India`, lat: 28.61, lng: 77.21, type: `country` },
    { name: `Indonesia`, lat: -6.21, lng: 106.85, type: `country` },
    { name: `Iran`, lat: 35.69, lng: 51.39, type: `country` },
    { name: `Iraq`, lat: 33.31, lng: 44.37, type: `country` },
    { name: `Ireland`, lat: 53.35, lng: -6.26, type: `country` },
    { name: `Israel`, lat: 31.77, lng: 35.22, type: `country` },
    { name: `Italy`, lat: 41.90, lng: 12.50, type: `country` },
    { name: `Jamaica`, lat: 18.11, lng: -76.80, type: `country` },
    { name: `Japan`, lat: 35.68, lng: 139.69, type: `country` },
    { name: `Jordan`, lat: 31.95, lng: 35.93, type: `country` },
    { name: `Kenya`, lat: -1.29, lng: 36.82, type: `country` },
    { name: `Kuwait`, lat: 29.38, lng: 47.99, type: `country` },
    { name: `Lebanon`, lat: 33.89, lng: 35.50, type: `country` },
    { name: `Malaysia`, lat: 3.14, lng: 101.69, type: `country` },
    { name: `Mexico`, lat: 19.43, lng: -99.13, type: `country` },
    { name: `Morocco`, lat: 33.57, lng: -7.59, type: `country` },
    { name: `Myanmar`, lat: 16.87, lng: 96.20, type: `country` },
    { name: `Nepal`, lat: 27.72, lng: 85.32, type: `country` },
    { name: `Netherlands`, lat: 52.37, lng: 4.90, type: `country` },
    { name: `New Zealand`, lat: -36.85, lng: 174.76, type: `country` },
    { name: `Nigeria`, lat: 6.52, lng: 3.38, type: `country` },
    { name: `Norway`, lat: 59.91, lng: 10.75, type: `country` },
    { name: `Pakistan`, lat: 24.86, lng: 67.01, type: `country` },
    { name: `Panama`, lat: 8.98, lng: -79.52, type: `country` },
    { name: `Paraguay`, lat: -25.26, lng: -57.58, type: `country` },
    { name: `Peru`, lat: -12.05, lng: -77.04, type: `country` },
    { name: `Philippines`, lat: 14.60, lng: 120.98, type: `country` },
    { name: `Poland`, lat: 52.23, lng: 21.01, type: `country` },
    { name: `Portugal`, lat: 38.72, lng: -9.14, type: `country` },
    { name: `Qatar`, lat: 25.29, lng: 51.53, type: `country` },
    { name: `Romania`, lat: 44.43, lng: 26.10, type: `country` },
    { name: `Russia`, lat: 55.76, lng: 37.62, type: `country` },
    { name: `Saudi Arabia`, lat: 24.71, lng: 46.67, type: `country` },
    { name: `Singapore`, lat: 1.35, lng: 103.82, type: `country` },
    { name: `South Africa`, lat: -26.20, lng: 28.04, type: `country` },
    { name: `South Korea`, lat: 37.57, lng: 126.98, type: `country` },
    { name: `Spain`, lat: 40.42, lng: -3.70, type: `country` },
    { name: `Sri Lanka`, lat: 6.93, lng: 79.84, type: `country` },
    { name: `Sweden`, lat: 59.33, lng: 18.07, type: `country` },
    { name: `Switzerland`, lat: 47.38, lng: 8.54, type: `country` },
    { name: `Taiwan`, lat: 25.03, lng: 121.57, type: `country` },
    { name: `Tanzania`, lat: -6.79, lng: 39.28, type: `country` },
    { name: `Thailand`, lat: 13.76, lng: 100.50, type: `country` },
    { name: `Tunisia`, lat: 36.81, lng: 10.17, type: `country` },
    { name: `Turkey`, lat: 41.01, lng: 28.98, type: `country` },
    { name: `UAE`, lat: 25.20, lng: 55.27, type: `country` },
    { name: `Uganda`, lat: 0.35, lng: 32.58, type: `country` },
    { name: `Ukraine`, lat: 50.45, lng: 30.52, type: `country` },
    { name: `United Kingdom`, lat: 51.51, lng: -0.13, type: `country` },
    { name: `United States`, lat: 40.71, lng: -74.01, type: `country` },
    { name: `Uruguay`, lat: -34.91, lng: -56.19, type: `country` },
    { name: `Venezuela`, lat: 10.49, lng: -66.88, type: `country` },
    { name: `Vietnam`, lat: 21.03, lng: 105.85, type: `country` },

    // ── Cities ───────────────────────────────────
    { name: `London`, lat: 51.51, lng: -0.13, type: `city` },
    { name: `Paris`, lat: 48.86, lng: 2.35, type: `city` },
    { name: `Berlin`, lat: 52.52, lng: 13.41, type: `city` },
    { name: `Madrid`, lat: 40.42, lng: -3.70, type: `city` },
    { name: `Rome`, lat: 41.90, lng: 12.50, type: `city` },
    { name: `Amsterdam`, lat: 52.37, lng: 4.90, type: `city` },
    { name: `Stockholm`, lat: 59.33, lng: 18.07, type: `city` },
    { name: `Oslo`, lat: 59.91, lng: 10.75, type: `city` },
    { name: `Helsinki`, lat: 60.17, lng: 24.94, type: `city` },
    { name: `Athens`, lat: 37.98, lng: 23.73, type: `city` },
    { name: `Istanbul`, lat: 41.01, lng: 28.98, type: `city` },
    { name: `Moscow`, lat: 55.76, lng: 37.62, type: `city` },
    { name: `Lisbon`, lat: 38.72, lng: -9.14, type: `city` },
    { name: `Vienna`, lat: 48.21, lng: 16.37, type: `city` },
    { name: `Zurich`, lat: 47.38, lng: 8.54, type: `city` },
    { name: `Warsaw`, lat: 52.23, lng: 21.01, type: `city` },
    { name: `Prague`, lat: 50.08, lng: 14.44, type: `city` },
    { name: `Budapest`, lat: 47.50, lng: 19.04, type: `city` },
    { name: `Dublin`, lat: 53.35, lng: -6.26, type: `city` },
    { name: `Brussels`, lat: 50.85, lng: 4.35, type: `city` },
    { name: `Copenhagen`, lat: 55.68, lng: 12.57, type: `city` },
    { name: `New York`, lat: 40.71, lng: -74.01, type: `city` },
    { name: `Chicago`, lat: 41.88, lng: -87.63, type: `city` },
    { name: `Denver`, lat: 39.74, lng: -104.99, type: `city` },
    { name: `Los Angeles`, lat: 34.05, lng: -118.24, type: `city` },
    { name: `Toronto`, lat: 43.65, lng: -79.38, type: `city` },
    { name: `Mexico City`, lat: 19.43, lng: -99.13, type: `city` },
    { name: `São Paulo`, lat: -23.55, lng: -46.63, type: `city` },
    { name: `Buenos Aires`, lat: -34.60, lng: -58.38, type: `city` },
    { name: `Bogotá`, lat: 4.71, lng: -74.07, type: `city` },
    { name: `Lima`, lat: -12.05, lng: -77.04, type: `city` },
    { name: `Santiago`, lat: -33.45, lng: -70.67, type: `city` },
    { name: `Anchorage`, lat: 61.22, lng: -149.90, type: `city` },
    { name: `Honolulu`, lat: 21.31, lng: -157.86, type: `city` },
    { name: `Tokyo`, lat: 35.68, lng: 139.69, type: `city` },
    { name: `Shanghai`, lat: 31.23, lng: 121.47, type: `city` },
    { name: `Hong Kong`, lat: 22.32, lng: 114.17, type: `city` },
    { name: `Singapore`, lat: 1.35, lng: 103.82, type: `city` },
    { name: `Dubai`, lat: 25.20, lng: 55.27, type: `city` },
    { name: `Kolkata`, lat: 22.57, lng: 88.36, type: `city` },
    { name: `Seoul`, lat: 37.57, lng: 126.98, type: `city` },
    { name: `Bangkok`, lat: 13.76, lng: 100.50, type: `city` },
    { name: `Jakarta`, lat: -6.21, lng: 106.85, type: `city` },
    { name: `Taipei`, lat: 25.03, lng: 121.57, type: `city` },
    { name: `Manila`, lat: 14.60, lng: 120.98, type: `city` },
    { name: `Karachi`, lat: 24.86, lng: 67.01, type: `city` },
    { name: `Tehran`, lat: 35.69, lng: 51.39, type: `city` },
    { name: `Riyadh`, lat: 24.71, lng: 46.67, type: `city` },
    { name: `Cairo`, lat: 30.04, lng: 31.24, type: `city` },
    { name: `Lagos`, lat: 6.52, lng: 3.38, type: `city` },
    { name: `Johannesburg`, lat: -26.20, lng: 28.04, type: `city` },
    { name: `Nairobi`, lat: -1.29, lng: 36.82, type: `city` },
    { name: `Casablanca`, lat: 33.57, lng: -7.59, type: `city` },
    { name: `Sydney`, lat: -33.87, lng: 151.21, type: `city` },
    { name: `Melbourne`, lat: -37.81, lng: 144.96, type: `city` },
    { name: `Auckland`, lat: -36.85, lng: 174.76, type: `city` },
]


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
