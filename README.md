# The GBEDEGU '26 AI Playbook

Resource hub for **“AI-Powered Personal Brand & Digital Presence”** — the Skills Development
Session at the JCI Northern Conference, GBEDEGU '26, Hawthorn Suites Abuja, 21 August 2026.

Live at **https://jci.innoedgetech.com**

## What's here

- The full 38-slide deck as PDF and as an editable PPTX
- Six handouts in markdown: prompt handbook, AI coworker flow, tools directory,
  open-source picks, bookmark shelf, 30-day action plan
- An interactive prompt bank (24 prompts, copy to clipboard)
- A searchable directory of every tool from the talk with real free-tier notes
- A 30-day checklist that saves progress to the visitor's browser

## Stack

Static HTML, CSS and vanilla JS. No build step — what is in `public/` is what ships.

- **GSAP + ScrollTrigger** for scroll choreography
- **Three.js** for the WebGL hero robot and neural field (lazy-loaded, desktop only)
- **qrcode.js** for the QR codes, rendered client-side from the live URL
- Libraries are vendored in `public/vendor/` rather than pulled from a CDN — a CDN miss
  on conference wifi turns the page blank.

Everything degrades: no JavaScript, no WebGL, or `prefers-reduced-motion` all still give
a complete, readable page with the SVG robot in the hero.

## Local development

```
cd public && python3 -m http.server 8899
```

## Deployment

DigitalOcean App Platform static site, deployed on push to `main`.
