# Japan Immigration Statistics Dashboard
[![Build and Deploy to GitHub Pages](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/build.yaml/badge.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/build.yaml)

## Overview

A React-based dashboard for visualizing and analyzing Japanese immigration application processing statistics. The
dashboard provides estimates and visual analytics for application processing times across different immigration bureaus
using a combination of predictive averages and confirmed statistics reported by Immigration Services Agency of Japan.

## Features

:bar_chart: Data Visualisation

- Interactive Stacked Bar Chart
    + Previously received applications
    + Newly received applications
    + Processed applications per month
    + Configurable time range display (6/12/24/36/all months)

:clock2: Processing Time Estimator

- Smart Estimation Panel
    + Collapsible interface
    + Queue position tracking
    + Historical processing rate analysis
    + Predictive modeling for future dates
    + Past-due notifications

:mag: Advanced Filtering

- Immigration bureau selection
- Application type filtering
- Time period adjustment
- Statistics summary

:iphone: Responsive Design

- Adaptive Breakpoints
- Fluid Layout
- Responsive Interface
- Light/Dark Mode Support

## Tech Stack

**Frontend**

- `Node.js` - Runtime & Build
- `React` - Core Framework
- `Chart.js` - Data Visualization
- `Tailwind CSS` - Styling
- `Iconify` - UI icons

## Data Processing

**Prediction Model**

- 3-month rolling averages
- Dynamic queue position calculation
- Real-time processing rate analysis
- Missing month predictions

**Calculations**

- Application processing rates
- Queue position tracking
- Completion date estimation
- Trend analysis

## Data Source

- Official statistics provided by Immigration Services Agency of Japan 
- Data acquisition via [e-Stat API](https://www.e-stat.go.jp/)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss proposed changes.