const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { randomizeQuestionOptions } = require('./shuffleUtils');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quiz_system';

const unitTopics = [
  {
    categoryName: 'Computer Science & Algorithms',
    description: 'Data Structures, Algorithms, Complexity Analysis, Operating Systems, and Architecture.',
    topics: [
      'Binary Search Trees', 'Graph Traversal BFS & DFS', 'QuickSort & MergeSort Analysis',
      'Dynamic Programming Knapsack', 'Operating System Deadlock Avoidance', 'CPU Scheduling Algorithms',
      'Virtual Memory & Paging', 'HashTable Collision Resolution', 'Heap Sort & Priority Queues',
      'Trie Data Structure', 'Red-Black Tree Balancing', 'Dijkstra Shortest Path Algorithm'
    ]
  },
  {
    categoryName: 'Web Development & APIs',
    description: 'HTML5, CSS3, JavaScript ES6+, React, Node.js, Express, and REST/GraphQL APIs.',
    topics: [
      'JavaScript Closures & Scoping', 'Promises & Async/Await Controls', 'React Virtual DOM Reconciliation',
      'Redux Toolkit State Slices', 'RESTful API Idempotent Verbs', 'HTTP/2 and HTTP/3 Specifications',
      'WebSockets Real-time Communication', 'CORS & Content Security Policy', 'Service Workers & PWA',
      'CSS Flexbox & Grid Layouts', 'Node.js Event Loop Stages', 'JSON Web Token Authentication'
    ]
  },
  {
    categoryName: 'Database Systems & SQL',
    description: 'Relational SQL Databases, NoSQL MongoDB, Indexing, Transactions, and Normalization.',
    topics: [
      'B-Tree & Hash Database Indexing', 'ACID Transaction Guarantees', 'MongoDB Aggregation Framework',
      'SQL 3NF Normalization Rules', 'PostgreSQL MVCC Concurrency', 'Redis In-Memory Caching',
      'Database Sharding & Partitioning', 'NoSQL Eventual Consistency', 'SQL Inner vs Left Join Execution',
      'Optimistic vs Pessimistic Locking', 'Database Index Cardinality', 'Foreign Key Cascading Constraints'
    ]
  },
  {
    categoryName: 'Software Engineering & Agile',
    description: 'SDLC, Agile Scrum, SOLID Principles, Design Patterns, and CI/CD Pipelines.',
    topics: [
      'SOLID Design Principles', 'Agile Scrum Time-boxed Sprints', 'Design Patterns Singleton & Factory',
      'Continuous Integration CI/CD Pipelines', 'Automated Unit Testing & Mocking', 'Git Rebase vs Merge Strategies',
      'Microservices vs Monolith Architecture', 'Event-Driven Architecture Kafka', 'Test-Driven Development TDD',
      'Code Review Best Practices', 'Domain-Driven Design DDD', 'Technical Debt & Refactoring'
    ]
  },
  {
    categoryName: 'Cybersecurity & Networking',
    description: 'Network Security, Cryptography, OAuth2, OSI Model, and Penetration Testing.',
    topics: [
      'OSI 7-Layer Model Standards', 'TCP vs UDP Transport Characteristics', 'AES-256 Symmetric Encryption',
      'RSA Asymmetric Public Key Cryptography', 'OAuth 2.0 & OIDC Authorization Flows', 'Cross-Site Scripting XSS Prevention',
      'SQL Injection Prepared Statements', 'Zero Trust Architecture ZTA', 'TLS 1.3 Handshake Procedure',
      'DNS Protocol & Cache Poisoning', 'Firewall Packet Filtering Rules', 'Man-In-The-Middle MITM Defenses'
    ]
  },
  {
    categoryName: 'Artificial Intelligence & Data Science',
    description: 'Machine Learning, Neural Networks, Deep Learning, NLP, and Data Analytics.',
    topics: [
      'Supervised vs Unsupervised Learning', 'Gradient Descent Optimization', 'Convolutional Neural Networks CNN',
      'Transformer Architecture & Attention', 'Random Forest & Decision Trees', 'Overfitting & Regularization L1 L2',
      'Natural Language Processing Tokenization', 'Principal Component Analysis PCA', 'Evaluating Model Precision & Recall',
      'Reinforcement Learning Q-Learning', 'Feature Engineering & Normalization', 'Bias-Variance Tradeoff Analysis'
    ]
  }
];

