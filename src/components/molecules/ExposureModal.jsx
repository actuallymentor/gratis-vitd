import styled from 'styled-components'
import { X } from 'lucide-react'


export const EXPOSURE_OPTIONS = [
    { percent: 10, label: `Face and hands`, icon: `🙂` },
    { percent: 27, label: `Face, hands, and arms`, icon: `💪` },
    { percent: 63, label: `Face, hands, arms, and legs`, icon: `🩳` },
    { percent: 100, label: `Birthday suit`, icon: `✨` },
]

/**
 * Get the display label for a given exposure percent.
 * Falls back to "XX% exposed" for custom values.
 * @param {number} percent
 * @returns {string}
 */
export function exposure_label( percent ) {
    const match = EXPOSURE_OPTIONS.find( o => o.percent === percent )
    return match ? `${ match.percent }% — ${ match.label }` : `${ percent }% exposed`
}


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

const OptionRow = styled.button`
    display: flex;
    align-items: center;
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

const Icon = styled.span`
    font-size: 1.4em;
    flex-shrink: 0;
`

const OptionInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`

const OptionLabel = styled.span`
    font-weight: 600;
    font-size: 0.9em;
    color: var(--text);
`

const OptionPercent = styled.span`
    font-size: 0.8em;
    color: var(--text-muted);
`


/**
 * Modal for selecting body exposure percentage.
 * @param {{ selected: number, on_select: Function, on_close: Function }} props
 */
export default function ExposureModal( { selected, on_select, on_close } ) {

    const select_option = ( percent ) => {
        on_select( percent )
        on_close()
    }

    return <Overlay onClick={ on_close }>
        <Modal onClick={ e => e.stopPropagation() }>

            <CloseButton onClick={ on_close }><X size={ 18 } /></CloseButton>

            <Title>Body exposure</Title>

            { EXPOSURE_OPTIONS.map( ( { percent, label, icon } ) =>
                <OptionRow key={ percent } $selected={ selected === percent } onClick={ () => select_option( percent ) }>
                    <Icon>{ icon }</Icon>
                    <OptionInfo>
                        <OptionLabel>{ label }</OptionLabel>
                        <OptionPercent>{ percent }% of skin exposed</OptionPercent>
                    </OptionInfo>
                </OptionRow>
            ) }

        </Modal>
    </Overlay>

}
