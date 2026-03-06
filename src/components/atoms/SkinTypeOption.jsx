import { useState } from 'react'
import styled from 'styled-components'
import { Info } from 'lucide-react'


// Swatch colors roughly representing Fitzpatrick types
export const SWATCH_COLORS = {
    1: `#fde4ce`,
    2: `#f5c9a0`,
    3: `#d4a373`,
    4: `#a67c52`,
    5: `#6b4226`,
    6: `#3b2211`,
}

export const LABELS = {
    1: `Type I — Very fair`,
    2: `Type II — Fair`,
    3: `Type III — Medium`,
    4: `Type IV — Olive`,
    5: `Type V — Brown`,
    6: `Type VI — Dark`,
}

export const DESCRIPTIONS = {
    1: `Always burns, never tans. Very sun-sensitive. Typical: very pale skin, red/blonde hair, blue eyes`,
    2: `Burns easily, tans minimally. Typical: fair skin, light hair, light eyes`,
    3: `Sometimes burns, tans gradually. Typical: cream-white to light brown skin`,
    4: `Rarely burns, tans easily. Typical: moderate brown skin`,
    5: `Very rarely burns, tans very easily. Typical: dark brown skin`,
    6: `Never burns. Typical: deeply pigmented dark brown to black skin`,
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

    const [ show_tip, set_show_tip ] = useState( false )

    return <Card $selected={ selected } onClick={ () => on_select( type ) }>
        <Swatch $color={ SWATCH_COLORS[ type ] } />
        <Label>{ LABELS[ type ] }</Label>
        <InfoWrap
            onMouseEnter={ () => set_show_tip( true ) }
            onMouseLeave={ () => set_show_tip( false ) }
        >
            <Info size={ 14 } />
            { show_tip && <Tooltip>{ DESCRIPTIONS[ type ] }</Tooltip> }
        </InfoWrap>
    </Card>

}
