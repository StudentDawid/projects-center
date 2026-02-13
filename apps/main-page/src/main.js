// Projects To Do - Tracking
const todoProjects = [
  {
    id: 'rpg-map-generator-todo',
    title: 'Generator Map RPG',
    description: 'Proceduralne generowanie map fantasy',
    icon: 'mdi-map-legend',
    color: '#4caf50',
    progress: 55,
    milestones: [
      { name: 'Basic Generation', progress: 100, status: 'completed', icon: 'mdi-check-circle' },
      { name: 'Natural Features', progress: 70, status: 'in-progress', icon: 'mdi-progress-clock' },
      { name: 'Terrain Variety', progress: 55, status: 'in-progress', icon: 'mdi-progress-clock' },
      { name: 'Cities & Towns', progress: 40, status: 'in-progress', icon: 'mdi-progress-clock' },
      { name: 'POI & Landmarks', progress: 30, status: 'in-progress', icon: 'mdi-progress-clock' },
      { name: 'Export & Features', progress: 20, status: 'in-progress', icon: 'mdi-progress-clock' },
      { name: 'Performance & Testing', progress: 0, status: 'pending', icon: 'mdi-clock-outline' },
    ],
  },
  {
    id: 'rpg-world-generator-todo',
    title: 'Generator Świata RPG',
    description: 'Tworzenie kompletnych światów fantasy',
    icon: 'mdi-earth',
    color: '#667eea',
    progress: 35,
    milestones: [
      { name: 'World Core System', progress: 100, status: 'completed', icon: 'mdi-check-circle' },
      { name: 'Deities & Pantheons', progress: 60, status: 'in-progress', icon: 'mdi-progress-clock' },
      { name: 'Cosmology & Planes', progress: 20, status: 'in-progress', icon: 'mdi-progress-clock' },
      { name: 'Factions & Conflicts', progress: 15, status: 'in-progress', icon: 'mdi-progress-clock' },
      { name: 'History & Timeline', progress: 10, status: 'in-progress', icon: 'mdi-progress-clock' },
      { name: 'Magic Systems', progress: 5, status: 'in-progress', icon: 'mdi-progress-clock' },
      { name: 'Advanced Features', progress: 0, status: 'pending', icon: 'mdi-clock-outline' },
    ],
  },
];

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
    visible: false,
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
    id: 'guild-master-idle',
    title: 'Guild Master Idle',
    description:
      'Zarządzaj gildią bohaterów! Rekrutuj wojowników, magów i łowców, wysyłaj ich na epickie misje i rozwijaj swoje imperium w tej grze idle.',
    category: 'Gra IDLE',
    filterType: 'game',
    icon: 'mdi-shield-sword',
    color: '#7C4DFF',
    link: '/projects-center/guild-master-idle/',
    tags: ['Vue 3', 'Vuetify', 'Nuxt', 'Idle Game'],
    status: 'development',
    featured: false,
    visible: true,
  },
];

// Wersja 1: Kompaktowe karty (jak obecne projekty)
function createTodoProjectCardV1(project) {
  const card = document.createElement('div');
  card.className = 'todo-card-v1';

  const cardId = 'todo-v1-' + project.id;
  const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = project.milestones.length;

  card.innerHTML = `
    <div class="todo-card-header">
      <div class="todo-card-icon" style="background-color: ${project.color}15;">
        <i class="mdi ${project.icon}" style="color: ${project.color}"></i>
      </div>
      <div class="todo-card-title-section">
        <h3 class="todo-card-title">${project.title}</h3>
        <p class="todo-card-description">${project.description}</p>
      </div>
      <button class="todo-expand-btn-v1" onclick="toggleTodoExpand('${cardId}')">
        <i class="mdi mdi-chevron-down"></i>
      </button>
    </div>
    
    <div class="todo-card-progress">
      <div class="progress-info">
        <span class="progress-label">Postęp</span>
        <span class="progress-percent">${project.progress}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${project.progress}%; background-color: ${project.color}"></div>
      </div>
      <div class="milestones-info">
        <span class="milestones-text">${completedMilestones} z ${totalMilestones} etapów ukończonych</span>
      </div>
    </div>
    
    <div class="todo-card-milestones">
      ${project.milestones.map(m => `
        <div class="milestone-dot" style="background-color: ${m.status === 'completed' ? project.color : m.status === 'in-progress' ? project.color + '80' : '#e5e7eb'}" 
             title="${m.name} - ${m.progress}%">
        </div>
      `).join('')}
    </div>
    
    <div class="todo-card-v1-content" id="${cardId}">
      <div class="milestones-list-v1">
        ${project.milestones.map((m, idx) => `
          <div class="milestone-item-v1">
            <div class="milestone-header-v1">
              <div class="milestone-status-icon-v1">
                <i class="mdi ${m.icon}" style="color: ${m.status === 'completed' ? project.color : m.status === 'in-progress' ? project.color + 'cc' : '#9ca3af'}"></i>
              </div>
              <div class="milestone-name-v1">${m.name}</div>
              <div class="milestone-progress-text-v1">${m.progress}%</div>
            </div>
            <div class="milestone-bar-v1">
              <div class="milestone-fill-v1" style="width: ${m.progress}%; background-color: ${project.color}"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return card;
}

// Wersja 2: Rozbudowana z rozwijalnymi milestonikami
function renderTodoProjects() {
  const gridV1 = document.getElementById('todo-projects-grid-v1');

  if (gridV1) {
    gridV1.innerHTML = '';
    todoProjects.forEach((project) => {
      gridV1.appendChild(createTodoProjectCardV1(project));
    });
  }
}

function toggleTodoExpand(cardId) {
  const content = document.getElementById(cardId);
  if (!content) return;
  
  // Znajdź przycisk - obsługuje zarówno V1 jak i V2
  const isV1 = cardId.startsWith('todo-v1-');
  const card = isV1 
    ? content.closest('.todo-card-v1')
    : content.closest('.todo-card-v2');
  
  const btnSelector = isV1 ? '.todo-expand-btn-v1' : '.todo-expand-btn';
  const btn = card ? card.querySelector(btnSelector) : null;
  
  if (!btn) return;
  
  if (content.classList.contains('expanded')) {
    content.classList.remove('expanded');
    btn.classList.remove('rotated');
  } else {
    content.classList.add('expanded');
    btn.classList.add('rotated');
  }
}

function switchTodoVersion(version) {
  const gridV1 = document.getElementById('todo-projects-grid-v1');
  const gridV2 = document.getElementById('todo-projects-grid-v2');
  const divider = document.querySelector('.todo-version-divider');
  const btns = document.querySelectorAll('.version-btn');

  btns.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  if (version === 1) {
    gridV1.style.display = 'grid';
    gridV2.style.display = 'none';
    if (divider) divider.style.display = 'none';
  } else if (version === 2) {
    gridV1.style.display = 'none';
    gridV2.style.display = 'grid';
    if (divider) divider.style.display = 'none';
  } else {
    // Obie wersje widoczne
    gridV1.style.display = 'grid';
    gridV2.style.display = 'grid';
    if (divider) divider.style.display = 'flex';
  }
}

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

  // Render Todo Projects
  renderTodoProjects();
});

// Eksportuj funkcje do global scope dla onclick handlers
window.toggleTodoExpand = toggleTodoExpand;
