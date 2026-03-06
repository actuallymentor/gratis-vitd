import styled from 'styled-components'

import { DESCRIPTIONS } from './SkinTypeOption'


// Short labels for the dropdown (no "Type" prefix)
const DROPDOWN_LABELS = {
    1: `1 — Very fair`,
    2: `2 — Fair`,
    3: `3 — Medium`,
    4: `4 — Olive`,
    5: `5 — Brown`,
    6: `6 — Dark`,
}

const Select = styled.select`
    display: inline;
    font-weight: 700;
    color: var(--accent-dark);
    background: transparent;
    border: none;
    border-bottom: 2px dashed var(--accent);
    padding: 0 var(--space-xs);
    font-size: inherit;
    line-height: inherit;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s ease;

    /* Remove default browser chrome, add custom arrow */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    padding-right: 1.2em;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.2em center;
    background-size: 0.6em;

    &:focus {
        border-bottom-style: solid;
        border-color: var(--accent-dark);
    }

    &:hover {
        border-color: var(--accent-dark);
    }
`


/**
 * Inline skin type dropdown that fits within flowing text.
 * @param {{ value: number, on_change: Function }} props
 */
export default function SkinTypeDropdown( { value, on_change } ) {

    const handle_change = ( e ) => on_change( Number( e.target.value ) )

    return <Select value={ value } onChange={ handle_change }>
        { Object.entries( DROPDOWN_LABELS ).map( ( [ type, label ] ) =>
            <option key={ type } value={ type } title={ DESCRIPTIONS[ type ] }>
                { label }
            </option>
        ) }
    </Select>

}
