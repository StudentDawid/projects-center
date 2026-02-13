export default {
  // Sidebar
  sidebarTitle: 'Guild Management',
  hideSidebar: 'Hide sidebar',
  showLeftSidebar: 'Show left sidebar',
  showRightSidebar: 'Show right sidebar',

  // Navigation
  nav: {
    grandHall: 'Grand Hall',
    tavern: 'Tavern',
    quests: 'Quests',
    research: 'Research',
    market: 'Market',
    profile: 'Profile',
  },

  // Resources
  resources: {
    title: 'Resources Status',
    gold: 'Gold',
    wood: 'Wood',
    stone: 'Stone',
    mana: 'Mana',
    speedUp: 'SPEED UP TIME (3x)',
  },

  // Production
  production: {
    title: 'Campus Production',
    recruitment: 'Recruitment',
    recruitNovices: 'Recruit Novices',
    recruitDescription:
      'Novices increase your research speed and can be trained into apprentices.',
    currentBonus: 'Current Bonus: +12% Research Speed',
    trainGuards: 'Train Guards',
    costGoldWood: 'Cost: 200 Gold, 50 Wood',
    train: 'TRAIN',
    infrastructure: 'Infrastructure',
    expandDormitories: 'Expand Dormitories',
    dormitoriesDescription: 'Increases max Novices by +10',
    upgrade: 'UPGRADE',
    arcaneLibrary: 'Arcane Library',
    arcaneLibraryDescription: 'Unlocks higher tier research projects',
    build: 'BUILD',
  },

  // Quests
  quests: {
    activeQuests: 'Active Quests',
    availableContracts: 'Available Contracts',
    clearDarkForest: 'Clear Dark Forest',
    merchantEscort: 'Merchant Escort',
    scoutMountainPass: 'Scout Mountain Pass',
    reqGuards: 'Req. {count} Guards',
  },

  // Guild Log
  log: {
    title: 'Guild Log',
    welcomeBack: '<strong class="text-grey-darken-4">System:</strong> Welcome back, Grandmaster.',
    novicesCompleted:
      'Training of <span class="text-blue-darken-1 font-weight-bold">{count} Novices</span> completed.',
    vaultCapacity:
      'Vault reached <strong>{percent}% capacity</strong>. Consider upgrading.',
    questReward:
      'Quest "{quest}" finished. Reward: <span class="text-amber-darken-2 font-weight-bold">{reward} Gold</span>.',
  },

  // Profile
  profile: {
    title: 'Profile',
    language: 'Language',
    languageDescription: 'Select your preferred language',
    english: 'English',
    polish: 'Polski',
  },
} as const;
