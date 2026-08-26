// src/utils/renderChangelog.tsx
import { ChevronRight } from 'lucide-react';
import type React from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
        <strong key={key} className="font-semibold text-foreground">
          {bold}
        </strong>
      );
    } else if (code !== undefined) {
      nodes.push(
        <code key={key} className="rounded bg-muted px-1 py-0.5 text-xxs sm:text-xs">
          {code}
        </code>
      );
    } else if (linkText !== undefined && linkHref !== undefined) {
      nodes.push(
        <a key={key} href={linkHref} className="hyperlink" target="_blank" rel="noreferrer">
          {linkText}
        </a>
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

interface ChangelogItem {
  text: string;
  children: string[];
}

interface ChangelogSection {
  heading: string;
  items: ChangelogItem[];
}

export interface ChangelogMonth {
  heading: string;
  sections: ChangelogSection[];
}

// Parses a CHANGELOG.md whose body is a flat list of `## YYYY-MM` month
// headings, each containing `### Category` subheadings with `- ` bullets.
// A bullet indented by two spaces (`  - `) nests under the preceding
// top-level bullet, so one release/PR can list each change as its own line.
export const parseChangelog = (markdown: string): ChangelogMonth[] => {
  const months: ChangelogMonth[] = [];
  let currentMonth: ChangelogMonth | null = null;
  let currentSection: ChangelogSection | null = null;
  let currentItem: ChangelogItem | null = null;

  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trimEnd();

    if (line.startsWith('## ')) {
      currentMonth = { heading: line.slice(3).trim(), sections: [] };
      currentSection = null;
      currentItem = null;
      months.push(currentMonth);
    } else if (line.startsWith('### ') && currentMonth) {
      currentSection = { heading: line.slice(4).trim(), items: [] };
      currentItem = null;
      currentMonth.sections.push(currentSection);
    } else if (/^ {2}- /.test(line) && currentItem) {
      currentItem.children.push(line.trim().slice(2).trim());
    } else if (line.startsWith('- ') && currentSection) {
      currentItem = { text: line.slice(2).trim(), children: [] };
      currentSection.items.push(currentItem);
    }
  }

  return months;
};

interface ChangelogContentProps {
  months: ChangelogMonth[];
  openMonths: readonly string[];
  onToggleMonth: (heading: string) => void;
}

// Which months are open is the caller's business: the expand/collapse-all
// control lives outside the modal's scroll container, so it and the headers
// below have to read the same state.
export const ChangelogContent: React.FC<ChangelogContentProps> = ({ months, openMonths, onToggleMonth }) => (
  <div className="space-y-4">
    {months.map((month) => {
      const isOpen = openMonths.includes(month.heading);

      return (
        <Collapsible key={month.heading} open={isOpen} onOpenChange={() => onToggleMonth(month.heading)}>
          {/* The heading wraps the trigger rather than the other way round: a
              button may not contain an h3, and screen-reader heading
              navigation still needs the h3 to survive. */}
          <h3 className="text-sm font-bold text-foreground sm:text-base">
            <CollapsibleTrigger className="flex w-full items-center gap-1.5 rounded text-left transition-opacity hover:opacity-80">
              <ChevronRight
                className={`size-3.5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-90' : ''}`}
                aria-hidden="true"
              />
              {month.heading}
            </CollapsibleTrigger>
          </h3>
          <CollapsibleContent>
            <div className="mt-2 space-y-3 pb-2 pl-5">
              {month.sections.map((section) => (
                <div key={section.heading}>
                  <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:text-sm">
                    {section.heading}
                  </h4>
                  <ul className="mt-1 list-disc space-y-1.5 pl-5 text-xs text-secondary-foreground sm:text-sm">
                    {section.items.map((item, index) => {
                      const itemKey = `${month.heading}-${section.heading}-${index}`;
                      return (
                        <li key={itemKey}>
                          {renderInline(item.text, itemKey)}
                          {item.children.length > 0 && (
                            <ul className="mt-1 list-[circle] space-y-1 pl-5 text-muted-foreground">
                              {item.children.map((child, childIndex) => {
                                const childKey = `${itemKey}-${childIndex}`;
                                return <li key={childKey}>{renderInline(child, childKey)}</li>;
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    })}
  </div>
);
