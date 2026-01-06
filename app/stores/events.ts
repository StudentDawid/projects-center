/**
 * Events Store
 * Handles random events system - positive, negative, and choice events
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Decimal from 'break_infinity.js';
import { bn, formatNumber } from '~/shared/lib/big-number';
import { useResourceStore } from './resources';
import { useEntityStore } from './entities';
import { useCombatStore } from './combat';
import { useNarrativeStore } from './narrative';
import type { ResourceId, EntityId } from '~/shared/types/game.types';
import { logger } from '~/shared/lib/logger';

// ============================================
// Types
// ============================================

export type EventType = 'positive' | 'negative' | 'choice';
export type EventRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  icon?: string;
  effect: () => void;
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: EventType;
  rarity: EventRarity;
  duration?: number; // Duration of effect in seconds (0 = instant)
  choices?: EventChoice[]; // For choice events
  effect?: () => void; // For non-choice events
  condition?: () => boolean; // Whether event can trigger
}

export interface ActiveEffect {
  id: string;
  eventId: string;
  name: string;
  description: string;
  icon: string;
  type: 'buff' | 'debuff';
  remainingTime: number;
  totalDuration: number;
  multipliers?: {
    production?: number;
    click?: number;
    defense?: number;
    moraleRegen?: number;
  };
}

export interface PendingEvent {
  event: GameEvent;
  expiresAt: number; // Timestamp when event auto-dismisses
}

// ============================================
// Store
// ============================================

export const useEventStore = defineStore(
  'events',
  () => {
    const resourceStore = useResourceStore();
    const entityStore = useEntityStore();
    const combatStore = useCombatStore();
    const narrativeStore = useNarrativeStore();

    // ============================================
    // Constants
    // ============================================

    const MIN_EVENT_INTERVAL = 120; // Minimum 2 minutes between events
    const MAX_EVENT_INTERVAL = 300; // Maximum 5 minutes between events
    const CHOICE_EVENT_TIMEOUT = 30; // 30 seconds to make a choice
    const EVENT_CHANCE_PER_TICK = 0.001; // Base chance per second

    // ============================================
    // State
    // ============================================

    const activeEffects = ref<ActiveEffect[]>([]);
    const pendingEvent = ref<PendingEvent | null>(null);
    const timeSinceLastEvent = ref(0);
    const nextEventTime = ref(getRandomEventInterval());
    const totalEventsTriggered = ref(0);
    const eventsEnabled = ref(true);

    // ============================================
    // Event Definitions
    // ============================================

    const events: GameEvent[] = [
      // ========== POSITIVE EVENTS ==========
      {
        id: 'pilgrimage',
        name: 'Pielgrzymka',
        description: 'Tłum pielgrzymów przybywa do Sanktuarium! Produkcja Wiary zwiększona o 500% przez 30 sekund.',
        icon: 'mdi-walk',
        type: 'positive',
        rarity: 'uncommon',
        duration: 30,
        effect: () => {
          addEffect({
            id: `pilgrimage_${Date.now()}`,
            eventId: 'pilgrimage',
            name: 'Pielgrzymka',
            description: '+500% produkcji Wiary',
            icon: 'mdi-walk',
            type: 'buff',
            remainingTime: 30,
            totalDuration: 30,
            multipliers: { production: 5 },
          });
        },
      },
      {
        id: 'miracle',
        name: 'Cud Solmara',
        description: 'Solmar zsyła cud! Każde kliknięcie daje podwójną Wiarę przez 60 sekund.',
        icon: 'mdi-star-four-points',
        type: 'positive',
        rarity: 'rare',
        duration: 60,
        effect: () => {
          addEffect({
            id: `miracle_${Date.now()}`,
            eventId: 'miracle',
            name: 'Cud Solmara',
            description: '×2 Wiara z kliknięć',
            icon: 'mdi-star-four-points',
            type: 'buff',
            remainingTime: 60,
            totalDuration: 60,
            multipliers: { click: 2 },
          });
        },
      },
      {
        id: 'generous_donor',
        name: 'Hojny Darczyńca',
        description: 'Bogaty szlachcic ofiarowuje dary Sanktuarium! Otrzymujesz natychmiast bonus zasobów.',
        icon: 'mdi-gift',
        type: 'positive',
        rarity: 'common',
        effect: () => {
          const faithBonus = Math.max(500, resourceStore.resources.faith.amount.mul(0.1).toNumber());
          resourceStore.addResource('faith', faithBonus);
          if (resourceStore.resources.ducats.unlocked) {
            resourceStore.addResource('ducats', Math.floor(faithBonus / 10));
          }
          narrativeStore.addLog({
            message: `🎁 Hojny Darczyńca ofiarował ${formatNumber(bn(faithBonus))} Wiary!`,
            type: 'info',
          });
        },
      },
      {
        id: 'blessing',
        name: 'Błogosławieństwo',
        description: 'Boska łaska spływa na Sanktuarium! Morale natychmiast regeneruje się do pełna.',
        icon: 'mdi-hand-heart',
        type: 'positive',
        rarity: 'uncommon',
        effect: () => {
          const combat = useCombatStore();
          combat.morale = combat.maxMorale;
          useNarrativeStore().addLog({
            message: `✨ Błogosławieństwo przywróciło morale do 100!`,
            type: 'info',
          });
        },
        condition: () => {
          const combat = useCombatStore();
          return combat.morale.lt(combat.maxMorale.mul(0.5));
        },
      },
      {
        id: 'sacred_vision',
        name: 'Święta Wizja',
        description: 'Prorok ma wizję przyszłości! Następny prestiż da +50% więcej Popiołów.',
        icon: 'mdi-eye-circle',
        type: 'positive',
        rarity: 'legendary',
        duration: 600, // 10 minutes or until prestige
        effect: () => {
          addEffect({
            id: `sacred_vision_${Date.now()}`,
            eventId: 'sacred_vision',
            name: 'Święta Wizja',
            description: '+50% Popiołów z prestiżu',
            icon: 'mdi-eye-circle',
            type: 'buff',
            remainingTime: 600,
            totalDuration: 600,
            multipliers: {},
          });
        },
      },
      {
        id: 'zealots_fervor',
        name: 'Żarliwość Zelotów',
        description: 'Wierni wpadają w ekstazę! Regeneracja morale zwiększona o +5/s przez 45 sekund.',
        icon: 'mdi-fire',
        type: 'positive',
        rarity: 'uncommon',
        duration: 45,
        effect: () => {
          addEffect({
            id: `zealots_fervor_${Date.now()}`,
            eventId: 'zealots_fervor',
            name: 'Żarliwość Zelotów',
            description: '+5/s regeneracji morale',
            icon: 'mdi-fire',
            type: 'buff',
            remainingTime: 45,
            totalDuration: 45,
            multipliers: { moraleRegen: 5 },
          });
        },
      },

      // ========== NEGATIVE EVENTS ==========
      {
        id: 'plague',
        name: 'Zaraza',
        description: 'Choroba nawiedza Sanktuarium! Produkcja zmniejszona o 50% przez 30 sekund.',
        icon: 'mdi-biohazard',
        type: 'negative',
        rarity: 'common',
        duration: 30,
        effect: () => {
          addEffect({
            id: `plague_${Date.now()}`,
            eventId: 'plague',
            name: 'Zaraza',
            description: '-50% produkcji',
            icon: 'mdi-biohazard',
            type: 'debuff',
            remainingTime: 30,
            totalDuration: 30,
            multipliers: { production: -0.5 },
          });
        },
      },
      {
        id: 'heresy',
        name: 'Herezja',
        description: 'Heretycy sieją zwątpienie! Tracisz 10% aktualnej Wiary.',
        icon: 'mdi-book-cancel',
        type: 'negative',
        rarity: 'common',
        effect: () => {
          const lostFaith = resourceStore.resources.faith.amount.mul(0.1);
          resourceStore.spendResource('faith', lostFaith);
          narrativeStore.addLog({
            message: `📕 Herezja pochłonęła ${formatNumber(lostFaith)} Wiary!`,
            type: 'warning',
          });
        },
        condition: () => useResourceStore().resources.faith.amount.gt(100),
      },
      {
        id: 'sabotage',
        name: 'Sabotaż',
        description: 'Wróg zniszczył jeden z twoich budynków!',
        icon: 'mdi-bomb',
        type: 'negative',
        rarity: 'uncommon',
        effect: () => {
          // Find a random building with count > 0
          const ownedBuildings = Object.values(entityStore.entities).filter(e => e.count > 0);
          if (ownedBuildings.length > 0) {
            const target = ownedBuildings[Math.floor(Math.random() * ownedBuildings.length)];
            target.count--;
            entityStore.updateProductionRates();
            narrativeStore.addLog({
              message: `💥 Sabotaż! Stracono 1 ${target.name}!`,
              type: 'warning',
            });
          }
        },
        condition: () => Object.values(useEntityStore().entities).some(e => e.count > 0),
      },
      {
        id: 'demoralization',
        name: 'Demoralizacja',
        description: 'Plotki o klęsce rozchodzą się wśród wiernych. Morale spada o 25.',
        icon: 'mdi-emoticon-sad',
        type: 'negative',
        rarity: 'common',
        effect: () => {
          const combat = useCombatStore();
          combat.morale = Decimal.max(combat.morale.sub(25), bn(0));
          useNarrativeStore().addLog({
            message: `😢 Demoralizacja! Morale spadło o 25.`,
            type: 'warning',
          });
        },
      },
      {
        id: 'surprise_attack',
        name: 'Atak Zaskoczenia',
        description: 'Wrogowie atakują bez ostrzeżenia! Natychmiastowa fala wrogów!',
        icon: 'mdi-sword-cross',
        type: 'negative',
        rarity: 'uncommon',
        effect: () => {
          useCombatStore().devTriggerWave();
          useNarrativeStore().addLog({
            message: `⚔️ Atak zaskoczenia! Wrogowie atakują!`,
            type: 'warning',
          });
        },
        condition: () => !useCombatStore().isWaveActive,
      },
      {
        id: 'corruption',
        name: 'Korupcja',
        description: 'Poborcy dziesięcin okradają skarbiec! Tracisz 20% Dukatów.',
        icon: 'mdi-cash-remove',
        type: 'negative',
        rarity: 'uncommon',
        effect: () => {
          if (resourceStore.resources.ducats.unlocked && resourceStore.resources.ducats.amount.gt(10)) {
            const lostDucats = resourceStore.resources.ducats.amount.mul(0.2);
            resourceStore.spendResource('ducats', lostDucats);
            narrativeStore.addLog({
              message: `💰 Korupcja! Stracono ${formatNumber(lostDucats)} Dukatów!`,
              type: 'warning',
            });
          }
        },
        condition: () => {
          const resources = useResourceStore();
          return resources.resources.ducats.unlocked && resources.resources.ducats.amount.gt(10);
        },
      },

      // ========== CHOICE EVENTS ==========
      {
        id: 'wandering_merchant',
        name: 'Wędrowny Kupiec',
        description: 'Tajemniczy kupiec oferuje wymianę zasobów. Co wybierzesz?',
        icon: 'mdi-cart',
        type: 'choice',
        rarity: 'common',
        choices: [
          {
            id: 'trade_faith_for_ducats',
            label: 'Wymień Wiarę na Dukaty',
            description: 'Oddaj 500 Wiary, otrzymaj 100 Dukatów',
            icon: 'mdi-swap-horizontal',
            effect: () => {
              if (resourceStore.resources.faith.amount.gte(500)) {
                resourceStore.spendResource('faith', bn(500));
                resourceStore.unlockResource('ducats');
                resourceStore.addResource('ducats', 100);
                narrativeStore.addLog({
                  message: `🔄 Wymieniono 500 Wiary na 100 Dukatów`,
                  type: 'info',
                });
              }
            },
          },
          {
            id: 'trade_ducats_for_faith',
            label: 'Wymień Dukaty na Wiarę',
            description: 'Oddaj 50 Dukatów, otrzymaj 1000 Wiary',
            icon: 'mdi-swap-horizontal',
            effect: () => {
              if (resourceStore.resources.ducats.unlocked && resourceStore.resources.ducats.amount.gte(50)) {
                resourceStore.spendResource('ducats', bn(50));
                resourceStore.addResource('faith', 1000);
                narrativeStore.addLog({
                  message: `🔄 Wymieniono 50 Dukatów na 1000 Wiary`,
                  type: 'info',
                });
              }
            },
          },
          {
            id: 'decline_trade',
            label: 'Odrzuć ofertę',
            description: 'Nie ryzykujesz',
            icon: 'mdi-close',
            effect: () => {
              narrativeStore.addLog({
                message: `🚶 Kupiec odszedł z niczym.`,
                type: 'info',
              });
            },
          },
        ],
      },
      {
        id: 'mysterious_pilgrim',
        name: 'Tajemniczy Pielgrzym',
        description: 'Enigmatyczny wędrowiec oferuje dar... ale czy można mu zaufać? 50% szansy na nagrodę lub karę.',
        icon: 'mdi-account-question',
        type: 'choice',
        rarity: 'uncommon',
        choices: [
          {
            id: 'accept_gift',
            label: 'Przyjmij dar',
            description: '50% szansy: +2000 Wiary LUB -500 Wiary',
            icon: 'mdi-gift',
            effect: () => {
              if (Math.random() > 0.5) {
                resourceStore.addResource('faith', 2000);
                narrativeStore.addLog({
                  message: `🎁 Dar pielgrzyma był prawdziwy! +2000 Wiary!`,
                  type: 'achievement',
                });
              } else {
                resourceStore.spendResource('faith', bn(Math.min(500, resourceStore.resources.faith.amount.toNumber())));
                narrativeStore.addLog({
                  message: `💀 To była pułapka! Stracono Wiarę!`,
                  type: 'warning',
                });
              }
            },
          },
          {
            id: 'refuse_gift',
            label: 'Odrzuć dar',
            description: 'Bezpieczna opcja',
            icon: 'mdi-hand-back-left',
            effect: () => {
              narrativeStore.addLog({
                message: `🚶 Pielgrzym zniknął we mgle.`,
                type: 'info',
              });
            },
          },
        ],
      },
      {
        id: 'diplomat',
        name: 'Dyplomata',
        description: 'Wysłannik wroga proponuje rozejm. Możesz opóźnić następną falę za cenę Wiary.',
        icon: 'mdi-handshake',
        type: 'choice',
        rarity: 'uncommon',
        choices: [
          {
            id: 'accept_truce',
            label: 'Zapłać za rozejm',
            description: 'Oddaj 1000 Wiary, opóźnij falę o 60s',
            icon: 'mdi-peace',
            effect: () => {
              if (useResourceStore().resources.faith.amount.gte(1000)) {
                useResourceStore().spendResource('faith', bn(1000));
                const combat = useCombatStore();
                combat.timeSinceLastWave = Math.max(0, combat.timeSinceLastWave - 60);
                useNarrativeStore().addLog({
                  message: `🕊️ Rozejm zawarty! Następna fala opóźniona o 60s.`,
                  type: 'info',
                });
              }
            },
          },
          {
            id: 'refuse_truce',
            label: 'Odrzuć propozycję',
            description: 'Zachowaj Wiarę, ale fala przyjdzie normalnie',
            icon: 'mdi-sword',
            effect: () => {
              narrativeStore.addLog({
                message: `⚔️ Odrzucono rozejm. Przygotuj się na walkę!`,
                type: 'info',
              });
            },
          },
        ],
        condition: () => !useCombatStore().isWaveActive,
      },
      {
        id: 'sacrifice',
        name: 'Ofiara',
        description: 'Kapłani proponują rytuał ofiarny. Poświęć budynek za potężny bonus.',
        icon: 'mdi-fire-alert',
        type: 'choice',
        rarity: 'rare',
        choices: [
          {
            id: 'make_sacrifice',
            label: 'Złóż ofiarę',
            description: 'Poświęć losowy budynek za +200% produkcji przez 60s',
            icon: 'mdi-fire',
            effect: () => {
              const ownedBuildings = Object.values(entityStore.entities).filter(e => e.count > 0);
              if (ownedBuildings.length > 0) {
                const target = ownedBuildings[Math.floor(Math.random() * ownedBuildings.length)];
                target.count--;
                entityStore.updateProductionRates();
                addEffect({
                  id: `sacrifice_${Date.now()}`,
                  eventId: 'sacrifice',
                  name: 'Ofiara Spalona',
                  description: '+200% produkcji',
                  icon: 'mdi-fire',
                  type: 'buff',
                  remainingTime: 60,
                  totalDuration: 60,
                  multipliers: { production: 2 },
                });
                narrativeStore.addLog({
                  message: `🔥 ${target.name} złożono w ofierze! +200% produkcji przez 60s!`,
                  type: 'achievement',
                });
              }
            },
          },
          {
            id: 'refuse_sacrifice',
            label: 'Odmów',
            description: 'Zachowaj swoje budynki',
            icon: 'mdi-cancel',
            effect: () => {
              narrativeStore.addLog({
                message: `🙏 Ofiarę odrzucono.`,
                type: 'info',
              });
            },
          },
        ],
        condition: () => Object.values(useEntityStore().entities).some(e => e.count > 0),
      },
      {
        id: 'holy_relic',
        name: 'Święta Relikwia',
        description: 'Odkryto starożytną relikwię! Możesz ją sprzedać lub zatrzymać dla bonusu.',
        icon: 'mdi-treasure-chest',
        type: 'choice',
        rarity: 'rare',
        choices: [
          {
            id: 'sell_relic',
            label: 'Sprzedaj relikwię',
            description: 'Otrzymaj natychmiast 5000 Wiary',
            icon: 'mdi-cash',
            effect: () => {
              resourceStore.addResource('faith', 5000);
              narrativeStore.addLog({
                message: `💰 Sprzedano relikwię za 5000 Wiary!`,
                type: 'info',
              });
            },
          },
          {
            id: 'keep_relic',
            label: 'Zatrzymaj relikwię',
            description: '+25% obrony przez 120s',
            icon: 'mdi-shield-star',
            effect: () => {
              addEffect({
                id: `relic_${Date.now()}`,
                eventId: 'holy_relic',
                name: 'Moc Relikwii',
                description: '+25% obrony',
                icon: 'mdi-shield-star',
                type: 'buff',
                remainingTime: 120,
                totalDuration: 120,
                multipliers: { defense: 0.25 },
              });
              narrativeStore.addLog({
                message: `✨ Relikwia błogosławi obrońców! +25% obrony przez 120s!`,
                type: 'achievement',
              });
            },
          },
        ],
      },
    ];

    // ============================================
    // Computed
    // ============================================

    const hasActiveEffects = computed(() => activeEffects.value.length > 0);
    const hasPendingEvent = computed(() => pendingEvent.value !== null);

    const activeBuffs = computed(() => activeEffects.value.filter(e => e.type === 'buff'));
    const activeDebuffs = computed(() => activeEffects.value.filter(e => e.type === 'debuff'));

    /**
     * Calculate total production multiplier from active effects
     */
    const productionMultiplier = computed(() => {
      let multiplier = 1;
      for (const effect of activeEffects.value) {
        if (effect.multipliers?.production) {
          multiplier += effect.multipliers.production;
        }
      }
      return Math.max(0.1, multiplier); // Minimum 10% production
    });

    /**
     * Calculate total click multiplier from active effects
     */
    const clickMultiplier = computed(() => {
      let multiplier = 1;
      for (const effect of activeEffects.value) {
        if (effect.multipliers?.click) {
          multiplier *= effect.multipliers.click;
        }
      }
      return multiplier;
    });

    /**
     * Calculate total defense bonus from active effects
     */
    const defenseBonus = computed(() => {
      let bonus = 0;
      for (const effect of activeEffects.value) {
        if (effect.multipliers?.defense) {
          bonus += effect.multipliers.defense;
        }
      }
      return bonus;
    });

    /**
     * Calculate total morale regen bonus from active effects
     */
    const moraleRegenBonus = computed(() => {
      let bonus = 0;
      for (const effect of activeEffects.value) {
        if (effect.multipliers?.moraleRegen) {
          bonus += effect.multipliers.moraleRegen;
        }
      }
      return bonus;
    });

    /**
     * Check if Sacred Vision buff is active (for prestige bonus)
     */
    const hasSacredVisionBuff = computed(() =>
      activeEffects.value.some(e => e.eventId === 'sacred_vision')
    );

    // ============================================
    // Actions
    // ============================================

    function getRandomEventInterval(): number {
      return MIN_EVENT_INTERVAL + Math.random() * (MAX_EVENT_INTERVAL - MIN_EVENT_INTERVAL);
    }

    /**
     * Add an active effect
     */
    function addEffect(effect: ActiveEffect) {
      // Remove any existing effect from the same event
      activeEffects.value = activeEffects.value.filter(e => e.eventId !== effect.eventId);
      activeEffects.value.push(effect);
    }

    /**
     * Remove an active effect
     */
    function removeEffect(effectId: string) {
      activeEffects.value = activeEffects.value.filter(e => e.id !== effectId);
    }

    /**
     * Clear Sacred Vision buff (called after prestige)
     */
    function clearSacredVisionBuff() {
      activeEffects.value = activeEffects.value.filter(e => e.eventId !== 'sacred_vision');
    }

    /**
     * Trigger a random event
     */
    function triggerRandomEvent() {
      if (!eventsEnabled.value || hasPendingEvent.value) return;

      // Filter events by condition
      const availableEvents = events.filter(e => !e.condition || e.condition());

      if (availableEvents.length === 0) return;

      // Weight by rarity
      const weightedEvents: GameEvent[] = [];
      for (const event of availableEvents) {
        let weight = 1;
        switch (event.rarity) {
          case 'common': weight = 10; break;
          case 'uncommon': weight = 5; break;
          case 'rare': weight = 2; break;
          case 'legendary': weight = 1; break;
        }
        for (let i = 0; i < weight; i++) {
          weightedEvents.push(event);
        }
      }

      // Select random event
      const selectedEvent = weightedEvents[Math.floor(Math.random() * weightedEvents.length)];

      // Set as pending
      pendingEvent.value = {
        event: selectedEvent,
        expiresAt: selectedEvent.type === 'choice'
          ? Date.now() + CHOICE_EVENT_TIMEOUT * 1000
          : Date.now() + 10000, // 10s for non-choice events
      };

      totalEventsTriggered.value++;
      timeSinceLastEvent.value = 0;
      nextEventTime.value = getRandomEventInterval();

      logger.log(`[Events] Triggered: ${selectedEvent.name} (${selectedEvent.rarity})`);
    }

    /**
     * Handle event - for non-choice events or auto-dismiss
     */
    function handleEvent() {
      if (!pendingEvent.value) return;

      const event = pendingEvent.value.event;

      if (event.type !== 'choice' && event.effect) {
        event.effect();
      }

      // Log the event
      const emoji = event.type === 'positive' ? '✨' : event.type === 'negative' ? '⚠️' : '❓';
      narrativeStore.addLog({
        message: `${emoji} ${event.name}: ${event.description}`,
        type: event.type === 'negative' ? 'warning' : 'info',
      });

      pendingEvent.value = null;
    }

    /**
     * Make a choice for choice events
     */
    function makeChoice(choiceId: string) {
      if (!pendingEvent.value || pendingEvent.value.event.type !== 'choice') return;

      const choice = pendingEvent.value.event.choices?.find(c => c.id === choiceId);
      if (choice) {
        choice.effect();
      }

      pendingEvent.value = null;
    }

    /**
     * Dismiss pending event (for choice events that expire)
     */
    function dismissEvent() {
      if (!pendingEvent.value) return;

      const event = pendingEvent.value.event;

      if (event.type === 'choice') {
        narrativeStore.addLog({
          message: `⏰ ${event.name} - Nie podjęto decyzji w czasie.`,
          type: 'warning',
        });
      }

      pendingEvent.value = null;
    }

    /**
     * Main tick function - update effects and check for new events
     */
    function tick(deltaTime: number) {
      if (!eventsEnabled.value) return;

      // Update active effects
      const expiredEffects: string[] = [];
      for (const effect of activeEffects.value) {
        effect.remainingTime -= deltaTime;
        if (effect.remainingTime <= 0) {
          expiredEffects.push(effect.id);
        }
      }

      // Remove expired effects
      for (const effectId of expiredEffects) {
        const effect = activeEffects.value.find(e => e.id === effectId);
        if (effect) {
          narrativeStore.addLog({
            message: `⏰ ${effect.name} wygasło.`,
            type: 'info',
          });
        }
        removeEffect(effectId);
      }

      // Check if pending event expired
      if (pendingEvent.value && Date.now() > pendingEvent.value.expiresAt) {
        if (pendingEvent.value.event.type === 'choice') {
          dismissEvent();
        } else {
          handleEvent();
        }
      }

      // Update time and check for new events
      timeSinceLastEvent.value += deltaTime;

      if (timeSinceLastEvent.value >= nextEventTime.value && !hasPendingEvent.value) {
        triggerRandomEvent();
      }
    }

    /**
     * Reset for prestige
     */
    function resetForPrestige() {
      activeEffects.value = [];
      pendingEvent.value = null;
      timeSinceLastEvent.value = 0;
      nextEventTime.value = getRandomEventInterval();
    }

    /**
     * Toggle events on/off
     */
    function toggleEvents() {
      eventsEnabled.value = !eventsEnabled.value;
    }

    /**
     * DEV: Trigger specific event
     */
    function devTriggerEvent(eventId: string) {
      const event = events.find(e => e.id === eventId);
      if (event) {
        pendingEvent.value = {
          event,
          expiresAt: event.type === 'choice'
            ? Date.now() + CHOICE_EVENT_TIMEOUT * 1000
            : Date.now() + 10000,
        };
        totalEventsTriggered.value++;
      }
    }

    /**
     * DEV: Get all event IDs
     */
    function getEventIds(): string[] {
      return events.map(e => e.id);
    }

    return {
      // State
      activeEffects,
      pendingEvent,
      timeSinceLastEvent,
      nextEventTime,
      totalEventsTriggered,
      eventsEnabled,

      // Computed
      hasActiveEffects,
      hasPendingEvent,
      activeBuffs,
      activeDebuffs,
      productionMultiplier,
      clickMultiplier,
      defenseBonus,
      moraleRegenBonus,
      hasSacredVisionBuff,

      // Actions
      tick,
      triggerRandomEvent,
      handleEvent,
      makeChoice,
      dismissEvent,
      clearSacredVisionBuff,
      resetForPrestige,
      toggleEvents,

      // Dev
      devTriggerEvent,
      getEventIds,
    };
  },
  {
    persist: {
      key: 'solmar-events',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      pick: ['activeEffects', 'timeSinceLastEvent', 'nextEventTime', 'totalEventsTriggered', 'eventsEnabled'],
      serializer: {
        serialize: (state) => JSON.stringify(state),
        deserialize: (str) => JSON.parse(str),
      },
    },
  }
);