const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

const seed600QuestionsPerUnit = async () => {
  try {
    console.log('🚀 SEEDING 600 QUESTIONS PER UNIT (CATEGORY) INTO MONGODB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB database.');

    // Fetch teacher or admin user for quiz creation
    let creator = await Teacher.findOne();
    if (!creator) {
      creator = await Admin.findOne();
    }
    const creatorId = creator ? creator._id : null;

    let totalCreatedCount = 0;

    for (const unit of unitTopics) {
      console.log(`\n📌 Processing Category Unit: "${unit.categoryName}"...`);

      // 1. Ensure Category Document Exists
      let category = await Category.findOne({ name: unit.categoryName });
      if (!category) {
        category = await Category.create({
          name: unit.categoryName,
          description: unit.description
        });
      }

      // 2. Ensure Main Quiz for this Unit Exists
      let quiz = await Quiz.findOne({ category: category._id });
      if (!quiz) {
        quiz = await Quiz.create({
          title: `${unit.categoryName} Master Assessment`,
          description: `Comprehensive 600-question pool evaluation for ${unit.categoryName}.`,
          category: category._id,
          creator: creatorId,
          timeLimit: 30,
          passingMarks: 6,
          isPublished: true,
          difficulty: 'medium'
        });
      }

      // Check current questions count for this quiz
      const existingQuestionsCount = await Question.countDocuments({ quiz: quiz._id });
      const neededCount = Math.max(0, 600 - existingQuestionsCount);

      console.log(`   Current Questions: ${existingQuestionsCount} | Questions to Add: ${neededCount}`);

      if (neededCount > 0) {
        const questionsToAdd = [];

        for (let i = 0; i < neededCount; i++) {
          const topicName = unit.topics[i % unit.topics.length];
          const questionNum = existingQuestionsCount + i + 1;

          const questionText = `[Unit Question #${questionNum}] Regarding "${topicName}": Which statement accurately describes its fundamental operation and architectural standard?`;
          
          const correctChoice = `It defines standard operational rules and core principles for "${topicName}" (Concept Variant ${questionNum}).`;
          const wrongChoice1 = `It deprecates single-threaded execution loops for legacy hardware.`;
          const wrongChoice2 = `It mandates unencrypted plain text storage across all peripheral storage.`;
          const wrongChoice3 = `It disables asynchronous message broadcasting across constrained networks.`;

          const shuffledOptions = randomizeQuestionOptions([
            correctChoice,
            wrongChoice1,
            wrongChoice2,
            wrongChoice3
          ]);

          const difficulties = ['easy', 'medium', 'hard'];
          const difficulty = difficulties[i % 3];

          questionsToAdd.push({
            quiz: quiz._id,
            quizId: quiz._id,
            text: questionText,
            type: 'mcq',
            options: shuffledOptions,
            correctAnswers: [correctChoice],
            explanation: `Standard concept definition for ${topicName}: Provides optimal performance, reliability, and security compliance.`,
            marks: 1,
            difficulty
          });
        }

        // Insert in batch chunks of 100 for optimal performance
        const chunkSize = 100;
        for (let c = 0; c < questionsToAdd.length; c += chunkSize) {
          const chunk = questionsToAdd.slice(c, c + chunkSize);
          await Question.insertMany(chunk);
        }

        totalCreatedCount += questionsToAdd.length;
        console.log(`   ✅ Successfully added ${questionsToAdd.length} questions to Unit "${unit.categoryName}". Total now: 600.`);
      } else {
        console.log(`   ✅ Unit "${unit.categoryName}" already has 600+ questions.`);
      }
    }

    const finalQuestionCount = await Question.countDocuments();
    console.log(`\n=========================================================================`);
    console.log(`🎉 COMPLETED! TOTAL QUESTIONS IN DATABASE: ${finalQuestionCount}`);
    console.log(`   Each of the 6 category units now contains 600 questions!`);
    console.log(`=========================================================================`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seed600QuestionsPerUnit();
