An app that based on the user location calculates how long you need to tan to get a certain amount of vitamin d.

## Vitamin d calculation

Calculating the vitamin d UI production for a given amount of exposure minutes (full body) is done with:

```js
/**
 * Approximate vitamin D produced (IU) from full-body sun exposure
 * for a given solar zenith angle, exposure duration, and skin type.
 * @param {number} sza_degrees - Solar zenith angle in degrees
 * @param {number} exposure_minutes - Duration of sun exposure in minutes
 * @param {number} skin_type - Fitzpatrick skin type (1–6)
 * @param {number} percent_body_exposed - Percentage of body exposed to sun (0–100)
 * @returns {number} Estimated IU of vitamin D produced
 */
function vitamin_d_iu_produced( sza_degrees, exposure_minutes, skin_type = 2, percent_body_exposed = 100 ) {

    // Skin type → time multiplier relative to fair/light skin (type 2)
    // Lower types reach dose faster, higher types need more time
    const skin_factors = { 1: 0.7, 2: 1, 3: 1, 4: 2, 5: 5, 6: 10 }
    const skin_factor = skin_factors[ skin_type ] ?? 1

    // Fitted constants for reference skin from McKenzie/NIWA table
    const k = 0.5942279531658679
    const n = 3.2240022213923023

    // sec(θ) = 1 / cos(θ) — atmospheric path length increases with zenith angle
    const theta = sza_degrees * ( Math.PI / 180 )
    const sec_theta = 1 / Math.cos( theta )

    // Minutes of full-body exposure needed for 1000 IU at this angle and skin type
    const t_1000_minutes = k * Math.pow( sec_theta, n ) * skin_factor

    // Assume linear production with time at fixed SZA
    return 1000 * ( exposure_minutes / t_1000_minutes ) * ( percent_body_exposed / 100 )
}
```

## Time for erythema calculatuion

Calculating the time for erythema (sunburn) is done with:

```js
/**
 * Approximate time to sunburn (minutes) for full-body exposure
 * at a given solar zenith angle and Fitzpatrick skin type.
 * Based on McKenzie/NIWA erythema model for reference light skin.
 * @param {number} sza_degrees - Solar zenith angle in degrees
 * @param {number} skin_type - Fitzpatrick skin type (1–6)
 * @returns {number} Estimated minutes until erythema
 */
function time_to_erythema( sza_degrees, skin_type = 2 ) {

    // Skin type → time multiplier relative to fair/light skin (type 2)
    // Lower types burn faster, higher types tolerate more exposure
    const skin_factors = { 1: 0.7, 2: 1, 3: 1, 4: 2, 5: 5, 6: 10 }
    const skin_factor = skin_factors[ skin_type ] ?? 1

    // Fitted constants for reference skin from McKenzie/NIWA table
    const a = 11.680455399889993
    const b = 2.663785759584473

    // sec(θ) — atmospheric path length increases with zenith angle
    const theta = sza_degrees * ( Math.PI / 180 )
    const sec_theta = 1 / Math.cos( theta )

    // Reference erythema time scaled by skin tolerance
    return a * Math.pow( sec_theta, b ) * skin_factor
}
```

## User flow

### Step 1: onboarding

The opening screen shows a centered headline saying "Vitamin D Calculator.

The text under it says "Check at what times of the day the sun is strong enough for you to generate vitamin D".

Under that is a button that says "Use my location". Under that is a subtle text that says "Choose manually" which opens a modal that allows you to either input coordinates or the name of a city+country, the city+country list is based on the list that is usually used for timezones.

Under that is a selection list for Fitspatrick skin type.

Once the location and Fitzpatrick skintype is clear (either through browser detection or manual selection) the app shows the main screen.

### Step 2: main screen

This screen is a 100vh 100vw centered screen that shows a chart that given the current location's solar behaviour plots:

- x-axis is the time of the day (in local time)
- y-axis is the amount of minutes of sun exposure needed to generate 1000 IU of vitamin D for the selected skin type
- The chart also shows a line for the time to erythema (sunburn) for the selected skin type.

Under the chart is a line saying "Assuming you are XXX% naked, have skin type YYY, and want to get ZZZ IU of Vitamin D which is AAA% of the daily recommended amount.

The numbers are input fields that are styled to smoothly fit into the text. The user can change XXX, YYY, and ZZZ and the chart as well as AAA will update dynamically (with a 3 second debounce using `use-debounce`).

NOTE: settings are persisted in local storage so that the user doesn't have to set them up every time. If settings are found onboarding is skipped and the user is forwarded to the main screen.

## Boundaries

- app is a frontend only PWA that works offline
- app is styled to work on mobile and desktop
- app uses `lucide-react` icons where relevant


## References

- https://onlinelibrary.wiley.com/doi/10.1111/j.1751-1097.2008.00400.x#b58
- https://www.perplexity.ai/search/extract-table-2-https-onlineli-sbuxXaOMTJepB0DUW71.mA