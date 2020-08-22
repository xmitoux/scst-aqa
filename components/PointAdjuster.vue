<template>
  <div>
    <v-btn @click="debug">debug</v-btn>
    <v-text-field
      v-model="currentEventPointString"
      type="tel"
      label="現在Pt"
      outlined
      clearable
    ></v-text-field>
    <v-text-field
      v-model="targetEventPointString"
      type="tel"
      label="目標Pt"
      outlined
      clearable
    ></v-text-field>
    <v-text-field
      v-model="requiredEventPoint"
      label="必要Pt"
      outlined
      disabled
    ></v-text-field>

    <v-container fluid>
      <v-row>
        <v-col cols="3">
          <v-checkbox
            v-model="targetDifficultyValues"
            color="red lighten-1"
            :label="getDifficultyString(DIFFICULTY_ADVANCEDPLUS)"
            :value="DIFFICULTY_ADVANCEDPLUS"
          />
        </v-col>
        <v-col cols="3">
          <v-checkbox
            v-model="targetDifficultyValues"
            color="amber"
            :label="getDifficultyString(DIFFICULTY_ADVANCED)"
            :value="DIFFICULTY_ADVANCED"
          />
        </v-col>
        <v-col cols="3">
          <v-checkbox
            v-model="targetDifficultyValues"
            color="green accent-3"
            :label="getDifficultyString(DIFFICULTY_INTERMEDIATE)"
            :value="DIFFICULTY_INTERMEDIATE"
          />
        </v-col>
        <v-col cols="3">
          <v-checkbox
            v-model="targetDifficultyValues"
            color="blue"
            :label="getDifficultyString(DIFFICULTY_BEGINNER)"
            :value="DIFFICULTY_BEGINNER"
          />
        </v-col>
      </v-row>
    </v-container>

    <v-text-field
      v-model="specialAttackPercent"
      type="tel"
      label="特攻(%)"
      outlined
      clearable
      maxlength="3"
    ></v-text-field>

    <v-btn color="primary" @click="calculateRequiredLive()">計算</v-btn>

    <v-dialog v-model="dialogInvalid">
      <v-card>
        <v-card-title />
        <v-card-text>{{ dialogInvalidMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="dialogInvalid = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogRequiredLives" persistent>
      <v-card>
        <v-simple-table dense>
          <template v-slot>
            <thead>
              <tr>
                <th class="text-center">難易度</th>
                <th class="text-center">クリアランク</th>
                <th class="text-center">獲得Pt</th>
                <th class="text-center">回数</th>
                <th class="text-center">合計Pt</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="requiredLive in requiredLives"
                :key="requiredLive.eventPoint"
              >
                <td :style="getDifficultyColor(requiredLive.difficulty)">
                  {{ getDifficultyString(requiredLive.difficulty) }}
                </td>
                <td>
                  <v-chip :color="getClearRankColor(requiredLive.clearRank)">{{
                    getClearRankString(requiredLive.clearRank)
                  }}</v-chip>
                </td>
                <td>{{ requiredLive.eventPoint }}</td>
                <td>{{ requiredLive.liveN }}</td>
                <td>{{ requiredLive.eventPointSum }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialogRequiredLives = false">CLOSE</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js';

const DIFFICULTY_BEGINNER = 0;
const DIFFICULTY_INTERMEDIATE = 1;
const DIFFICULTY_ADVANCED = 2;
const DIFFICULTY_ADVANCEDPLUS = 3;

const CLEAR_RANK_D = 0;
const CLEAR_RANK_C = 1;
const CLEAR_RANK_B = 2;
const CLEAR_RANK_A = 3;
const CLEAR_RANK_S = 4;

class EventPoint {
  constructor(difficulty, clearRank, value) {
    this.difficulty = difficulty;
    this.clearRank = clearRank;
    this.value = value;
  }
}

const EVENT_POINTS_BEGINNER = [
  new EventPoint(DIFFICULTY_BEGINNER, CLEAR_RANK_D, 225),
  new EventPoint(DIFFICULTY_BEGINNER, CLEAR_RANK_C, 237),
  new EventPoint(DIFFICULTY_BEGINNER, CLEAR_RANK_B, 250),
  new EventPoint(DIFFICULTY_BEGINNER, CLEAR_RANK_A, 262),
  new EventPoint(DIFFICULTY_BEGINNER, CLEAR_RANK_S, 275),
];

const EVENT_POINTS_INTERMEDIATE = [
  new EventPoint(DIFFICULTY_INTERMEDIATE, CLEAR_RANK_D, 345),
  new EventPoint(DIFFICULTY_INTERMEDIATE, CLEAR_RANK_C, 360),
  new EventPoint(DIFFICULTY_INTERMEDIATE, CLEAR_RANK_B, 375),
  new EventPoint(DIFFICULTY_INTERMEDIATE, CLEAR_RANK_A, 390),
  new EventPoint(DIFFICULTY_INTERMEDIATE, CLEAR_RANK_S, 405),
];

const EVENT_POINTS_ADVANCED = [
  new EventPoint(DIFFICULTY_ADVANCED, CLEAR_RANK_D, 525),
  new EventPoint(DIFFICULTY_ADVANCED, CLEAR_RANK_C, 543),
  new EventPoint(DIFFICULTY_ADVANCED, CLEAR_RANK_B, 562),
  new EventPoint(DIFFICULTY_ADVANCED, CLEAR_RANK_A, 581),
  new EventPoint(DIFFICULTY_ADVANCED, CLEAR_RANK_S, 600),
];

const EVENT_POINTS_ADVANCEDPLUS = [
  new EventPoint(DIFFICULTY_ADVANCEDPLUS, CLEAR_RANK_D, 815),
  new EventPoint(DIFFICULTY_ADVANCEDPLUS, CLEAR_RANK_C, 830),
  new EventPoint(DIFFICULTY_ADVANCEDPLUS, CLEAR_RANK_B, 845),
  new EventPoint(DIFFICULTY_ADVANCEDPLUS, CLEAR_RANK_A, 860),
  new EventPoint(DIFFICULTY_ADVANCEDPLUS, CLEAR_RANK_S, 875),
];

const importData = () => ({
  DIFFICULTY_BEGINNER,
  DIFFICULTY_INTERMEDIATE,
  DIFFICULTY_ADVANCED,
  DIFFICULTY_ADVANCEDPLUS,
});

const isInteger = (numString) => {
  return (
    !!numString &&
    numString.trim().length > 0 &&
    Number.isInteger(Number(numString))
  );
};

const parseInteger = (numString) => {
  return isInteger(numString) ? Number(numString) : null;
};

const prepareEventPoints = (targetDifficultyValues, specialAttackPercent) => {
  const eventPoints = [];

  if (targetDifficultyValues.includes(0)) {
    eventPoints.push(
      ...multiplySpecialAttackPercent(
        EVENT_POINTS_BEGINNER,
        specialAttackPercent
      )
    );
  }

  if (targetDifficultyValues.includes(1)) {
    eventPoints.push(
      ...multiplySpecialAttackPercent(
        EVENT_POINTS_INTERMEDIATE,
        specialAttackPercent
      )
    );
  }

  if (targetDifficultyValues.includes(2)) {
    eventPoints.push(
      ...multiplySpecialAttackPercent(
        EVENT_POINTS_ADVANCED,
        specialAttackPercent
      )
    );
  }

  if (targetDifficultyValues.includes(3)) {
    eventPoints.push(
      ...multiplySpecialAttackPercent(
        EVENT_POINTS_ADVANCEDPLUS,
        specialAttackPercent
      )
    );
  }

  return eventPoints;
};

const multiplySpecialAttackPercent = (eventPoints, specialAttackPercent) => {
  const specialAttackRatio = BigNumber(1).plus(
    BigNumber(specialAttackPercent).div(100)
  );

  return eventPoints.map(({ difficulty, clearRank, value }) => ({
    value: BigNumber(value)
      .times(specialAttackRatio)
      .integerValue(BigNumber.ROUND_DOWN) // 小数点以下切り捨て
      .toNumber(),
    difficulty,
    clearRank,
  }));
};

const aggregateDPResults = (dpResults, targetDifficultyValues) => {
  const requiredLives = [];

  // 難易度降順で集計するため選択された難易度をソート
  const targetDifficultyValuesDesc = targetDifficultyValues
    .concat() // ソートで破壊しないようコピー
    .sort((a, b) => b - a);

  // 難易度ごとに結果を集計
  for (const difficultyValue of targetDifficultyValuesDesc) {
    const resultsFilteredByDifficulty = dpResults.filter(
      (eventPoint) => eventPoint.difficulty === difficultyValue
    );

    // クリアランクごと(降順)に結果を集計
    for (
      let tmpClearRank = CLEAR_RANK_S;
      tmpClearRank >= CLEAR_RANK_D;
      tmpClearRank--
    ) {
      const results = resultsFilteredByDifficulty.filter(
        (eventPoint) => eventPoint.clearRank === tmpClearRank
      );

      const liveN = results.length;
      if (liveN > 0) {
        const result = {
          difficulty: difficultyValue,
          clearRank: tmpClearRank,
          eventPoint: results[0].value,
          liveN,
          eventPointSum: results[0].value * liveN,
        };

        requiredLives.push(result);
      }
    }
  }

  return requiredLives;
};

export default {
  name: 'PointAdjuster',

  data() {
    return {
      currentEventPointString: '0',
      targetEventPointString: '919919',
      specialAttackPercent: '0',
      targetDifficultyValues: [],
      selectedEvnetPoints: [],
      dpResults: [],
      requiredLives: [],
      dialogInvalid: false,
      dialogInvalidMessage: '',
      dialogRequiredLives: false,
      ...importData(),
    };
  },

  computed: {
    requiredEventPoint() {
      const currentEventPoint = parseInteger(this.currentEventPointString);
      const targetEventPoint = parseInteger(this.targetEventPointString);
      if (currentEventPoint !== null && targetEventPoint !== null) {
        const requiredEventPoint = targetEventPoint - currentEventPoint;
        return requiredEventPoint >= 0 ? requiredEventPoint : '';
      } else {
        return '';
      }
    },
  },

  created() {
    // 初期表示時は難易度全選択
    [
      DIFFICULTY_BEGINNER,
      DIFFICULTY_INTERMEDIATE,
      DIFFICULTY_ADVANCED,
      DIFFICULTY_ADVANCEDPLUS,
    ].forEach((difficultyValue) =>
      this.targetDifficultyValues.push(difficultyValue)
    );
  },

  methods: {
    debug() {
      const hoge = { fuga: 'foo' };
      const str = 'fuga';
      console.log(hoge[str]);
    },

    showInvalidDialog(message) {
      this.dialogInvalid = true;
      this.dialogInvalidMessage = message;
    },

    calculateRequiredLive() {
      if (!this.validateInput()) {
        return;
      }

      const eventPoints = prepareEventPoints(
        this.targetDifficultyValues,
        parseInteger(this.specialAttackPercent)
      );

      const dpResults = this.calculateDP(eventPoints, this.requiredEventPoint);
      if (dpResults.length === 0) {
        this.showInvalidDialog('計算の結果、ポイント調整は不可能でした。');
        return;
      }

      this.requiredLives = aggregateDPResults(
        dpResults,
        this.targetDifficultyValues
      );

      this.dialogRequiredLives = true;
    },

    validateInput() {
      const currentEventPoint = parseInteger(this.currentEventPointString);
      const targetEventPoint = parseInteger(this.targetEventPointString);
      if (
        [currentEventPoint, targetEventPoint].some(
          (point) => point === null || point < 0
        )
      ) {
        this.showInvalidDialog('Ptには0以上の整数を入力してください。');
        return false;
      }

      if (targetEventPoint <= currentEventPoint) {
        this.showInvalidDialog('目標Ptは現在Ptより大きく設定してください。');
        return false;
      }

      if (this.targetDifficultyValues.length === 0) {
        this.showInvalidDialog('難易度を選択してください。');
        return false;
      }

      const specialAttackPercent = parseInteger(this.specialAttackPercent);
      if (
        specialAttackPercent === null ||
        !(specialAttackPercent >= 0 && specialAttackPercent <= 999)
      ) {
        this.showInvalidDialog('特攻(%)には0～999の整数を入力してください。');
        return false;
      }

      return true;
    },

    getDifficultyString(difficultyValue) {
      switch (difficultyValue) {
        case DIFFICULTY_BEGINNER:
          return '初級';

        case DIFFICULTY_INTERMEDIATE:
          return '中級';

        case DIFFICULTY_ADVANCED:
          return '上級';

        case DIFFICULTY_ADVANCEDPLUS:
          return '上級+';

        default:
          return '不明な難易度';
      }
    },

    getDifficultyColor(difficultyValue) {
      switch (difficultyValue) {
        case DIFFICULTY_BEGINNER:
          return { color: 'white', background: '#2196F3' };

        case DIFFICULTY_INTERMEDIATE:
          return { color: 'white', background: '#00E676' };

        case DIFFICULTY_ADVANCED:
          return { color: 'white', background: '#FFC107' };

        case DIFFICULTY_ADVANCEDPLUS:
          return { color: 'white', background: '#F44336' };

        default:
          return { color: 'white', background: '#212121' };
      }
    },

    getClearRankString(clearRankValue) {
      switch (clearRankValue) {
        case CLEAR_RANK_D:
          return 'D';

        case CLEAR_RANK_C:
          return 'C';

        case CLEAR_RANK_B:
          return 'B';

        case CLEAR_RANK_A:
          return 'A';

        case CLEAR_RANK_S:
          return 'S';

        default:
          return '不明なクリアランク';
      }
    },

    getClearRankColor(clearRankValue) {
      switch (clearRankValue) {
        case CLEAR_RANK_D:
          return '#A5D6A7';
        // return { background: "white", color: "#A5D6A7" };

        case CLEAR_RANK_C:
          return '#FFAB91';
        // return { background: "white", color: "#D84315" };

        case CLEAR_RANK_B:
          return '#EEEEEE';
        // return { background: "white", color: "#CFD8DC" };

        case CLEAR_RANK_A:
          return '#FFF59D';
        // return { background: "white", color: "#FFF59D" };

        case CLEAR_RANK_S:
          return '#E1BEE7';
        // return { background: "white", color: "#E1BEE7" };

        default:
          return '#9E9E9E';
        // return { background: "white", color: "#9E9E9E" };
      }
    },

    calculateDP(eventPoints, W) {
      const eventPointN = eventPoints.length;

      // DP初期化
      const dp = [...Array(W + 1)].fill(Number.MAX_SAFE_INTEGER);
      dp[0] = 0;

      // 復元用テーブル
      const prev = Array(W + 1);

      // DP
      // 参考: https://qiita.com/drken/items/ace3142967c4f01d42e9
      for (let i = 0; i < eventPointN; i++) {
        for (let w = eventPoints[i].value; w <= W; w++) {
          const liveN = dp[w - eventPoints[i].value] + 1;
          if (liveN <= dp[w]) {
            dp[w] = liveN;
            prev[w] = w - eventPoints[i].value;
          }
        }
      }

      // 復元
      // 参考: https://qiita.com/drken/items/0c7bab0384438f285f93
      const dpResults = [];
      let tmpW = W;
      let i = eventPointN - 1;
      while (i >= 0) {
        const tmpEventPoint = eventPoints[i];
        if (prev[tmpW] === tmpW - tmpEventPoint.value) {
          // 選んでいた場合
          dpResults.push(tmpEventPoint);

          // 残ポイントがこのポイント以上なら、このポイントを複数回選んでいるかもしれないので
          // 次のループもこのポイントをチェック
          i = prev[tmpW] >= tmpEventPoint ? i : i--;

          // テーブルをたどる
          tmpW = prev[tmpW];
        } else {
          i--;
        }
      }

      return dpResults;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
