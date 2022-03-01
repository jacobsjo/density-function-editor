export const schemas = new Map(Object.entries({
    'abs': {
        group: "math",
        argument: "densityFunction",
    },
    'add': {
        group: "math",
        argument1: "densityFunction",
        argument2: "densityFunction",
    },
    'beardifier': {
        group: "extra"
    },
    'blend_alpha': {
        group: "extra"
    },
    'blend_density': {
        group: "extra",
        argument: "densityFunction",
    },
    'blend_offset': {
        group: "extra"
    },
    'cache_2d': {
        group: "cache",
        argument: "densityFunction",
    },
    'cache_all_in_cell': {
        group: "cache",
        argument: "densityFunction",
    },
    'cache_once': {
        group: "cache",
        argument: "densityFunction",
    },
    'clamp': {
        group: "math",
        input: "densityFunction",
        min: "number",
        max: "number",
    },
    'cube': {
        group: "math",
        argument: "densityFunction",
    },
    "end_islands": {
        group: "extra"
    },
    'flat_cache': {
        group: "cache",
        argument: "densityFunction",
    },
    'half_negative': {
        group: "math",
        argument: "densityFunction",
    },
    'interpolated': {
        group: "special",
        argument: "densityFunction",
    },
    'max': {
        group: "math",
        argument1: "densityFunction",
        argument2: "densityFunction",
    },
    'min': {
        group: "math",
        argument1: "densityFunction",
        argument2: "densityFunction",
    },
    'mul': {
        group: "math",
        argument1: "densityFunction",
        argument2: "densityFunction",
    },
    'noise': {
        group: "input",
        noise: "noise",
        xz_scale: "number",
        y_scale: "number",
    },
    "old_blended_noise": {
        group: "input",
    },
    'quarter_negative': {
        group: "math",
        argument: "densityFunction",
    },
    'range_choice': {
        group: "special",
        input: "densityFunction",
        min_inclusive: "number",
        max_exclusive: "number",
        when_in_range: "densityFunction",
        when_out_of_range: "densityFunction",
    },
    'shift': {
        group: "input",
        argument: "noise",
    },
    'shift_a': {
        group: "input",
        argument: "noise",
    },
    'shift_b': {
        group: "input",
        argument: "noise",
    },
    'shifted_noise': {
        group: "input",
        shift_x: "densityFunction",
        shift_y: "densityFunction",
        shift_z: "densityFunction",
        noise: "noise",
        xz_scale: "number",
        y_scale: "number",
    },
    'slide': {
        group: "extra",
        argument: "densityFunction",
    },
    'square': {
        group: "math",
        argument: "densityFunction",
    },
    'squeeze': {
        group: "math",
        argument: "densityFunction",
    },
    'terrain_shaper_spline': {
        group: "special",
        spline: "spline",
        min_value: "number",
        max_value: "number",
        continentalness: "densityFunction",
        erosion: "densityFunction",
        weirdness: "densityFunction",
    },
    'weird_scaled_sampler': {
        group: "input",
        rarity_value_mapper: "sampler_type",
        noise: "noise",
        input: "densityFunction",
    },
    'y_clamped_gradient': {
        group: "input",
        from_y: "number",
        to_y: "number",
        from_value: "number",
        to_value: "number",
    }
}))

export const noise_router_fields = [
    "final_density",
    "vein_toggle",
    "vein_ridged",
    "vein_gap",
    "erosion",
    "depth",
    "ridges",
    "initial_density_without_jaggedness",
    "lava",
    "temperature",
    "vegetation",
    "continents",
    "barrier",
    "fluid_level_floodedness",
    "fluid_level_spread"
]