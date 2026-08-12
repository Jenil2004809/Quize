const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const AIService = require('../services/aiService');

// Intelligent Knowledge Base Templates for Instant High-Quality AI Generation
const AI_TOPIC_TEMPLATES = {
  iot: [
    {
      text: "Which layer in the IoT architectural model is responsible for sensor data acquisition?",
      options: ["Perception / Sensing Layer", "Network Layer", "Application Layer", "Business Layer"],
      correctAnswers: ["Perception / Sensing Layer"],
      explanation: "The Perception Layer consists of sensors, RFID tags, and actuators that physical gather ambient data from the environment.",
      marks: 1,
      difficulty: "easy"
    },
    {
      text: "Which wireless protocol is optimized for short-range, low-power personal area networks in IoT?",
      options: ["Zigbee (IEEE 802.15.4)", "5G NR", "Ethernet IEEE 802.3", "Satellite X-Band"],
      correctAnswers: ["Zigbee (IEEE 802.15.4)"],
      explanation: "Zigbee is specifically built for low-power, low-data rate mesh networking in smart home and industrial automation.",
      marks: 1,
      difficulty: "medium"
    },
    {
      text: "What is the primary advantage of MQTT over traditional HTTP in constrained IoT deployments?",
      options: ["Publish-Subscribe architecture with minimal header overhead", "Heavy synchronous XML formatting", "Stateless connectionless UDP streaming", "Built-in video rendering"],
      correctAnswers: ["Publish-Subscribe architecture with minimal header overhead"],
      explanation: "MQTT uses a lightweight 2-byte header with pub/sub architecture, dramatically reducing battery & data consumption compared to HTTP headers.",
      marks: 1,
      difficulty: "hard"
    }
  ],
  se: [
    {
      text: "Which SDLC model is characterized by iterative development cycles called Sprints?",
      options: ["Agile Scrum", "Waterfall Model", "V-Model", "Big Bang Model"],
      correctAnswers: ["Agile Scrum"],
      explanation: "Scrum breaks software delivery into time-boxed iterations (1-4 weeks) called Sprints for continuous feedback.",
      marks: 1,
      difficulty: "easy"
    },
    {
      text: "What does the Single Responsibility Principle (SRP) state in SOLID architecture?",
      options: ["A class should have only one reason to change", "Functions must return single values", "All modules must compile in one file", "Database tables must have one primary key"],
      correctAnswers: ["A class should have only one reason to change"],
      explanation: "SRP mandates that a software module/class should be encapsulated around a single core business responsibility.",
      marks: 1,
      difficulty: "medium"
    },
    {
      text: "Which testing technique evaluates system behavior at stress boundaries exceeding normal capacity?",
      options: ["Stress & Load Testing", "Unit Testing", "Syntax Checking", "Alpha Acceptance Testing"],
      correctAnswers: ["Stress & Load Testing"],
      explanation: "Stress testing pushes system loads beyond theoretical capacity to verify failure recovery and stability under extreme spikes.",
      marks: 1,
      difficulty: "hard"
    }
  ],
  ws: [
    {
      text: "Which format is mandatory for messaging in SOAP (Simple Object Access Protocol)?",
      options: ["XML Envelope", "JSON Array", "YAML Key-Value", "Binary Buffer"],
      correctAnswers: ["XML Envelope"],
      explanation: "SOAP strictly relies on XML for formatting message headers and payloads.",
      marks: 1,
      difficulty: "easy"
    },
    {
      text: "What does WSDL stand for in Web Services architecture?",
      options: ["Web Services Description Language", "Wide System Data Link", "Web Server Directory List", "Wireless Service Definition Layer"],
      correctAnswers: ["Web Services Description Language"],
      explanation: "WSDL is an XML-based specification used to describe web service endpoints, methods, and data contracts.",
      marks: 1,
      difficulty: "medium"
    },
    {
      text: "Which HTTP method should be idempotent according to RESTful architectural guidelines?",
      options: ["PUT & GET", "POST", "PATCH", "CONNECT"],
      correctAnswers: ["PUT & GET"],
      explanation: "PUT and GET methods are idempotent, meaning multiple identical requests yield the exact same resource state as a single request.",
      marks: 1,
      difficulty: "hard"
    }
  ]
};

