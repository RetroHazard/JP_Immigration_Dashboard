// src/utils/renderChangelog.tsx
import type React from 'react';

// Renders inline markdown spans: **bold**, `code`, and [text](url) links.
const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  const pattern = /\*\*(.+?)\*\*|`(.+?)`|\[([^\]]+)]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [full, bold, code, linkText, linkHref] = match;
    const key = `${keyPrefix}-${index++}`;

    if (bold !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold text-gray-800 dark:text-gray-100">
          {bold}
        </strong>,
      );
    } else if (code !== undefined) {
      nodes.push(
        <code key={key} className="rounded bg-gray-100 px-1 py-0.5 text-xxs dark:bg-gray-600 sm:text-xs">
          {code}
        </code>,
      );
    } else if (linkText !== undefined && linkHref !== undefined) {
      nodes.push(
        <a key={key} href={linkHref} className="hyperlink" target="_blank" rel="noreferrer">
          {linkText}
        </a>,
      );
    } else {
      nodes.push(full);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

interface ChangelogMonth {
  heading: string;
  sections: { heading: string; items: string[] }[];
}

// Parses a CHANGELOG.md whose body is a flat list of `## YYYY-MM` month
// headings, each containing `### Category` subheadings with `- ` bullets.
export const parseChangelog = (markdown: string): ChangelogMonth[] => {
  const months: ChangelogMonth[] = [];
  let currentMonth: ChangelogMonth | null = null;
  let currentSection: { heading: string; items: string[] } | null = null;

  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trimEnd();

    if (line.startsWith('## ')) {
      currentMonth = { heading: line.slice(3).trim(), sections: [] };
      currentSection = null;
      months.push(currentMonth);
    } else if (line.startsWith('### ') && currentMonth) {
      currentSection = { heading: line.slice(4).trim(), items: [] };
      currentMonth.sections.push(currentSection);
    } else if (line.startsWith('- ') && currentSection) {
      currentSection.items.push(line.slice(2).trim());
    }
  }

  return months;
};

export const ChangelogContent: React.FC<{ markdown: string }> = ({ markdown }) => {
  const months = parseChangelog(markdown);

  return (
    <div className="space-y-6">
      {months.map((month) => (
        <div key={month.heading}>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 sm:text-base">{month.heading}</h3>
          <div className="mt-2 space-y-3">
            {month.sections.map((section) => (
              <div key={section.heading}>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300 sm:text-sm">
                  {section.heading}
                </h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-gray-700 dark:text-gray-300 sm:text-sm">
                  {section.items.map((item, index) => (
                    <li key={`${section.heading}-${index}`}>{renderInline(item, `${section.heading}-${index}`)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
