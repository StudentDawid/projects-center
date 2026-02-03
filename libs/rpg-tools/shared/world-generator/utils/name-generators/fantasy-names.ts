/**
 * Generator nazw fantasy dla bogów, miejsc, postaci
 */

/**
 * Losuje liczbę całkowitą z zakresu [min, max] (włącznie)
 * Używa Math.random() który jest nadpisywany przez seed w useWorldGenerator
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sylaby dla nazw fantasy
 */
const SYLLABLES = {
  start: [
    'Ae',
    'Al',
    'An',
    'Ar',
    'As',
    'At',
    'Ba',
    'Be',
    'Bi',
    'Bo',
    'Br',
    'Ca',
    'Ce',
    'Ci',
    'Co',
    'Cr',
    'Da',
    'De',
    'Di',
    'Do',
    'Dr',
    'Du',
    'Ea',
    'El',
    'En',
    'Er',
    'Es',
    'Et',
    'Fa',
    'Fe',
    'Fi',
    'Fo',
    'Ga',
    'Ge',
    'Gi',
    'Go',
    'Gr',
    'Gu',
    'Ha',
    'He',
    'Hi',
    'Ho',
    'Hu',
    'Ia',
    'Il',
    'In',
    'Ir',
    'Is',
    'Ja',
    'Je',
    'Ji',
    'Jo',
    'Ka',
    'Ke',
    'Ki',
    'Ko',
    'Kr',
    'La',
    'Le',
    'Li',
    'Lo',
    'Lu',
    'Ma',
    'Me',
    'Mi',
    'Mo',
    'Mu',
    'Na',
    'Ne',
    'Ni',
    'No',
    'Nu',
    'Oa',
    'Ol',
    'On',
    'Or',
    'Os',
    'Pa',
    'Pe',
    'Pi',
    'Po',
    'Pr',
    'Qu',
    'Ra',
    'Re',
    'Ri',
    'Ro',
    'Ru',
    'Sa',
    'Se',
    'Si',
    'So',
    'Su',
    'Ta',
    'Te',
    'Ti',
    'To',
    'Tr',
    'Tu',
    'Ua',
    'Ul',
    'Un',
    'Ur',
    'Us',
    'Va',
    'Ve',
    'Vi',
    'Vo',
    'Vu',
    'Wa',
    'We',
    'Wi',
    'Wo',
    'Xa',
    'Xe',
    'Xi',
    'Ya',
    'Ye',
    'Yi',
    'Yo',
    'Za',
    'Ze',
    'Zi',
    'Zo',
    'Zu',
  ],
  middle: [
    'al', 'an', 'ar', 'as', 'at', 'el', 'en', 'er', 'es', 'et',
    'il', 'in', 'ir', 'is', 'it', 'ol', 'on', 'or', 'os', 'ot',
    'ul', 'un', 'ur', 'us', 'ut', 'am', 'em', 'im', 'om', 'um',
    'ad', 'ed', 'id', 'od', 'ud', 'ag', 'eg', 'ig', 'og', 'ug',
    'ak', 'ek', 'ik', 'ok', 'uk', 'ab', 'eb', 'ib', 'ob', 'ub',
    'ac', 'ec', 'ic', 'oc', 'uc', 'af', 'ef', 'if', 'of', 'uf',
    'ah', 'eh', 'ih', 'oh', 'uh', 'aj', 'ej', 'ij', 'oj', 'uj',
    'al', 'el', 'il', 'ol', 'ul', 'am', 'em', 'im', 'om', 'um',
    'ap', 'ep', 'ip', 'op', 'up', 'aq', 'eq', 'iq', 'oq', 'uq',
    'as', 'es', 'is', 'os', 'us', 'at', 'et', 'it', 'ot', 'ut',
    'av', 'ev', 'iv', 'ov', 'uv', 'aw', 'ew', 'iw', 'ow', 'uw',
    'ax', 'ex', 'ix', 'ox', 'ux', 'ay', 'ey', 'iy', 'oy', 'uy',
    'az', 'ez', 'iz', 'oz', 'uz', 'ach', 'ech', 'ich', 'och', 'uch',
    'ath', 'eth', 'ith', 'oth', 'uth', 'ald', 'eld', 'ild', 'old', 'uld',
  ],
  end: [
    'a',
    'ae',
    'al',
    'an',
    'ar',
    'as',
    'at',
    'e',
    'el',
    'en',
    'er',
    'es',
    'et',
    'ia',
    'ian',
    'iel',
    'ien',
    'ier',
    'ies',
    'iet',
    'il',
    'in',
    'ir',
    'is',
    'it',
    'o',
    'ol',
    'on',
    'or',
    'os',
    'ot',
    'u',
    'ul',
    'un',
    'ur',
    'us',
    'ut',
    'us',
    'um',
    'ix',
    'ax',
    'ex',
    'ox',
    'yx',
  ],
};

