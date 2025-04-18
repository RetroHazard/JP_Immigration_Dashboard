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
  createPrefecture('Hokkaido', '101010', 5381733, 83424),
  createPrefecture('Aomori', '101090', 1279594, 9646),
  createPrefecture('Iwate', '101090', 1244537, 15275),
  createPrefecture('Miyagi', '101090', 2333899, 7282),
  createPrefecture('Akita', '101090', 1023119, 11637),
  createPrefecture('Yamagata', '101090', 1123891, 9323),
  createPrefecture('Fukushima', '101090', 1914039, 13784),
  createPrefecture('Ibaraki', '101170', 2866145, 6097),
  createPrefecture('Tochigi', '101170', 1974255, 6408),
  createPrefecture('Gunma', '101170', 1973115, 6362),
  createPrefecture('Saitama', '101170', 7337330, 3797),
  createPrefecture('Chiba', '101170', 6222666, 5157),
  createPrefecture('Tokyo', '101170', 13929286, 2191),
  createPrefecture('Kanagawa', '101210', 9200166, 2416),
  createPrefecture('Niigata', '101170', 2230729, 12584),
  createPrefecture('Toyama', '101350', 1066328, 4247),
  createPrefecture('Ishikawa', '101350', 1137181, 4186),
  createPrefecture('Fukui', '101350', 778943, 4190),
  createPrefecture('Yamanashi', '101170', 817192, 4465),
  createPrefecture('Nagano', '101170', 2098804, 13561),
  createPrefecture('Gifu', '101350', 2003145, 10621),
  createPrefecture('Shizuoka', '101350', 3639390, 7777),
  createPrefecture('Aichi', '101350', 7552873, 5172),
  createPrefecture('Mie', '101350', 1815865, 5774),
  createPrefecture('Shiga', '101460', 1412916, 4017),
  createPrefecture('Kyoto', '101460', 2610353, 4612),
  createPrefecture('Osaka', '101460', 8824566, 1905),
  createPrefecture('Hyogo', '101460', 5466000, 8401),
  createPrefecture('Nara', '101460', 1340078, 3691),
  createPrefecture('Wakayama', '101460', 944320, 4725),
  createPrefecture('Tottori', '101580', 573441, 3507),
  createPrefecture('Shimane', '101580', 674346, 6708),
  createPrefecture('Okayama', '101580', 1901039, 7114),
  createPrefecture('Hiroshima', '101580', 2843990, 8479),
  createPrefecture('Yamaguchi', '101580', 1385262, 6112),
  createPrefecture('Tokushima', '101670', 728633, 4146),
  createPrefecture('Kagawa', '101670', 956347, 1876),
  createPrefecture('Ehime', '101670', 1345550, 5676),
  createPrefecture('Kochi', '101670', 728276, 7104),
  createPrefecture('Fukuoka', '101720', 5101556, 4986),
  createPrefecture('Saga', '101720', 814211, 2441),
  createPrefecture('Nagasaki', '101720', 1377187, 4132),
  createPrefecture('Kumamoto', '101720', 1786170, 7409),
  createPrefecture('Oita', '101720', 1139646, 6340),
  createPrefecture('Miyazaki', '101720', 1104069, 7735),
  createPrefecture('Kagoshima', '101720', 1648177, 9187),
  createPrefecture('Okinawa', '101740', 1453313, 2281),
];
// TODO: Setup system to automatically update Population values when necessary.
