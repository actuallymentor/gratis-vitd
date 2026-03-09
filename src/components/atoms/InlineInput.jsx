import styled from 'styled-components'


const Input = styled.input`
    display: inline-block;
    width: ${ ( { $width } ) => $width || `3.5em` };
    text-align: center;
    font-weight: 700;
    color: var(--accent-dark);
    background: transparent;
    border: none;
    border-bottom: 2px dashed var(--accent);
    padding: 0 var(--space-xs);
    font-size: inherit;
    line-height: inherit;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
        border-bottom-style: solid;
        border-color: var(--accent-dark);
    }

    /* Hide number spinners */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    -moz-appearance: textfield;
`

/**
 * A number input styled to sit inline within flowing text.
 * @param {{ value: number, on_change: Function, on_blur: Function, min: number, max: number, width: string }} props
 */
export default function InlineInput( { value, on_change, on_blur, min = 0, max = 10000, width, ...rest } ) {

    const handle_change = ( e ) => {
        const num = Number( e.target.value )
        if( !isNaN( num ) ) on_change( num )
    }

    const handle_blur = ( e ) => {
        if( on_blur ) on_blur( Number( e.target.value ) )
    }

    return <Input
        type="number"
        value={ value }
        onChange={ handle_change }
        onBlur={ handle_blur }
        min={ min }
        max={ max }
        $width={ width }
        { ...rest }
    />

}
