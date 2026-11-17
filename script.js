const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const appGrid = document.querySelector("#app-grid");
const appStatus = document.querySelector("#app-status");
const appLoadError = document.querySelector("#app-load-error");
const catalogUrl = "https://modernselfhost.github.io/openappstore/";

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
  return ["id", "name", "version", "category", "description", "runtime", "icon"]
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

    appGrid.replaceChildren(...catalog.apps.map(createAppCard));
    appStatus.textContent = `${catalog.apps.length} apps from OpenAppStore`;
  } catch (error) {
    console.error("Unable to load the OpenAppStore catalog.", error);
    appStatus.textContent = "";
    appLoadError.hidden = false;
  }
}

loadAppCatalog();
