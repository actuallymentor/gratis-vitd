import { skin_types } from '../modules/vitd'

/**
 * Six Fitzpatrick skin type buttons with color swatches
 * @param {{ selected: number, on_select: Function }} props
 */
export function SkinTypeSelector( { selected, on_select } ) {

    const active = skin_types[ selected ]

    return <div className="card">

        <h2>Skin Type</h2>

        { /* Color-coded type buttons */ }
        <div style={ { display: `flex`, gap: `0.4rem`, marginBottom: `0.75rem` } }>
            { skin_types.map( ( skin, i ) => <button
                key={ skin.type }
                className={ i === selected ? `active` : `` }
                onClick={ () => on_select( i ) }
                style={ {
                    flex: 1,
                    padding: `0.4rem 0`,
                    position: `relative`,
                    overflow: `hidden`,
                } }
            >
                { /* Color swatch dot */ }
                <span style={ {
                    display: `inline-block`,
                    width: `14px`,
                    height: `14px`,
                    borderRadius: `50%`,
                    backgroundColor: skin.color,
                    border: `1px solid rgba(0,0,0,0.15)`,
                    verticalAlign: `middle`,
                    marginRight: `0.25rem`,
                } }
                />
                <span style={ { verticalAlign: `middle`, fontSize: `0.8rem` } }>{ skin.type }</span>
            </button> ) }
        </div>

        { /* Selected type description */ }
        <p style={ { fontSize: `0.95rem` } }>
            <strong>Type { active.type }</strong> &middot; { active.label }
        </p>
        <p className="muted">{ active.description }</p>

    </div>
}
