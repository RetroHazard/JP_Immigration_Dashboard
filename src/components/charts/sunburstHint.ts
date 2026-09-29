// Bklit's SunburstHint falls back to a hardcoded English string when nothing is
// selected, so both sunburst views pass a catalogue key from here instead.
// The wording differs by pointer type: on touch a segment takes two taps
// (inspect, then zoom) where a mouse takes a hover and a click.
import type { DictionaryKey } from '../../i18n/types';

export const idleSunburstHint = (focusDepth: number, coarsePointer: boolean): DictionaryKey => {
  if (focusDepth > 0) {
    return coarsePointer ? 'chart.sunburst.zoomOutTap' : 'chart.sunburst.zoomOutClick';
  }
  return coarsePointer ? 'chart.sunburst.hintTap' : 'chart.sunburst.hintClick';
};
