import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Globe } from 'lucide-react'

import { use_i18n, LANGUAGES } from '../../i18n/use_i18n'


const Wrapper = styled.div`
    position: fixed;
    top: var(--space-m);
    right: var(--space-m);
    z-index: 50;
`

const GlobeButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: var(--surface);
    color: var(--text-muted);
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    &:hover {
        border-color: var(--accent);
        color: var(--accent-dark);
    }
`

const Dropdown = styled.div`
    position: absolute;
    top: calc(100% + var(--space-xs));
    right: 0;
    min-width: 160px;
    max-height: 70vh;
    overflow-y: auto;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 0.75rem;
    padding: var(--space-xs) 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`

const LangOption = styled.button`
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--space-s) var(--space-m);
    border: none;
    background: ${ ( { $active } ) => $active ? `color-mix(in srgb, var(--accent) 10%, transparent)` : `transparent` };
    color: var(--text);
    font-weight: ${ ( { $active } ) => $active ? 600 : 400 };
    text-align: left;
    transition: background 0.15s ease;

    &:hover {
        background: color-mix(in srgb, var(--accent) 8%, transparent);
    }
`


/**
 * Floating globe button in the top-right corner with a language dropdown.
 */
export default function LanguageSelector() {

    const { language, set_language } = use_i18n()
    const [ open, set_open ] = useState( false )
    const ref = useRef( null )

    // Close dropdown on outside click
    useEffect( () => {
        if( !open ) return
        const close = ( e ) => {
            if( !ref.current?.contains( e.target ) ) set_open( false ) 
        }
        document.addEventListener( `mousedown`, close )
        return () => document.removeEventListener( `mousedown`, close )
    }, [ open ] )

    const pick_language = ( code ) => {
        set_language( code )
        set_open( false )
    }

    return <Wrapper ref={ ref }>

        <GlobeButton onClick={ () => set_open( !open ) } aria-label="Language">
            <Globe size={ 18 } />
        </GlobeButton>

        { open && <Dropdown>
            { LANGUAGES.map( ( { code, label } ) =>
                <LangOption key={ code } $active={ language === code } onClick={ () => pick_language( code ) }>
                    { label }
                </LangOption>
            ) }
        </Dropdown> }

    </Wrapper>

}
