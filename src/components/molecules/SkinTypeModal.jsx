import styled from 'styled-components'
import { X } from 'lucide-react'

import { SWATCH_COLORS } from '../atoms/SkinTypeOption'
import { use_i18n } from '../../i18n/use_i18n'


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
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
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

const Title = styled.h3`
    font-weight: 700;
    margin: 0;
    padding-right: var(--space-xl);
`

const TypeRow = styled.button`
    display: flex;
    align-items: flex-start;
    gap: var(--space-s);
    padding: var(--space-s) var(--space-m);
    border: 2px solid ${ ( { $selected } ) => $selected ? `var(--accent)` : `transparent` };
    border-radius: 0.75rem;
    background: ${ ( { $selected } ) => $selected ? `color-mix(in srgb, var(--accent) 8%, transparent)` : `transparent` };
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;

    &:hover {
        background: color-mix(in srgb, var(--accent) 6%, transparent);
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
    margin-top: 2px;
`

const TypeInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`

const TypeLabel = styled.span`
    font-weight: 600;
    font-size: 0.9em;
    color: var(--text);
`

const TypeDescription = styled.span`
    font-size: 0.8em;
    color: var(--text-muted);
    line-height: 1.5;
`


/**
 * Modal for selecting and learning about the 6 Fitzpatrick skin types.
 * @param {{ selected: number, on_select: Function, on_close: Function }} props
 */
export default function SkinTypeModal( { selected, on_select, on_close } ) {

    const { t } = use_i18n()

    const select_type = ( type ) => {
        on_select( type )
        on_close()
    }

    return <Overlay onClick={ on_close }>
        <Modal onClick={ e => e.stopPropagation() }>

            <CloseButton onClick={ on_close }><X size={ 18 } /></CloseButton>

            <Title>{ t( `skin.title` ) }</Title>

            { [ 1, 2, 3, 4, 5, 6 ].map( type =>
                <TypeRow key={ type } $selected={ selected === type } onClick={ () => select_type( type ) }>
                    <Swatch $color={ SWATCH_COLORS[ type ] } />
                    <TypeInfo>
                        <TypeLabel>{ t( `skin.type${ type }` ) }</TypeLabel>
                        <TypeDescription>{ t( `skin.desc${ type }` ) }</TypeDescription>
                    </TypeInfo>
                </TypeRow>
            ) }

        </Modal>
    </Overlay>

}
