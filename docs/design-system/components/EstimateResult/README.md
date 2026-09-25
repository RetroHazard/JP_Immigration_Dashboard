# EstimateResult

The answer the Processing Time Estimator exists to give: an estimated completion date, how sure it is, and how far through the queue the application has moved.

Recreated from the result block in `src/components/EstimationCard.tsx`.

## Anatomy

- A card with a 5% `primary` tint, a 25% `primary` border, `radius-xl` and `shadow-soft`, 16px padding.
- An `eyebrow` ("Estimated completion"), the date in `display-figure` (tabular), and a note joining the spread and the sample with a middle dot.
- Notices inside the card when they apply (limited data); see Notice.
- The queue bar: a 6px `border` track with a `primary` fill showing how much of the original queue has cleared, and a 10px caption row ("Queue position", "≈ 91,380 ahead of you").
- Under the card, the "How is this calculated?" disclosure and the italic disclaimer with "estimate" in bold and underlined.

## What you provide

The estimate result (date, spread, months used, data quality, queue variables) from `calculateEstimatedDate`.

## Rules

- The result settles in once per new estimate (97.5% scale and 40% opacity to full, 450ms) and the queue bar fills over 1.1s; both are skipped under reduced motion.
- Say "estimate" in the result's vicinity every time.
- A past-due estimate keeps this neutral card; the destructive notice goes below it, never inside a second tint (Roadmap step 3).

## Code today

Past due turns the whole card `warning` (10% tint, 40% border, date in `warning`) and nests both notices inside it, at 3.89:1 (warning) and 4.03:1 (destructive) (Audit A3). The notice body here uses `foreground`, as the Roadmap proposes.
