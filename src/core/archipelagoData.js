/**
 * @fileoverview Candidate Festival Archipelago datasets and presets.
 * Conforms to SPR26_D2_P01 specifications.
 */

/**
 * Main Festival Archipelago Demonstration Graph:
 * - 7 Islands (6 to 9 nodes contract)
 * - 8 Footbridges (6 to 13 edges contract)
 * - Connected
 * - Contains 2 cycles (A-B-C and E-F-G)
 * - Contains 2 critical bridges (BR_CD and BR_DE)
 * - Contains 3 non-root articulation points (ISL_C, ISL_D, ISL_E)
 * - Contains non-bridge edges inside cycles (BR_AB, BR_BC, BR_CA, BR_EF, BR_FG, BR_GE)
 */
export const MAIN_FESTIVAL_ARCHIPELAGO = {
  nodes: [
    { id: 'ISL_A', name: 'Anchor Bay', x: 18, y: 35 },
    { id: 'ISL_B', name: 'Beacon Point', x: 38, y: 18 },
    { id: 'ISL_C', name: 'Coral Cove', x: 42, y: 55 },
    { id: 'ISL_D', name: 'Dune Haven', x: 62, y: 55 },
    { id: 'ISL_E', name: 'Emerald Isle', x: 78, y: 38 },
    { id: 'ISL_F', name: 'Fisher Wharf', x: 92, y: 22 },
    { id: 'ISL_G', name: 'Gull Shoals', x: 92, y: 65 },
  ],
  edges: [
    { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
    { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
    { id: 'BR_CA', from: 'ISL_C', to: 'ISL_A' },
    { id: 'BR_CD', from: 'ISL_C', to: 'ISL_D' },
    { id: 'BR_DE', from: 'ISL_D', to: 'ISL_E' },
    { id: 'BR_EF', from: 'ISL_E', to: 'ISL_F' },
    { id: 'BR_FG', from: 'ISL_F', to: 'ISL_G' },
    { id: 'BR_GE', from: 'ISL_G', to: 'ISL_E' },
  ],
};

/**
 * Pure Safe Cycle Preset:
 * Triangle cycle with 0 bridges and 0 articulation points.
 */
export const SAFE_CYCLE_PRESET = {
  nodes: [
    { id: 'ISL_A', name: 'Anchor Bay', x: 25, y: 30 },
    { id: 'ISL_B', name: 'Beacon Point', x: 75, y: 30 },
    { id: 'ISL_C', name: 'Coral Cove', x: 50, y: 75 },
  ],
  edges: [
    { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
    { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
    { id: 'BR_CA', from: 'ISL_C', to: 'ISL_A' },
  ],
};

/**
 * Bowtie / Hourglass Preset:
 * Two cycles sharing a single vertex (ISL_C), creating an articulation point with 0 bridges.
 */
export const BOWTIE_PRESET = {
  nodes: [
    { id: 'ISL_A', name: 'North Pier', x: 20, y: 25 },
    { id: 'ISL_B', name: 'West Dock', x: 20, y: 65 },
    { id: 'ISL_C', name: 'Central Junction', x: 50, y: 45 },
    { id: 'ISL_D', name: 'East Boardwalk', x: 80, y: 25 },
    { id: 'ISL_E', name: 'South Lagoon', x: 80, y: 65 },
  ],
  edges: [
    { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
    { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
    { id: 'BR_CA', from: 'ISL_C', to: 'ISL_A' },
    { id: 'BR_CD', from: 'ISL_C', to: 'ISL_D' },
    { id: 'BR_DE', from: 'ISL_D', to: 'ISL_E' },
    { id: 'BR_EC', from: 'ISL_E', to: 'ISL_C' },
  ],
};

/**
 * Multi-Child Root & Disconnected Island Preset:
 * Root with 2 DFS children + disconnected island.
 */
export const MULTI_ROOT_PRESET = {
  nodes: [
    { id: 'ISL_R', name: 'Root Hub', x: 30, y: 40 },
    { id: 'ISL_C1', name: 'Branch East', x: 55, y: 25 },
    { id: 'ISL_C2', name: 'Branch South', x: 55, y: 60 },
    { id: 'ISL_ISO', name: 'Lonely Rock', x: 85, y: 45 },
  ],
  edges: [
    { id: 'BR_R_C1', from: 'ISL_R', to: 'ISL_C1' },
    { id: 'BR_R_C2', from: 'ISL_R', to: 'ISL_C2' },
  ],
};

export const PRESETS = {
  MAIN: MAIN_FESTIVAL_ARCHIPELAGO,
  CYCLE: SAFE_CYCLE_PRESET,
  BOWTIE: BOWTIE_PRESET,
  MULTI_ROOT: MULTI_ROOT_PRESET,
};
