import { log } from 'mentie'

const STORAGE_KEY = `vitd_settings`

/**
 * Load saved settings from localStorage.
 * @returns {Object|null} Settings object or null if none saved
 */
export function load_settings() {

    try {
        const raw = localStorage.getItem( STORAGE_KEY )
        if( !raw ) return null
        return JSON.parse( raw )
    } catch ( e ) {
        log.warn( `Failed to load settings from localStorage`, e )
        return null
    }

}


/**
 * Save settings to localStorage.
 * @param {Object} settings - The settings to persist
 */
export function save_settings( settings ) {

    try {
        localStorage.setItem( STORAGE_KEY, JSON.stringify( settings ) )
    } catch ( e ) {
        log.warn( `Failed to save settings to localStorage`, e )
    }

}
