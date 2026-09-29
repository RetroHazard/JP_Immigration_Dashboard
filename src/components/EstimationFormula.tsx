// The estimator's "Show the math" breakdown: five KaTeX cards from the bureau's
// throughput to a completion offset, in dependency order - no symbol appears in
// a formula before the step that defines it. Steps are data rather than JSX so
// that rule is testable: each declares what it `defines` and `uses`, and
// __tests__/EstimationFormula.test.ts checks every `uses` against earlier steps.
// Where a variable comes from one of two branches (whether the dataset covers
// the application month), only the branch that ran is rendered.
'use client';

import { useMemo } from 'react';

import type React from 'react';
import { BlockMath } from 'react-katex';

import { useLocale } from '../i18n/LocaleContext';
import type { DictionaryKey } from '../i18n/types';
import type { ModelBranches, ModelVariables } from '../utils/calculateEstimates';
import type { VariableId } from './common/FormulaTooltip';
import { FormulaTooltip, useVariableExplanations } from './common/FormulaTooltip';

/** The LaTeX each model variable renders as, in both the math and the glossary. */
export const SYMBOLS: Record<VariableId, string> = {
  sigmaP: '\\sum P',
  sigmaN: '\\sum N',
  sigmaD: '\\sum D',
  rProc: 'R_{\\text{proc}}',
  rNew: 'R_{\\text{new}}',
  aDay: 'a',
  dMonth: 'd_m',
  tPrev: 'T_{\\text{prev}}',
  pPrev: 'P_{\\text{prev}}',
  cSeed: 'C_0',
  mSim: 'M_{\\text{sim}}',
  nMonth: 'N_m',
  pMonth: 'P_m',
  cPrev: 'C_{\\text{prev}}',
  nApp: 'N_{\\text{app}}',
  pApp: 'P_{\\text{app}}',
  qApp: 'Q_{\\text{app}}',
  pAfter: 'P_{>m}',
  tApp: '\\Delta t_{\\text{app}}',
  tData: '\\Delta t_{\\text{data}}',
  cProc: 'C_{\\text{proc}}',
  eProc: 'E_{\\text{proc}}',
  sProc: 'S_{\\text{proc}}',
  qPos: 'Q_{\\text{pos}}',
  dRem: 'D_{\\text{rem}}',
  dEst: 'D_{\\text{est}}',
  rBar: '\\bar{R}',
  sigmaR: '\\sigma_R',
  uDays: 'U',
};

export interface FormulaStep {
  /** 1-based, shown in the card's numbered badge. */
  step: number;
  titleKey: DictionaryKey;
  /** Variables this step introduces, in reading order. */
  defines: VariableId[];
  /** Variables it carries in from an earlier step, in reading order. */
  uses: VariableId[];
  math: string;
}

/** Locale-bound number rendering for use inside a KaTeX string. */
export interface MathFormatters {
  /** A whole count, grouped. */
  n: (value: number) => string;
  /** A two-decimal rate or day count. */
  rate: (value: number) => string;
}

/**
 * Escapes a locale-formatted number for math mode. KaTeX has no symbol for
 * U+202F (fr-FR grouping) or U+00A0 (pt-PT) and renders them as a zero-width
 * box. A comma needs `{,}`, or TeX spaces it as sentence punctuation.
 */
export const escapeNumber = (formatted: string): string =>
  formatted
    // Commas first: the thin space substituted below is written `\,`, which a
    // later comma pass would mangle into `\{,}`.
    .replace(/,/g, '{,}')
    .replace(/[\u00a0\u202f\u2009\u2007]/g, '\\,')
    .replace(/\u2212/g, '-');

/** Row separator; KaTeX's default `aligned` leading is tight at this size. */
const ROW = ' \\\\[2pt]\n';

/**
 * `\underbrace{sym}_{value}` - the figure sits under its own symbol, so a term
 * reads without a second, substituted line. The sign stays with the value
 * rather than flipping the operator: `E_proc` goes negative when the published
 * months outrun the average rate, and `+ \underbrace{E_proc}_{-20{,}146}`
 * shows that where a subtraction would hide it.
 */
const under = (id: VariableId, value: string): string => `\\underbrace{${SYMBOLS[id]}}_{${value}}`;

const aligned = (rows: string[]): string => `\\begin{aligned}\n${rows.join(ROW)}\n\\end{aligned}`;

