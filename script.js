const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const appGrid = document.querySelector("#app-grid");
const appStatus = document.querySelector("#app-status");
const appLoadError = document.querySelector("#app-load-error");
const quizForm = document.querySelector("#discovery-quiz");
const quizSubmit = document.querySelector("#quiz-submit");
const quizCatalogStatus = document.querySelector("#quiz-catalog-status");
const quizResults = document.querySelector("#quiz-results");
const catalogUrl = "https://modernselfhost.github.io/openappstore/";
let appCatalog = [];

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement && window.matchMedia("(max-width: 640px)").matches) {
      menuToggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    }
  });
}

function isCatalogApp(app) {
  return ["id", "name", "version", "category", "description", "runtime", "icon", "manifest"]
    .every((field) => typeof app[field] === "string" && app[field].length > 0);
}

function createAppCard(app) {
  const card = document.createElement("article");
  card.className = "app-card";

  const icon = document.createElement("img");
  icon.className = "app-logo";
  icon.src = new URL(app.icon, catalogUrl).href;
  icon.alt = `${app.name} logo`;
  icon.width = 44;
  icon.height = 44;
  icon.loading = "lazy";
  icon.decoding = "async";
  card.append(icon);

  const category = document.createElement("span");
  category.className = "app-type";
  category.textContent = app.category;
  card.append(category);

  const name = document.createElement("strong");
  name.textContent = app.name;
  card.append(name);

  const description = document.createElement("span");
  description.className = "app-description";
  description.textContent = app.description;
  card.append(description);

  const meta = document.createElement("div");
  meta.className = "app-meta";
  const version = document.createElement("span");
  version.textContent = `Version ${app.version}`;
  const runtime = document.createElement("span");
  runtime.textContent = app.runtime;
  meta.append(version, runtime);
  card.append(meta);

  return card;
}

const goalRecommendations = {
  privacy: ["vaultwarden", "nextcloud", "immich", "syncthing"],
  subscriptions: ["vaultwarden", "jellyfin", "immich", "nextcloud", "uptime-kuma"],
  media: ["jellyfin", "immich"],
  organize: ["immich", "nextcloud", "paperless-ngx", "syncthing"],
  network: ["adguard-home", "pihole"],
  home: ["haos"],
  learn: ["portainer", "uptime-kuma", "nginx-proxy-manager", "vaultwarden"],
  monitor: ["uptime-kuma", "grafana"],
};

const interestRecommendations = {
  media: ["immich", "jellyfin"],
  files: ["nextcloud", "paperless-ngx", "syncthing"],
  network: ["adguard-home", "pihole", "nginx-proxy-manager", "traefik"],
  security: ["vaultwarden"],
  home: ["haos"],
  monitoring: ["uptime-kuma", "grafana"],
  dev: ["portainer", "gitea"],
};

const beginnerStack = ["portainer", "vaultwarden", "uptime-kuma", "nginx-proxy-manager"];

function createQuizAppCard(app) {
  const card = document.createElement("article");
  card.className = "quiz-result-app";

  const image = document.createElement("img");
  image.className = "app-logo";
  image.src = new URL(app.icon, catalogUrl).href;
  image.alt = `${app.name} logo`;
  image.width = 44;
  image.height = 44;
  image.loading = "lazy";
  image.decoding = "async";
  card.append(image);

  const category = document.createElement("span");
  category.className = "app-type";
  category.textContent = app.category;
  card.append(category);

  const name = document.createElement("strong");
  name.textContent = app.name;
  card.append(name);

  const description = document.createElement("span");
  description.className = "app-description";
  description.textContent = app.description;
  card.append(description);

  const details = document.createElement("a");
  details.href = new URL(app.manifest, catalogUrl).href;
  details.target = "_blank";
  details.rel = "noopener noreferrer";
  details.textContent = "View setup details ↗";
  card.append(details);

  return card;
}

function addQuizResultGroup(container, title, apps) {
  if (!apps.length) return;

  const group = document.createElement("div");
  group.className = "quiz-result-group";
  const heading = document.createElement("h4");
  heading.textContent = title;
  group.append(heading);

  const cards = document.createElement("div");
  cards.className = "quiz-result-apps";
  cards.append(...apps.map(createQuizAppCard));
  group.append(cards);
  container.append(group);
}

function getHardwareGuidance(hardware) {
  const guidance = {
    pi: "For a Raspberry Pi or other low-power device, consider lighter apps like Vaultwarden, Pi-hole or AdGuard Home, Uptime Kuma, Syncthing, and Portainer. Immich and Home Assistant OS may need more resources.",
    nas: "A mini PC, NAS, or desktop can suit many apps. Check each app’s CPU, memory, storage, and architecture requirements before choosing.",
    vps: "A VPS can suit Vaultwarden, Uptime Kuma, Gitea, Portainer, Nginx Proxy Manager, and Traefik. Media and photo apps depend on storage and bandwidth.",
    unsure: "Still deciding on hardware? Check the CPU, memory, storage, and architecture requirements in each app’s setup details before choosing.",
  };
  return guidance[hardware];
}

