import styled from 'styled-components'

import SkinTypeOption from '../atoms/SkinTypeOption'


const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--space-s);
    width: 100%;
`


/**
 * Grid of Fitzpatrick skin type radio cards (1–6).
 * @param {{ selected: number, on_select: Function }} props
 */
export default function SkinTypeSelector( { selected, on_select } ) {

    return <Grid>
        { [ 1, 2, 3, 4, 5, 6 ].map( type =>
            <SkinTypeOption
                key={ type }
                type={ type }
                selected={ selected === type }
                on_select={ on_select }
            />
        ) }
    </Grid>

}
