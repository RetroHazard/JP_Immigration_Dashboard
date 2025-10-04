// src/constants/japanPrefectures.ts
// noinspection SpellCheckingInspection

interface Prefecture {
  name: string;
  bureau: string;
  population: number;
  area: number;
  density: string;
}

const createPrefecture = (name: string, bureau: string, population: number, area: number): Prefecture => ({
  name,
  bureau,
  population,
  area,
  get density() {
    return (this.population / this.area).toFixed(2);
  },
});

export const japanPrefectures: Prefecture[] = [
  createPrefecture('Hokkaido', '101010', 5041491, 83422),
  createPrefecture('Aomori', '101090', 1164710, 9645),
  createPrefecture('Iwate', '101090', 1144407, 15275),
  createPrefecture('Miyagi', '101090', 2247139, 7282),
  createPrefecture('Akita', '101090', 896324, 11638),
  createPrefecture('Yamagata', '101090', 1010776, 9323),
  createPrefecture('Fukushima', '101090', 1742317, 13784),
  createPrefecture('Ibaraki', '101170', 2810049, 6098),
  createPrefecture('Tochigi', '101170', 1882342, 6408),
  createPrefecture('Gunma', '101170', 1889425, 6362),
  createPrefecture('Saitama', '101170', 7329258, 3798),
  createPrefecture('Chiba', '101170', 6275423, 5156),
  createPrefecture('Tokyo', '101170', 14192184, 2200),
  createPrefecture('Kanagawa', '101210', 9223695, 2417),
  createPrefecture('Niigata', '101170', 2098804, 12584),
  createPrefecture('Toyama', '101350', 995955, 4248),
  createPrefecture('Ishikawa', '101350', 1098531, 4186),
  createPrefecture('Fukui', '101350', 738691, 4191),
  createPrefecture('Yamanashi', '101170', 790215, 4465),
  createPrefecture('Nagano', '101170', 1988462, 13562),
  createPrefecture('Gifu', '101350', 1913076, 10621),
  createPrefecture('Shizuoka', '101350', 3524160, 7777),
  createPrefecture('Aichi', '101350', 7465250, 5173),
  createPrefecture('Mie', '101350', 1711370, 5774),
  createPrefecture('Shiga', '101460', 1400812, 4017),
  createPrefecture('Kyoto', '101460', 2521262, 4612),
  createPrefecture('Osaka', '101460', 8770315, 1905),
  createPrefecture('Hyogo', '101490', 5336665, 8401),
  createPrefecture('Nara', '101460', 1285094, 3691),
  createPrefecture('Wakayama', '101460', 879617, 4725),
  createPrefecture('Tottori', '101580', 531085, 3507),
  createPrefecture('Shimane', '101580', 641396, 6708),
  createPrefecture('Okayama', '101580', 1830621, 7114),
  createPrefecture('Hiroshima', '101580', 2716733, 8478),
  createPrefecture('Yamaguchi', '101580', 1279601, 6113),
  createPrefecture('Tokushima', '101670', 685357, 4147),
  createPrefecture('Kagawa', '101670', 917058, 1877),
  createPrefecture('Ehime', '101670', 1275349, 5676),
  createPrefecture('Kochi', '101670', 655698, 7102),
  createPrefecture('Fukuoka', '101720', 5097710, 4988),
  createPrefecture('Saga', '101720', 787675, 2441),
  createPrefecture('Nagasaki', '101720', 1250705, 4131),
  createPrefecture('Kumamoto', '101720', 1696144, 7409),
  createPrefecture('Oita', '101720', 1085198, 6341),
  createPrefecture('Miyazaki', '101720', 1031344, 7734),
  createPrefecture('Kagoshima', '101720', 1530203, 9186),
  createPrefecture('Okinawa', '101740', 1467065, 2282),
];
// TODO: Setup system to automatically update Population values when necessary.
