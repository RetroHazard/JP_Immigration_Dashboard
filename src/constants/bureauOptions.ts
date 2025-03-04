// src/constants/bureauOptions.ts

interface BureauOption {
  value: string;
  label: string;
  short: string;
  coordinates?: [number, number];
  border?: string;
  background?: string;
}

// Bureau Colors are based on the color palette of its Prefecture's flag
// https://www.flagcolorcodes.com/

export const bureauOptions: BureauOption[] = [
  { value: 'all', label: 'Nationwide', short: 'ALL' },
  {
    value: '101720',
    label: 'Fukuoka',
    short: 'FUK',
    coordinates: [130.38832, 33.59066],
    border: 'rgba(0,104,178, 1)',
    background: 'rgba(0,104,178, 0.75)',
  },
  {
    value: '101580',
    label: 'Hiroshima',
    short: 'HIJ',
    coordinates: [132.46367, 34.40062],
    border: 'rgba(139, 0, 0, 1)',
    background: 'rgba(139, 0, 0, 0.75)',
  },
  {
    value: '101350',
    label: 'Nagoya',
    short: 'NAG',
    coordinates: [136.86337, 35.11406],
    border: 'rgba(180, 65, 80, 1)',
    background: 'rgba(180, 65, 80, 0.75)',
  },
  {
    value: '101740',
    label: 'Naha',
    short: 'OKA',
    coordinates: [127.6867, 26.2078],
    border: 'rgba(0, 0, 0, 1)',
    background: 'rgba(235, 235, 235, 0.75)',
  },
  {
    value: '101460',
    label: 'Osaka',
    short: 'ITM',
    coordinates: [135.41185, 34.64141],
    border: 'rgba(51, 65, 154, 1)',
    background: 'rgba(51, 65, 154, 0.75)',
  },
  {
    value: '101010',
    label: 'Sapporo',
    short: 'CTS',
    coordinates: [141.33889, 43.05975],
    border: 'rgba(47, 48, 78, 1)',
    background: 'rgba(47, 48, 78, 0.75)',
  },
  {
    value: '101090',
    label: 'Sendai',
    short: 'SDJ',
    coordinates: [140.89861, 38.2626],
    border: 'rgba(0, 89, 76, 1)',
    background: 'rgba(0, 89, 76, 0.75)',
  },
  {
    value: '101670',
    label: 'Takamatsu',
    short: 'TAK',
    coordinates: [134.04924, 34.34798],
    border: 'rgba(85, 107, 47, 1)',
    background: 'rgba(85, 107, 47, 0.75)',
  },
  {
    value: '101170',
    label: 'Tokyo',
    short: 'TYO',
    coordinates: [139.75653, 35.62823],
    border: 'rgba(75, 0, 130, 1)',
    background: 'rgba(75, 0, 130, 0.75)',
  },
  {
    value: '101210',
    label: 'Yokohama',
    short: 'YOK',
    coordinates: [139.6483, 35.38773],
    border: 'rgba(255, 100, 0, 1)',
    background: 'rgba(255, 100, 0, 0.75)',
  },
  {
    value: '101190',
    label: 'Narita Airport',
    short: 'NRT',
    coordinates: [140.38439, 35.77004],
    border: 'rgba(0, 0, 0, 0.5)',
    background: 'rgba(26, 21, 163, 0.35)',
  },
  {
    value: '101200',
    label: 'Haneda Airport',
    short: 'HND',
    coordinates: [139.78609, 35.55032],
    border: 'rgba(0, 0, 0, 0.5)',
    background: 'rgba(75, 0, 130, 0.35)',
  },
  {
    value: '101480',
    label: 'Kansai Airport',
    short: 'KIX',
    coordinates: [135.23645, 34.43191],
    border: 'rgba(0, 0, 0, 0.5)',
    background: 'rgba(51, 65, 154, 0.35)',
  },
  {
    value: '101370',
    label: 'Chubu Airport',
    short: 'NGO',
    coordinates: [136.81064, 34.85724],
    border: 'rgba(0, 0, 0, 0.5)',
    background: 'rgba(180, 65, 80, 0.35)',
  },
];