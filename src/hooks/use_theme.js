import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = `vitd_theme`

// Read persisted theme preference, default to light
const read_stored = () => {
    try {
        return localStorage.getItem( STORAGE_KEY ) || `light`
    } catch {
        return `light`
    }
}

/**
 * Theme toggle hook — persists choice to localStorage, applies data-theme to <html>
 * @returns {{ theme: string, toggle_theme: Function }}
 */
export function use_theme() {

    const [ theme, set_theme ] = useState( read_stored )

    // Sync the data-theme attribute on <html> whenever theme changes
    useEffect( () => {
        document.documentElement.setAttribute( `data-theme`, theme )
        localStorage.setItem( STORAGE_KEY, theme )
    }, [ theme ] )

    const toggle_theme = useCallback( () => {
        set_theme( prev => prev === `light` ? `dark` : `light` )
    }, [] )

    return { theme, toggle_theme }
}