function showQuizResults(formData) {
  const goal = formData.get("goal");
  const hardware = formData.get("hardware");
  const experience = formData.get("experience");
  const docker = formData.get("docker");
  const interests = formData.getAll("interests");
  const scores = new Map();

  for (const id of goalRecommendations[goal] ?? []) {
    scores.set(id, (scores.get(id) ?? 0) + 5);
  }
  for (const interest of interests) {
    for (const id of interestRecommendations[interest] ?? []) {
      scores.set(id, (scores.get(id) ?? 0) + 3);
    }
  }

  const wantsBeginnerPath = experience === "beginner" || docker === "no" || docker === "unsure";
  if (wantsBeginnerPath) {
    for (const id of beginnerStack) {
      scores.set(id, (scores.get(id) ?? 0) + 1);
    }
  }

  const appsById = new Map(appCatalog.map((app) => [app.id, app]));
  const matches = [...scores.entries()]
    .map(([id, score]) => ({ app: appsById.get(id), score }))
    .filter((match) => match.app)
    .sort((a, b) => b.score - a.score || a.app.name.localeCompare(b.app.name))
    .slice(0, 6)
    .map((match) => match.app);

  quizResults.replaceChildren();
  const title = document.createElement("h3");
  title.id = "quiz-result-title";
  title.textContent = "Your self-hosting shortlist";
  quizResults.append(title);

  const introduction = document.createElement("p");
  introduction.textContent = "These apps match your goals and interests. Start with one, review its setup guide, and take time to understand the requirements before installing.";
  quizResults.append(introduction);
  addQuizResultGroup(quizResults, "Good matches for you", matches);

  if (wantsBeginnerPath) {
    const starterGroup = document.createElement("div");
    starterGroup.className = "quiz-result-group";
    const starterTitle = document.createElement("h4");
    starterTitle.textContent = "A suggested first stack, in order";
    starterGroup.append(starterTitle);
    const starterDescription = document.createElement("p");
    starterDescription.className = "quiz-path-intro";
    starterDescription.textContent = "Start with one app at a time: Portainer, Vaultwarden, Uptime Kuma, then Nginx Proxy Manager.";
    starterGroup.append(starterDescription);
    const starterAppsInOrder = beginnerStack.map((id) => appsById.get(id)).filter(Boolean);
    const starterCards = document.createElement("div");
    starterCards.className = "quiz-result-apps";
    starterCards.append(...starterAppsInOrder.map(createQuizAppCard));
    starterGroup.append(starterCards);
    quizResults.append(starterGroup);
  }

  const hardwareNote = document.createElement("p");
  hardwareNote.className = "quiz-hardware-note";
  hardwareNote.textContent = getHardwareGuidance(hardware);
  quizResults.append(hardwareNote);

  const retake = document.createElement("button");
  retake.className = "quiz-retake";
  retake.type = "button";
  retake.textContent = "Change my answers";
  retake.addEventListener("click", () => {
    quizForm.reset();
    quizResults.hidden = true;
    quizForm.querySelector('input[name="goal"]').focus();
  });
  quizResults.append(retake);
  quizResults.hidden = false;
  quizResults.focus({ preventScroll: true });
  quizResults.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

if (quizForm && quizSubmit && quizCatalogStatus && quizResults) {
  quizResults.tabIndex = -1;
  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showQuizResults(new FormData(quizForm));
  });
}

async function loadAppCatalog() {
  if (!appGrid || !appStatus || !appLoadError) return;

  try {
    const response = await fetch(catalogUrl);
    if (!response.ok) {
      throw new Error(`Catalog request failed with status ${response.status}`);
    }

    const catalog = await response.json();
    if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.apps) || !catalog.apps.every(isCatalogApp)) {
      throw new Error("OpenAppStore returned an invalid catalog.");
    }

    appCatalog = catalog.apps;
    appGrid.replaceChildren(...catalog.apps.map(createAppCard));
    appStatus.textContent = `${catalog.apps.length} apps from OpenAppStore`;
    if (quizSubmit && quizCatalogStatus) {
      quizSubmit.disabled = false;
      quizCatalogStatus.textContent = `${catalog.apps.length} apps ready for your quiz`;
    }
  } catch (error) {
    console.error("Unable to load the OpenAppStore catalog.", error);
    appStatus.textContent = "";
    appLoadError.hidden = false;
    if (quizCatalogStatus) {
      quizCatalogStatus.textContent = "The app catalog couldn’t be loaded, so quiz recommendations aren’t available right now.";
    }
  }
}

loadAppCatalog();
