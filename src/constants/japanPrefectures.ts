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
  createPrefecture('Hokkaido', '101010', 5038741, 83422),
  createPrefecture('Aomori', '101090', 1163739, 9645),
  createPrefecture('Iwate', '101090', 1138978, 15275),
  createPrefecture('Miyagi', '101090', 2253196, 7282),
  createPrefecture('Akita', '101090', 891374, 11638),
  createPrefecture('Yamagata', '101090', 1015176, 9323),
  createPrefecture('Fukushima', '101090', 1745608, 13784),
  createPrefecture('Ibaraki', '101170', 2810305, 6098),
  createPrefecture('Tochigi', '101170', 1881790, 6408),
  createPrefecture('Gunma', '101170', 1894171, 6362),
  createPrefecture('Saitama', '101170', 7329078, 3798),
  createPrefecture('Chiba', '101170', 6252001, 5156),
  createPrefecture('Tokyo', '101170', 14175329, 2200),
  createPrefecture('Kanagawa', '101210', 9223249, 2417),
  createPrefecture('Niigata', '101170', 2104634, 12584),
  createPrefecture('Toyama', '101350', 1002796, 4248),
  createPrefecture('Ishikawa', '101350', 1101838, 4186),
  createPrefecture('Fukui', '101350', 742812, 4191),
  createPrefecture('Yamanashi', '101170', 792333, 4465),
  createPrefecture('Nagano', '101170', 1993212, 13562),
  createPrefecture('Gifu', '101350', 1918931, 10621),
  createPrefecture('Shizuoka', '101350', 3528357, 7777),
  createPrefecture('Aichi', '101350', 7465261, 5173),
  createPrefecture('Mie', '101350', 1708468, 5774),
  createPrefecture('Shiga', '101460', 1398963, 4017),
  createPrefecture('Kyoto', '101460', 2525561, 4612),
  createPrefecture('Osaka', '101460', 8752801, 1905),
  createPrefecture('Hyogo', '101490', 5335866, 8401),
  createPrefecture('Nara', '101460', 1287541, 3691),
  createPrefecture('Wakayama', '101460', 878994, 4725),
  createPrefecture('Tottori', '101580', 532349, 3507),
  createPrefecture('Shimane', '101580', 643770, 6708),
  createPrefecture('Okayama', '101580', 1832270, 7114),
  createPrefecture('Hiroshima', '101580', 2711264, 8478),
  createPrefecture('Yamaguchi', '101580', 1275161, 6113),
  createPrefecture('Tokushima', '101670', 680911, 4147),
  createPrefecture('Kagawa', '101670', 916135, 1877),
  createPrefecture('Ehime', '101670', 1275161, 5676),
  createPrefecture('Kochi', '101670', 656151, 7102),
  createPrefecture('Fukuoka', '101720', 5088262, 4988),
  createPrefecture('Saga', '101720', 792333, 2441),
  createPrefecture('Nagasaki', '101720', 1250400, 4131),
  createPrefecture('Kumamoto', '101720', 1696087, 7409),
  createPrefecture('Oita', '101720', 1089458, 6341),
  createPrefecture('Miyazaki', '101720', 1027557, 7734),
  createPrefecture('Kagoshima', '101720', 1535145, 9186),
  createPrefecture('Okinawa', '101740', 1460864, 2282),
];
// Population and area data as of October 1, 2024
// Source: Statistics Bureau of Japan (stat.go.jp) - Official Population Estimates
// Area figures are from the Geospatial Information Authority of Japan