/** Builds the breakdown for one estimate. Pure, and exported for the ordering test. */
export const buildFormulaSteps = (
  vars: ModelVariables,
  branches: ModelBranches,
  fmt: MathFormatters
): FormulaStep[] => {
  const { n, rate } = fmt;

  // Counts print whole; rates keep two decimals. Fractional intermediates are
  // rounded for display only, so a ⌊·⌉ row's visible operands can sum to one
  // off its printed result; the notation says the sum is what gets rounded.

  // ── 1. Throughput baseline ─────────────────────────────────────────────
  const throughput: FormulaStep = {
    step: 1,
    titleKey: 'estimator.formula.step1',
    defines: ['sigmaP', 'sigmaN', 'sigmaD', 'rProc', 'rNew'],
    uses: [],
    math: aligned([
      `${SYMBOLS.rProc} &= \\frac{${SYMBOLS.sigmaP}}{${SYMBOLS.sigmaD}} = \\frac{${n(vars.Sigma_P)}}{${n(vars.Sigma_D)}} = ${rate(vars.R_proc)}`,
      `${SYMBOLS.rNew} &= \\frac{${SYMBOLS.sigmaN}}{${SYMBOLS.sigmaD}} = \\frac{${n(vars.Sigma_N)}}{${n(vars.Sigma_D)}} = ${rate(vars.R_new)}`,
    ]),
  };

  // ── 2. Queue at application ────────────────────────────────────────────
  const queueDefines: VariableId[] = [];
  const queueUses: VariableId[] = [];
  const queueRows: string[] = [];

  if (branches.carryover === 'reported') {
    queueDefines.push('tPrev', 'pPrev');
    queueRows.push(
      `${SYMBOLS.cPrev} &= ${under('tPrev', n(vars.T_prev ?? 0))} - ${under('pPrev', n(vars.P_prev ?? 0))} = ${n(vars.C_prev)}`
    );
  } else if (branches.carryover === 'simulated') {
    queueDefines.push('cSeed', 'mSim');
    queueUses.push('rNew', 'rProc');
    queueRows.push(
      `C_k &= \\max\\bigl(0,\\, C_{k-1} + (${under('rNew', rate(vars.R_new))} - ${under('rProc', rate(vars.R_proc))})\\, d_k\\bigr)`,
      `${SYMBOLS.cSeed} &= ${n(vars.C_seed ?? 0)}, \\quad ${SYMBOLS.mSim} = ${n(vars.M_sim ?? 0)}`,
      `${SYMBOLS.cPrev} &= C_{${SYMBOLS.mSim}} = ${n(vars.C_prev)}`
    );
  } else {
    // The application month is the earliest the dataset covers: nothing to
    // carry in, and no earlier month to roll forward from.
    queueRows.push(`${SYMBOLS.cPrev} &= ${n(vars.C_prev)}`);
  }
  queueDefines.push('cPrev');

  if (branches.appMonth === 'reported') {
    queueDefines.push('nMonth', 'pMonth', 'dMonth', 'aDay');
    queueRows.push(
      `${SYMBOLS.nApp} &= \\tfrac{${SYMBOLS.nMonth}}{${SYMBOLS.dMonth}}\\, ${SYMBOLS.aDay} = \\tfrac{${n(vars.N_month ?? 0)}}{${n(vars.D_month)}} \\cdot ${n(vars.A_day)} = ${n(vars.N_app)}`,
      `${SYMBOLS.pApp} &= \\tfrac{${SYMBOLS.pMonth}}{${SYMBOLS.dMonth}}\\, ${SYMBOLS.aDay} = \\tfrac{${n(vars.P_month ?? 0)}}{${n(vars.D_month)}} \\cdot ${n(vars.A_day)} = ${n(vars.P_app)}`
    );
  } else {
    queueDefines.push('aDay');
    if (!queueUses.includes('rNew')) queueUses.push('rNew', 'rProc');
    queueRows.push(
      `${SYMBOLS.nApp} &= ${under('rNew', rate(vars.R_new))} \\cdot ${under('aDay', n(vars.A_day))} = ${n(vars.N_app)}`,
      `${SYMBOLS.pApp} &= ${under('rProc', rate(vars.R_proc))} \\cdot ${under('aDay', n(vars.A_day))} = ${n(vars.P_app)}`
    );
  }
  queueDefines.push('nApp', 'pApp', 'qApp');
  queueRows.push(
    `${SYMBOLS.qApp} &= \\bigl\\lfloor ${under('cPrev', n(vars.C_prev))} + ${under('nApp', n(vars.N_app))} - ${under('pApp', n(vars.P_app))} \\bigr\\rceil = ${n(vars.Q_app)}`
  );

  const queueAtApplication: FormulaStep = {
    step: 2,
    titleKey: 'estimator.formula.step2',
    defines: queueDefines,
    uses: queueUses,
    math: aligned(queueRows),
  };

  // ── 3. Processed since application ─────────────────────────────────────
  const sinceDefines: VariableId[] = ['pAfter'];
  const sinceUses: VariableId[] = ['rProc'];
  const sinceRows: string[] = [];

  if (branches.appMonth === 'reported') {
    sinceUses.push('dMonth', 'aDay');
    sinceRows.push(
      `${SYMBOLS.cProc} &= ${under('pAfter', n(vars.P_after))} + ${under('rProc', rate(vars.R_proc))} \\cdot (${under('dMonth', n(vars.D_month))} - ${under('aDay', n(vars.A_day))}) = ${n(vars.C_proc)}`
    );
  } else {
    // The dataset does not reach the application month, so C_proc is the later
    // months alone.
    sinceRows.push(`${SYMBOLS.cProc} &= ${SYMBOLS.pAfter} = ${n(vars.C_proc)}`);
  }

  if (branches.sinceApplication === 'fromApplication') {
    sinceDefines.push('tApp');
    sinceRows.push(
      `${SYMBOLS.eProc} &= ${under('rProc', rate(vars.R_proc))} \\cdot ${under('tApp', n(vars.T_app))} - ${under('cProc', n(vars.C_proc))} = ${n(vars.E_proc)}`
    );
  } else {
    sinceDefines.push('tData');
    sinceRows.push(
      `${SYMBOLS.eProc} &= ${under('rProc', rate(vars.R_proc))} \\cdot ${under('tData', n(vars.T_data))} = ${n(vars.E_proc)}`
    );
  }
  sinceDefines.push('cProc', 'eProc', 'sProc');
  sinceRows.push(
    `${SYMBOLS.sProc} &= \\bigl\\lfloor ${under('cProc', n(vars.C_proc))} + ${under('eProc', n(vars.E_proc))} \\bigr\\rceil = ${n(vars.S_proc)}`
  );

  const processedSince: FormulaStep = {
    step: 3,
    titleKey: 'estimator.formula.step3',
    defines: sinceDefines,
    uses: sinceUses,
    math: aligned(sinceRows),
  };

  // ── 4. Queue position & remaining days ─────────────────────────────────
  const position: FormulaStep = {
    step: 4,
    titleKey: 'estimator.formula.step4',
    defines: ['qPos', 'dRem'],
    uses: ['qApp', 'sProc', 'rProc'],
    math: aligned([
      `${SYMBOLS.qPos} &= ${under('qApp', n(vars.Q_app))} - ${under('sProc', n(vars.S_proc))} = ${n(vars.Q_pos)}`,
      `${SYMBOLS.dRem} &= \\frac{${SYMBOLS.qPos}}{${SYMBOLS.rProc}} = \\frac{${n(vars.Q_pos)}}{${rate(vars.R_proc)}} = ${rate(vars.D_rem)}\\ \\text{d}`,
    ]),
  };

  // ── 5. Completion offset & spread ──────────────────────────────────────
  // Whole days are rounded away from zero, so a past-due estimate floors.
  // Fixed-size delimiters, not `\left`/`\right`: stretched around an
  // underbraced term, KaTeX (0.16.28) emits a `\rceil` path with a doubled
  // moveto, which the browser rejects as invalid SVG.
  const [openWhole, closeWhole] =
    vars.D_rem >= 0 ? ['\\bigl\\lceil', '\\bigr\\rceil'] : ['\\bigl\\lfloor', '\\bigr\\rfloor'];

  const completion: FormulaStep = {
    step: 5,
    titleKey: 'estimator.formula.step5',
    defines: ['dEst', 'sigmaR', 'rBar', 'uDays'],
    uses: ['dRem'],
    math: aligned([
      `${SYMBOLS.dEst} &= ${openWhole} ${under('dRem', rate(vars.D_rem))} ${closeWhole} = ${n(vars.D_est)}\\ \\text{d}`,
      `${SYMBOLS.uDays} &= \\left\\lfloor \\lvert ${SYMBOLS.dRem} \\rvert \\cdot \\frac{${SYMBOLS.sigmaR}}{${SYMBOLS.rBar}} \\right\\rceil`,
      `&= \\left\\lfloor ${rate(Math.abs(vars.D_rem))} \\cdot \\frac{${rate(vars.R_sd)}}{${rate(vars.R_bar)}} \\right\\rceil = ${n(vars.U_days)}\\ \\text{d}`,
    ]),
  };

  return [throughput, queueAtApplication, processedSince, position, completion];
};

interface EstimationFormulaProps {
  vars: ModelVariables;
  branches: ModelBranches;
}

export const EstimationFormula: React.FC<EstimationFormulaProps> = ({ vars, branches }) => {
  const { t, formatters } = useLocale();
  const explanations = useVariableExplanations();

  // Numbers keep the reader's locale separators: formatted through the locale,
  // then escaped for math mode rather than wrapped in \text{}.
  const steps = useMemo(
    () =>
      buildFormulaSteps(vars, branches, {
        n: (value) => escapeNumber(formatters.number(Math.round(value))),
        rate: (value) => escapeNumber(formatters.decimal(value, 2)),
      }),
    [vars, branches, formatters]
  );

  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <FormulaTooltip
          key={step.step}
          step={step.step}
          title={t(step.titleKey)}
          variables={Object.fromEntries([...step.defines, ...step.uses].map((id) => [SYMBOLS[id], explanations[id]]))}
        >
          <BlockMath math={step.math} renderError={() => null} />
        </FormulaTooltip>
      ))}
    </div>
  );
};
