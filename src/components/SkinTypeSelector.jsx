import { skin_types } from '../modules/vitd'

/**
 * Six Fitzpatrick skin type buttons with color swatches
 * @param {{ selected: number, on_select: Function, compact?: boolean }} props
 */
export function SkinTypeSelector( { selected, on_select, compact = false } ) {

    const active = skin_types[ selected ]

    // Compact mode — no card wrapper, inline description
    if( compact ) return <div className="skin-type-compact">

        { /* Color-coded type buttons */ }
        <div className="skin-type-grid">
            { skin_types.map( ( skin, i ) => <button
                key={ skin.type }
                className={ `skin-type-btn${ i === selected ? ` active` : `` }` }
                onClick={ () => on_select( i ) }
            >
                <span className="skin-swatch" style={ { backgroundColor: skin.color } } />
                <span style={ { verticalAlign: `middle` } }>{ skin.type }</span>
            </button> ) }
        </div>

        { /* One-line description */ }
        <p className="muted">
            Type { active.type } &middot; { active.label }
        </p>

    </div>

    // Full mode — card wrapper with heading
    return <div className="card">

        <h2>Skin Type</h2>

        { /* Color-coded type buttons */ }
        <div className="skin-type-grid">
            { skin_types.map( ( skin, i ) => <button
                key={ skin.type }
                className={ `skin-type-btn${ i === selected ? ` active` : `` }` }
                onClick={ () => on_select( i ) }
            >
                { /* Color swatch dot */ }
                <span className="skin-swatch" style={ { backgroundColor: skin.color } } />
                <span style={ { verticalAlign: `middle` } }>{ skin.type }</span>
            </button> ) }
        </div>

        { /* Selected type description */ }
        <p>
            <strong>Type { active.type }</strong> &middot; { active.label }
        </p>
        <p className="muted">{ active.description }</p>

    </div>
}
