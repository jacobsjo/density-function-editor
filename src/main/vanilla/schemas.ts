export const schemas = new Map(Object.entries({
    'minecraft:abs': {
        argument: "densityFunction",
    },
    'minecraft:add': {
        argument1: "densityFunction",
        argument2: "densityFunction",
    },
    'minecraft:beardifier': {},
    'minecraft:blend_alpha': {},
    'minecraft:blend_density': {
        argument: "densityFunction",
    },
    'minecraft:blend_offset': {},
    'minecraft:cache_2d': {
        argument: "densityFunction",
    },
    'minecraft:cache_all_in_cell': {
        argument: "densityFunction",
    },
    'minecraft:cache_once': {
        argument: "densityFunction",
    },
    'minecraft:clamp': {
        input: "densityFunction",
        min: "number",
        max: "number",
    },
    'minecraft:cube': {
        argument: "densityFunction",
    },
    "minecraft:end_islands": {},
    'minecraft:flat_cache': {
        argument: "densityFunction",
    },
    'minecraft:half_negative': {
        argument: "densityFunction",
    },
    'minecraft:interpolated': {
        argument: "densityFunction",
    },
    'minecraft:max': {
        argument1: "densityFunction",
        argument2: "densityFunction",
    },
    'minecraft:min': {
        argument1: "densityFunction",
        argument2: "densityFunction",
    },
    'minecraft:mul': {
        argument1: "densityFunction",
        argument2: "densityFunction",
    },
    'minecraft:noise': {
        noise: "noise",
        xz_scale: "number",
        y_scale: "number",
    },
    "minecraft:old_blended_noise": {},
    'minecraft:quarter_negative': {
        argument: "densityFunction",
    },
    'minecraft:range_choice': {
        input: "densityFunction",
        min_inclusive: "number",
        max_exclusive: "number",
        when_in_range: "densityFunction",
        when_out_of_range: "densityFunction",
    },
    'minecraft:shift': {
        argument: "noise",
    },
    'minecraft:shift_a': {
        argument: "noise",
    },
    'minecraft:shift_b': {
        argument: "noise",
    },
    'minecraft:shifted_noise': {
        shift_x: "densityFunction",
        shift_y: "densityFunction",
        shift_z: "densityFunction",
        noise: "noise",
        xz_scale: "number",
        y_scale: "number",
    },
    'minecraft:slide': {
        argument: "densityFunction",
    },
    'minecraft:square': {
        argument: "densityFunction",
    },
    'minecraft:squeeze': {
        argument: "densityFunction",
    },
    'minecraft:terrain_shaper_spline': {
        spline: "spline",
        min_value: "number",
        max_value: "number",
        continentalness: "densityFunction",
        erosion: "densityFunction",
        weirdness: "densityFunction",
    },
    'minecraft:weird_scaled_sampler': {
        rarity_value_mapper: "sampler_type",
        noise: "noise",
        input: "densityFunction",
    },
    'minecraft:y_clamped_gradient': {
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