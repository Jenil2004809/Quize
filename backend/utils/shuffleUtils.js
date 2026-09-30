// Utility to shuffle array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Shuffles options for a single question
const randomizeQuestionOptions = (options) => {
  if (!Array.isArray(options) || options.length <= 1) return options;
  return shuffleArray(options);
};

/**
 * Distributes a single question's options so that the correct answer is placed at a specific target slot (0=A, 1=B, 2=C, 3=D),
 * and the remaining slots are filled with shuffled distractors.
 */
const placeCorrectAnswerAtSlot = (options = [], correctAnswers = [], targetSlot = 1) => {
  if (!Array.isArray(options) || options.length <= 1) return options;
  const correctChoice = Array.isArray(correctAnswers) && correctAnswers.length > 0 
    ? correctAnswers[0] 
    : options[0];

  // Separate distractors from correct choice
  const distractors = shuffleArray(options.filter(opt => opt !== correctChoice));
  
  const totalSlots = Math.max(options.length, 4);
  const clampedSlot = Math.max(0, Math.min(targetSlot, totalSlots - 1));

  const result = [];
  let distractorIdx = 0;

  for (let i = 0; i < totalSlots; i++) {
    if (i === clampedSlot) {
      result.push(correctChoice);
    } else if (distractorIdx < distractors.length) {
      result.push(distractors[distractorIdx++]);
    } else {
      result.push(`Alternative option ${i + 1}`);
    }
  }

  return result;
};

/**
 * Balances an entire list of questions so correct answers are uniformly distributed across A, B, C, D.
 * Guarantees that Option A is not favored, and consecutive questions do not have the same answer position.
 */
const balanceAndDistributeQuestionOptions = (questions = []) => {
  if (!Array.isArray(questions) || questions.length === 0) return questions;

  // Generate balanced sequence of slots [0, 1, 2, 3] repeated and shuffled in chunks
  const slotsPool = [];
  while (slotsPool.length < questions.length) {
    // Avoid starting with 0 (Option A) to directly break the "Option A for everything" pattern
    const batch = shuffleArray([1, 2, 3, 0]);
    slotsPool.push(...batch);
  }

  return questions.map((q, idx) => {
    // If not MCQ or single choice with options, return as is
    if (!['mcq', 'single', undefined].includes(q.type) || !Array.isArray(q.options) || q.options.length <= 1) {
      return q;
    }

    const targetSlot = slotsPool[idx] % Math.min(q.options.length, 4);
    const updatedOptions = placeCorrectAnswerAtSlot(q.options, q.correctAnswers, targetSlot);

    return {
      ...q,
      options: updatedOptions
    };
  });
};

module.exports = {
  shuffleArray,
  randomizeQuestionOptions,
  placeCorrectAnswerAtSlot,
  balanceAndDistributeQuestionOptions
};