// @desc    Generate AI Quiz Questions based on topic and difficulty
// @route   POST /api/ai/generate-quiz
// @access  Private (Teacher/Admin)
const generateAIQuiz = async (req, res, next) => {
  try {
    const { topic, difficulty = 'mixed', count = 5 } = req.body;

    if (!topic || topic.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a topic for AI question generation.' });
    }

    const cleanTopic = topic.toLowerCase().trim();
    let baseQuestions = [];

    if (cleanTopic.includes('iot') || cleanTopic.includes('internet of things') || cleanTopic.includes('sensor')) {
      baseQuestions = AI_TOPIC_TEMPLATES.iot;
    } else if (cleanTopic.includes('se') || cleanTopic.includes('software') || cleanTopic.includes('agile')) {
      baseQuestions = AI_TOPIC_TEMPLATES.se;
    } else if (cleanTopic.includes('ws') || cleanTopic.includes('web service') || cleanTopic.includes('soap') || cleanTopic.includes('rest')) {
      baseQuestions = AI_TOPIC_TEMPLATES.ws;
    } else {
      // Dynamic General Tech Generation
      baseQuestions = [
        {
          text: `What is a fundamental concept in ${topic}?`,
          options: [
            `Modular architecture in ${topic}`,
            `Monolithic static processing`,
            `Depreciated single-thread loops`,
            `Manual tape storage indexing`
          ],
          correctAnswers: [`Modular architecture in ${topic}`],
          explanation: `Modular design ensures scalability and fault-isolation when building applications in ${topic}.`,
          marks: 1,
          difficulty: "easy"
        },
        {
          text: `Which security best practice should be enforced when implementing ${topic}?`,
          options: [
            "Principle of Least Privilege & Encryption at Rest",
            "Disabling SSL/TLS certificates",
            "Hardcoding credentials in source control",
            "Storing plaintext passwords in memory"
          ],
          correctAnswers: ["Principle of Least Privilege & Encryption at Rest"],
          explanation: "Least privilege access combined with strong encryption safeguards resources against unauthorized exploitation.",
          marks: 1,
          difficulty: "medium"
        },
        {
          text: `How does real-time monitoring optimize performance in ${topic} systems?`,
          options: [
            "Provides immediate telemetric visibility and automated anomaly alerts",
            "Slowing down system clock speeds",
            "Deleting log files automatically",
            "Disabling network sockets"
          ],
          correctAnswers: ["Provides immediate telemetric visibility and automated anomaly alerts"],
          explanation: "Telemetry and continuous observability enable proactive mitigation of bottlenecks before service degradation occurs.",
          marks: 1,
          difficulty: "hard"
        }
      ];
    }

    // Expand questions to requested count
    const numRequested = Math.max(1, Math.min(parseInt(count || 5), 15));
    const generated = [];

    const { randomizeQuestionOptions } = require('../utils/shuffleUtils');

    for (let i = 0; i < numRequested; i++) {
      const template = baseQuestions[i % baseQuestions.length];
      const shuffledOptions = randomizeQuestionOptions(template.options || []);
      generated.push({
        ...template,
        options: shuffledOptions,
        text: i >= baseQuestions.length ? `${template.text} (Variation ${Math.floor(i / baseQuestions.length) + 1})` : template.text
      });
    }

    return res.json({
      success: true,
      topic,
      count: generated.length,
      questions: generated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate instant AI Mentor explanation for a question result
// @route   POST /api/ai/explain-question
// @access  Private (Student)
const explainQuestionWithAI = async (req, res, next) => {
  try {
    const { questionText, options, selectedAnswers, correctAnswers, explanation } = req.body;

    if (!questionText) {
      return res.status(400).json({ success: false, message: 'Question details required for AI explanation.' });
    }

    const userAns = Array.isArray(selectedAnswers) ? selectedAnswers.join(', ') : (selectedAnswers || 'None');
    const correctAns = Array.isArray(correctAnswers) ? correctAnswers.join(', ') : (correctAnswers || 'Not Specified');
    const isUserCorrect = userAns === correctAns;

    // Extract key topic from question text for a rich topic deep-dive
    let topicDetail = 'This topic evaluates core principles, standards, and architecture specifications.';
    const qLower = questionText.toLowerCase();

    if (qLower.includes('mqtt') || qLower.includes('protocol') || qLower.includes('sensor')) {
      topicDetail = 'IoT Communication Protocols: Protocols like MQTT, CoAP, and Zigbee are engineered for constrained sensor networks with minimal header overhead, low power consumption, and publish-subscribe asynchronous messaging.';
    } else if (qLower.includes('agile') || qLower.includes('scrum') || qLower.includes('sprint') || qLower.includes('sdlc')) {
      topicDetail = 'Agile Software Development Lifecycle (SDLC): Iterative methodologies prioritize continuous customer feedback, time-boxed Sprints (1-4 weeks), adaptive planning, and rapid feature delivery over rigid upfront documentation.';
    } else if (qLower.includes('soap') || qLower.includes('wsdl') || qLower.includes('rest') || qLower.includes('http')) {
      topicDetail = 'Web Services Architecture: Service-Oriented Architecture (SOA) relies on standardized contracts (SOAP XML envelopes with WSDL descriptors or RESTful JSON APIs with idempotent HTTP verbs) to achieve seamless interoperability across heterogeneous platforms.';
    } else if (qLower.includes('security') || qLower.includes('encrypt') || qLower.includes('privilege')) {
      topicDetail = 'Cybersecurity & Least Privilege: Multi-layered defense requires enforcing minimal access permissions, strict authorization tokens (JWT/OAuth2), and encryption at rest and in transit.';
    } else if (qLower.includes('layer') || qLower.includes('perception') || qLower.includes('sensing')) {
      topicDetail = 'IoT Architecture Layers: The Perception/Sensing Layer acquires real-world physical data via sensors/actuators; the Network Layer transmits packets; the Application Layer delivers end-user analytics.';
    }

    const aiBreakdown = {
      conceptSummary: `📘 Topic Overview:\n${topicDetail}\n\n📌 Question Context:\n"${questionText}"`,
      whyCorrect: `✅ Correct Choice: "${correctAns}"\n\nExplanation:\n${explanation || 'This option directly satisfies the theoretical and operational criteria defined by domain standards.'}`,
      whyUserWrong: isUserCorrect
        ? '🎉 Excellent work! Your selection was 100% accurate.'
        : `⚠️ Your Selection: "${userAns}"\n\nAnalysis:\nThis option is incorrect because it represents a different layer, protocol, or anti-pattern that does not satisfy the requirements of "${correctAns}".`,
      proTip: '💡 AI Mentor Advice: Focus on understanding the core concept rather than memorizing options. Reviewing this unit’s summary will help solidify this topic!'
    };

    return res.json({
      success: true,
      aiBreakdown
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get questions categorized by difficulty for AI Adaptive Quiz mode
// @route   GET /api/ai/adaptive-questions/:quizId
// @access  Private (Student)
const getAdaptiveQuestions = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const questions = await Question.find({ quizId });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found for this quiz.' });
    }

    // Categorize questions into Easy, Medium, Hard
    const easy = questions.filter(q => q.difficulty === 'easy' || q.marks <= 1);
    const medium = questions.filter(q => q.difficulty === 'medium' || q.marks === 2);
    const hard = questions.filter(q => q.difficulty === 'hard' || q.marks >= 3);

    return res.json({
      success: true,
      totalCount: questions.length,
      adaptivePool: {
        easy: easy.length > 0 ? easy : questions,
        medium: medium.length > 0 ? medium : questions,
        hard: hard.length > 0 ? hard : questions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Interactive 1-on-1 Chat with AI Tutor for a specific question
// @route   POST /api/ai/chat
// @access  Private (Student)
const chatWithAI = async (req, res, next) => {
  try {
    const { questionContext, history, userMessage, message, userPrompt } = req.body;
    const msg = userMessage || message || userPrompt;

    if (!msg) {
      return res.status(400).json({ success: false, message: 'Message is required for AI chat.' });
    }

    const reply = await AIService.chatWithAITutor(questionContext, history || [], msg);

    return res.json({
      success: true,
      reply
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAIQuiz,
  explainQuestionWithAI,
  getAdaptiveQuestions,
  chatWithAI
};
