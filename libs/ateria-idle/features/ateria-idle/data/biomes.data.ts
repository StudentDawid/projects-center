/**
 * Biome definitions for Ateria Idle
 * Data-Driven Design - all biome data in one place
 */

import type { Biome, BiomeId } from '@ateria-idle/entities/ateria-idle/warrior';

export const BIOMES: Record<BiomeId, Biome> = {
  // ============================================
  // TIER 1 - Early Game (Level 1-15)
  // ============================================
  forest: {
    id: 'forest',
    name: 'Mroczny Las',
    description: 'Gęsty las pełen goblinów, wilków i innych stworzeń. Idealny dla początkujących wojowników.',
    icon: 'mdi-pine-tree',
    color: '#228B22',
    requiredLevel: 1,
    monsterIds: ['goblin', 'wolf', 'spider', 'skeleton', 'forest_troll'],
    bossId: 'ancient_treant',
    uniqueLoot: ['forest_essence', 'ancient_bark', 'spider_silk'],
  },

  plains: {
    id: 'plains',
    name: 'Bezkresne Równiny',
    description: 'Rozległe stepy zamieszkałe przez bandytów, dzikie konie i pradawne bestie.',
    icon: 'mdi-grass',
    color: '#9ACD32',
    requiredLevel: 8,
    monsterIds: ['bandit', 'wild_boar', 'prairie_wolf', 'centaur', 'plains_giant'],
    bossId: 'warlord_khan',
    uniqueLoot: ['wild_mane', 'bandit_insignia', 'giant_bone'],
  },

  // ============================================
  // TIER 2 - Mid Game (Level 15-35)
  // ============================================
  swamp: {
    id: 'swamp',
    name: 'Trujące Bagna',
    description: 'Zdradliwe mokradła pełne trucizn i nieumarłych. Wymaga odporności na truciznę.',
    icon: 'mdi-water',
    color: '#556B2F',
    requiredLevel: 15,
    monsterIds: ['swamp_zombie', 'poison_frog', 'bog_witch', 'hydra_spawn', 'swamp_horror'],
    bossId: 'queen_of_rot',
    uniqueLoot: ['toxic_gland', 'witch_eye', 'hydra_scale'],
    environmentalEffect: {
      id: 'poison_mist',
      name: 'Trująca Mgła',
      description: 'Powietrze jest przesycone trucizną. Otrzymujesz obrażenia co turę.',
      effect: {
        type: 'damage_over_time',
        value: 5,
        tickInterval: 10, // Every second
      },
      mitigation: {
        potionId: 'antidote',
        researchId: 'poison_resistance',
      },
    },
  },

  desert: {
    id: 'desert',
    name: 'Płonące Piaski',
    description: 'Bezlitosna pustynia z palącym słońcem. Wymaga ochrony przed upałem.',
    icon: 'mdi-weather-sunny',
    color: '#EDC9AF',
    requiredLevel: 20,
    monsterIds: ['sand_scorpion', 'mummy', 'desert_nomad', 'sand_worm', 'sphinx'],
    bossId: 'pharaoh_lich',
    uniqueLoot: ['ancient_scarab', 'mummy_wrapping', 'desert_crystal'],
    environmentalEffect: {
      id: 'scorching_heat',
      name: 'Piekący Upał',
      description: 'Ekstremalne temperatury wyczerpują wojownika.',
      effect: {
        type: 'stat_debuff',
        stat: 'maxHp',
        value: -20, // -20% max HP
      },
      mitigation: {
        itemId: 'desert_robes',
        potionId: 'cooling_elixir',
      },
    },
  },

  // ============================================
  // TIER 3 - Late Game (Level 35-60)
  // ============================================
  mountains: {
    id: 'mountains',
    name: 'Szczyty Gromu',
    description: 'Lodowate góry zamieszkałe przez smoki i gigantów. Tylko dla doświadczonych.',
    icon: 'mdi-image-filter-hdr',
    color: '#708090',
    requiredLevel: 35,
    monsterIds: ['rock_golem', 'harpy', 'frost_giant', 'young_dragon', 'storm_elemental'],
    bossId: 'mountain_king',
    uniqueLoot: ['dragon_scale', 'giant_heart', 'storm_crystal'],
    environmentalEffect: {
      id: 'thin_air',
      name: 'Rzadkie Powietrze',
      description: 'Na tej wysokości trudno oddychać.',
      effect: {
        type: 'stat_debuff',
        stat: 'attack',
        value: -15, // -15% attack
      },
      mitigation: {
        itemId: 'breathing_mask',
        researchId: 'altitude_training',
      },
    },
  },

  volcano: {
    id: 'volcano',
    name: 'Ognista Otchłań',
    description: 'Aktywny wulkan pełen demonów i żywiołaków ognia. Śmiertelnie niebezpieczny.',
    icon: 'mdi-fire',
    color: '#FF4500',
    requiredLevel: 45,
    monsterIds: ['fire_elemental', 'lava_golem', 'hell_hound', 'demon_warrior', 'infernal'],
    bossId: 'lord_of_cinders',
    uniqueLoot: ['demon_heart', 'infernal_ember', 'volcanic_glass'],
    environmentalEffect: {
      id: 'burning_ground',
      name: 'Płonąca Ziemia',
      description: 'Podłoże parzy przy każdym kroku.',
      effect: {
        type: 'damage_over_time',
        value: 15,
        tickInterval: 10,
      },
      mitigation: {
        itemId: 'fireproof_boots',
        potionId: 'fire_resistance',
      },
    },
  },

  // ============================================
  // TIER 4 - End Game (Level 60+)
  // ============================================
  tundra: {
    id: 'tundra',
    name: 'Wieczna Zmarzlina',
    description: 'Kraina wiecznego lodu, gdzie nawet czas zdaje się zamarzać.',
    icon: 'mdi-snowflake',
    color: '#E0FFFF',
    requiredLevel: 55,
    monsterIds: ['frost_wraith', 'ice_troll', 'yeti', 'frost_dragon', 'ancient_ice_elemental'],
    bossId: 'frost_emperor',
    uniqueLoot: ['eternal_ice', 'yeti_fur', 'frost_dragon_fang'],
    environmentalEffect: {
      id: 'freezing_cold',
      name: 'Mroźny Chłód',
      description: 'Przeszywający zimno spowalnia ruchy.',
      effect: {
        type: 'stat_debuff',
        stat: 'evasion',
        value: -30, // -30% evasion
      },
      mitigation: {
        itemId: 'fur_cloak',
        potionId: 'warming_elixir',
      },
    },
  },

  abyss: {
    id: 'abyss',
    name: 'Otchłań',
    description: 'Wymiar chaosu i mroku. Tylko najpotężniejsi wojownicy przetrwają.',
    icon: 'mdi-blur',
    color: '#4B0082',
    requiredLevel: 70,
    monsterIds: ['void_stalker', 'chaos_spawn', 'abyssal_demon', 'elder_horror', 'void_dragon'],
    bossId: 'the_nameless_one',
    uniqueLoot: ['void_essence', 'chaos_crystal', 'elder_rune'],
    environmentalEffect: {
      id: 'void_corruption',
      name: 'Korupcja Pustki',
      description: 'Otchłań powoli pochłania twoją duszę.',
      effect: {
        type: 'resource_drain',
        value: 1, // Drains 1 essence per tick
      },
      mitigation: {
        itemId: 'void_ward',
        researchId: 'void_resistance',
      },
    },
  },
};

// Helper functions
export function getBiome(id: BiomeId): Biome | undefined {
  return BIOMES[id];
}

export function getUnlockedBiomes(playerLevel: number): Biome[] {
  return Object.values(BIOMES).filter(biome => biome.requiredLevel <= playerLevel);
}

export function getBiomesByTier(): Record<string, Biome[]> {
  return {
    tier1: [BIOMES.forest, BIOMES.plains],
    tier2: [BIOMES.swamp, BIOMES.desert],
    tier3: [BIOMES.mountains, BIOMES.volcano],
    tier4: [BIOMES.tundra, BIOMES.abyss],
  };
}

export const BIOME_ORDER: BiomeId[] = [
  'forest',
  'plains',
  'swamp',
  'desert',
  'mountains',
  'volcano',
  'tundra',
  'abyss',
];
