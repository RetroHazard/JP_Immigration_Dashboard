// src/components/EstimationFormula.tsx
// The estimator's "Show the math" breakdown: five KaTeX cards walking from the
// bureau's throughput to a completion offset, in dependency order - no symbol
// appears in a formula before the step that defines it.
//
// The steps are built as data rather than JSX so that ordering rule is
// testable: each step declares what it `defines` and what it `uses`, and
// EstimationFormula.test.tsx checks every `uses` against the steps before it.
//
// Several model variables come from one of two code branches depending on
// whether the dataset actually covers the application month. Only the branch
// that ran is rendered - showing both would be twice the height and half of it
// would be a lie about how the number on screen was reached.
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
 * Escapes a locale-formatted number for math mode. Not every separator `Intl`
 * reaches for is typesettable: fr-FR groups with U+202F and pt-PT with U+00A0,
 * and KaTeX has a symbol for neither - both raise "Unrecognized Unicode
 * character" and render as a zero-width box. A comma needs `{,}` besides, or
 * TeX spaces it as sentence punctuation instead of as part of the number.
 */
export const escapeNumber = (formatted: string): string =>
  formatted
    // Commas first: the thin space substituted below is itself written `\,`,
    // and a later comma pass would go on to mangle it into `\{,}`.
    .replace(/,/g, '{,}')
    .replace(/[\u00a0\u202f\u2009\u2007]/g, '\\,')
    .replace(/\u2212/g, '-');

/** Row separator; KaTeX's default `aligned` leading is tight at this size. */
const ROW = ' \\\\[2pt]\n';

/** ` + x` or ` - |x|`, so a negative term never renders as `+ -20{,}146`. */
const addend = (value: number, fmt: (v: number) => string): string =>
  value < 0 ? `- ${fmt(Math.abs(value))}` : `+ ${fmt(value)}`;

/** The same, for a term being subtracted. */
const subtrahend = (value: number, fmt: (v: number) => string): string =>
  value < 0 ? `+ ${fmt(Math.abs(value))}` : `- ${fmt(value)}`;

const aligned = (rows: string[]): string => `\\begin{aligned}\n${rows.join(ROW)}\n\\end{aligned}`;

/**
 * Builds the breakdown for one estimate. Pure, and exported for the ordering
 * test - the component only formats and renders what comes out of here.
 */
export const buildFormulaSteps = (
  vars: ModelVariables,
  branches: ModelBranches,
  fmt: MathFormatters
): FormulaStep[] => {
  const { n, rate } = fmt;

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
      `${SYMBOLS.cPrev} &= ${SYMBOLS.tPrev} - ${SYMBOLS.pPrev} = ${n(vars.T_prev ?? 0)} - ${n(vars.P_prev ?? 0)} = ${n(vars.C_prev)}`
    );
  } else if (branches.carryover === 'simulated') {
    queueDefines.push('cSeed', 'mSim');
    queueUses.push('rNew', 'rProc');
    queueRows.push(
      `C_k &= \\max\\bigl(0,\\, C_{k-1} + (${SYMBOLS.rNew} - ${SYMBOLS.rProc})\\, d_k\\bigr)`,
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
      `${SYMBOLS.nApp} &= ${SYMBOLS.rNew}\\, ${SYMBOLS.aDay} = ${rate(vars.R_new)} \\cdot ${n(vars.A_day)} = ${n(vars.N_app)}`,
      `${SYMBOLS.pApp} &= ${SYMBOLS.rProc}\\, ${SYMBOLS.aDay} = ${rate(vars.R_proc)} \\cdot ${n(vars.A_day)} = ${n(vars.P_app)}`
    );
  }
  queueDefines.push('nApp', 'pApp', 'qApp');
  queueRows.push(
    `${SYMBOLS.qApp} &= \\left\\lfloor ${SYMBOLS.cPrev} + ${SYMBOLS.nApp} - ${SYMBOLS.pApp} \\right\\rceil`,
    `&= \\left\\lfloor ${n(vars.C_prev)} + ${n(vars.N_app)} - ${n(vars.P_app)} \\right\\rceil = ${n(vars.Q_app)}`
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
      `${SYMBOLS.cProc} &= ${SYMBOLS.pAfter} + ${SYMBOLS.rProc}\\,(${SYMBOLS.dMonth} - ${SYMBOLS.aDay})`,
      `&= ${n(vars.P_after)} + ${rate(vars.R_proc)} \\cdot (${n(vars.D_month)} - ${n(vars.A_day)}) = ${n(vars.C_proc)}`
    );
  } else {
    // Nothing was processed inside the application month, because the dataset
    // does not reach it - C_proc is the later months alone.
    sinceRows.push(`${SYMBOLS.cProc} &= ${SYMBOLS.pAfter} = ${n(vars.C_proc)}`);
  }

  if (branches.sinceApplication === 'fromApplication') {
    sinceDefines.push('tApp');
    sinceRows.push(
      `${SYMBOLS.eProc} &= ${SYMBOLS.rProc}\\, ${SYMBOLS.tApp} - ${SYMBOLS.cProc}`,
      `&= ${rate(vars.R_proc)} \\cdot ${n(vars.T_app)} - ${n(vars.C_proc)} = ${n(vars.E_proc)}`
    );
  } else {
    sinceDefines.push('tData');
    sinceRows.push(
      `${SYMBOLS.eProc} &= ${SYMBOLS.rProc}\\, ${SYMBOLS.tData} = ${rate(vars.R_proc)} \\cdot ${n(vars.T_data)} = ${n(vars.E_proc)}`
    );
  }
  sinceDefines.push('cProc', 'eProc', 'sProc');
  sinceRows.push(
    `${SYMBOLS.sProc} &= \\left\\lfloor ${SYMBOLS.cProc} + ${SYMBOLS.eProc} \\right\\rceil`,
    `&= \\left\\lfloor ${n(vars.C_proc)} ${addend(vars.E_proc, n)} \\right\\rceil = ${n(vars.S_proc)}`
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
      `${SYMBOLS.qPos} &= ${SYMBOLS.qApp} - ${SYMBOLS.sProc} = ${n(vars.Q_app)} ${subtrahend(vars.S_proc, n)} = ${n(vars.Q_pos)}`,
      `${SYMBOLS.dRem} &= \\frac{${SYMBOLS.qPos}}{${SYMBOLS.rProc}} = \\frac{${n(vars.Q_pos)}}{${rate(vars.R_proc)}} = ${rate(vars.D_rem)}\\ \\text{d}`,
    ]),
  };

  // ── 5. Completion offset & spread ──────────────────────────────────────
  // Whole days are rounded away from zero, so a past-due estimate floors.
  const [openWhole, closeWhole] =
    vars.D_rem >= 0 ? ['\\left\\lceil', '\\right\\rceil'] : ['\\left\\lfloor', '\\right\\rfloor'];

  const completion: FormulaStep = {
    step: 5,
    titleKey: 'estimator.formula.step5',
    defines: ['dEst', 'sigmaR', 'rBar', 'uDays'],
    uses: ['dRem'],
    math: aligned([
      `${SYMBOLS.dEst} &= ${openWhole} ${SYMBOLS.dRem} ${closeWhole} = ${n(vars.D_est)}\\ \\text{d}`,
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

  // Numbers keep the reader's own separators - they are formatted through the
  // locale and then escaped for math mode, never wrapped in \text{}.
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
