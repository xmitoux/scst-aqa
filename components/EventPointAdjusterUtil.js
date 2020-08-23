import {
  DIFFICULTY_ADVANCEDPLUS,
  DIFFICULTY_ADVANCED,
  DIFFICULTY_INTERMEDIATE,
  DIFFICULTY_BEGINNER,
  CLEAR_RANK_S,
  CLEAR_RANK_A,
  CLEAR_RANK_B,
  CLEAR_RANK_C,
  CLEAR_RANK_D,
  clearRankValuesDesc,
} from '@/util/const/common';
import BigNumber from 'bignumber.js';

export const eventPointDefinitions = {
  [DIFFICULTY_ADVANCEDPLUS]: {
    [CLEAR_RANK_S]: 875,
    [CLEAR_RANK_A]: 860,
    [CLEAR_RANK_B]: 845,
    [CLEAR_RANK_C]: 830,
    [CLEAR_RANK_D]: 815,
  },

  [DIFFICULTY_ADVANCED]: {
    [CLEAR_RANK_S]: 600,
    [CLEAR_RANK_A]: 581,
    [CLEAR_RANK_B]: 562,
    [CLEAR_RANK_C]: 543,
    [CLEAR_RANK_D]: 525,
  },

  [DIFFICULTY_INTERMEDIATE]: {
    [CLEAR_RANK_S]: 405,
    [CLEAR_RANK_A]: 390,
    [CLEAR_RANK_B]: 375,
    [CLEAR_RANK_C]: 360,
    [CLEAR_RANK_D]: 345,
  },

  [DIFFICULTY_BEGINNER]: {
    [CLEAR_RANK_S]: 275,
    [CLEAR_RANK_A]: 262,
    [CLEAR_RANK_B]: 250,
    [CLEAR_RANK_C]: 237,
    [CLEAR_RANK_D]: 225,
  },
};

export class EventPoint {
  constructor(difficulty, clearRank, value) {
    this.difficulty = difficulty;
    this.clearRank = clearRank;
    this.value = value;
  }
}

export class DifficultyClearRank {
  constructor() {
    this[DIFFICULTY_ADVANCEDPLUS] = clearRankValuesDesc.concat();
    this[DIFFICULTY_ADVANCED] = clearRankValuesDesc.concat();
    this[DIFFICULTY_INTERMEDIATE] = clearRankValuesDesc.concat();
    this[DIFFICULTY_BEGINNER] = clearRankValuesDesc.concat();
  }

  /**
   *難易度が未選択
   */
  isEmpty() {
    return (
      this[DIFFICULTY_ADVANCEDPLUS].length === 0 &&
      this[DIFFICULTY_ADVANCED].length === 0 &&
      this[DIFFICULTY_INTERMEDIATE].length === 0 &&
      this[DIFFICULTY_BEGINNER].length === 0
    );
  }
}

export const prepareEventPoints = (
  targetDifficultyClearRank,
  specialAttackPercent
) => {
  const eventPoints = [];

  // 特攻(%)から倍率を計算
  const specialAttackRatio = BigNumber(1).plus(
    BigNumber(specialAttackPercent).div(100)
  );

  // 対象のイベントポイント全てに特攻を反映する
  for (const targetDifficulty in targetDifficultyClearRank) {
    // for-inだと順序が不定かもしれないがソートするのでどうでもいい
    for (const targetClearRank of targetDifficultyClearRank[targetDifficulty]) {
      // 難易度・クリアランクからイベントポイントを参照
      const eventPoint =
        eventPointDefinitions[targetDifficulty][targetClearRank];

      const eventPointSpecialAttack = BigNumber(eventPoint)
        .times(specialAttackRatio)
        .integerValue(BigNumber.ROUND_DOWN) // 小数点以下切り捨て
        .toNumber();

      eventPoints.push(
        new EventPoint(
          targetDifficulty,
          targetClearRank,
          eventPointSpecialAttack
        )
      );
    }
  }

  // DPで難易度・クリアランクが高いものを優先的に選ぶために昇順ソート
  eventPoints.sort((a, b) => a.value - b.value);

  return eventPoints;
};
