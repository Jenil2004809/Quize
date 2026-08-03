require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Category = require('../models/Category');
const Subject = require('../models/Subject');
const Result = require('../models/Result');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quiz_system';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected for seeding...');

    // Clear all collections
    await Promise.all([
      Admin.deleteMany({}),
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      Category.deleteMany({}),
      Subject.deleteMany({}),
      Result.deleteMany({}),
      Certificate.deleteMany({}),
      Notification.deleteMany({}),
      Message.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing collections...');

    // ─── ADMINS ─────────────────────────────────────────────────────────────
    const admin = await Admin.create({
      name: 'System Admin',
      email: 'admin@quizsystem.com',
      password: 'Admin@123',
      role: 'admin',
      isActive: true
    });

    console.log('👥 Created Admin: admin@quizsystem.com / Admin@123');

    // ─── TEACHERS ───────────────────────────────────────────────────────────
    const teacher1 = await Teacher.create({
      name: 'Alice Teacher',
      email: 'alice@quiz.com',
      password: 'Teacher@1234',
      role: 'teacher',
      specialization: 'Computer Science',
      isApproved: true,
      isActive: true
    });

    const teacher2 = await Teacher.create({
      name: 'Bob Teacher',
      email: 'bob@quiz.com',
      password: 'Teacher@1234',
      role: 'teacher',
      specialization: 'Mathematics',
      isApproved: true,
      isActive: true
    });

    const pendingTeacher = await Teacher.create({
      name: 'Pending Teacher',
      email: 'pending@quiz.com',
      password: 'Teacher@1234',
      role: 'teacher',
      specialization: 'General Science',
      isApproved: false,
      isActive: true
    });

    console.log('👥 Created Teachers (2 approved, 1 pending)');

    // ─── STUDENTS ───────────────────────────────────────────────────────────
    const student1 = await Student.create({
      name: 'John Student',
      email: 'john@quiz.com',
      password: 'Student@1234',
      role: 'student',
      isActive: true
    });

    const student2 = await Student.create({
      name: 'Jane Student',
      email: 'jane@quiz.com',
      password: 'Student@1234',
      role: 'student',
      isActive: true
    });

    const student3 = await Student.create({
      name: 'Mike Student',
      email: 'mike@quiz.com',
      password: 'Student@1234',
      role: 'student',
      isActive: true
    });

    console.log('👥 Created Students (3 students)');

    // ─── CATEGORIES ───────────────────────────────────────────────────────────
    const catCS = await Category.create({
      name: 'Computer Science',
      description: 'Programming, algorithms, and computing systems',
      slug: 'computer-science'
    });

    const catMath = await Category.create({
      name: 'Mathematics',
      description: 'Calculus, algebra, logic, and geometry',
      slug: 'mathematics'
    });

    const catScience = await Category.create({
      name: 'General Science',
      description: 'Physics, chemistry, biology and space science',
      slug: 'general-science'
    });

    console.log('📚 Created 3 categories');

    // ─── SUBJECTS ─────────────────────────────────────────────────────────────
    const subJS = await Subject.create({
      name: 'JavaScript',
      description: 'Web development scripting language',
      category: catCS._id
    });

    const subPython = await Subject.create({
      name: 'Python',
      description: 'Data science and backend scripting',
      category: catCS._id
    });

    const subDS = await Subject.create({
      name: 'Data Structures',
      description: 'Standard memory architectures for algorithms',
      category: catCS._id
    });

    const subAlgebra = await Subject.create({
      name: 'Algebra',
      description: 'Solving mathematical equations',
      category: catMath._id
    });

    const subPhysics = await Subject.create({
      name: 'Physics',
      description: 'Forces, energy, and thermodynamics',
      category: catScience._id
    });

    const subChemistry = await Subject.create({
      name: 'Chemistry',
      description: 'Chemical compounds, reactions and bonds',
      category: catScience._id
    });

    console.log('📚 Created 6 subjects');

    // ─── QUIZZES (6 Quizzes, 4-7 range) ──────────────────────────────────────
    const quizJS = await Quiz.create({
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge on basic variables, scopes, closures, arrays and ES6+',
      category: catCS._id,
      subject: subJS._id,
      difficulty: 'easy',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 3,
      visibility: 'public',
      creator: teacher1._id,
      creatorModel: 'Teacher',
      isPublished: true
    });

    const quizPython = await Quiz.create({
      title: 'Advanced Python Concepts',
      description: 'Decorators, generators, OOP principles and asynchronous tasks',
      category: catCS._id,
      subject: subPython._id,
      difficulty: 'hard',
      timeLimit: 20,
      passingMarks: 7,
      maxAttempts: 2,
      visibility: 'public',
      creator: teacher1._id,
      creatorModel: 'Teacher',
      isPublished: true
    });

    const quizDS = await Quiz.create({
      title: 'Data Structures Essentials',
      description: 'Linear and non-linear data structure definitions, operations, and complexities',
      category: catCS._id,
      subject: subDS._id,
      difficulty: 'medium',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 5,
      visibility: 'public',
      creator: teacher1._id,
      creatorModel: 'Teacher',
      isPublished: true
    });

    const quizAlgebra = await Quiz.create({
      title: 'Algebra Challenge',
      description: 'Basic and intermediate equations and variable operations',
      category: catMath._id,
      subject: subAlgebra._id,
      difficulty: 'medium',
      timeLimit: 10,
      passingMarks: 5,
      maxAttempts: 5,
      visibility: 'public',
      creator: teacher2._id,
      creatorModel: 'Teacher',
      isPublished: true
    });

    const quizPhysics = await Quiz.create({
      title: 'General Physics Trivia',
      description: 'Basic concepts of forces, motion, waves and thermodynamics',
      category: catScience._id,
      subject: subPhysics._id,
      difficulty: 'easy',
      timeLimit: 10,
      passingMarks: 5,
      maxAttempts: 3,
      visibility: 'public',
      creator: admin._id,
      creatorModel: 'Admin',
      isPublished: true
    });

    const quizChemistry = await Quiz.create({
      title: 'Basic Chemistry Principles',
      description: 'Test your understanding of elements, bonds, pH scale, and reactions',
      category: catScience._id,
      subject: subChemistry._id,
      difficulty: 'easy',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 3,
      visibility: 'public',
      creator: teacher2._id,
      creatorModel: 'Teacher',
      isPublished: true
    });

    console.log('📝 Created 6 published quizzes (conducted by both teachers and admin)');

    // ─── QUESTIONS (10 Questions for each of the 6 Quizzes = 60 total) ───────────
    
    // Quiz 1: JavaScript Fundamentals (10 Questions)
    const jsQ = [
      {
        quizId: quizJS._id,
        type: 'mcq',
        text: 'Which keyword defines a block-scoped variable in modern JS?',
        options: ['var', 'let', 'define', 'scope'],
        correctAnswers: ['let'],
        explanation: 'let and const are block-scoped variable identifiers introduced in ES6.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizJS._id,
        type: 'true-false',
        text: 'JavaScript is a statically typed language.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'JavaScript is dynamically typed; variable types are checked at runtime.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizJS._id,
        type: 'multiple-correct',
        text: 'Which of the following are primitive data types in JavaScript? (Select all that apply)',
        options: ['String', 'Object', 'Boolean', 'Array', 'Symbol'],
        correctAnswers: ['String', 'Boolean', 'Symbol'],
        explanation: 'Primitive types in JS include String, Number, BigInt, Boolean, Undefined, Null, and Symbol.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        quizId: quizJS._id,
        type: 'fill-in-the-blank',
        text: 'The operator that checks both value and type equality is triple equals symbol, represented as _______',
        options: [],
        correctAnswers: ['==='],
        explanation: '=== is the strict equality operator checking both type and value equivalence.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizJS._id,
        type: 'mcq',
        text: 'What is the output of typeof [] in JavaScript?',
        options: ['array', 'object', 'list', 'undefined'],
        correctAnswers: ['object'],
        explanation: 'Arrays are objects in JavaScript; typeof [] returns "object".',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizJS._id,
        type: 'true-false',
        text: 'The const keyword prevents objects from being mutated.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'const prevents reassigning the variable itself, but object properties can still be updated.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizJS._id,
        type: 'mcq',
        text: 'Which method is used to serialize an object into a JSON string?',
        options: ['JSON.parse()', 'JSON.stringify()', 'JSON.toString()', 'JSON.serialize()'],
        correctAnswers: ['JSON.stringify()'],
        explanation: 'JSON.stringify() turns a JS object or array into a standard JSON string.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizJS._id,
        type: 'fill-in-the-blank',
        text: 'The keyword used to define an asynchronous function in ES2017 is _______',
        options: [],
        correctAnswers: ['async'],
        explanation: 'The async keyword specifies that a function yields a Promise implicitly.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizJS._id,
        type: 'mcq',
        text: 'What is the default value of an uninitialized variable in JavaScript?',
        options: ['null', 'undefined', 'NaN', '0'],
        correctAnswers: ['undefined'],
        explanation: 'Variables declared without values default to undefined.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizJS._id,
        type: 'multiple-correct',
        text: 'Which of the following are array helper methods? (Select all that apply)',
        options: ['map', 'filter', 'reduce', 'slice', 'define'],
        correctAnswers: ['map', 'filter', 'reduce', 'slice'],
        explanation: 'map, filter, reduce, and slice are standard Array prototype helper methods.',
        marks: 2,
        negativeMarks: 0.5
      }
    ];

    // Quiz 2: Advanced Python Concepts (10 Questions)
    const pythonQ = [
      {
        quizId: quizPython._id,
        type: 'mcq',
        text: 'How do you create a generator in Python?',
        options: ['Using yield keyword', 'Using return keyword', 'Using class structure', 'Using map function'],
        correctAnswers: ['Using yield keyword'],
        explanation: 'A generator function in Python yields a sequence of results rather than returning a single block.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        quizId: quizPython._id,
        type: 'true-false',
        text: 'Python lists are mutable.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'Lists can be modified after creation, unlike tuples.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizPython._id,
        type: 'multiple-correct',
        text: 'Select python built-in decorators (Select all that apply)',
        options: ['@staticmethod', '@classmethod', '@property', '@decorator'],
        correctAnswers: ['@staticmethod', '@classmethod', '@property'],
        explanation: 'staticmethod, classmethod and property are standard Python decorators.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        quizId: quizPython._id,
        type: 'fill-in-the-blank',
        text: 'In Python, you can find the length of a list using the _______ function.',
        options: [],
        correctAnswers: ['len'],
        explanation: 'The len() function computes the number of elements in a collection.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizPython._id,
        type: 'mcq',
        text: 'What is the main utility of __init__ in a Python class?',
        options: ['Constructor method', 'Destructor method', 'Static method', 'Class definition wrapper'],
        correctAnswers: ['Constructor method'],
        explanation: '__init__ acts as the constructor class instance initialization routine.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizPython._id,
        type: 'true-false',
        text: 'Python tuples are mutable.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'Tuples are immutable; they cannot be altered after declaration.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizPython._id,
        type: 'mcq',
        text: 'Which of the following handles exception raising?',
        options: ['raise', 'throw', 'except', 'try'],
        correctAnswers: ['raise'],
        explanation: 'In Python, exceptions are thrown using the raise keyword.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizPython._id,
        type: 'fill-in-the-blank',
        text: 'The method used to add an item to the end of a list is _______',
        options: [],
        correctAnswers: ['append'],
        explanation: 'The append() method mutates lists by adding an item to the end.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizPython._id,
        type: 'mcq',
        text: 'What keyword is used to represent an empty block of code in Python?',
        options: ['null', 'void', 'pass', 'empty'],
        correctAnswers: ['pass'],
        explanation: 'pass acts as a null operation statement for placeholder functions/classes.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizPython._id,
        type: 'multiple-correct',
        text: 'Which of the following are built-in Python collection types? (Select all that apply)',
        options: ['list', 'dict', 'set', 'tuple', 'struct'],
        correctAnswers: ['list', 'dict', 'set', 'tuple'],
        explanation: 'list, dict, set, and tuple are built-in data types. struct is a standard library module.',
        marks: 2,
        negativeMarks: 0.5
      }
    ];

    // Quiz 3: Data Structures Essentials (10 Questions)
    const dsQ = [
      {
        quizId: quizDS._id,
        type: 'mcq',
        text: 'Which data structure operates on a Last In First Out (LIFO) basis?',
        options: ['Stack', 'Queue', 'Array', 'Graph'],
        correctAnswers: ['Stack'],
        explanation: 'Stacks operate using the LIFO approach, pushing and popping from the top.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizDS._id,
        type: 'true-false',
        text: 'A binary search tree requires sorted elements for insertion.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'Elements can be inserted dynamically; the tree preserves its properties at insertion time.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizDS._id,
        type: 'multiple-correct',
        text: 'Which of the following are linear data structures? (Select all that apply)',
        options: ['Array', 'LinkedList', 'Queue', 'Tree', 'Graph'],
        correctAnswers: ['Array', 'LinkedList', 'Queue'],
        explanation: 'Arrays, Lists and Queues are linear. Trees and Graphs are non-linear structures.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        quizId: quizDS._id,
        type: 'fill-in-the-blank',
        text: 'A FIFO (First In First Out) data structure is called a _______',
        options: [],
        correctAnswers: ['Queue'],
        explanation: 'Queues maintain first-in first-out sequencing.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizDS._id,
        type: 'mcq',
        text: 'What is the time complexity of searching in a balanced binary search tree?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswers: ['O(log n)'],
        explanation: 'Searching in balanced trees halves search scopes at each node step, creating logarithmic time.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizDS._id,
        type: 'true-false',
        text: 'Arrays have a dynamic size in native low-level memory allocation.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'Standard low-level arrays allocate fixed sizes; dynamic arrays use resizing logic.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizDS._id,
        type: 'mcq',
        text: 'Which traversal visits nodes in Root-Left-Right order?',
        options: ['In-order', 'Pre-order', 'Post-order', 'Breadth-first'],
        correctAnswers: ['Pre-order'],
        explanation: 'Pre-order traversal starts at the root, then visits left and right subtrees.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizDS._id,
        type: 'fill-in-the-blank',
        text: 'A collision resolution method in hash tables is chaining or open _______',
        options: [],
        correctAnswers: ['addressing'],
        explanation: 'Open addressing resolves collisions by finding alternative empty slots.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizDS._id,
        type: 'mcq',
        text: 'Which data structure consists of nodes where each node has a value and a pointer to the next node?',
        options: ['Array', 'Stack', 'Linked List', 'Binary Tree'],
        correctAnswers: ['Linked List'],
        explanation: 'Singly linked lists utilize node references to point to successive items.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizDS._id,
        type: 'multiple-correct',
        text: 'Which of the following are self-balancing search trees? (Select all that apply)',
        options: ['AVL Tree', 'Red-Black Tree', 'Heap', 'B-Tree'],
        correctAnswers: ['AVL Tree', 'Red-Black Tree', 'B-Tree'],
        explanation: 'AVL, Red-Black, and B-Trees are self-balancing. Heaps maintain parent/child key order only.',
        marks: 2,
        negativeMarks: 0.5
      }
    ];

    // Quiz 4: Algebra Challenge (10 Questions)
    const algebraQ = [
      {
        quizId: quizAlgebra._id,
        type: 'mcq',
        text: 'Solve for x: 2x + 5 = 15',
        options: ['3', '5', '7', '10'],
        correctAnswers: ['5'],
        explanation: 'Subtract 5: 2x = 10, divide by 2: x = 5.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizAlgebra._id,
        type: 'fill-in-the-blank',
        text: 'Solve for y: 3y - 3 = 12. y = _______',
        options: [],
        correctAnswers: ['5'],
        explanation: '3y = 15 => y = 5',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizAlgebra._id,
        type: 'mcq',
        text: 'What is the value of x if x^2 = 16 and x > 0?',
        options: ['2', '4', '8', '-4'],
        correctAnswers: ['4'],
        explanation: 'The square root of 16 is 4 (since 4 * 4 = 16) and x > 0.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizAlgebra._id,
        type: 'true-false',
        text: 'The slope of a horizontal line is zero.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'Horizontal lines represent constant functions and have y-axis changes of zero.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizAlgebra._id,
        type: 'mcq',
        text: 'Solve for x: 5x - 4 = 2x + 5',
        options: ['3', '4', '5', '9'],
        correctAnswers: ['3'],
        explanation: 'Subtract 2x: 3x - 4 = 5. Add 4: 3x = 9 => x = 3.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizAlgebra._id,
        type: 'fill-in-the-blank',
        text: 'What is the y-intercept of the line y = 3x - 7? y = _______',
        options: [],
        correctAnswers: ['-7'],
        explanation: 'At x = 0, y = -7, yielding the y-intercept value.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizAlgebra._id,
        type: 'mcq',
        text: 'Find the value of 2^3 + 3^2.',
        options: ['12', '15', '17', '24'],
        correctAnswers: ['17'],
        explanation: '2^3 = 8. 3^2 = 9. 8 + 9 = 17.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizAlgebra._id,
        type: 'true-false',
        text: 'A quadratic equation always has two distinct real roots.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'Quadratic equations can yield one repeated real root or complex conjugate roots.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizAlgebra._id,
        type: 'mcq',
        text: 'Solve for z: z/3 + 2 = 6',
        options: ['4', '8', '12', '16'],
        correctAnswers: ['12'],
        explanation: 'z/3 = 4 => z = 12.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizAlgebra._id,
        type: 'multiple-correct',
        text: 'Which of the following are algebraic properties of real numbers? (Select all that apply)',
        options: ['Commutative', 'Associative', 'Distributive', 'Disjunctive'],
        correctAnswers: ['Commutative', 'Associative', 'Distributive'],
        explanation: 'Commutative, Associative, and Distributive are standard real algebraic properties.',
        marks: 2,
        negativeMarks: 0.5
      }
    ];

    // Quiz 5: General Physics Trivia (10 Questions)
    const physicsQ = [
      {
        quizId: quizPhysics._id,
        type: 'mcq',
        text: 'What is the acceleration due to gravity on Earth (approx)?',
        options: ['8.9 m/s^2', '9.8 m/s^2', '10.2 m/s^2', '12.0 m/s^2'],
        correctAnswers: ['9.8 m/s^2'],
        explanation: 'Gravity pulls objects toward Earth at approximately 9.8 meters per second squared.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizPhysics._id,
        type: 'true-false',
        text: 'Sound waves travel faster in a vacuum than in air.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'Sound is a mechanical wave and requires a physical medium to travel; it cannot travel in a vacuum.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizPhysics._id,
        type: 'multiple-correct',
        text: 'Which of the following are vector quantities? (Select all that apply)',
        options: ['Velocity', 'Acceleration', 'Force', 'Mass', 'Speed'],
        correctAnswers: ['Velocity', 'Acceleration', 'Force'],
        explanation: 'Velocity, acceleration, and force specify magnitude and direction. Mass and speed are scalars.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        quizId: quizPhysics._id,
        type: 'fill-in-the-blank',
        text: 'The SI unit of force is named after Isaac Newton, represented as _______',
        options: [],
        correctAnswers: ['Newton'],
        explanation: 'The Newton (N) is the SI unit of force.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizPhysics._id,
        type: 'mcq',
        text: 'What is the unit of electric current?',
        options: ['Volt', 'Ohm', 'Ampere', 'Watt'],
        correctAnswers: ['Ampere'],
        explanation: 'Amperes (Amps) measure the rate of electrical charge flow.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizPhysics._id,
        type: 'true-false',
        text: 'Light is an electromagnetic wave.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'Light consists of self-propagating oscillating electric and magnetic fields.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizPhysics._id,
        type: 'mcq',
        text: 'Which law states that for every action, there is an equal and opposite reaction?',
        options: ['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Law of Gravity'],
        correctAnswers: ['Newton\'s Third Law'],
        explanation: 'Newton\'s Third Law defines action-reaction pairs.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizPhysics._id,
        type: 'fill-in-the-blank',
        text: 'The speed of light in a vacuum is approximately 3 x 10^8 meters per _______',
        options: [],
        correctAnswers: ['second'],
        explanation: 'c is exactly 299,792,458 m/s, or roughly 3 x 10^8 meters per second.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizPhysics._id,
        type: 'mcq',
        text: 'What is the term for energy stored in an object due to its position?',
        options: ['Kinetic Energy', 'Thermal Energy', 'Potential Energy', 'Chemical Energy'],
        correctAnswers: ['Potential Energy'],
        explanation: 'Potential energy is stored energy dependent on spatial positioning (e.g. height).',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizPhysics._id,
        type: 'multiple-correct',
        text: 'Which of the following are primary states of matter? (Select all that apply)',
        options: ['Solid', 'Liquid', 'Gas', 'Plasma', 'Ether'],
        correctAnswers: ['Solid', 'Liquid', 'Gas', 'Plasma'],
        explanation: 'Solid, liquid, gas, and plasma are physical states of matter.',
        marks: 2,
        negativeMarks: 0.5
      }
    ];

    // Quiz 6: Basic Chemistry Principles (10 Questions)
    const chemistryQ = [
      {
        quizId: quizChemistry._id,
        type: 'mcq',
        text: 'What is the chemical formula for water?',
        options: ['H2', 'O2', 'CO2', 'H2O'],
        correctAnswers: ['H2O'],
        explanation: 'Water molecules consist of two hydrogen atoms bonded to one oxygen atom.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizChemistry._id,
        type: 'true-false',
        text: 'Electrons are positively charged subatomic particles.',
        options: ['True', 'False'],
        correctAnswers: ['False'],
        explanation: 'Electrons carry a negative charge. Protons are positive, and neutrons are neutral.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizChemistry._id,
        type: 'multiple-correct',
        text: 'Which of the following are noble gases? (Select all that apply)',
        options: ['Helium', 'Neon', 'Argon', 'Oxygen', 'Nitrogen'],
        correctAnswers: ['Helium', 'Neon', 'Argon'],
        explanation: 'Helium, Neon, and Argon are chemically inert noble gases in group 18.',
        marks: 2,
        negativeMarks: 0.5
      },
      {
        quizId: quizChemistry._id,
        type: 'fill-in-the-blank',
        text: 'The most abundant gas in Earth\'s atmosphere is _______',
        options: [],
        correctAnswers: ['Nitrogen'],
        explanation: 'Nitrogen makes up approximately 78% of dry atmosphere.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizChemistry._id,
        type: 'mcq',
        text: 'What is the pH of pure water?',
        options: ['0', '5', '7', '14'],
        correctAnswers: ['7'],
        explanation: 'Neutral pure water has a pH balance of 7.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizChemistry._id,
        type: 'true-false',
        text: 'Oxidation involves the loss of electrons.',
        options: ['True', 'False'],
        correctAnswers: ['True'],
        explanation: 'Oxidation is electron loss; reduction is electron gain (OIL RIG).',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizChemistry._id,
        type: 'mcq',
        text: 'What is the chemical symbol for Gold?',
        options: ['Ag', 'Au', 'Fe', 'Pb'],
        correctAnswers: ['Au'],
        explanation: 'Au comes from the Latin word "aurum", signifying gold.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizChemistry._id,
        type: 'fill-in-the-blank',
        text: 'The atomic number of Carbon is _______',
        options: [],
        correctAnswers: ['6'],
        explanation: 'Carbon atoms possess 6 protons.',
        marks: 1,
        negativeMarks: 0
      },
      {
        quizId: quizChemistry._id,
        type: 'mcq',
        text: 'Which state of matter has a definite volume but no definite shape?',
        options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
        correctAnswers: ['Liquid'],
        explanation: 'Liquids adapt shapes to matching containers while preserving constant volume sizes.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        quizId: quizChemistry._id,
        type: 'multiple-correct',
        text: 'Which of the following are covalent compounds? (Select all that apply)',
        options: ['H2O', 'CO2', 'CH4', 'NaCl'],
        correctAnswers: ['H2O', 'CO2', 'CH4'],
        explanation: 'Water, carbon dioxide and methane share electrons. NaCl is an ionic compound.',
        marks: 2,
        negativeMarks: 0.5
      }
    ];

    // Bulk insert all questions
    const allQuestions = [
      ...jsQ,
      ...pythonQ,
      ...dsQ,
      ...algebraQ,
      ...physicsQ,
      ...chemistryQ
    ];
    await Question.insertMany(allQuestions);
    console.log(`❓ Created ${allQuestions.length} questions (10 questions per quiz)`);

    // Fetch newly created questions for references in results
    const qDocsJS = await Question.find({ quizId: quizJS._id });

    // ─── RESULTS ─────────────────────────────────────────────────────────────
    // John Student took JavaScript Quiz and passed
    const resultJS = await Result.create({
      studentId: student1._id,
      quizId: quizJS._id,
      score: 8,
      percentage: 80.0,
      totalQuestions: 10,
      correctAnswers: 8,
      wrongAnswers: 2,
      skippedAnswers: 0,
      timeTaken: 240,
      passed: true,
      answers: qDocsJS.map((q, i) => {
        return {
          questionId: q._id,
          selectedAnswers: q.correctAnswers,
          isCorrect: i < 8, // Mark first 8 correct
          marksAwarded: i < 8 ? q.marks : -q.negativeMarks
        };
      })
    });

    // Generate certificate for passed attempt
    await Certificate.create({
      studentId: student1._id,
      quizId: quizJS._id,
      resultId: resultJS._id
    });

    // Jane Student took JavaScript Quiz and failed
    await Result.create({
      studentId: student2._id,
      quizId: quizJS._id,
      score: 2,
      percentage: 20.0,
      totalQuestions: 10,
      correctAnswers: 2,
      wrongAnswers: 8,
      skippedAnswers: 0,
      timeTaken: 500,
      passed: false,
      answers: qDocsJS.map((q, i) => {
        return {
          questionId: q._id,
          selectedAnswers: i < 2 ? q.correctAnswers : ['wrong-placeholder'],
          isCorrect: i < 2,
          marksAwarded: i < 2 ? q.marks : -q.negativeMarks
        };
      })
    });

    console.log('📊 Created 2 quiz results + 1 Certificate');

    // ─── NOTIFICATIONS ─────────────────────────────────────────────────────
    await Notification.create([
      {
        recipientId: null,
        title: 'Welcome to Quiz Platform! 🎓',
        message: 'Get ready to attempt quizzes across computer science, math and general science!',
        type: 'announcement'
      },
      {
        recipientId: student1._id,
        recipientModel: 'Student',
        title: 'Quiz Passed! 🏆',
        message: 'You successfully completed the JavaScript Fundamentals quiz. Certificate generated!',
        type: 'certificate_ready'
      }
    ]);

    console.log('🔔 Created notifications');

    // ─── CONTACT MESSAGES ──────────────────────────────────────────────────
    await Message.create([
      {
        name: 'John Student',
        email: 'john@quiz.com',
        subject: 'Certificate Download Issue',
        message: 'Hello admin, I am unable to export my certificate as PDF. It throws a blank page.'
      }
    ]);

    console.log('📩 Created 1 contact message');

    console.log('\n✅ ===== DATABASE SEEDING COMPLETED =====');
    console.log('Admin Email:     admin@quizsystem.com / Admin@123');
    console.log('Teacher Email:   alice@quiz.com       / Teacher@1234');
    console.log('Student Email:   john@quiz.com        / Student@1234');
    console.log('========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seed();
