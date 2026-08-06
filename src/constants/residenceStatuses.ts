// src/constants/residenceStatuses.ts
// Identity-only table for the e-Stat `cat01` (在留資格) dimension of the
// Foreign Residents table (0004019020). Display names live in the catalogue
// under `status.<value>` and are joined in by `useResidenceStatusOptions`
// (src/i18n/useDomainLabels.ts), same as every other domain constant here.
//
// The hierarchy below is CORRECTED, not copied from the payload's
// `@parentCode` metadata, which is wrong in two ways:
//
//   1. 技能実習 1号イ…3号ロ (1300-1350) are published with
//      `@parentCode: '1260'` (特定技能合計). Their real parent is 1290
//      (技能実習合計). Taking e-Stat at its word puts the Technical Intern
//      Training sub-statuses inside Specified Skilled Worker, which roughly
//      triples that category and empties the other.
//   2. 永住者 / 日本人の配偶者等 / 永住者の配偶者等 / 定住者 / 特別永住者
//      (1430-1470) carry no `@parentCode` at all, though they are level-2
//      members of 総数 like every other top-level status.

export type StatusGroup = 'work' | 'training' | 'study' | 'family' | 'residency' | 'other';

export interface ResidenceStatus {
  /** e-Stat cat01 code — the stable identifier and the catalogue key suffix. */
  value: string;
  /** Corrected parent code; null only for 総数 itself. */
  parent: string | null;
  /**
   * True for rows that are the sum of their children (総数 and the three
   * 合計 rollups). They are derivable, so the build prunes them from the
   * shipped payload and the client re-sums the leaves.
   */
  isAggregate?: boolean;
  /** Coarse family used as the middle ring of the status-mix hierarchy. */
  group: StatusGroup;
  /**
   * Statuses that were abolished or merged partway through the 2012-2025
   * span, so their series legitimately stops rather than going to zero:
   * 投資・経営 became 経営・管理, and 技術 + 人文知識・国際業務 merged into
   * 技術・人文知識・国際業務, both in 2015.
   */
  legacy?: boolean;
}

/** The 総数 row. Derivable from the leaves, so it is never shipped. */
export const STATUS_TOTAL = '1010';

export const residenceStatuses: ResidenceStatus[] = [
  { value: '1010', parent: null, isAggregate: true, group: 'other' }, // 総数
  { value: '1040', parent: '1010', group: 'work' }, // 教授
  { value: '1050', parent: '1010', group: 'work' }, // 芸術
  { value: '1060', parent: '1010', group: 'work' }, // 宗教
  { value: '1070', parent: '1010', group: 'work' }, // 報道
  { value: '1080', parent: '1010', isAggregate: true, group: 'work' }, // 高度専門職合計
  { value: '1090', parent: '1080', group: 'work' }, // 高度専門職1号イ
  { value: '1100', parent: '1080', group: 'work' }, // 高度専門職1号ロ
  { value: '1110', parent: '1080', group: 'work' }, // 高度専門職1号ハ
  { value: '1120', parent: '1080', group: 'work' }, // 高度専門職2号
  { value: '1130', parent: '1010', group: 'work', legacy: true }, // 投資・経営 (→ 経営・管理, 2015)
  { value: '1140', parent: '1010', group: 'work' }, // 経営・管理
  { value: '1150', parent: '1010', group: 'work' }, // 法律・会計業務
  { value: '1160', parent: '1010', group: 'work' }, // 医療
  { value: '1170', parent: '1010', group: 'work' }, // 研究
  { value: '1180', parent: '1010', group: 'work' }, // 教育
  { value: '1190', parent: '1010', group: 'work', legacy: true }, // 技術 (→ 技術・人文知識・国際業務, 2015)
  { value: '1200', parent: '1010', group: 'work', legacy: true }, // 人文知識・国際業務 (同上)
  { value: '1210', parent: '1010', group: 'work' }, // 技術・人文知識・国際業務
  { value: '1220', parent: '1010', group: 'work' }, // 企業内転勤
  { value: '1230', parent: '1010', group: 'work' }, // 介護
  { value: '1240', parent: '1010', group: 'work' }, // 興行
  { value: '1250', parent: '1010', group: 'work' }, // 技能
  { value: '1260', parent: '1010', isAggregate: true, group: 'work' }, // 特定技能合計
  { value: '1270', parent: '1260', group: 'work' }, // 特定技能1号
  { value: '1280', parent: '1260', group: 'work' }, // 特定技能2号
  { value: '1290', parent: '1010', isAggregate: true, group: 'training' }, // 技能実習合計
  // 1300-1350: parent corrected from the published 1260 to 1290 — see the note above.
  { value: '1300', parent: '1290', group: 'training' }, // 技能実習1号イ
  { value: '1310', parent: '1290', group: 'training' }, // 技能実習1号ロ
  { value: '1320', parent: '1290', group: 'training' }, // 技能実習2号イ
  { value: '1330', parent: '1290', group: 'training' }, // 技能実習2号ロ
  { value: '1340', parent: '1290', group: 'training' }, // 技能実習3号イ
  { value: '1350', parent: '1290', group: 'training' }, // 技能実習3号ロ
  { value: '1360', parent: '1010', group: 'study' }, // 文化活動
  { value: '1380', parent: '1010', group: 'study' }, // 留学
  { value: '1400', parent: '1010', group: 'training' }, // 研修
  { value: '1410', parent: '1010', group: 'family' }, // 家族滞在
  { value: '1420', parent: '1010', group: 'other' }, // 特定活動
  // 1430-1470: parent supplied — the payload leaves these five with none.
  { value: '1430', parent: '1010', group: 'residency' }, // 永住者
  { value: '1440', parent: '1010', group: 'family' }, // 日本人の配偶者等
  { value: '1450', parent: '1010', group: 'family' }, // 永住者の配偶者等
  { value: '1460', parent: '1010', group: 'residency' }, // 定住者
  { value: '1470', parent: '1010', group: 'residency' }, // 特別永住者
];

const byCode = new Map(residenceStatuses.map((status) => [status.value, status]));

export const residenceStatusByCode = (code: string): ResidenceStatus | undefined => byCode.get(code);

/** Codes the build prunes: every row that is the sum of its own children. */
export const STATUS_AGGREGATE_CODES = new Set(
  residenceStatuses.filter((status) => status.isAggregate).map((status) => status.value)
);

/** Rows safe to sum into a total: the leaves of the corrected hierarchy. */
export const summableStatuses = residenceStatuses.filter((status) => !status.isAggregate);

/** The order the status-mix chart draws its middle ring in. */
export const STATUS_GROUPS: StatusGroup[] = ['work', 'training', 'study', 'family', 'residency', 'other'];
