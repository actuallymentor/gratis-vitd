import styled from 'styled-components'


// Swatch colors roughly representing Fitzpatrick types
const SWATCH_COLORS = {
    1: `#fde4ce`,
    2: `#f5c9a0`,
    3: `#d4a373`,
    4: `#a67c52`,
    5: `#6b4226`,
    6: `#3b2211`,
}

const LABELS = {
    1: `Type I — Very fair`,
    2: `Type II — Fair`,
    3: `Type III — Medium`,
    4: `Type IV — Olive`,
    5: `Type V — Brown`,
    6: `Type VI — Dark`,
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
`


/**
 * Single Fitzpatrick skin type radio card.
 * @param {{ type: number, selected: boolean, on_select: Function }} props
 */
export default function SkinTypeOption( { type, selected, on_select } ) {

    return <Card $selected={ selected } onClick={ () => on_select( type ) }>
        <Swatch $color={ SWATCH_COLORS[ type ] } />
        <Label>{ LABELS[ type ] }</Label>
    </Card>

}
