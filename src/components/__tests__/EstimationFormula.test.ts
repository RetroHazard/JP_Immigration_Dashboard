// Pure tests over the breakdown builder. Deliberately no rendering: the point
// is the LaTeX and the dependency ordering, and `EstimationCard` cannot mount
// under jsdom anyway - its share button calls `useRouter`, and nothing in the
// repo stands up an App Router context.
import katex from 'katex';
import { describe, expect, it } from 'vitest';

import { createFormatters } from '../../i18n/formatters';
import { LOCALE_CODES, LOCALES } from '../../i18n/locales';
import type { ModelBranches, ModelVariables } from '../../utils/calculateEstimates';
import { buildFormulaSteps, escapeNumber, SYMBOLS } from '../EstimationFormula';

const BASE: ModelVariables = {
  Sigma_P: 17200,
  Sigma_N: 20500,
  Sigma_D: 181,
  R_proc: 95.0276,
  R_new: 113.2596,
  A_day: 14,
  D_month: 31,
  T_prev: 18300,
  P_prev: 3400,
  C_seed: 12040,
  M_sim: 2,
  N_month: 3100,
  P_month: 1400,
  C_prev: 14900,
  N_app: 1400.0,
  P_app: 632.26,
  Q_app: 15668,
  P_after: 2100,
  T_app: 45,
  T_data: 25,
  C_proc: 3715.53,
  E_proc: 561.71,
  S_proc: 4277,
  Q_pos: 11391,
  D_rem: 119.87,
  D_est: 120,
  R_bar: 95.2867,
  R_sd: 24.1,
  U_days: 30,
};

const CARRYOVER: ModelBranches['carryover'][] = ['reported', 'simulated', 'unavailable'];
const APP_MONTH: ModelBranches['appMonth'][] = ['reported', 'projected'];
const SINCE: ModelBranches['sinceApplication'][] = ['fromApplication', 'fromLastData'];

/** Every branch the model can take - twelve of them. */
const COMBINATIONS: ModelBranches[] = CARRYOVER.flatMap((carryover) =>
  APP_MONTH.flatMap((appMonth) => SINCE.map((sinceApplication) => ({ carryover, appMonth, sinceApplication })))
);

const label = (b: ModelBranches) => `${b.carryover}/${b.appMonth}/${b.sinceApplication}`;

/** Plain-ASCII formatters, so ordering tests do not depend on a locale. */
const PLAIN = { n: (v: number) => String(Math.round(v)), rate: (v: number) => v.toFixed(2) };

describe('buildFormulaSteps ordering', () => {
  it.each(COMBINATIONS.map((b) => [label(b), b] as const))(
    'defines every variable before it is used (%s)',
    (_name, branches) => {
      const steps = buildFormulaSteps(BASE, branches, PLAIN);
      const defined = new Set<string>();

      steps.forEach((step) => {
        // Checked before this step's own `defines` are folded in, so a step
        // may not lean on a variable it introduces further down the block.
        step.uses.forEach((id) => expect(defined, `step ${step.step} uses ${id}`).toContain(id));
        step.defines.forEach((id) => {
          expect(defined, `${id} defined twice`).not.toContain(id);
          defined.add(id);
        });
      });
    }
  );

  it.each(COMBINATIONS.map((b) => [label(b), b] as const))(
    'renders every variable it lists, and lists every variable it renders (%s)',
    (_name, branches) => {
      buildFormulaSteps(BASE, branches, PLAIN).forEach((step) => {
        const listed = [...step.defines, ...step.uses];

        listed.forEach((id) =>
          expect(step.math, `step ${step.step} lists ${id} but never shows it`).toContain(SYMBOLS[id])
        );

        // The reverse: a symbol on screen with no glossary entry behind it.
        // Restricted to symbols long enough to match unambiguously - `a` and
        // `d_m` are substrings of half the LaTeX in the file.
        (Object.keys(SYMBOLS) as (keyof typeof SYMBOLS)[])
          .filter((id) => SYMBOLS[id].length >= 6 && step.math.includes(SYMBOLS[id]))
          .forEach((id) => expect(listed, `step ${step.step} shows ${id} unexplained`).toContain(id));
      });
    }
  );

  it('walks all five steps in order', () => {
    const steps = buildFormulaSteps(BASE, COMBINATIONS[0], PLAIN);
    expect(steps.map((step) => step.step)).toEqual([1, 2, 3, 4, 5]);
    expect(steps.map((step) => step.titleKey)).toEqual([
      'estimator.formula.step1',
      'estimator.formula.step2',
      'estimator.formula.step3',
      'estimator.formula.step4',
      'estimator.formula.step5',
    ]);
  });
});

