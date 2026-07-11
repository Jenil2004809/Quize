require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Notification = require('../models/Notification');

const quizBank = [
  {
    category: {
      name: 'Science',
      description: 'Physics, chemistry, biology, space, and practical scientific reasoning.'
    },
    title: 'Everyday Science Mastery',
    description: 'A balanced science quiz covering forces, cells, energy, matter, and the solar system.',
    difficulty: 'medium',
    timeLimit: 12,
    passingMarks: 7,
    maxAttempts: 4,
    questions: [
      {
        type: 'mcq',
        text: 'Which gas do plants mainly absorb from the atmosphere during photosynthesis?',
        options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
        correctAnswers: ['Carbon dioxide'],
        explanation: 'Plants use carbon dioxide and water to produce glucose during photosynthesis.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'true-false',
        text: 'Sound can travel through a vacuum.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'Sound needs a medium such as air, water, or solids to travel.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'mcq',
        text: 'What is the basic unit of life?',
        options: ['Atom', 'Cell', 'Tissue', 'Organ'],
        correctAnswers: ['Cell'],
        explanation: 'Cells are the smallest structural and functional units of living organisms.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'fill-in-the-blank',
        text: 'The force that pulls objects toward Earth is called ____.',
        options: [],
        correctAnswers: ['gravity'],
        explanation: 'Gravity is the attractive force between masses.',
        marks: 1,
        negativeMarks: 0
      },
      {
        type: 'multiple-correct',
        text: 'Which of these are renewable energy sources?',
        options: ['Solar', 'Coal', 'Wind', 'Natural gas', 'Hydropower'],
        correctAnswers: ['Solar', 'Wind', 'Hydropower'],
        explanation: 'Solar, wind, and hydropower are naturally replenished energy sources.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        type: 'mcq',
        text: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
        correctAnswers: ['Mars'],
        explanation: 'Mars appears red because of iron oxide on its surface.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'mcq',
        text: 'What is H2O commonly known as?',
        options: ['Salt', 'Oxygen', 'Water', 'Hydrogen peroxide'],
        correctAnswers: ['Water'],
        explanation: 'H2O is the chemical formula for water.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'true-false',
        text: 'Metals are generally good conductors of electricity.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'Most metals have free electrons that allow electric current to flow easily.',
        marks: 1,
        negativeMarks: 0.25
      }
    ]
  },
  {
    category: {
      name: 'Computer Science',
      description: 'Quizzes covering web development, database design, algorithms, and tech languages.'
    },
    title: 'MERN Stack Developer Challenge',
    description: 'A practical quiz on React, Express, MongoDB, APIs, JWT, and production web app behavior.',
    difficulty: 'hard',
    timeLimit: 18,
    passingMarks: 9,
    maxAttempts: 3,
    questions: [
      {
        type: 'mcq',
        text: 'Which hook is commonly used to run side effects in React components?',
        options: ['useMemo', 'useEffect', 'useRef', 'useReducer'],
        correctAnswers: ['useEffect'],
        explanation: 'useEffect runs side effects such as fetching data or subscribing to events.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'mcq',
        text: 'In Express.js, what does middleware usually do?',
        options: ['Compile React components', 'Process requests before a final route handler', 'Create MongoDB indexes only', 'Encrypt CSS files'],
        correctAnswers: ['Process requests before a final route handler'],
        explanation: 'Middleware can validate auth, parse payloads, handle errors, and more.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'true-false',
        text: 'JWT payloads should be treated as encrypted secrets by default.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'JWT payloads are encoded, not encrypted, unless a separate encryption mechanism is used.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'multiple-correct',
        text: 'Which practices improve API security?',
        options: ['Input validation', 'Password hashing', 'Exposing JWT secrets in frontend code', 'Rate limiting', 'Role-based authorization'],
        correctAnswers: ['Input validation', 'Password hashing', 'Rate limiting', 'Role-based authorization'],
        explanation: 'Validation, hashing, rate limiting, and authorization reduce common security risks.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        type: 'fill-in-the-blank',
        text: 'MongoDB documents are commonly represented in a ____-like format.',
        options: [],
        correctAnswers: ['json'],
        explanation: 'MongoDB stores BSON documents, which are similar to JSON objects.',
        marks: 1,
        negativeMarks: 0
      },
      {
        type: 'mcq',
        text: 'Which HTTP status code is commonly used for unauthorized requests?',
        options: ['200', '201', '401', '500'],
        correctAnswers: ['401'],
        explanation: '401 indicates authentication is missing or invalid.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'mcq',
        text: 'What does Redux Toolkit mainly help with?',
        options: ['Image compression only', 'Predictable application state management', 'MongoDB hosting', 'SMTP delivery'],
        correctAnswers: ['Predictable application state management'],
        explanation: 'Redux Toolkit simplifies predictable state management in frontend apps.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'multiple-correct',
        text: 'Which files are typically backend responsibilities in a MERN app?',
        options: ['Mongoose models', 'Express routes', 'React page components', 'Controllers', 'API middleware'],
        correctAnswers: ['Mongoose models', 'Express routes', 'Controllers', 'API middleware'],
        explanation: 'React page components are frontend responsibilities; the rest are backend concerns.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        type: 'true-false',
        text: 'A protected route should verify the user token before serving private data.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'Protected backend routes should verify authentication and authorization.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'mcq',
        text: 'Which database library is used in this project to model MongoDB documents?',
        options: ['Sequelize', 'Mongoose', 'Prisma SQL only', 'Knex'],
        correctAnswers: ['Mongoose'],
        explanation: 'Mongoose provides schemas, validation, hooks, and model APIs for MongoDB.',
        marks: 1,
        negativeMarks: 0.25
      }
    ]
  },
  {
    category: {
      name: 'English',
      description: 'Grammar, vocabulary, comprehension, and language usage.'
    },
    title: 'English Grammar and Vocabulary',
    description: 'Improve sentence structure, word choice, grammar rules, and reading precision.',
    difficulty: 'easy',
    timeLimit: 10,
    passingMarks: 6,
    maxAttempts: 5,
    questions: [
      {
        type: 'mcq',
        text: 'Choose the correct sentence.',
        options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She gone to school.'],
        correctAnswers: ['She goes to school.'],
        explanation: 'For third-person singular present tense, use the verb form "goes".',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'fill-in-the-blank',
        text: 'The opposite of "ancient" is ____.',
        options: [],
        correctAnswers: ['modern'],
        explanation: 'Modern means relating to the present or recent times.',
        marks: 1,
        negativeMarks: 0
      },
      {
        type: 'mcq',
        text: 'Which word is an adjective?',
        options: ['Quickly', 'Beautiful', 'Run', 'Happiness'],
        correctAnswers: ['Beautiful'],
        explanation: 'Beautiful describes a noun, so it is an adjective.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'true-false',
        text: 'A synonym is a word with a similar meaning.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'Synonyms have the same or nearly the same meaning.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'multiple-correct',
        text: 'Which of these are nouns?',
        options: ['City', 'Blue', 'Teacher', 'Run', 'River'],
        correctAnswers: ['City', 'Teacher', 'River'],
        explanation: 'City, teacher, and river name people, places, or things.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        type: 'mcq',
        text: 'Select the correctly punctuated sentence.',
        options: ['Lets eat, Grandma.', "Let's eat, Grandma.", 'Lets eat Grandma.', "Let's eat Grandma."],
        correctAnswers: ["Let's eat, Grandma."],
        explanation: 'The apostrophe forms "let us", and the comma shows direct address.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'mcq',
        text: 'Which word best completes the sentence: I have ____ my homework.',
        options: ['do', 'did', 'done', 'doing'],
        correctAnswers: ['done'],
        explanation: 'Present perfect uses "have" plus the past participle.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'true-false',
        text: 'The word "quickly" is usually an adverb.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'Quickly describes how an action is performed.',
        marks: 1,
        negativeMarks: 0.25
      }
    ]
  },
  {
    category: {
      name: 'General Knowledge',
      description: 'World histories, geography, sports, pop culture, and fun trivia.'
    },
    title: 'World General Knowledge',
    description: 'A broad GK quiz about geography, history, culture, organizations, and world facts.',
    difficulty: 'medium',
    timeLimit: 14,
    passingMarks: 7,
    maxAttempts: 4,
    questions: [
      {
        type: 'mcq',
        text: 'Which is the largest ocean on Earth?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correctAnswers: ['Pacific Ocean'],
        explanation: 'The Pacific Ocean is the largest and deepest ocean on Earth.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'fill-in-the-blank',
        text: 'The capital city of Japan is ____.',
        options: [],
        correctAnswers: ['tokyo'],
        explanation: 'Tokyo is the capital of Japan.',
        marks: 1,
        negativeMarks: 0
      },
      {
        type: 'true-false',
        text: 'The United Nations was founded after World War II.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'The UN was founded in 1945 after World War II.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'mcq',
        text: 'Which country is famous for the pyramids of Giza?',
        options: ['Mexico', 'Egypt', 'Greece', 'Peru'],
        correctAnswers: ['Egypt'],
        explanation: 'The pyramids of Giza are located in Egypt.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'multiple-correct',
        text: 'Which of these are continents?',
        options: ['Asia', 'Greenland', 'Africa', 'Europe', 'Sahara'],
        correctAnswers: ['Asia', 'Africa', 'Europe'],
        explanation: 'Asia, Africa, and Europe are continents.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        type: 'mcq',
        text: 'How many players are on the field for one soccer team during regular play?',
        options: ['9', '10', '11', '12'],
        correctAnswers: ['11'],
        explanation: 'A soccer team has 11 players on the field, including the goalkeeper.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'mcq',
        text: 'Which currency is used in the United States?',
        options: ['Euro', 'Dollar', 'Yen', 'Peso'],
        correctAnswers: ['Dollar'],
        explanation: 'The United States uses the US dollar.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'true-false',
        text: 'Mount Everest is the highest mountain above sea level.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'Mount Everest is widely recognized as the highest mountain above sea level.',
        marks: 1,
        negativeMarks: 0.25
      }
    ]
  },
  {
    category: {
      name: 'Mathematics',
      description: 'Test your algebra, geometry, calculus, and basic mental math operations.'
    },
    title: 'Algebra and Geometry Drill',
    description: 'A stronger math quiz with algebra, geometry, percentages, ratios, and equations.',
    difficulty: 'hard',
    timeLimit: 16,
    passingMarks: 8,
    maxAttempts: 4,
    questions: [
      {
        type: 'mcq',
        text: 'What is the area of a rectangle with length 12 and width 5?',
        options: ['17', '34', '60', '120'],
        correctAnswers: ['60'],
        explanation: 'Area of a rectangle is length multiplied by width: 12 x 5 = 60.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'fill-in-the-blank',
        text: 'Solve: 2x - 4 = 10. x = ____.',
        options: [],
        correctAnswers: ['7'],
        explanation: 'Add 4 to both sides to get 2x = 14, then divide by 2.',
        marks: 1,
        negativeMarks: 0
      },
      {
        type: 'mcq',
        text: 'What is 25% of 200?',
        options: ['25', '40', '50', '75'],
        correctAnswers: ['50'],
        explanation: '25% is one quarter, and one quarter of 200 is 50.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'true-false',
        text: 'The angles in any triangle add up to 180 degrees.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'The interior angles of a Euclidean triangle sum to 180 degrees.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'mcq',
        text: 'If a circle has radius 7, what is its diameter?',
        options: ['7', '14', '21', '49'],
        correctAnswers: ['14'],
        explanation: 'Diameter is twice the radius.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'multiple-correct',
        text: 'Which of these numbers are prime?',
        options: ['2', '9', '11', '15', '17'],
        correctAnswers: ['2', '11', '17'],
        explanation: '2, 11, and 17 have exactly two positive factors.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        type: 'mcq',
        text: 'What is the next number in the sequence: 3, 6, 12, 24, ____?',
        options: ['30', '36', '48', '60'],
        correctAnswers: ['48'],
        explanation: 'Each number is doubled.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        type: 'fill-in-the-blank',
        text: 'The square root of 144 is ____.',
        options: [],
        correctAnswers: ['12'],
        explanation: '12 x 12 = 144.',
        marks: 1,
        negativeMarks: 0
      },
      {
        type: 'mcq',
        text: 'Simplify: 5 + 3 x 4',
        options: ['20', '32', '17', '24'],
        correctAnswers: ['17'],
        explanation: 'Multiplication comes first: 3 x 4 = 12, then 5 + 12 = 17.',
        marks: 1,
        negativeMarks: 0.25
      }
    ]
  }
];

