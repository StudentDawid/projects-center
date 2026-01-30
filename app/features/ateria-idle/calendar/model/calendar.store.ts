/**
 * Calendar Store - Time, Weather, Seasons, Festivals Management
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAteriaGameStore } from '../../core/model/game.store';
import {
  SEASONS, WEATHER_DATA, TIME_OF_DAY, MOON_PHASES, FESTIVALS, DAILY_BONUSES,
  getSeason, getTimeOfDay, getMoonPhase, getActiveFestivals, getDailyBonus, getRandomWeather,
  type Season, type Weather, type TimeOfDay, type MoonPhase, type Festival
} from '../data/calendar.data';

// ============================================
// TYPES
// ============================================

export interface GameTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface CalendarStats {
  daysPlayed: number;
  festivalsAttended: number;
  seasonsExperienced: number;
  weatherEventsWitnessed: number;
}

// ============================================
// STORE
// ============================================

export const useAteriaCalendarStore = defineStore('ateria-calendar', () => {
  const gameStore = useAteriaGameStore();

  // Time scale: 1 real minute = 1 game hour (adjustable)
  const TIME_SCALE = 60; // 1 real minute = 60 game minutes = 1 game hour

  // ============================================
  // STATE
  // ============================================

  const gameTime = ref<GameTime>({
    year: 1,
    month: 3, // Start in spring (March)
    day: 1,
    hour: 8,
    minute: 0,
  });

  const currentWeather = ref<Weather>('clear');
  const weatherDuration = ref<number>(24); // hours remaining
  const weatherChangeTime = ref<number>(Date.now());

  const stats = ref<CalendarStats>({
    daysPlayed: 0,
    festivalsAttended: 0,
    seasonsExperienced: 1,
    weatherEventsWitnessed: 0,
  });

  const lastProcessedRealTime = ref<number>(Date.now());
  const isPaused = ref<boolean>(false);

  // ============================================
  // COMPUTED
  // ============================================

  const currentSeason = computed((): Season => {
    return getSeason(gameTime.value.month);
  });

  const seasonData = computed(() => {
    return SEASONS[currentSeason.value];
  });

  const currentTimeOfDay = computed((): TimeOfDay => {
    return getTimeOfDay(gameTime.value.hour);
  });

  const timeOfDayData = computed(() => {
    return TIME_OF_DAY[currentTimeOfDay.value];
  });

  const dayOfYear = computed(() => {
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let days = gameTime.value.day;
    for (let i = 0; i < gameTime.value.month - 1; i++) {
      days += daysPerMonth[i];
    }
    return days;
  });

  const dayOfSeason = computed(() => {
    // Each season has 90 days (simplified)
    const seasonStartMonth = { spring: 3, summer: 6, autumn: 9, winter: 12 };
    const startMonth = seasonStartMonth[currentSeason.value];
    let days = gameTime.value.day;
    
    if (gameTime.value.month > startMonth) {
      // Add days from previous months in season
      const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      for (let m = startMonth; m < gameTime.value.month; m++) {
        days += daysPerMonth[(m - 1) % 12];
      }
    }
    
    return Math.min(90, days);
  });

  const currentMoonPhase = computed((): MoonPhase => {
    return getMoonPhase(dayOfYear.value);
  });

  const moonPhaseData = computed(() => {
    return MOON_PHASES[currentMoonPhase.value];
  });

  const weatherData = computed(() => {
    return WEATHER_DATA[currentWeather.value];
  });

  const activeFestivals = computed((): Festival[] => {
    return getActiveFestivals(currentSeason.value, dayOfSeason.value);
  });

  const dailyBonus = computed(() => {
    // Use real-world day of week for daily bonuses
    const realDayOfWeek = new Date().getDay();
    return getDailyBonus(realDayOfWeek);
  });

  const formattedTime = computed(() => {
    const h = gameTime.value.hour.toString().padStart(2, '0');
    const m = gameTime.value.minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  const formattedDate = computed(() => {
    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    return `${gameTime.value.day} ${monthNames[gameTime.value.month - 1]}, Rok ${gameTime.value.year}`;
  });

  // All active bonuses from calendar
  const allBonuses = computed(() => {
    const bonuses: Record<string, number> = {};

    // Season bonuses
    for (const bonus of seasonData.value.bonuses) {
      bonuses[bonus.stat] = (bonuses[bonus.stat] || 0) + bonus.value;
    }

    // Weather effects
    for (const effect of weatherData.value.effects) {
      bonuses[effect.stat] = (bonuses[effect.stat] || 0) + effect.value;
    }

    // Time of day bonuses
    for (const bonus of timeOfDayData.value.bonuses) {
      bonuses[bonus.stat] = (bonuses[bonus.stat] || 0) + bonus.value;
    }

    // Moon phase effects
    for (const effect of moonPhaseData.value.effects) {
      bonuses[effect.stat] = (bonuses[effect.stat] || 0) + effect.value;
    }

    // Festival bonuses
    for (const festival of activeFestivals.value) {
      for (const bonus of festival.bonuses) {
        bonuses[bonus.stat] = (bonuses[bonus.stat] || 0) + bonus.value;
      }
    }

    // Daily bonuses
    if (dailyBonus.value) {
      for (const bonus of dailyBonus.value.bonuses) {
        bonuses[bonus.stat] = (bonuses[bonus.stat] || 0) + bonus.value;
      }
    }

    return bonuses;
  });

  // ============================================
  // TIME PROGRESSION
  // ============================================

  function advanceTime(realMs: number) {
    if (isPaused.value) return;

    // Convert real time to game time
    const gameMinutes = Math.floor((realMs / 1000) * (TIME_SCALE / 60));
    
    let totalMinutes = gameTime.value.minute + gameMinutes;
    let hoursToAdd = Math.floor(totalMinutes / 60);
    gameTime.value.minute = totalMinutes % 60;

    if (hoursToAdd > 0) {
      advanceHours(hoursToAdd);
    }
  }

  function advanceHours(hours: number) {
    const oldSeason = currentSeason.value;
    const oldDay = gameTime.value.day;

    let totalHours = gameTime.value.hour + hours;
    let daysToAdd = Math.floor(totalHours / 24);
    gameTime.value.hour = totalHours % 24;

    if (daysToAdd > 0) {
      advanceDays(daysToAdd);
    }

    // Check weather
    weatherDuration.value -= hours;
    if (weatherDuration.value <= 0) {
      changeWeather();
    }

    // Check for new day
    if (gameTime.value.day !== oldDay) {
      onNewDay();
    }

    // Check for season change
    if (currentSeason.value !== oldSeason) {
      onSeasonChange(oldSeason, currentSeason.value);
    }
  }

  function advanceDays(days: number) {
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    for (let i = 0; i < days; i++) {
      gameTime.value.day++;
      stats.value.daysPlayed++;

      if (gameTime.value.day > daysPerMonth[gameTime.value.month - 1]) {
        gameTime.value.day = 1;
        gameTime.value.month++;

        if (gameTime.value.month > 12) {
          gameTime.value.month = 1;
          gameTime.value.year++;
          onNewYear();
        }
      }
    }
  }

  function changeWeather() {
    const newWeather = getRandomWeather(currentSeason.value);
    if (newWeather !== currentWeather.value) {
      currentWeather.value = newWeather;
      stats.value.weatherEventsWitnessed++;
      
      const weather = WEATHER_DATA[newWeather];
      gameStore.addNotification({
        type: 'info',
        title: 'Zmiana pogody',
        message: weather.name,
        icon: weather.icon,
        duration: 3000,
      });
    }

    const weatherInfo = WEATHER_DATA[currentWeather.value];
    weatherDuration.value = weatherInfo.duration.min + 
      Math.floor(Math.random() * (weatherInfo.duration.max - weatherInfo.duration.min));
    weatherChangeTime.value = Date.now();
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function onNewDay() {
    // Check for festivals
    const festivals = getActiveFestivals(currentSeason.value, dayOfSeason.value);
    for (const festival of festivals) {
      if (dayOfSeason.value === festival.dayOfSeason) {
        stats.value.festivalsAttended++;
        gameStore.addNotification({
          type: 'success',
          title: `Festiwal: ${festival.name}!`,
          message: festival.description,
          icon: festival.icon,
          duration: 5000,
        });
      }
    }
  }

  function onSeasonChange(oldSeason: Season, newSeason: Season) {
    stats.value.seasonsExperienced++;
    const season = SEASONS[newSeason];
    
    gameStore.addNotification({
      type: 'info',
      title: `Nadchodzi ${season.name}!`,
      message: season.description,
      icon: season.icon,
      duration: 5000,
    });
  }

  function onNewYear() {
    gameStore.addNotification({
      type: 'success',
      title: `Nowy Rok ${gameTime.value.year}!`,
      message: 'Niech nowy rok przyniesie przygody!',
      icon: 'mdi-firework',
      duration: 5000,
    });
  }

  // ============================================
  // PROCESS TICK
  // ============================================

  function processTick() {
    const now = Date.now();
    const elapsed = now - lastProcessedRealTime.value;
    lastProcessedRealTime.value = now;

    advanceTime(elapsed);
  }

  // ============================================
  // UTILITY
  // ============================================

  function getBonus(stat: string): number {
    return allBonuses.value[stat] || 0;
  }

  function setTime(hour: number, minute: number = 0) {
    gameTime.value.hour = Math.max(0, Math.min(23, hour));
    gameTime.value.minute = Math.max(0, Math.min(59, minute));
  }

  function setDate(year: number, month: number, day: number) {
    gameTime.value.year = Math.max(1, year);
    gameTime.value.month = Math.max(1, Math.min(12, month));
    gameTime.value.day = Math.max(1, Math.min(31, day));
  }

  function togglePause() {
    isPaused.value = !isPaused.value;
  }

  // ============================================
  // SAVE/LOAD
  // ============================================

  function resetCalendar() {
    gameTime.value = { year: 1, month: 3, day: 1, hour: 8, minute: 0 };
    currentWeather.value = 'clear';
    weatherDuration.value = 24;
    weatherChangeTime.value = Date.now();
    stats.value = { daysPlayed: 0, festivalsAttended: 0, seasonsExperienced: 1, weatherEventsWitnessed: 0 };
    lastProcessedRealTime.value = Date.now();
    isPaused.value = false;
  }

  return {
    // State
    gameTime, currentWeather, weatherDuration, weatherChangeTime,
    stats, lastProcessedRealTime, isPaused,

    // Computed
    currentSeason, seasonData, currentTimeOfDay, timeOfDayData,
    dayOfYear, dayOfSeason, currentMoonPhase, moonPhaseData,
    weatherData, activeFestivals, dailyBonus,
    formattedTime, formattedDate, allBonuses,

    // Actions
    advanceTime, advanceHours, advanceDays, changeWeather,
    processTick, getBonus, setTime, setDate, togglePause,
    resetCalendar,
  };
}, {
  persist: {
    key: 'ateria-calendar',
  },
});
