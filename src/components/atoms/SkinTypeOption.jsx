import { useState } from 'react'
import styled from 'styled-components'
import { Info } from 'lucide-react'

import { use_i18n } from '../../i18n/use_i18n'


// Swatch colors roughly representing Fitzpatrick types
export const SWATCH_COLORS = {
    1: `#fde4ce`,
    2: `#f5c9a0`,
    3: `#d4a373`,
    4: `#a67c52`,
    5: `#6b4226`,
    6: `#3b2211`,
}

const Card = styled.button`
    display: flex;
    align-items: center;
    gap: var(--space-s);
    padding: var(--space-s) var(--space-m);
    border: 2px solid ${ ( { $selected } ) => $selected ? `var(--accent)` : `var(--border)` };
    border-radius: 0.75rem;
    background: ${ ( { $selected } ) => $selected ? `color-mix(in srgb, var(--accent) 10%, white)` : `var(--surface)` };
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    text-align: left;

    &:hover {
        border-color: var(--accent);
    }
`

const Swatch = styled.span`
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: ${ ( { $color } ) => $color };
    border: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
`

const Label = styled.span`
    font-size: 0.9em;
    color: var(--text);
    flex: 1;
`

const InfoWrap = styled.span`
    position: relative;
    display: inline-flex;
    align-items: center;
    color: var(--text-muted);
    flex-shrink: 0;
`

const Tooltip = styled.span`
    position: absolute;
    bottom: calc(100% + 8px);
    right: -8px;
    width: 240px;
    padding: var(--space-s) var(--space-m);
    background: var(--text);
    color: var(--bg);
    font-size: 0.78em;
    line-height: 1.5;
    border-radius: 0.5rem;
    pointer-events: none;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    /* Arrow */
    &::after {
        content: '';
        position: absolute;
        top: 100%;
        right: 12px;
        border: 6px solid transparent;
        border-top-color: var(--text);
    }
`


/**
 * Single Fitzpatrick skin type radio card with info tooltip.
 * @param {{ type: number, selected: boolean, on_select: Function }} props
 */
export default function SkinTypeOption( { type, selected, on_select } ) {

    const { t } = use_i18n()
    const [ show_tip, set_show_tip ] = useState( false )

    return <Card $selected={ selected } onClick={ () => on_select( type ) }>
        <Swatch $color={ SWATCH_COLORS[ type ] } />
        <Label>{ t( `skin.type${ type }` ) }</Label>
        <InfoWrap
            onMouseEnter={ () => set_show_tip( true ) }
            onMouseLeave={ () => set_show_tip( false ) }
        >
            <Info size={ 14 } />
            { show_tip && <Tooltip>{ t( `skin.desc${ type }` ) }</Tooltip> }
        </InfoWrap>
    </Card>

}
