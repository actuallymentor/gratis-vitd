import styled from 'styled-components'
import { X } from 'lucide-react'

import { use_i18n } from '../../i18n/use_i18n'


// Exposure options with i18n keys for labels
const EXPOSURE_OPTIONS = [
    { percent: 10, key: `exposure.face_hands`, icon: `🙂` },
    { percent: 27, key: `exposure.face_hands_arms`, icon: `💪` },
    { percent: 63, key: `exposure.face_hands_arms_legs`, icon: `🩳` },
    { percent: 100, key: `exposure.birthday_suit`, icon: `✨` },
]

/**
 * Get the display label for a given exposure percent.
 * Falls back to "{percent}% exposed" for custom values.
 * @param {number} percent
 * @param {Function} t - Translation function
 * @returns {string}
 */
export function exposure_label( percent, t ) {
    const match = EXPOSURE_OPTIONS.find( o => o.percent === percent )
    if( match ) return `${ match.percent }% — ${ t( match.key ) }`
    return t( `exposure.custom_label`, { percent } )
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

    const { t } = use_i18n()

    const select_option = ( percent ) => {
        on_select( percent )
        on_close()
    }

    return <Overlay onClick={ on_close }>
        <Modal onClick={ e => e.stopPropagation() }>

            <CloseButton onClick={ on_close }><X size={ 18 } /></CloseButton>

            <Title>{ t( `exposure.title` ) }</Title>

            { EXPOSURE_OPTIONS.map( ( { percent, key, icon } ) =>
                <OptionRow key={ percent } $selected={ selected === percent } onClick={ () => select_option( percent ) }>
                    <Icon>{ icon }</Icon>
                    <OptionInfo>
                        <OptionLabel>{ t( key ) }</OptionLabel>
                        <OptionPercent>{ t( `exposure.percent_exposed`, { percent } ) }</OptionPercent>
                    </OptionInfo>
                </OptionRow>
            ) }

        </Modal>
    </Overlay>

}
