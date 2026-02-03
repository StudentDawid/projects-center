const projects = [
  {
    id: 'stc-40k',
    title: 'STC Warhammer 40,000',
    description:
      'Strona największego w Polsce turnieju drużynowego Warhammer 40,000. Profesjonalna platforma informacyjna dla setek graczy, integrująca wyniki i regulaminy.',
    category: 'E-Sport / Tabletop',
    filterType: 'finished',
    icon: 'mdi-trophy-variant',
    color: '#ED2630',
    image: '/projects-center/images/stc40k.png',
    link: 'https://stc40k.com/',
    tags: ['Web Design', 'Community', 'Tournament'],
    status: 'active',
    featured: true,
    visible: true,
  },
  {
    id: 'yarn-chaos',
    title: 'Włóczkowy Chaos',
    description:
      'Wkręcaj się w wir kolorowych nici! Relaksująca gra typu clicker, w której zarządzasz chaosem włóczek i tworzysz niesamowite sploty.',
    category: 'Gra IDLE',
    filterType: 'game',
    icon: 'mdi-zodiac-cancer',
    color: '#ff9ed2',
    link: '/projects-center/yarn-chaos/',
    tags: ['React 19', 'Vite', 'Idle Game'],
    status: 'development',
    featured: true,
    visible: true,
  },
  {
    id: 'ateria-idle',
    title: 'Echa Aterii',
    description:
      'Gra typu Idle RPG w klimacie fantasy. Wybierz ścieżkę Wojownika, Naukowca lub Handlarza i odkryj złożony świat Aterii.',
    category: 'Gra IDLE',
    filterType: 'game',
    icon: 'mdi-sword-cross',
    color: '#9c27b0',
    link: '/projects-center/ateria-idle/',
    tags: ['Vue.js', 'Pinia', 'Idle Game', 'RPG'],
    status: 'development',
    featured: true,
    visible: true,
  },
  {
    id: 'rpg-map-generator',
    title: 'Generator Map RPG',
    description:
      'Narzędzie do generowania proceduralnych map światów fantasy. Twórz kontynenty, góry, rzeki i miasta dla swoich kampanii.',
    category: 'Narzędzie RPG',
    filterType: 'rpg',
    icon: 'mdi-map-legend',
    color: '#4caf50',
    link: '/projects-center/rpg-tools/map-generator/',
    tags: ['Vue.js', 'Canvas', 'Procedural Generation'],
    status: 'development',
    featured: false,
    visible: true,
  },
  {
    id: 'rpg-world-generator',
    title: 'Generator Świata RPG',
    description:
      'Twórz kompletne światy fantasy z kosmologią, bogami, mitami i płaszczyznami. Idealne narzędzie dla mistrzów gry.',
    category: 'Narzędzie RPG',
    filterType: 'rpg',
    icon: 'mdi-earth',
    color: '#667eea',
    link: '/projects-center/rpg-tools/world-generator/',
    tags: ['Vue.js', 'World Building', 'RPG Tools'],
    status: 'development',
    featured: false,
    visible: true,
  },
  {
    id: 'fabula-ultima-card-generator',
    title: 'Generator Kart Fabula Ultima',
    description:
      'Twórz i zarządzaj kartami do systemu Fabula Ultima. Generuj karty broni, zbroi, umiejętności i zaklęć.',
    category: 'Narzędzie RPG',
    filterType: 'rpg',
    icon: 'mdi-cards',
    color: '#296a6a',
    link: '/projects-center/rpg-tools/fabula-ultima-card-generator/',
    tags: ['Vue.js', 'Card Creator', 'Fabula Ultima'],
    status: 'development',
    featured: false,
    visible: true,
  },
  {
    id: 'mtg-card-generator',
    title: 'Generator Kart RPG',
    description:
      'Twórz własne karty przedmiotów, czarów i umiejętności do sesji RPG. Drukuj zestawy na A4.',
    category: 'Narzędzie RPG',
    filterType: 'rpg',
    icon: 'mdi-cards-playing',
    color: '#f44336',
    link: '/projects-center/mtg-generator/',
    tags: ['Vue.js', 'Pinia', 'Print Tools'],
    status: 'active',
    featured: false,
    visible: true,
  },
];

function createProjectCard(project) {
  const card = document.createElement('a');
  card.href = project.link;
  card.className = 'project-card';
  card.dataset.type = project.filterType;

  const visualHTML = project.image
    ? `<div class="card-image" style="background-image: url('${project.image}');"></div>`
    : `<div class="card-image" style="display: flex; align-items: center; justify-content: center; background-color: ${project.color}15;">
         <i class="mdi ${project.icon}" style="font-size: 64px; color: ${project.color}"></i>
      </div>`;

  card.innerHTML = `
    <div class="card-visual">
      ${visualHTML}
    </div>
    <div class="card-body">
      <h3 class="card-title">${project.title}</h3>
      <p class="card-description">${project.description}</p>
      <div class="card-link">
        Zobacz projekt <i class="mdi mdi-arrow-top-right"></i>
      </div>
    </div>
  `;

  return card;
}

function renderProjects(filter = 'all') {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const filteredProjects = projects
    .filter((p) => p.visible !== false)
    .filter((p) => (filter === 'all' ? true : p.filterType === filter));

  filteredProjects.forEach((project) => {
    grid.appendChild(createProjectCard(project));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  renderProjects();

  // Filter logic
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update UI
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter projects
      const filter = btn.dataset.filter;
      renderProjects(filter);
    });
  });
});
