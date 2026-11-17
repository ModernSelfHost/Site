# Modern Self Host

Modern Self Host helps beginners explore self-hosted apps, choose a first project, and understand what running services themselves involves.

This is a static site: there’s no build step, package installation, or server-side form handling.

## Explore the site

| Page | What you’ll find |
| --- | --- |
| [Home](./index.html) | Project introduction and a preview of the app catalog |
| [App catalog](./apps.html) | Searchable, filterable list of apps with icons and setup manifests |
| [Getting started](./getting-started.html) | First steps, hardware considerations, example paths, and safety guidance |
| [Discovery quiz](./quiz.html) | Personalized app suggestions based on your goals, interests, experience, and hardware |

## Run locally

From the repository root, start any static file server. For example, with Python:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Use a local server rather than opening the HTML files directly so the browser can load the app catalog.

## Deploy to Netlify

Connect this repository to Netlify. The [`netlify.toml`](./netlify.toml) configuration publishes the repository root (`.`); no build command is required.

## App catalog and quiz data

The app list, descriptions, versions, categories, icons, and setup manifests are loaded from the [Modern Self Host OpenAppStore](https://modernselfhost.github.io/openappstore/). The catalog pages need an internet connection to display this data.

Quiz answers are processed in the browser to create recommendations and are not submitted to a server. Recommendations are starting points, not endorsements; check each app’s documentation, requirements, and security practices before installing it.

## Project files

- `index.html`, `apps.html`, `getting-started.html`, `quiz.html` — site pages
- `styles.css` — shared responsive styles
- `script.js` — mobile navigation, catalog loading and filtering, and quiz recommendations
- `netlify.toml` — Netlify publish configuration