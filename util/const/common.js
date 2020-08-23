class DifficultyClearRankLabel {
  constructor(name, color) {
    this.name = name;
    this.color = color;
  }
}

export const DIFFICULTY_ADVANCEDPLUS = 3;
export const DIFFICULTY_ADVANCED = 2;
export const DIFFICULTY_INTERMEDIATE = 1;
export const DIFFICULTY_BEGINNER = 0;

export const difficultyLabels = {
  [DIFFICULTY_ADVANCEDPLUS]: new DifficultyClearRankLabel('上級+', '#F44336'),
  [DIFFICULTY_ADVANCED]: new DifficultyClearRankLabel('上級', '#FFC107'),
  [DIFFICULTY_INTERMEDIATE]: new DifficultyClearRankLabel('中級', '#00E676'),
  [DIFFICULTY_BEGINNER]: new DifficultyClearRankLabel('初級', '#2196F3'),
};

export const CLEAR_RANK_S = 4;
export const CLEAR_RANK_A = 3;
export const CLEAR_RANK_B = 2;
export const CLEAR_RANK_C = 1;
export const CLEAR_RANK_D = 0;
export const clearRankValuesDesc = [
  CLEAR_RANK_S,
  CLEAR_RANK_A,
  CLEAR_RANK_B,
  CLEAR_RANK_C,
  CLEAR_RANK_D,
];

export const clearRankLabels = {
  [CLEAR_RANK_S]: new DifficultyClearRankLabel('S', '#E1BEE7'),
  [CLEAR_RANK_A]: new DifficultyClearRankLabel('A', '#FFF59D'),
  [CLEAR_RANK_B]: new DifficultyClearRankLabel('B', '#EEEEEE'),
  [CLEAR_RANK_C]: new DifficultyClearRankLabel('C', '#FFAB91'),
  [CLEAR_RANK_D]: new DifficultyClearRankLabel('D', '#A5D6A7'),
};
