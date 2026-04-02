# Current Account Balance Explorer

An interactive single-page React app that visualizes World Bank macroeconomic data for economics students. Compare current account balances across countries, overlay major global crisis periods, and explore the savings vs. investment identity (CA = S − I) for any country from 2000 to 2023.

---

## Features

### Educational Context Panel
A collapsible explainer at the top of the page covering:
- What the current account balance is (surplus vs. deficit)
- The CA = S − I accounting identity
- Real-world examples (Netherlands, Germany, United States, Saudi Arabia, Russia)

### Multi-Country Current Account Chart
- Loads 4 countries by default: **United States, Netherlands, Russian Federation, Saudi Arabia**
- Search and add up to **15 countries** simultaneously
- Each country gets a unique color with a colored pill/tag badge and a remove button
- Interactive tooltip showing all countries' values for the hovered year, ranked by value
- Dashed reference line at 0% (surplus/deficit split)
- **Crisis period overlays** — semi-transparent bands highlighting 4 major economic events:
  - 2008–09 Global Financial Crisis
  - 2014–16 Oil Price Crash
  - 2020–21 COVID-19 Pandemic
  - 2022 Energy & Geopolitical Shock
- Click any crisis band for a popover with economic context
- Toggle to show/hide the crisis overlays

### Savings vs. Investment Breakdown
- Separate section with its own country search (no country limit)
- Per-country chart cards showing **Gross Savings** (teal) vs. **Gross Capital Formation / Investment** (red)
- The gap between the two lines approximates the current account balance
- Each card is independently removable

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 5 |
| Charts | Recharts |
| Data | World Bank Open API (no API key needed) |
| Styling | Inline styles + single CSS reset |
| State | React `useState` / `useEffect` (no external store) |

---

## Data Source

All data is fetched live from the **World Bank World Development Indicators** API.

| Indicator | Code | Description |
|---|---|---|
| Current Account Balance | `BN.CAB.XOKA.GD.ZS` | % of GDP, 2000–2023 |
| Gross Savings | `NY.GNS.ICTR.ZS` | % of GNI, 2000–2023 |
| Gross Capital Formation | `NE.GDI.TOTL.ZS` | % of GDP, 2000–2023 |

No backend, no API key, no localStorage — all state is session-only. Fetched data is cached in memory so removing and re-adding a country does not trigger a new request.

---

## Project Structure

```
src/
  App.jsx                  — Main layout, state management, data loading
  components/
    EducationPanel.jsx     — Collapsible CA explainer
    CountrySearch.jsx      — Reusable search/autocomplete dropdown
    CAChart.jsx            — Multi-country line chart with crisis overlays
    SIChart.jsx            — Per-country savings vs investment card
  data/
    crisisEvents.js        — Crisis period definitions, colors, descriptions
  api/
    worldbank.js           — Fetch helpers with in-memory caching
  index.css                — Minimal CSS reset
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173

# Production build
npm run build
```

> **Note (Apple Silicon / ARM64 Macs):** If you get a rollup native binding error, run:
> ```bash
> npm install @rollup/rollup-darwin-arm64 --no-save
> ```

---

## Crisis Periods Reference

| Event | Years | Key Context |
|---|---|---|
| Global Financial Crisis | 2008–09 | US housing/banking collapse; oil fell from $147 to $35 |
| Oil Price Crash | 2014–16 | Oil dropped from $100+ to below $30; commodity exporters hit hard |
| COVID-19 Pandemic | 2020–21 | Global trade collapsed; oil briefly went negative (−$37/barrel) |
| Energy & Geopolitical Shock | 2022 | Russia–Ukraine war; energy prices surged; European gas crisis |

---

## Source

World Bank, World Development Indicators — [https://data.worldbank.org](https://data.worldbank.org)