const upsertQuizBank = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quiz_system');

  const teacher = await User.findOne({ role: 'teacher', isApproved: true }).sort({ createdAt: 1 });
  if (!teacher) {
    throw new Error('No approved teacher found. Run the main seeder first.');
  }

  let createdQuizzes = 0;
  let createdQuestions = 0;

  for (const item of quizBank) {
    const category = await Category.findOneAndUpdate(
      { name: item.category.name },
      { $setOnInsert: item.category },
      { new: true, upsert: true }
    );

    const quiz = await Quiz.findOneAndUpdate(
      { title: item.title },
      {
        title: item.title,
        description: item.description,
        category: category._id,
        difficulty: item.difficulty,
        timeLimit: item.timeLimit,
        passingMarks: item.passingMarks,
        maxAttempts: item.maxAttempts,
        visibility: 'public',
        creator: teacher._id,
        isPublished: true
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await Question.deleteMany({ quizId: quiz._id });
    await Question.insertMany(item.questions.map((question) => ({ ...question, quizId: quiz._id })));

    createdQuizzes += 1;
    createdQuestions += item.questions.length;
  }

  await Notification.create({
    recipientId: null,
    senderId: teacher._id,
    title: 'New quiz bank published',
    message: `${createdQuizzes} new quizzes with ${createdQuestions} questions are now available for students.`,
    type: 'quiz_published'
  });

  console.log(`Added/updated ${createdQuizzes} quizzes with ${createdQuestions} questions.`);
  await mongoose.disconnect();
};

upsertQuizBank()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
