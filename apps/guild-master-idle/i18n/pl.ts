export default {
  // Sidebar
  sidebarTitle: 'Zarządzanie Gildią',
  hideSidebar: 'Ukryj panel',
  showLeftSidebar: 'Pokaż lewy panel',
  showRightSidebar: 'Pokaż prawy panel',

  // Navigation
  nav: {
    grandHall: 'Wielka Sala',
    tavern: 'Tawerna',
    quests: 'Misje',
    research: 'Badania',
    market: 'Rynek',
    profile: 'Profil',
  },

  // Resources
  resources: {
    title: 'Status Zasobów',
    gold: 'Złoto',
    wood: 'Drewno',
    stone: 'Kamień',
    mana: 'Mana',
    speedUp: 'PRZYSPIESZ CZAS (3x)',
  },

  // Production
  production: {
    title: 'Produkcja Kampusu',
    recruitment: 'Rekrutacja',
    recruitNovices: 'Rekrutuj Nowicjuszy',
    recruitDescription:
      'Nowicjusze zwiększają szybkość badań i mogą być szkoleni na praktykantów.',
    currentBonus: 'Aktualny Bonus: +12% Szybkość Badań',
    trainGuards: 'Szkol Strażników',
    costGoldWood: 'Koszt: 200 Złota, 50 Drewna',
    train: 'SZKOL',
    infrastructure: 'Infrastruktura',
    expandDormitories: 'Rozbuduj Dormitoria',
    dormitoriesDescription: 'Zwiększa maks. Nowicjuszy o +10',
    upgrade: 'ULEPSZENIE',
    arcaneLibrary: 'Tajemna Biblioteka',
    arcaneLibraryDescription: 'Odblokowuje wyższy poziom projektów badawczych',
    build: 'BUDUJ',
  },

  // Quests
  quests: {
    activeQuests: 'Aktywne Misje',
    availableContracts: 'Dostępne Kontrakty',
    clearDarkForest: 'Oczyść Mroczny Las',
    merchantEscort: 'Eskorta Kupca',
    scoutMountainPass: 'Zwiad Przełęczy Górskiej',
    reqGuards: 'Wym. {count} Strażników',
  },

  // Guild Log
  log: {
    title: 'Dziennik Gildii',
    welcomeBack: '<strong class="text-grey-darken-4">System:</strong> Witaj ponownie, Wielki Mistrzu.',
    novicesCompleted:
      'Szkolenie <span class="text-blue-darken-1 font-weight-bold">{count} Nowicjuszy</span> zakończone.',
    vaultCapacity:
      'Skarbiec osiągnął <strong>{percent}% pojemności</strong>. Rozważ ulepszenie.',
    questReward:
      'Misja "{quest}" zakończona. Nagroda: <span class="text-amber-darken-2 font-weight-bold">{reward} Złota</span>.',
  },

  // Profile
  profile: {
    title: 'Profil',
    language: 'Język',
    languageDescription: 'Wybierz preferowany język',
    english: 'English',
    polish: 'Polski',
  },
} as const;