/**
 * Generuje losową nazwę fantasy
 */
export function generateFantasyName(
  minSyllables: number = 2,
  maxSyllables: number = 4
): string {
  const syllableCount = randomInt(minSyllables, maxSyllables);
  let name = '';

  // Pierwsza sylaba (z start)
  name += SYLLABLES.start[randomInt(0, SYLLABLES.start.length - 1)]!;

  // Środkowe sylaby
  for (let i = 1; i < syllableCount - 1; i++) {
    name += SYLLABLES.middle[randomInt(0, SYLLABLES.middle.length - 1)]!;
  }

  // Ostatnia sylaba (z end)
  if (syllableCount > 1) {
    name += SYLLABLES.end[randomInt(0, SYLLABLES.end.length - 1)]!;
  }

  // Kapitalizuj pierwszą literę
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Generuje nazwę boga (bardziej majestatyczna)
 */
export function generateGodName(): string {
  const patterns = [
    () => generateFantasyName(2, 3) + 'ius',
    () => generateFantasyName(2, 3) + 'on',
    () => generateFantasyName(2, 3) + 'ar',
    () => generateFantasyName(2, 3) + 'os',
    () => generateFantasyName(2, 3) + 'en',
    () => generateFantasyName(3, 4),
    () => 'The ' + generateFantasyName(2, 3),
  ];

  return patterns[randomInt(0, patterns.length - 1)]!();
}

/**
 * Generuje tytuł boga
 */
export function generateGodTitle(domain: string): string {
  const titles: Record<string, string[]> = {
    war: [
      'Wojownik',
      'Niszczyciel',
      'Pan Wojny',
      'Mistrz Bitwy',
      'Władca Konfliktów',
    ],
    magic: [
      'Czarodziej',
      'Mistrz Magii',
      'Władca Tajemnic',
      'Twórca Czarów',
      'Pan Arkanów',
    ],
    nature: [
      'Opiekun Natury',
      'Władca Lasów',
      'Pan Zwierząt',
      'Stróż Ziemi',
      'Duch Przyrody',
    ],
    death: [
      'Żniwiarz',
      'Władca Śmierci',
      'Pan Umarlaków',
      'Przewodnik Dusz',
      'Król Nekropolii',
    ],
    life: [
      'Dawca Życia',
      'Twórca',
      'Opiekun Narodzin',
      'Władca Wzrostu',
      'Pan Życia',
    ],
    light: [
      'Światło', 'Władca Światła', 'Pan Dnia', 'Gwiazda', 'Płomień',
      'Król Światła', 'Dawca Blasku', 'Pan Promieni', 'Władca Jutrzenki', 'Gwiazda Poranna',
      'Świetlisty', 'Władca Latarni', 'Pan Oświecenia', 'Dawca Nadziei', 'Król Blasku',
    ],
    darkness: [
      'Cień', 'Władca Ciemności', 'Pan Nocy', 'Mrok', 'Pustka',
      'Król Ciemności', 'Władca Mroku', 'Pan Zmierzchu', 'Duch Nocy', 'Władca Cieni',
      'Ciemność', 'Pan Pustki', 'Władca Otchłani', 'Król Mroku', 'Duch Ciemności',
    ],
    chaos: [
      'Chaos', 'Władca Chaosu', 'Pan Nieporządku', 'Burzyciel', 'Zniszczyciel',
      'Król Chaosu', 'Władca Burzy', 'Pan Zniszczenia', 'Burzyciel Porządku', 'Władca Nieporządku',
      'Chaos', 'Pan Zmiany', 'Władca Przemian', 'Burzyciel Świata', 'Król Zniszczenia',
    ],
    order: [
      'Porządek', 'Władca Prawa', 'Pan Harmonii', 'Twórca', 'Stabilność',
      'Król Porządku', 'Władca Praw', 'Pan Równowagi', 'Twórca Struktury', 'Władca Stabilności',
      'Porządek', 'Pan Reguł', 'Władca Harmonii', 'Twórca Systemu', 'Król Prawa',
    ],
    knowledge: [
      'Mędrzec', 'Władca Wiedzy', 'Pan Bibliotek', 'Nauczyciel', 'Filozof',
      'Król Wiedzy', 'Władca Mądrości', 'Pan Ksiąg', 'Nauczyciel Prawdy', 'Filozof Niebios',
      'Mędrzec', 'Władca Nauki', 'Pan Uczenia', 'Nauczyciel Mądrości', 'Król Filozofów',
    ],
    wisdom: [
      'Mądrość', 'Władca Mądrości', 'Pan Rozumu', 'Przewodnik', 'Doradca',
      'Król Mądrości', 'Władca Rozumu', 'Pan Przewodnictwa', 'Doradca Bogów', 'Mistrz Mądrości',
      'Mądrość', 'Władca Rady', 'Pan Przewodnictwa', 'Doradca Królów', 'Król Rozumu',
    ],
  };

  // Domyślne tytuły dla domen, które nie mają specjalnych tytułów (15 opcji)
  const defaultTitles = [
    'Władca', 'Pan', 'Mistrz', 'Opiekun', 'Król', 'Dawca', 'Twórca',
    'Władca', 'Pan', 'Mistrz', 'Opiekun', 'Król', 'Dawca', 'Twórca', 'Władca',
  ];
  const domainTitles = titles[domain] || defaultTitles;
  return domainTitles[randomInt(0, domainTitles.length - 1)]!;
}

/**
 * Generuje nazwę panteonu - 18 wzorców
 */
export function generatePantheonName(): string {
  const patterns = [
    () => generateFantasyName(2, 3) + 'ian Pantheon',
    () => 'The ' + generateFantasyName(2, 3) + ' Gods',
    () => generateFantasyName(2, 3) + 'ian Circle',
    () => 'The ' + generateFantasyName(2, 3) + ' Assembly',
    () => generateFantasyName(2, 3) + 'ian Council',
    () => 'The ' + generateFantasyName(2, 3) + ' Host',
    () => generateFantasyName(2, 3) + 'ian Order',
    () => 'The ' + generateFantasyName(2, 3) + ' Pantheon',
    () => generateFantasyName(2, 3) + 'ian Gathering',
    () => 'The ' + generateFantasyName(2, 3) + ' Collective',
    () => generateFantasyName(2, 3) + 'ian Brotherhood',
    () => 'The ' + generateFantasyName(2, 3) + ' Fellowship',
    () => generateFantasyName(2, 3) + 'ian Covenant',
    () => 'The ' + generateFantasyName(2, 3) + ' Alliance',
    () => generateFantasyName(2, 3) + 'ian Union',
    () => 'The ' + generateFantasyName(2, 3) + ' Coalition',
    () => generateFantasyName(2, 3) + 'ian Conclave',
    () => 'The ' + generateFantasyName(2, 3) + ' Tribunal',
  ];

  return patterns[randomInt(0, patterns.length - 1)]!();
}
