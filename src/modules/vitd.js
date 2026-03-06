// Skin type → time multiplier relative to fair/light skin (type 2)
// Lower types reach dose faster, higher types need more time
const SKIN_FACTORS = { 1: 0.7, 2: 1, 3: 1, 4: 2, 5: 5, 6: 10 }

// Fitted constants for reference skin from McKenzie/NIWA table
const VITD_K = 0.5942279531658679
const VITD_N = 3.2240022213923023
const ERYTH_A = 11.680455399889993
const ERYTH_B = 2.663785759584473


/**
 * Compute sec(θ) from degrees — atmospheric path length increases with zenith angle.
 * @param {number} sza_degrees - Solar zenith angle in degrees
 * @returns {number} Secant of the zenith angle
 */
function sec_theta( sza_degrees ) {
    const theta = sza_degrees * ( Math.PI / 180 )
    return 1 / Math.cos( theta )
}


/**
 * Approximate vitamin D produced (IU) from full-body sun exposure
 * for a given solar zenith angle, exposure duration, and skin type.
 * @param {number} sza_degrees - Solar zenith angle in degrees
 * @param {number} exposure_minutes - Duration of sun exposure in minutes
 * @param {number} skin_type - Fitzpatrick skin type (1–6)
 * @param {number} percent_body_exposed - Percentage of body exposed to sun (0–100)
 * @returns {number} Estimated IU of vitamin D produced
 */
export function vitamin_d_iu_produced( sza_degrees, exposure_minutes, skin_type = 2, percent_body_exposed = 100 ) {

    const skin_factor = SKIN_FACTORS[ skin_type ] ?? 1

    // Minutes of full-body exposure needed for 1000 IU at this angle and skin type
    const t_1000_minutes = VITD_K * Math.pow( sec_theta( sza_degrees ), VITD_N ) * skin_factor

    // Assume linear production with time at fixed SZA
    return 1000 * ( exposure_minutes / t_1000_minutes ) * ( percent_body_exposed / 100 )

}


/**
 * Approximate time to sunburn (minutes) for full-body exposure
 * at a given solar zenith angle and Fitzpatrick skin type.
 * Based on McKenzie/NIWA erythema model for reference light skin.
 * @param {number} sza_degrees - Solar zenith angle in degrees
 * @param {number} skin_type - Fitzpatrick skin type (1–6)
 * @returns {number} Estimated minutes until erythema
 */
export function time_to_erythema( sza_degrees, skin_type = 2 ) {

    const skin_factor = SKIN_FACTORS[ skin_type ] ?? 1

    // Reference erythema time scaled by skin tolerance
    return ERYTH_A * Math.pow( sec_theta( sza_degrees ), ERYTH_B ) * skin_factor

}


/**
 * Calculate how many minutes of exposure are needed to produce
 * a target amount of vitamin D at a given SZA and skin type.
 * @param {number} sza_degrees - Solar zenith angle in degrees
 * @param {number} target_iu - Target IU of vitamin D
 * @param {number} skin_type - Fitzpatrick skin type (1–6)
 * @param {number} percent_body_exposed - Percentage of body exposed (0–100)
 * @returns {number} Minutes needed
 */
export function minutes_for_target_iu( sza_degrees, target_iu, skin_type = 2, percent_body_exposed = 100 ) {

    const skin_factor = SKIN_FACTORS[ skin_type ] ?? 1

    // Minutes needed for 1000 IU at full body exposure
    const t_1000 = VITD_K * Math.pow( sec_theta( sza_degrees ), VITD_N ) * skin_factor

    // Scale for target IU and actual body exposure
    return t_1000 * ( target_iu / 1000 ) / ( percent_body_exposed / 100 )

}
