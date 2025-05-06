# Japan Immigration Statistics Dashboard
[![Build and Deploy to GitHub Pages](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/build.yaml/badge.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/build.yaml)

## Overview
A React-based dashboard for visualizing and analyzing application processing statistics at Japan's 
Immigration Bureaus. The dashboard provides estimates and visual analytics for application processing 
times across different immigration bureaus using a combination of predictive averages and confirmed statistics 
reported by the Immigration Services Agency of Japan.

---

## :sparkles: Features

### :bar_chart: Data Visualization
This project offers a suite of interactive and configurable charts to analyze data trends and distributions. 
Each chart is designed to provide clear insights while allowing flexibility through filters and customization.

#### **Stacked Bar Chart**
- **Purpose:** Represents intake and processing trends.
- **Features:**
  - Displays:
    - Previously received applications
    - Newly received applications
    - Processed applications per month
  - Filterable by bureau and application type
  - Indexed tooltips for detailed viewing
  - Configurable time range display

#### **Multi-Line Chart**
- **Purpose:** Represents submission trends.
- **Features:**
  - Tracks all category types
  - Filterable by individual bureaus
  - Exclude specific application types via UI
  - Indexed tooltips for detailed viewing
  - Configurable time range display

#### **Ring Chart**
- **Purpose:** Represents distribution of workload.
- **Features:**
  - Visualizes load distribution by application type
  - Exclude specific bureaus via UI
  - Configurable cumulative time range display

#### **Bubble Chart**
- **Purpose:** Measure processing efficiency.
- **Features:**
  - Visualizes monthly intake vs. processing rates
  - Normalized bubble sizes for large datasets
  - Filterable by bureau and application type
  - Clear, concise tooltips
  - Configurable cumulative time range display

#### **Radar Chart**
- **Purpose:** Highlight category spread.
- **Features:**
  - Visualize category distributions
  - Filterable by individual bureaus
  - Configurable cumulative time range display

#### **Choropleth Map**
- **Purpose:** Show service density.
- **Features:**
  - Interactive, topographical map of Japan, at a Prefectural level
  - Prefectures colored based on Service Bureau and overall Density rating
  - Prefecture tooltips with vital statistics
  - Bureau/Airport markers placed via GPS coordinates
  - Bureau tooltips with Service Area statistics

---

### :mag: Dynamic Filtering
- Dynamic filter availability:
  - Immigration bureau selection
  - Application type selection
- Statistics summary on charts
- On-chart series pruning for better insights

---

### :clock2: Processing Time Estimator
- Smart Estimation Panel:
  - Collapsible interface
  - Queue position tracking
  - Historical processing rate analysis
  - Predictive modeling with detailed calculation formulas
    - Tooltip reference /w variable explanations
  - Past-due notifications

---

### :pencil: Summary Badges
- Effortlessly reference the most recent data points
- Filterable by Immigration Bureau and Application Type
- Responsive tooltips for mobile users

---

### :iphone: Responsive Design
- Mobile-friendly with adaptive breakpoints
- Fluid layout for all screen sizes
- Responsive user interface with light/dark mode support

---

## :hammer_and_wrench: Tech Stack

### Frontend:
- `Node.js` – Runtime
- `Next.js` – Framework
- `React` – Library
- `Chart.js` – Data Visualization (Charts)
- `react-simple-maps` - Data Visualization (Maps)
- `Tippy.js` – Tooltips
- `Tailwind CSS` – Styling
- `Iconify` – UI Icons
- `KaTeX` – LaTeX Typesetting

### DevOps:
- `GitHub Actions` – Automation

### Hosting:
- `GitHub Pages` – Static Site Hosting

### Tooling:
- `WebStorm` – IDE
- `Prettier` – Code Formatter
- `ESLint` – Linter

---

## :chart_with_upwards_trend: Data Processing

### Prediction Model:
- Predicts original queue position based on the average daily rate during the month of application.
- Simulates progression through queue based on a combination of confirmed counts and recent output levels.
- Uses a rolling average (6 months) for dynamic processing calculation.
- Predicts data for months that are yet to be published, using historical data.

### Calculations:
- Application processing rates
- Application intake rates
- Queue position tracking
- Completion date estimation
- Trend analysis

---

## :file_folder: Data Source
This project uses official statistics provided by the Immigration Services Agency of Japan. 
Data acquisition is performed via the [e-Stat API](https://www.e-stat.go.jp/).

---

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss proposed changes.