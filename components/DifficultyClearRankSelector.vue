<template>
  <div>
    <v-checkbox
      v-model="isDifficultyChecked"
      :label="difficultyLabel.name"
      :color="difficultyLabel.color"
      :indeterminate="isDifficultyCheckIndeterminate"
      :class="difficultyIndeterminateColor"
      :style="difficultyIndeterminateColorVariable"
      @change="selectOrUnselectAllClearRank()"
    />

    <div v-for="clearRankValue in clearRankValuesDesc" :key="clearRankValue">
      <v-checkbox
        v-model="tmpSelectedClearRankValues"
        :label="clearRankLabels[clearRankValue].name"
        :color="clearRankLabels[clearRankValue].color"
        :value="clearRankValue"
        @change="changeClearRankSelection()"
      />
    </div>
  </div>
</template>

<script>
import {
  difficultyLabels,
  clearRankValuesDesc,
  clearRankLabels,
} from '@/util/const/common';

export default {
  name: 'DifficultyClearRankSelector',

  // props.selectionをv-modelで渡すための定義
  model: {
    prop: 'selection',
    event: 'change',
  },

  props: {
    difficultyValue: {
      required: true,
      type: Number,
    },

    selection: {
      required: true,
      type: Array,
    },
  },

  data() {
    return {
      difficultyLabels,
      clearRankValuesDesc: clearRankValuesDesc.concat(), // 定義が破壊されないようコピー
      clearRankLabels,
      isDifficultyChecked: true,
      tmpSelectedClearRankValues: [], // props.selection変更用の一時的な配列
    };
  },

  computed: {
    difficultyLabel() {
      return difficultyLabels[this.difficultyValue];
    },

    isClearRankAllChecked() {
      return (
        this.tmpSelectedClearRankValues.length === clearRankValuesDesc.length
      );
    },

    isDifficultyCheckIndeterminate() {
      return (
        !this.isClearRankAllChecked &&
        this.tmpSelectedClearRankValues.length > 0
      );
    },

    // 不定チェック状態の色付け用スタイル
    // ※Vuetifyのデフォルトで灰色固定を各色に変えるために必要
    difficultyIndeterminateColor() {
      return {
        'difficulty-indeterminate': this.isDifficultyCheckIndeterminate,
      };
    },

    // 不定チェック状態の色付け用CSS変数
    difficultyIndeterminateColorVariable() {
      return {
        '--difficulty-indeterminate-color': this.difficultyLabel.color,
      };
    },
  },

  created() {
    // 初期表示時は全選択
    this.tmpSelectedClearRankValues = this.clearRankValuesDesc;
  },

  methods: {
    changeClearRankSelection() {
      // 親からv-modelで渡されたprops.selectionを変更する
      // ※propsの直接変更は許されないため必要
      this.$emit('change', this.tmpSelectedClearRankValues);

      this.isDifficultyChecked = this.isClearRankAllChecked;
    },

    selectOrUnselectAllClearRank() {
      if (this.isClearRankAllChecked) {
        this.tmpSelectedClearRankValues = [];
      } else {
        this.tmpSelectedClearRankValues = this.clearRankValuesDesc;
      }
      this.changeClearRankSelection();
    },
  },
};
</script>

<style scoped>
.difficulty-indeterminate ::v-deep .mdi-minus-box {
  /* CSS変数で不定チェック状態の灰色を難易度ごとの色に変更 */
  color: var(--difficulty-indeterminate-color);
}
</style>
