<template>
  <div>
    <!-- TODO: デバッグ用 -->
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
          <DifficultyClearRankSelector
            v-model="targetDifficultyClearRank[common.DIFFICULTY_ADVANCEDPLUS]"
            :difficulty-value="common.DIFFICULTY_ADVANCEDPLUS"
          ></DifficultyClearRankSelector>
        </v-col>

        <v-col cols="3">
          <DifficultyClearRankSelector
            v-model="targetDifficultyClearRank[common.DIFFICULTY_ADVANCED]"
            :difficulty-value="common.DIFFICULTY_ADVANCED"
          ></DifficultyClearRankSelector>
        </v-col>

        <v-col cols="3">
          <DifficultyClearRankSelector
            v-model="targetDifficultyClearRank[common.DIFFICULTY_INTERMEDIATE]"
            :difficulty-value="common.DIFFICULTY_INTERMEDIATE"
          ></DifficultyClearRankSelector>
        </v-col>

        <v-col cols="3">
          <DifficultyClearRankSelector
            v-model="targetDifficultyClearRank[common.DIFFICULTY_BEGINNER]"
            :difficulty-value="common.DIFFICULTY_BEGINNER"
          ></DifficultyClearRankSelector>
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
                  {{ common.difficultyLabels[requiredLive.difficulty].name }}
                </td>
                <td>
                  <v-chip
                    :color="
                      common.clearRankLabels[requiredLive.clearRank].color
                    "
                    ><span style="color: black;">{{
                      common.clearRankLabels[requiredLive.clearRank].name
                    }}</span></v-chip
                  >
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
import DifficultyClearRankSelector from '@/components/DifficultyClearRankSelector';
import * as util from '@/components/EventPointAdjusterUtil';
import * as common from '@/util/const/common';

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

const aggregateDPResults = (dpResults, eventPoints) => {
  const requiredLives = [];

  let tmpDPRsults = dpResults.concat(); // DP結果を集計処理用にコピー
  while (tmpDPRsults.length) {
    const dpResultEventPointValue = tmpDPRsults[0];

    // 複数選択されたポイントを集計
    const sameEventPoints = tmpDPRsults.filter(
      (eventPoint) => eventPoint === dpResultEventPointValue
    );

    // イベントポイント定義
    const eventPoint = eventPoints.find(
      (eventPoint) => eventPoint.value === dpResultEventPointValue
    );

    const liveN = sameEventPoints.length;
    const result = {
      difficulty: eventPoint.difficulty,
      clearRank: eventPoint.clearRank,
      eventPoint: eventPoint.value,
      liveN,
      eventPointSum: eventPoint.value * liveN,
    };

    requiredLives.push(result);

    // 複数選択されたポイントをDP結果から削除
    tmpDPRsults = tmpDPRsults.filter(
      (eventPoint) => eventPoint !== dpResultEventPointValue
    );
  }

  return requiredLives;
};

export default {
  name: 'PointAdjuster',

  components: {
    DifficultyClearRankSelector,
  },

  data() {
    return {
      currentEventPointString: '0',
      targetEventPointString: '919919', // TODO: デバッグ用
      specialAttackPercent: '0',
      targetDifficultyClearRank: new util.DifficultyClearRank(),
      dpResults: [],
      requiredLives: [],
      dialogInvalid: false,
      dialogInvalidMessage: '',
      dialogRequiredLives: false,
      util,
      common,
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

  methods: {
    debug() {
      console.log(this.targetDifficultyClearRank);
    },

    showInvalidDialog(message) {
      this.dialogInvalid = true;
      this.dialogInvalidMessage = message;
    },

    calculateRequiredLive() {
      if (!this.validateInput()) {
        return;
      }

      const eventPoints = util.prepareEventPoints(
        this.targetDifficultyClearRank,
        parseInteger(this.specialAttackPercent)
      );

      const eventPointValues = eventPoints.map(
        (eventPoint) => eventPoint.value
      );

      const dpResults = this.calculateDP(
        eventPointValues,
        this.requiredEventPoint
      );

      if (dpResults.length === 0) {
        this.showInvalidDialog('計算の結果、ポイント調整は不可能でした。');
        return;
      }

      this.requiredLives = aggregateDPResults(dpResults, eventPoints);

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

      if (this.targetDifficultyClearRank.isEmpty()) {
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

    getDifficultyColor(difficultyValue) {
      return {
        background: common.difficultyLabels[difficultyValue].color,
        color: 'white',
      };
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
        for (let w = eventPoints[i]; w <= W; w++) {
          const liveN = dp[w - eventPoints[i]] + 1;
          if (liveN <= dp[w]) {
            dp[w] = liveN;
            prev[w] = w - eventPoints[i];
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
        if (prev[tmpW] === tmpW - tmpEventPoint) {
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
