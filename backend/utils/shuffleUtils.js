// Utility to shuffle options array while preserving correct answers matching
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Shuffles options for a question so correct answers are distributed randomly across A, B, C, D
const randomizeQuestionOptions = (options) => {
  if (!Array.isArray(options) || options.length <= 1) return options;
  return shuffleArray(options);
};

module.exports = {
  shuffleArray,
  randomizeQuestionOptions
};