describe('buildFormulaSteps LaTeX', () => {
  const formattersFor = (code: string) => {
    const { number, decimal } = createFormatters(LOCALES[code as keyof typeof LOCALES].intlTag);
    return { n: (v: number) => escapeNumber(number(Math.round(v))), rate: (v: number) => escapeNumber(decimal(v, 2)) };
  };

  // strict:'error' is the point of this test. Left at the default 'warn', a
  // separator KaTeX cannot typeset - fr-FR's U+202F - degrades to a console
  // message and a zero-width box in the reader's browser, and passes here.
  it.each(LOCALE_CODES.flatMap((code) => COMBINATIONS.map((b) => [code, label(b), b] as const)))(
    'compiles under KaTeX in %s (%s)',
    (code, _name, branches) => {
      buildFormulaSteps(BASE, branches, formattersFor(code)).forEach((step) => {
        expect(() =>
          katex.renderToString(step.math, { displayMode: true, throwOnError: true, strict: 'error' })
        ).not.toThrow();
      });
    }
  );

  // KaTeX draws a stretchy delimiter as an SVG path, and neither `throwOnError`
  // nor `strict: 'error'` looks at what it emitted. Asked to grow around an
  // underbraced term, 0.16.28 writes a `\rceil` path with a doubled moveto
  // (`MM319 602 ...`); the browser rejects it as invalid SVG and logs an error
  // for every affected formula. Fixed-size delimiters avoid it entirely.
  it.each(LOCALE_CODES.flatMap((code) => COMBINATIONS.map((b) => [code, label(b), b] as const)))(
    'emits no malformed SVG path in %s (%s)',
    (code, _name, branches) => {
      buildFormulaSteps(BASE, branches, formattersFor(code)).forEach((step) => {
        const html = katex.renderToString(step.math, { displayMode: true, throwOnError: true, strict: 'error' });
        const commands = [...html.matchAll(/ d="([^"]*)"/g)].map((m) => m[1]);
        // Two command letters back to back means one has no coordinates.
        const malformed = commands.filter((d) => /[A-Za-z]{2}/.test(d));
        expect(malformed, `step ${step.step}`).toEqual([]);
      });
    }
  );

  it('compiles a past-due estimate, which floors rather than ceils', () => {
    const pastDue: ModelVariables = { ...BASE, Q_pos: -420, D_rem: -4.42, D_est: -5, U_days: 1 };
    const steps = buildFormulaSteps(pastDue, COMBINATIONS[0], formattersFor('en'));

    expect(steps[4].math).toContain('\\lfloor');
    expect(steps[4].math).not.toContain('\\lceil');
    expect(() =>
      katex.renderToString(steps[4].math, { displayMode: true, throwOnError: true, strict: 'error' })
    ).not.toThrow();
  });

  it('keeps a negative value under its own brace instead of flipping the operator', () => {
    // E_proc goes negative whenever the published months already account for
    // more than the average rate predicted, and S_proc follows it down. The
    // sign belongs to the variable, so it stays under the brace - turning the
    // sum into a subtraction would report E_proc as a positive number.
    const negative: ModelVariables = { ...BASE, E_proc: -20146, S_proc: -16430, Q_pos: 32098 };
    const steps = buildFormulaSteps(negative, COMBINATIONS[0], formattersFor('en'));

    expect(steps[2].math).toContain('_{-20{,}146}');
    expect(steps[2].math).toContain(`+ \\underbrace{${SYMBOLS.eProc}}`);
    expect(steps[3].math).toContain('_{-16{,}430}');
    expect(steps[3].math).toContain(`- \\underbrace{${SYMBOLS.sProc}}`);
    steps.forEach((step) =>
      expect(() =>
        katex.renderToString(step.math, { displayMode: true, throwOnError: true, strict: 'error' })
      ).not.toThrow()
    );
  });

  it('tucks each value under its own symbol', () => {
    // Every step but the first carries at least one braced term; step 1 is
    // two quotients, which keep the paired symbolic/numeric form because an
    // underbrace inside a \frac pushes the fraction bar down.
    COMBINATIONS.forEach((branches) => {
      const steps = buildFormulaSteps(BASE, branches, PLAIN);
      steps
        .slice(1)
        .forEach((step) =>
          expect(step.math, `step ${step.step} on ${label(branches)} has no braced value`).toContain('\\underbrace')
        );
      expect(steps[0].math).not.toContain('\\underbrace');
    });
  });

  it('prints operands the rounded rows can be checked against', () => {
    // The ⌊·⌉ rows round the *sum*; a fractional operand rounded for display
    // made the visible arithmetic land one off the printed result
    // (⌊3,716 + 562⌉ = 4,277). Fractional operands keep their decimals.
    const steps = buildFormulaSteps(BASE, COMBINATIONS[0], PLAIN);

    // Step 3: S_proc = ⌊C_proc + E_proc⌉, checkable as printed.
    expect(steps[2].math).toContain(`${SYMBOLS.cProc}}_{3715.53}`);
    expect(steps[2].math).toContain(`${SYMBOLS.eProc}}_{561.71}`);
    expect(Math.round(3715.53 + 561.71)).toBe(BASE.S_proc);

    // Step 2: Q_app = ⌊C_prev + N_app − P_app⌉ — the fractional term keeps its
    // decimals, whole ones stay grouped integers.
    expect(steps[1].math).toContain(`${SYMBOLS.pApp}}_{632.26}`);
    expect(steps[1].math).toContain(`${SYMBOLS.nApp}}_{1400}`);
    expect(Math.round(14900 + 1400 - 632.26)).toBe(BASE.Q_app);
  });

  it('leaves behind none of the notation the old breakdown used', () => {
    COMBINATIONS.forEach((branches) => {
      buildFormulaSteps(BASE, branches, PLAIN).forEach((step) => {
        expect(step.math).not.toContain('\\lbrack');
        expect(step.math).not.toContain('\\rbrack');
      });
    });
  });
});

