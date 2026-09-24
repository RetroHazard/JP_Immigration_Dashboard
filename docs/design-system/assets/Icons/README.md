# Icons

The lucide-react 1.27 icons the dashboard uses, one file per icon, named by lucide's own file name, with the React import name the code uses and what it means here. Files are 24px outline strokes (2px, round caps and joins) drawn in #6d7285, the light `muted-foreground`, so they read on light and dark tiles; in the app they take `currentColor`. Copy icons from lucide rather than from these files when building.

| File | Import | Meaning |
| --- | --- | --- |
| `file-stack.svg` | `FileStack` | Total applications (stat tile) |
| `hourglass.svg` | `Hourglass` | Pending (stat tile) |
| `stamp.svg` | `Stamp` | Granted (stat tile) |
| `circle-slash.svg` | `CircleSlash` | Denied (stat tile) |
| `percent.svg` | `Percent` | Approval rate and population share (stat tiles) |
| `users.svg` | `Users` | Foreign residents (stat tile) |
| `globe.svg` | `Globe` | Largest nationality (stat tile); World Origins (tab) |
| `layers.svg` | `Layers` | Largest status (stat tile); Residence Status Mix (tab) |
| `chart-column.svg` | `BarChart3` | Intake & Processing (tab) |
| `chart-line.svg` | `LineChart` | Application Types and Origins Over Time (tabs), a collision |
| `git-fork.svg` | `GitFork` | Outcomes (tab) |
| `chart-pie.svg` | `PieChart` | Bureau Share (tab) |
| `layout-dashboard.svg` | `LayoutDashboard` | Category Mix (tab) |
| `chart-bar-decreasing.svg` | `ChartBarDecreasing` | Processing Efficiency (tab) |
| `earth.svg` | `Globe2` | Regional Map (tab) |
| `trending-up.svg` | `TrendingUp` | Population Growth (tab) |
| `network.svg` | `Network` | Origin to Status Flows (tab) |
| `scale.svg` | `Scale` | Legislation (policy marker) and Biggest Movers (tab), a collision |
| `banknote.svg` | `Banknote` | Fees (policy marker) |
| `landmark.svg` | `Landmark` | Operations (policy marker) |
| `split.svg` | `Split` | Reporting change (policy marker) |
| `calculator.svg` | `Calculator` | The Processing Time Estimator (mobile bar, collapsed rail) |
| `rotate-ccw.svg` | `RotateCcw` | Reset filters, reset the estimator |
| `link.svg` | `Link` | Copy a permalink to the estimate |
| `check.svg` | `Check` | Copied; the selected item in a menu |
| `chevrons-right.svg` | `ChevronsRight` | Collapse the estimator sidebar |
| `chevrons-left.svg` | `ChevronsLeft` | Expand the estimator rail |
| `x.svg` | `X` | Close |
| `pencil.svg` | `Pencil` | Edit the estimator inputs (summary row) |
| `triangle-alert.svg` | `AlertTriangle` | Warning notice |
| `octagon-alert.svg` | `OctagonAlert` | Destructive notice |
| `circle-question-mark.svg` | `CircleHelp` | Explain a formula step |
| `languages.svg` | `Languages` | Language |
| `rotate-ccw-clock.svg` | `History` | Changelog / version chip |
| `sun.svg` | `Sun` | Light theme |
| `moon.svg` | `Moon` | Dark theme |
| `menu.svg` | `Menu` | Open the settings drawer |
| `external-link.svg` | `ExternalLink` | Opens another site |
| `plane.svg` | `Plane` | Airport offices (filter toggle, map markers) |
| `building-2.svg` | `Building2` | Regional bureau (map markers) |
| `download.svg` | `Download` | Download CSV |
| `chevron-down.svg` | `ChevronDown` | Open a disclosure or list |
| `chevron-up.svg` | `ChevronUp` | Close a disclosure |
| `chevron-right.svg` | `ChevronRight` | Collapsed section; show the math |
| `loader-circle.svg` | `Loader2` | Loading |

The GitHub mark in the header is vendored from simple-icons (CC0) in `src/components/icons/GitHubIcon.tsx` and is not included here.
