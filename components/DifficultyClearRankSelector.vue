<template>
  <div>
    <v-checkbox
      :label="difficultyLabels[difficultyValue].name"
      :color="difficultyLabels[difficultyValue].color"
      :value="difficultyValue"
    />
    <div v-for="clearRankValue in clearRankValuesDesc" :key="clearRankValue">
      <v-checkbox
        v-model="tmpSelectedClearRankValues"
        :label="clearRankLabels[clearRankValue].name"
        :color="clearRankLabels[clearRankValue].color"
        :value="clearRankValue"
        @change="changeSelection"
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
      clearRankValuesDesc,
      clearRankLabels,
      tmpSelectedClearRankValues: [], // props.selection変更用の一時的な配列
    };
  },

  methods: {
    changeSelection() {
      // 選択順になっているので昇順ソート
      this.tmpSelectedClearRankValues.sort();

      // 親からv-modelで渡されたprops.selectionを変更する
      // ※propsの直接変更は許されないため必要
      this.$emit('change', this.tmpSelectedClearRankValues);
    },
  },
};
</script>