describe('escapeNumber', () => {
  it('turns separators KaTeX cannot typeset into a thin space', () => {
    // fr-FR groups with U+202F, pt-PT with U+00A0. KaTeX has a symbol for
    // neither and raises "Unrecognized Unicode character" on both.
    expect(escapeNumber(createFormatters('fr-FR').number(12345))).toBe('12\\,345');
    expect(escapeNumber(createFormatters('pt-PT').number(12345))).toBe('12\\,345');
  });

  it('makes a decimal comma part of the number rather than punctuation', () => {
    expect(escapeNumber(createFormatters('de-DE').decimal(1007.654, 2))).toBe('1.007{,}65');
    expect(escapeNumber(createFormatters('en-US').number(12345))).toBe('12{,}345');
  });

  it('emits nothing KaTeX would reject, in any registered locale', () => {
    LOCALE_CODES.forEach((code) => {
      const { number, decimal } = createFormatters(LOCALES[code].intlTag);
      [number(1234567), number(-1234), decimal(1007.654, 2), decimal(-0.5, 2)].forEach((value) => {
        const escaped = escapeNumber(value);
        expect(escaped, `${code}: ${JSON.stringify(value)}`).not.toMatch(/[    −]/);
        expect(() => katex.renderToString(escaped, { throwOnError: true, strict: 'error' })).not.toThrow();
      });
    });
  });
});
