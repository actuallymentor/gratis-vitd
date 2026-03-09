import { createContext, useContext, useState, useCallback, useMemo } from 'react'

import en from './en'
import es from './es'
import de from './de'
import fr from './fr'
import ja from './ja'
import pt from './pt'
import ru from './ru'
import it from './it'
import nl from './nl'
import pl from './pl'
import zh from './zh'


// ── Available translations ───────────────────────
const TRANSLATIONS = { en, es, de, fr, ja, pt, ru, it, nl, pl, zh }

// All supported language codes — displayed in the language selector
export const LANGUAGES = [
    { code: `en`, label: `English` },
    { code: `es`, label: `Español` },
    { code: `de`, label: `Deutsch` },
    { code: `fr`, label: `Français` },
    { code: `ja`, label: `日本語` },
    { code: `pt`, label: `Português` },
    { code: `ru`, label: `Русский` },
    { code: `it`, label: `Italiano` },
    { code: `nl`, label: `Nederlands` },
    { code: `pl`, label: `Polski` },
    { code: `zh`, label: `中文` },
]

// ── Storage key ──────────────────────────────────
const STORAGE_KEY = `vitd_language`


/**
 * Detect the best matching language from browser settings.
 * Falls back to 'en' if no match found.
 * @returns {string} Language code
 */
function detect_language() {

    // Check localStorage first (user's explicit choice)
    try {
        const stored = localStorage.getItem( STORAGE_KEY )
        if( stored && TRANSLATIONS[ stored ] ) return stored
    } catch { /* ignore */ }

    // Try navigator languages
    const browser_langs = navigator.languages || [ navigator.language ]
    for( const lang of browser_langs ) {

        // Exact match (e.g. "en")
        const code = lang.toLowerCase()
        if( TRANSLATIONS[ code ] ) return code

        // Base language match (e.g. "en-US" → "en")
        const [ base ] = code.split( `-` )
        if( TRANSLATIONS[ base ] ) return base

    }

    return `en`
}


// ── React context ────────────────────────────────
const I18nContext = createContext( null )


/**
 * Provider that wraps the app and supplies translations.
 * @param {{ children: React.ReactNode }} props
 */
export function I18nProvider( { children } ) {

    const [ language, set_language_raw ] = useState( detect_language )

    // Persist language choice to localStorage
    const set_language = useCallback( ( code ) => {
        set_language_raw( code )
        try {
            localStorage.setItem( STORAGE_KEY, code ) 
        } catch { /* ignore */ }
    }, [] )

    // Translation function — replaces {placeholders} with values
    const t = useCallback( ( key, params ) => {

        const translations = TRANSLATIONS[ language ] || TRANSLATIONS.en
        const template = translations[ key ] ?? TRANSLATIONS.en[ key ] ?? key

        if( !params ) return template

        return Object.entries( params ).reduce(
            ( str, [ k, v ] ) => str.replace( new RegExp( `\\{${ k }\\}`, `g` ), v ),
            template
        )

    }, [ language ] )

    const value = useMemo( () => ( { t, language, set_language } ), [ t, language, set_language ] )

    return <I18nContext.Provider value={ value }>{ children }</I18nContext.Provider>
}


/**
 * Hook to access the i18n context.
 * @returns {{ t: (key: string, params?: Object) => string, language: string, set_language: (code: string) => void }}
 */
export function use_i18n() {
    const ctx = useContext( I18nContext )
    if( !ctx ) throw new Error( `use_i18n must be used within I18nProvider` )
    return ctx
}
