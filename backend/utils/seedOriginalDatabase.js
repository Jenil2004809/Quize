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
const PolicyViolationLog = require('../models/PolicyViolationLog');
const Setting = require('../models/Setting');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quiz_system';

const seedOriginalDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Connected to MongoDB for 100% Original Academic Seeding...');
    }

    // ─── PURGE EXISTING COLLECTIONS ──────────────────────────────────────────
    console.log('🧹 Purging existing legacy data...');
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
      Message.deleteMany({}),
      PolicyViolationLog.deleteMany({}),
      Setting.deleteMany({})
    ]);

    // ─── 1. GLOBAL SYSTEM SETTINGS ───────────────────────────────────────────
    await Setting.create({
      siteName: 'University Examination & Assessment Portal',
      contactEmail: 'academics@university.edu',
      enableAiProctoring: true,
      maxTabViolations: 3,
      allowRegistration: true,
      maintenanceMode: false
    });

    // ─── 2. SYSTEM ADMINISTRATOR ────────────────────────────────────────────
    const admin = await Admin.create({
      name: 'System Administrator',
      email: 'admin@quizsystem.com',
      phone: '+1 (555) 019-2831',
      password: 'Admin@123',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    console.log('👤 Admin Created: admin@quizsystem.com / Admin@123');

    // ─── 3. AUTHENTIC UNIVERSITY FACULTY (TEACHERS) ──────────────────────────
    const teacherGohil = await Teacher.create({
      name: 'Prof. Dr. Rajesh Gohil',
      email: 'prof.rajesh.gohil@college.edu',
      phone: '+1 (555) 234-8901',
      password: 'Teacher@1234',
      role: 'teacher',
      specialization: 'Computer Science & Software Architecture (PhD, IIT Bombay)',
      isApproved: true,
      isActive: true,
      isEmailVerified: true
    });

    const teacherSharma = await Teacher.create({
      name: 'Dr. Ananya Sharma',
      email: 'dr.ananya.sharma@college.edu',
      phone: '+1 (555) 345-9012',
      password: 'Teacher@1234',
      role: 'teacher',
      specialization: 'Artificial Intelligence & Neural Architectures (PhD, Stanford)',
      isApproved: true,
      isActive: true,
      isEmailVerified: true
    });

    const teacherPatel = await Teacher.create({
      name: 'Prof. Vikram Patel',
      email: 'prof.vikram.patel@college.edu',
      phone: '+1 (555) 456-0123',
      password: 'Teacher@1234',
      role: 'teacher',
      specialization: 'Internet of Things & Embedded Hardware Systems',
      isApproved: true,
      isActive: true,
      isEmailVerified: true
    });

    const teacherDeshmukh = await Teacher.create({
      name: 'Dr. Priya Deshmukh',
      email: 'dr.priya.deshmukh@college.edu',
      phone: '+1 (555) 567-1234',
      password: 'Teacher@1234',
      role: 'teacher',
      specialization: 'Database Systems & Cloud Web Services',
      isApproved: true,
      isActive: true,
      isEmailVerified: true
    });

    console.log('👥 4 University Faculty Profiles Created');

    // ─── 4. AUTHENTIC ENROLLED UNIVERSITY STUDENTS ───────────────────────────
    const studentAarav = await Student.create({
      name: 'Aarav Mehta',
      email: 'aarav.mehta@student.college.edu',
      phone: '+1 (555) 678-2345',
      password: 'Student@1234',
      role: 'student',
      isActive: true,
      isApproved: true,
      isEmailVerified: true
    });

    const studentDiya = await Student.create({
      name: 'Diya Nair',
      email: 'diya.nair@student.college.edu',
      phone: '+1 (555) 789-3456',
      password: 'Student@1234',
      role: 'student',
      isActive: true,
      isApproved: true,
      isEmailVerified: true
    });

    const studentRohan = await Student.create({
      name: 'Rohan Gupta',
      email: 'rohan.gupta@student.college.edu',
      phone: '+1 (555) 890-4567',
      password: 'Student@1234',
      role: 'student',
      isActive: true,
      isApproved: true,
      isEmailVerified: true
    });

    const studentAnanya = await Student.create({
      name: 'Ananya Verma',
      email: 'ananya.verma@student.college.edu',
      phone: '+1 (555) 901-5678',
      password: 'Student@1234',
      role: 'student',
      isActive: true,
      isApproved: true,
      isEmailVerified: true
    });

    const studentKavya = await Student.create({
      name: 'Kavya Shah',
      email: 'kavya.shah@student.college.edu',
      phone: '+1 (555) 012-6789',
      password: 'Student@1234',
      role: 'student',
      isActive: true,
      isApproved: true,
      isEmailVerified: true
    });

    console.log('🎓 5 Enrolled University Students Created');

    // ─── 5. ACADEMIC CATEGORIES ──────────────────────────────────────────────
    const catCSE = await Category.create({
      name: 'Computer Science & Engineering',
      slug: 'computer-science-engineering',
      description: 'Core ABET-accredited curriculum covering system software, algorithms, architectures, and design principles.'
    });

    const catIT = await Category.create({
      name: 'Information Technology & Cloud Systems',
      slug: 'information-technology-cloud',
      description: 'Enterprise web services, distributed database architectures, cloud infrastructures, and DevOps protocols.'
    });

    const catAI = await Category.create({
      name: 'Artificial Intelligence & Data Science',
      slug: 'artificial-intelligence-data-science',
      description: 'Deep neural networks, probabilistic machine learning, statistical evaluation, and natural language computing.'
    });

    const catIoT = await Category.create({
      name: 'Electronics & IoT Systems',
      slug: 'electronics-iot-systems',
      description: 'Embedded microcontrollers, wireless sensor mesh networks, edge computing, and real-time hardware telemetry.'
    });

    console.log('🏛️ 4 Academic Disciplines/Categories Created');

    // ─── 6. UNIVERSITY SUBJECTS ──────────────────────────────────────────────
    const subSE = await Subject.create({
      name: 'Software Engineering',
      slug: 'software-engineering',
      category: catCSE._id,
      description: 'Comprehensive curriculum covering SDLC Agile/Scrum, Requirements SRS, Object-Oriented SOLID Architecture, and Testing QA.'
    });

    const subIoT = await Subject.create({
      name: 'Internet of Things',
      slug: 'internet-of-things',
      category: catIoT._id,
      description: 'Comprehensive curriculum covering IoT Protocols (6LoWPAN/MQTT/CoAP), Sensors, Arduino/ESP32, and WSN Cloud Integration.'
    });

    const subWS = await Subject.create({
      name: 'Web Services & SOA',
      slug: 'web-services-soa',
      category: catIT._id,
      description: 'Comprehensive curriculum covering SOA Architecture, SOAP, WSDL, UDDI, Conversational WS, and WS-Security Standards.'
    });

    const subDSA = await Subject.create({
      name: 'Computer Science & Algorithms',
      slug: 'computer-science-algorithms',
      category: catCSE._id,
      description: 'Comprehensive curriculum covering Asymptotic Complexity, Self-Balancing Trees, Graph Algorithms, and Dynamic Programming.'
    });

    const subDBMS = await Subject.create({
      name: 'Database Systems & SQL',
      slug: 'database-systems-sql',
      category: catIT._id,
      description: 'Comprehensive curriculum covering Relational Normalization (1NF–BCNF), ACID Transactions, B+ Tree Indexing, and NoSQL.'
    });

    const subAI = await Subject.create({
      name: 'Artificial Intelligence & Data Science',
      slug: 'artificial-intelligence-data-science-subject',
      category: catAI._id,
      description: 'Comprehensive curriculum covering Supervised/Unsupervised Learning, Neural Backpropagation, CNNs, and Transformer Attention.'
    });

    console.log('📚 6 Core Academic Subjects Created');

    // Helper to insert quiz and questions
    const createQuizWithQuestions = async ({ quizData, questionsData }) => {
      const quiz = await Quiz.create(quizData);
      for (const q of questionsData) {
        await Question.create({
          quizId: quiz._id,
          type: q.type || 'mcq',
          text: q.text,
          options: q.options || [],
          correctAnswers: q.correctAnswers,
          explanation: q.explanation || '',
          marks: q.marks || 1,
          negativeMarks: q.negativeMarks !== undefined ? q.negativeMarks : 0.25
        });
      }
      return quiz;
    };

    // =========================================================================
    // SUBJECT 1: SOFTWARE ENGINEERING (SE) - 4 UNIT QUIZZES
    // =========================================================================
    
    // SE Unit 1
    const seQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'SE Unit 1: SDLC Models & Agile Scrum Methodologies',
        description: 'System Curriculum Quiz for Unit 1. Covers Waterfall, Spiral, V-Model, Agile Manifesto principles, Scrum sprint ceremonies, and User Story estimation.',
        category: catCSE._id,
        subject: subSE._id,
        unitName: 'Unit 1: SDLC Models & Agile Scrum',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'Which software development lifecycle model introduces risk assessment and mitigation at the beginning of every developmental phase loop?', options: ['The Spiral Model (Boehm)', 'The Classical Waterfall Model', 'The Big Bang Model', 'The Linear Sequential Model'], correctAnswers: ['The Spiral Model (Boehm)'], explanation: 'Barry Boehm\'s Spiral Model explicitly incorporates structured risk analysis and management into each cyclical iteration before committing to further phases.' },
        { text: 'In the Agile Scrum framework, what is the primary objective of the Daily Standup (Daily Scrum) ceremony?', options: ['A 15-minute time-boxed synchronization for the team to inspect progress toward the Sprint Goal and plan the next 24 hours of work', 'A formal performance review meeting conducted by upper management to grade individual developer output', 'A 2-hour technical code review session where every pull request is reviewed line-by-line', 'A client budget renegotiation meeting held every morning'], correctAnswers: ['A 15-minute time-boxed synchronization for the team to inspect progress toward the Sprint Goal and plan the next 24 hours of work'], explanation: 'The Daily Scrum is a 15-minute time-boxed event for the Scrum Team to synchronize activities and create a plan for the next 24 hours.' },
        { text: 'According to IEEE-830 standards, what constitutes a Non-Functional Requirement (NFR)?', options: ['System constraints specifying performance criteria, security levels, availability, and throughput benchmarks', 'Specific business logic actions that calculate user invoice discounts', 'A bug report filed after software release', 'The physical salary rate negotiated with software engineering contractors'], correctAnswers: ['System constraints specifying performance criteria, security levels, availability, and throughput benchmarks'], explanation: 'Non-Functional Requirements define system quality attributes and constraints rather than specific behavioral features.' },
        { text: 'In the V-Model of software engineering, which verification activity corresponds directly to Acceptance Testing?', options: ['Requirements Analysis & Specification', 'System Architectural Design', 'Module Low-Level Detailed Design', 'Source Code Compilation'], correctAnswers: ['Requirements Analysis & Specification'], explanation: 'In the V-Model, User Acceptance Testing verifies whether the deliverable satisfies the original business and requirements specifications.' },
        { text: 'Which Agile artifact represents the single source of truth for all proposed features, enhancements, and bug fixes awaiting prioritization?', options: ['Product Backlog', 'Sprint Burndown Chart', 'Team Velocity Graph', 'Daily Impediment Log'], correctAnswers: ['Product Backlog'], explanation: 'The Product Backlog is an ordered, evolving list of everything that is known to be needed in the product, managed directly by the Product Owner.' },
        { text: 'What does the Definition of Done (DoD) signify in modern Agile engineering teams?', options: ['A shared, formal checklist of quality standards that a product increment must meet before release', 'The date when the client pays the final contractual invoice', 'The moment when a developer finishes writing raw code before testing begins', 'When the software engineering manager signs off on retirement benefits'], correctAnswers: ['A shared, formal checklist of quality standards that a product increment must meet before release'], explanation: 'The Definition of Done is a formal commitment ensuring an Increment meets required quality standards for production.' },
        { text: 'Which estimation technique uses a consensus-based, gamified approach using Fibonacci numbers to calculate relative story points?', options: ['Planning Poker', 'COCOMO II Algorithmic Cost Estimation', 'Function Point Analysis (FPA)', 'Delphi Top-Down Budgeting'], correctAnswers: ['Planning Poker'], explanation: 'Planning Poker is a gamified technique where team members play numbered cards to collaboratively estimate user story complexity.' },
        { text: 'What is the fundamental difference between Verification and Validation in software engineering?', options: ['Verification evaluates whether the product is built according to specifications ("Are we building the product right?"), while Validation evaluates if it meets customer needs ("Are we building the right product?")', 'Verification is done exclusively by clients, whereas Validation is executed by the compiler', 'Verification only checks hardware voltage, whereas Validation tests network cables', 'There is no technical distinction between the two terms'], correctAnswers: ['Verification evaluates whether the product is built according to specifications ("Are we building the product right?"), while Validation evaluates if it meets customer needs ("Are we building the right product?")'], explanation: 'Verification confirms conformance to design specs; Validation ensures the software meets real-world user needs.' },
        { text: 'In Scrum, who is exclusively responsible for maximizing the value of the product and managing the Product Backlog?', options: ['The Product Owner', 'The Scrum Master', 'The Lead Quality Assurance Engineer', 'The Database Administrator'], correctAnswers: ['The Product Owner'], explanation: 'The Product Owner is the sole person responsible for managing the Product Backlog and optimizing product value.' },
        { text: 'Which metric measures the rate at which an Agile development team completes backlog items per sprint iteration?', options: ['Team Velocity (Story Points per Sprint)', 'Cyclomatic Complexity Index', 'Lines of Code (LOC) per Hour', 'Database CPU Utilization Rate'], correctAnswers: ['Team Velocity (Story Points per Sprint)'], explanation: 'Velocity calculates the average number of story points completed by a Scrum team during a standard sprint iteration.' }
      ]
    });

    // SE Unit 2
    const seQuiz2 = await createQuizWithQuestions({
      quizData: {
        title: 'SE Unit 2: Requirements Engineering & System Modeling',
        description: 'System Curriculum Quiz for Unit 2. Covers SRS Documentation, Use Case Diagrams, Class Diagrams, State Machine Modeling, and Feasibility Analysis.',
        category: catCSE._id,
        subject: subSE._id,
        unitName: 'Unit 2: Requirements & System Modeling',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'Which UML diagram is used to capture the dynamic behavioral interactions and message sequences between objects over time?', options: ['Sequence Diagram', 'Deployment Diagram', 'Package Diagram', 'Entity-Relationship Diagram'], correctAnswers: ['Sequence Diagram'], explanation: 'UML Sequence Diagrams visualize object lifelines and chronologically ordered message exchanges.' },
        { text: 'What is a Use Case diagram primarily used for in requirements engineering?', options: ['Representing system functionality from the perspective of external actors and users', 'Showing CPU register allocations', 'Compiling source code binaries', 'Configuring operating system file permissions'], correctAnswers: ['Representing system functionality from the perspective of external actors and users'], explanation: 'Use Case diagrams depict the interactions between external actors and system capabilities.' },
        { text: 'In UML Class Diagrams, what does a solid line with a filled diamond symbol represent?', options: ['Composition (Strong ownership with shared lifecycle)', 'Aggregation (Weak association)', 'Generalization (Inheritance)', 'Realization (Interface implementation)'], correctAnswers: ['Composition (Strong ownership with shared lifecycle)'], explanation: 'Composition denotes a strict "has-a" relationship where the child component cannot exist independently of the parent container.' },
        { text: 'What is the primary objective of a Feasibility Study in early software planning?', options: ['Determining whether the proposed system is technically, economically, legally, and operationally viable', 'Writing automated unit tests in JavaScript', 'Creating Photoshop user interface banners', 'Purchasing server racks before knowing project scope'], correctAnswers: ['Determining whether the proposed system is technically, economically, legally, and operationally viable'], explanation: 'Feasibility studies evaluate technical, operational, financial, and schedule viability prior to financial investment.' },
        { text: 'In software requirements engineering, what does the term "Requirements Elicitation" mean?', options: ['The process of discovering, extracting, and gathering requirements from stakeholders and users', 'Deleting outdated source code repositories', 'Encrypting database passwords', 'Formatting code indentation automatically'], correctAnswers: ['The process of discovering, extracting, and gathering requirements from stakeholders and users'], explanation: 'Elicitation involves interviews, surveys, workshops, and observation to gather stakeholder requirements.' },
        { text: 'Which section of an IEEE-830 standard Software Requirements Specification (SRS) documents hardware, software, and communication interfaces?', options: ['External Interface Requirements', 'Executive Summary', 'Glossary Appendix', 'Staff Salary Schedule'], correctAnswers: ['External Interface Requirements'], explanation: 'External Interface Requirements specify user interfaces, hardware interfaces, software dependencies, and network communication protocols.' },
        { text: 'What does an <<extend>> relationship between two Use Cases denote in UML?', options: ['An optional or conditional behavior that executes only under specified conditions', 'A mandatory sub-routine that must always execute', 'A database table primary key relation', 'A physical USB cable connection'], correctAnswers: ['An optional or conditional behavior that executes only under specified conditions'], explanation: 'The <<extend>> relationship shows optional, auxiliary functionality extending a base use case conditionally.' },
        { text: 'Which UML diagram models the discrete states an entity transitions through in response to events during its lifecycle?', options: ['State Machine (Statechart) Diagram', 'Activity Diagram', 'Class Diagram', 'Component Diagram'], correctAnswers: ['State Machine (Statechart) Diagram'], explanation: 'State Machine diagrams model event-driven state transitions of complex reactive objects.' },
        { text: 'What is "Requirements Creep" (Scope Creep) in project management?', options: ['Uncontrolled growth or continuous addition of requirements without corresponding adjustments to time, cost, and resources', 'A software bug that crashes the operating system', 'A slow internet connection in the office', 'A malicious computer virus'], correctAnswers: ['Uncontrolled growth or continuous addition of requirements without corresponding adjustments to time, cost, and resources'], explanation: 'Scope creep refers to unapproved changes and additions to project scope without budget/schedule adjustments.' },
        { text: 'In Data Flow Diagrams (DFD), what does an arrow with a label represent?', options: ['Data Flow (movement of data between processes and stores)', 'Data Storage on disk', 'A human operator', 'A physical electrical ground connection'], correctAnswers: ['Data Flow (movement of data between processes and stores)'], explanation: 'In DFDs, directed arrows denote pipelines through which packets of structured information flow.' }
      ]
    });

    // SE Unit 3
    const seQuiz3 = await createQuizWithQuestions({
      quizData: {
        title: 'SE Unit 3: SOLID Principles & Design Patterns',
        description: 'System Curriculum Quiz for Unit 3. Covers Object-Oriented SOLID architecture, Creational, Structural, and Behavioral Gang of Four (GoF) design patterns.',
        category: catCSE._id,
        subject: subSE._id,
        unitName: 'Unit 3: SOLID Principles & Design Patterns',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What does the Open/Closed Principle (OCP) in SOLID design dictate?', options: ['Software entities (classes, modules, functions) should be open for extension, but closed for modification', 'Source code files must be locked with read-only permissions after initial commit', 'Classes must open a network socket upon instantiation and close it immediately upon garbage collection', 'All member variables must be declared public and methods declared private'], correctAnswers: ['Software entities (classes, modules, functions) should be open for extension, but closed for modification'], explanation: 'Bertrand Meyer\'s Open/Closed Principle states that software entities should allow behavior extension without altering existing source code.' },
        { text: 'Which Gang of Four (GoF) Creational Design Pattern guarantees that a class has only one instance and provides a global point of access to it?', options: ['Singleton Pattern', 'Factory Method Pattern', 'Prototype Pattern', 'Builder Pattern'], correctAnswers: ['Singleton Pattern'], explanation: 'The Singleton pattern restricts instantiation of a class to one single instance, controlling shared resource access.' },
        { text: 'Which SOLID principle states that client software should not be forced to depend upon interfaces that they do not use?', options: ['Interface Segregation Principle (ISP)', 'Single Responsibility Principle (SRP)', 'Liskov Substitution Principle (LSP)', 'Dependency Inversion Principle (DIP)'], correctAnswers: ['Interface Segregation Principle (ISP)'], explanation: 'ISP advocates for fine-grained, role-specific interfaces rather than large monolithic interfaces.' },
        { text: 'Which Behavioral Design Pattern defines a one-to-many dependency between objects such that when one object changes state, all its dependents are notified automatically?', options: ['Observer Pattern', 'Strategy Pattern', 'State Pattern', 'Command Pattern'], correctAnswers: ['Observer Pattern'], explanation: 'The Observer Pattern establishes a publish-subscribe mechanism where a subject automatically broadcasts state updates to observers.' },
        { text: 'What violation of the Liskov Substitution Principle (LSP) occurs in the classic Rectangle-Square geometric inheritance hierarchy?', options: ['Overriding setWidth() in Square alters height unexpectedly, breaking behavioral contracts expected by consumers of the base Rectangle class', 'Square requires more memory bytes than Rectangle', 'Rectangle cannot be rendered on a 2D graphical display', 'Square cannot inherit methods from any abstract class'], correctAnswers: ['Overriding setWidth() in Square alters height unexpectedly, breaking behavioral contracts expected by consumers of the base Rectangle class'], explanation: 'LSP requires that subtypes must be substitutable for their base types without altering program correctness.' },
        { text: 'Which Structural Design Pattern allows incompatible interfaces to work together by wrapping an existing class with a compatible adapter interface?', options: ['Adapter Pattern', 'Decorator Pattern', 'Facade Pattern', 'Composite Pattern'], correctAnswers: ['Adapter Pattern'], explanation: 'The Adapter Pattern converts the interface of a legacy or third-party class into another interface that clients expect.' },
        { text: 'According to the Dependency Inversion Principle (DIP), high-level modules should depend on what?', options: ['Abstractions (Interfaces or Abstract Classes)', 'Concrete low-level hardware implementations', 'Global static singleton variables', 'Raw operating system system-call pointers'], correctAnswers: ['Abstractions (Interfaces or Abstract Classes)'], explanation: 'DIP states that high-level modules should not depend on low-level modules; both should depend on abstractions.' },
        { text: 'Which design pattern is best suited for constructing complex composite objects step-by-step with differing representations using the same construction process?', options: ['Builder Pattern', 'Flyweight Pattern', 'Memento Pattern', 'Chain of Responsibility Pattern'], correctAnswers: ['Builder Pattern'], explanation: 'The Builder Pattern separates the construction of a complex object from its representation, enabling fluent construction.' },
        { text: 'Which Behavioral Pattern encapsulates an algorithm inside a family of interchangeable classes, enabling the client to select the execution strategy at runtime?', options: ['Strategy Pattern', 'Template Method Pattern', 'Visitor Pattern', 'Mediator Pattern'], correctAnswers: ['Strategy Pattern'], explanation: 'The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime.' },
        { text: 'What is the primary benefit of applying the Facade Structural Design Pattern in complex multi-subsystem architectures?', options: ['Provides a simplified, unified high-level interface that masks subsystem complexity from external clients', 'Compresses binary files before transmitting them over network sockets', 'Executes automated unit test assertions in background threads', 'Prevents any subclassing across the entire application codebase'], correctAnswers: ['Provides a simplified, unified high-level interface that masks subsystem complexity from external clients'], explanation: 'The Facade pattern provides a simplified interface to a complex set of subsystem classes, reducing coupling.' }
      ]
    });

    // SE Unit 4
    const seQuiz4 = await createQuizWithQuestions({
      quizData: {
        title: 'SE Unit 4: Software Testing, QA & DevOps CI/CD',
        description: 'System Curriculum Quiz for Unit 4. Covers Black-Box vs White-Box Testing, Cyclomatic Complexity, Integration Strategies, CI/CD Pipelines, and Maintenance.',
        category: catCSE._id,
        subject: subSE._id,
        unitName: 'Unit 4: Testing, QA & DevOps',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What is the mathematical formula for calculating McCabe\'s Cyclomatic Complexity V(G) of a control flow graph?', options: ['V(G) = E - N + 2P (where E = edges, N = nodes, P = connected components)', 'V(G) = E * N', 'V(G) = Total Lines of Code / 10', 'V(G) = Total Function Names'], correctAnswers: ['V(G) = E - N + 2P (where E = edges, N = nodes, P = connected components)'], explanation: 'McCabe\'s Cyclomatic Complexity calculates the number of linearly independent paths through a program\'s source code.' },
        { text: 'Which Black-Box testing technique partitions input domains into valid and invalid classes from which representative test cases are chosen?', options: ['Equivalence Partitioning', 'Basis Path Testing', 'Data Flow Mutation Testing', 'Branch Condition Coverage'], correctAnswers: ['Equivalence Partitioning'], explanation: 'Equivalence Partitioning divides the input domain into classes of data from which test cases can be derived.' },
        { text: 'What is the difference between Boundary Value Analysis (BVA) and Equivalence Partitioning?', options: ['BVA specifically tests values at the extreme minimum, just below, just above, and maximum boundaries of input ranges', 'BVA only tests code comments', 'Equivalence partitioning is a hardware test', 'They are mathematically identical'], correctAnswers: ['BVA specifically tests values at the extreme minimum, just below, just above, and maximum boundaries of input ranges'], explanation: 'BVA complements equivalence partitioning by targeting edge/boundary conditions where off-by-one errors frequently occur.' },
        { text: 'What is the primary purpose of Regression Testing in software engineering?', options: ['Verifying that recent code changes or bug fixes have not inadvertently broken existing working features', 'Rewriting the entire software in a new programming language', 'Deleting customer database records', 'Testing hardware battery life under cold temperatures'], correctAnswers: ['Verifying that recent code changes or bug fixes have not inadvertently broken existing working features'], explanation: 'Regression testing re-executes a test suite to ensure that software modifications do not cause unintended side effects.' },
        { text: 'In White-Box testing, what does 100% Statement Coverage guarantee?', options: ['Every executable statement in the source code has been executed at least once by the test suite', 'The software has zero bugs', 'All possible combination of loops has been tested', 'The user interface is visually appealing'], correctAnswers: ['Every executable statement in the source code has been executed at least once by the test suite'], explanation: 'Statement coverage measures the percentage of executable source code statements executed by tests.' },
        { text: 'In Continuous Integration (CI) practices, what automated action occurs whenever a developer commits code to the shared repository?', options: ['Automated compilation, static analysis linting, and execution of automated unit/integration test suites', 'Manual printing of paper reports', 'Instant shutdown of all production servers', 'Deletion of git history branches'], correctAnswers: ['Automated compilation, static analysis linting, and execution of automated unit/integration test suites'], explanation: 'CI automates building and running tests on every commit to detect integration problems early.' },
        { text: 'What is the difference between Continuous Delivery and Continuous Deployment?', options: ['Continuous Delivery automates release up to the staging environment requiring manual one-click approval for production, whereas Continuous Deployment pushes every passing build directly to production automatically', 'Continuous Delivery requires physical mail delivery', 'Continuous Deployment works only for mobile apps', 'There is no difference'], correctAnswers: ['Continuous Delivery automates release up to the staging environment requiring manual one-click approval for production, whereas Continuous Deployment pushes every passing build directly to production automatically'], explanation: 'Continuous Delivery ensures software is always in a release-ready state; Continuous Deployment automates release directly into production.' },
        { text: 'What type of software maintenance involves modifying code to correct defects discovered after release in production?', options: ['Corrective Maintenance', 'Adaptive Maintenance', 'Perfective Maintenance', 'Preventive Maintenance'], correctAnswers: ['Corrective Maintenance'], explanation: 'Corrective maintenance addresses reported bugs, crashes, and defects in production systems.' },
        { text: 'In software quality assurance, what is a "Stub" in Bottom-Up and Top-Down Integration Testing?', options: ['A dummy program module that simulates the behavior of a lower-level module called by the unit under test', 'A broken hard drive', 'A software license key', 'A git commit hash'], correctAnswers: ['A dummy program module that simulates the behavior of a lower-level module called by the unit under test'], explanation: 'Stubs simulate called sub-modules during top-down integration testing before actual modules are implemented.' },
        { text: 'What is Technical Debt in software engineering?', options: ['The future implied cost of additional rework caused by choosing an easy or quick solution now instead of using a better approach that would take longer', 'Unpaid server electricity bills', 'Bank loans taken by tech startups', 'Salary bonuses owed to engineers'], correctAnswers: ['The future implied cost of additional rework caused by choosing an easy or quick solution now instead of using a better approach that would take longer'], explanation: 'Ward Cunningham coined Technical Debt to describe the compounding maintenance cost of sub-optimal architectural shortcuts.' }
      ]
    });

    console.log('✅ Subject 1 (Software Engineering) - 4 Unit Quizzes Seeded');

    // =========================================================================
    // SUBJECT 2: INTERNET OF THINGS (IoT) - 4 UNIT QUIZZES
    // =========================================================================

    // IoT Unit 1
    const iotQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'IoT Unit 1: Introduction to IoT & Protocols',
        description: 'System Curriculum Quiz for Unit 1. Covers Physical & Logical Architecture, Network Layer Protocols (IPv6, 6LoWPAN), Transport Layer (TCP, UDP), and Application Layer Protocols (MQTT, CoAP, AMQP).',
        category: catIoT._id,
        subject: subIoT._id,
        unitName: 'Unit 1: Introduction to IoT & Protocols',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What is the primary purpose of the 6LoWPAN protocol in Wireless Sensor Networks?', options: ['Enables IPv6 packet transmission over low-power IEEE 802.15.4 wireless networks through header compression and fragmentation', 'Replaces 5G cellular communication entirely for long-range autonomous vehicles', 'Encrypts raw video streams for HDMI monitor cables', 'Controls high-voltage AC electric motors in industrial factories'], correctAnswers: ['Enables IPv6 packet transmission over low-power IEEE 802.15.4 wireless networks through header compression and fragmentation'], explanation: '6LoWPAN specifies header compression, encapsulation, and fragmentation to transport 1280-byte IPv6 MTUs over 127-byte 802.15.4 frames.' },
        { text: 'In the MQTT (Message Queuing Telemetry Transport) protocol, which entity is responsible for receiving messages from publishers and distributing them to subscribers?', options: ['MQTT Broker', 'Edge Sensor Node', 'Database Compiler', 'TCP Gateway Router'], correctAnswers: ['MQTT Broker'], explanation: 'The MQTT Broker is the central server that manages topics, filters incoming publish requests, and dispatches messages to subscribed client nodes.' },
        { text: 'How does CoAP (Constrained Application Protocol) differ fundamentally from HTTP in transport architecture?', options: ['CoAP runs over lightweight UDP with asynchronous transaction messaging, whereas HTTP relies on connection-oriented TCP streams', 'CoAP requires 100Mbps dedicated fiber-optic internet connection', 'HTTP cannot transmit text or JSON documents', 'CoAP is exclusively designed for desktop mainframe computers'], correctAnswers: ['CoAP runs over lightweight UDP with asynchronous transaction messaging, whereas HTTP relies on connection-oriented TCP streams'], explanation: 'RFC 7252 defines CoAP as a specialized web transfer protocol operating over UDP to minimize transmission overhead and support multicast in constrained nodes.' },
        { text: 'In IoT Edge Computing, what is the key technical advantage of performing local data filtering at the Edge Gateway layer?', options: ['Reduces network bandwidth consumption and latency by processing telemetry data near sensor sources before forwarding summaries to the Cloud', 'Eliminates the physical need for electrical power supplies on sensor nodes', 'Prevents any computer virus from ever existing on the internet', 'Increases the physical weight of microcontroller boards'], correctAnswers: ['Reduces network bandwidth consumption and latency by processing telemetry data near sensor sources before forwarding summaries to the Cloud'], explanation: 'Edge gateways aggregate, filter, and run local analytics on high-frequency telemetry, preventing raw noise from saturating wide-area cloud connections.' },
        { text: 'Which MQTT Quality of Service (QoS) level guarantees that a message is delivered exactly once using a four-step handshake (PUBLISH, PUBREC, PUBREL, PUBCOMP)?', options: ['QoS Level 2 (Exactly Once)', 'QoS Level 0 (At Most Once)', 'QoS Level 1 (At Least Once)', 'QoS Level 3 (Infinite Redundancy)'], correctAnswers: ['QoS Level 2 (Exactly Once)'], explanation: 'MQTT QoS 2 is the highest service level, using a 4-step dual-handshake to guarantee zero message loss and zero duplicates.' },
        { text: 'What wireless technology operates in the sub-GHz unlicensed ISM bands and is optimized for long-range, low-power telemetry transmission over several kilometers?', options: ['LoRa / LoRaWAN', 'Bluetooth Classic (BR/EDR)', 'Ultra-Wideband (UWB)', 'Standard Wi-Fi 6 (802.11ax)'], correctAnswers: ['LoRa / LoRaWAN'], explanation: 'LoRa (Long Range) uses chirp spread spectrum modulation to transmit small packets across 5–15 km with ultra-low power consumption.' },
        { text: 'In IoT communication models, which pattern involves nodes pushing data directly to a persistent WebSocket channel for bi-directional full-duplex communication?', options: ['Exclusive-Pair Communication Model', 'Request-Response Polling Model', 'Push-Pull Message Queue Model', 'Publisher-Subscriber Model'], correctAnswers: ['Exclusive-Pair Communication Model'], explanation: 'The Exclusive-Pair model sets up a stateful, bi-directional, full-duplex connection between client and server over a single transport connection.' },
        { text: 'What role does an Actuator perform in a cyber-physical IoT system?', options: ['Converts electronic control signals into physical actions or mechanical movements (e.g. opening a valve, rotating a servo motor, triggering a relay)', 'Measures physical ambient temperature and outputs an analog voltage', 'Stores compiled firmware code in read-only flash memory', 'Acts as the wireless base-station router'], correctAnswers: ['Converts electronic control signals into physical actions or mechanical movements (e.g. opening a valve, rotating a servo motor, triggering a relay)'], explanation: 'While sensors measure environmental conditions and convert them into electrical signals, actuators receive electrical signals and perform physical actions.' },
        { text: 'Which IEEE standard defines the Physical (PHY) and Media Access Control (MAC) layers for Low-Rate Wireless Personal Area Networks (LR-WPANs)?', options: ['IEEE 802.15.4', 'IEEE 802.11ac', 'IEEE 802.3u', 'IEEE 802.1Q'], correctAnswers: ['IEEE 802.15.4'], explanation: 'IEEE 802.15.4 is the fundamental physical and MAC layer standard underlying Zigbee, 6LoWPAN, and Thread wireless systems.' },
        { text: 'What is a significant security vulnerability specific to resource-constrained IoT endpoints?', options: ['Inability to execute heavy asymmetric cryptographic calculations (e.g. RSA-4096) due to limited CPU cycles and battery constraints', 'Inability to display colorful user interface graphics', 'Excessive memory buffers causing instant hard-drive crashes', 'Automatic deletion of network router passwords'], correctAnswers: ['Inability to execute heavy asymmetric cryptographic calculations (e.g. RSA-4096) due to limited CPU cycles and battery constraints'], explanation: 'Constrained microcontrollers have limited ALU capability and power, making heavy public-key cryptography difficult without dedicated hardware accelerators.' }
      ]
    });

    // IoT Unit 2
    const iotQuiz2 = await createQuizWithQuestions({
      quizData: {
        title: 'IoT Unit 2: Sensors, Microcontrollers & Hardware Interfacing',
        description: 'System Curriculum Quiz for Unit 2. Covers Microcontroller Architectures (ATmega328P, PIC, ARM Cortex), Arduino Uno Pinouts, Sensors (DHT11, PIR, HC-SR04, MQ-2), and ADC Interfacing.',
        category: catIoT._id,
        subject: subIoT._id,
        unitName: 'Unit 2: Sensors & Microcontrollers',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What is the primary architectural difference between a Microprocessor (e.g. Intel Core) and a Microcontroller (e.g. ATmega328P)?', options: ['A microcontroller integrates CPU, RAM, ROM/Flash memory, and I/O peripherals on a single silicon integrated circuit, whereas a microprocessor requires external RAM and support chips', 'Microprocessors cannot run operating systems', 'Microcontrollers can only process audio files', 'There is no architectural difference'], correctAnswers: ['A microcontroller integrates CPU, RAM, ROM/Flash memory, and I/O peripherals on a single silicon integrated circuit, whereas a microprocessor requires external RAM and support chips'], explanation: 'Microcontrollers are self-contained embedded systems with on-chip RAM, ROM/Flash, timers, and I/O ports.' },
        { text: 'What is the resolution and voltage reference range of the standard Analog-to-Digital Converter (ADC) on an Arduino Uno (ATmega328P)?', options: ['10-bit resolution (0 to 1023) over 0 to 5V default range', '8-bit resolution (0 to 255) over 0 to 12V range', '16-bit resolution (0 to 65535) over 0 to 220V range', '1-bit binary resolution'], correctAnswers: ['10-bit resolution (0 to 1023) over 0 to 5V default range'], explanation: 'The ATmega328P features a 10-bit Successive Approximation ADC, dividing 0–5V into 1024 discrete steps (~4.88mV per step).' },
        { text: 'Which sensor uses acoustic ultrasonic echo reflection timing to calculate distance to physical obstacles?', options: ['HC-SR04 Ultrasonic Distance Sensor', 'DHT11 Humidity Sensor', 'MQ-2 Gas Smoke Sensor', 'PIR Pyroelectric Infrared Sensor'], correctAnswers: ['HC-SR04 Ultrasonic Distance Sensor'], explanation: 'The HC-SR04 emits 40 kHz ultrasonic pulses and measures the time taken for the echo to bounce back: Distance = (Time × Speed of Sound) / 2.' },
        { text: 'What communication bus protocol uses two bidirectional open-drain lines (SDA and SCL) with pull-up resistors to interface multiple peripheral sensors?', options: ['I2C (Inter-Integrated Circuit)', 'SPI (Serial Peripheral Interface)', 'UART Asynchronous Serial', 'CAN Bus'], correctAnswers: ['I2C (Inter-Integrated Circuit)'], explanation: 'I2C uses two lines (Serial Data SDA and Serial Clock SCL) with 7-bit addressing to communicate with multiple slave sensors.' },
        { text: 'In embedded hardware, what is Pulse Width Modulation (PWM) primarily used for?', options: ['Simulating analog output voltage levels to control motor speed or LED brightness using digital duty cycle switching', 'Increasing microprocessor clock crystal frequency', 'Encrypting Wi-Fi passwords', 'Formatting flash memory sectors'], correctAnswers: ['Simulating analog output voltage levels to control motor speed or LED brightness using digital duty cycle switching'], explanation: 'PWM modulates the duty cycle (percentage of time high vs low) at high frequency to simulate variable analog voltage output.' },
        { text: 'Which sensor detects human or animal movement by measuring changes in emitted infrared thermal radiation?', options: ['PIR (Passive Infrared) Sensor', 'Thermocouple K-Type Probe', 'Photodiode LDR', 'Capacitive Touch Sensor'], correctAnswers: ['PIR (Passive Infrared) Sensor'], explanation: 'PIR sensors detect changes in infrared radiation emitted by warm bodies moving across split pyroelectric detection zones.' },
        { text: 'What is the role of an Analog-to-Digital Converter (ADC) in an embedded sensor interface?', options: ['Converts continuous real-world analog physical voltages produced by sensors into discrete digital binary integers for MCU processing', 'Converts 220V AC into 5V DC', 'Transmits FM radio waves', 'Stores digital video files'], correctAnswers: ['Converts continuous real-world analog physical voltages produced by sensors into discrete digital binary integers for MCU processing'], explanation: 'ADCs sample continuous analog voltages and quantize them into digital binary values that microcontrollers can compute.' },
        { text: 'Which communication protocol uses four dedicated signals: MOSI (Master Out Slave In), MISO (Master In Slave Out), SCK (Serial Clock), and SS/CS (Slave Select)?', options: ['SPI (Serial Peripheral Interface)', 'I2C', 'RS-232', 'Modbus RTU'], correctAnswers: ['SPI (Serial Peripheral Interface)'], explanation: 'SPI is a synchronous, full-duplex four-wire bus designed for high-speed communication with peripheral chips.' },
        { text: 'What is the function of a Pull-Up resistor connected to a digital microcontroller input pin with a push-button?', options: ['Ensures the input pin defaults to a known HIGH logic state (5V/3.3V) when the switch is open, preventing a floating undefined state', 'Increases battery current by 100 amps', 'Powers the microcontroller cooling fan', 'Prevents software compiler errors'], correctAnswers: ['Ensures the input pin defaults to a known HIGH logic state (5V/3.3V) when the switch is open, preventing a floating undefined state'], explanation: 'Pull-up resistors prevent floating inputs from oscillating randomly due to ambient electromagnetic noise.' },
        { text: 'What popular 32-bit Wi-Fi and Bluetooth SoC microcontroller module is widely used in commercial IoT products due to its dual-core CPU and low cost?', options: ['ESP32 (Espressif Systems)', '8051 Intel Legacy MCU', 'PIC16F84A', 'ATmega8'], correctAnswers: ['ESP32 (Espressif Systems)'], explanation: 'The ESP32 features a dual-core Xtensa 32-bit processor, integrated Wi-Fi 802.11 b/g/n, BLE 4.2/5.0, and rich GPIO peripherals.' }
      ]
    });

    // IoT Unit 3
    const iotQuiz3 = await createQuizWithQuestions({
      quizData: {
        title: 'IoT Unit 3: Wireless Sensor Networks & Cloud Integration',
        description: 'System Curriculum Quiz for Unit 3. Covers WSN Topologies, Zigbee Mesh, Bluetooth Low Energy (BLE), LoRaWAN Gateway Architecture, and Cloud IoT Hubs.',
        category: catIoT._id,
        subject: subIoT._id,
        unitName: 'Unit 3: WSN & Cloud Integration',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'In Wireless Sensor Networks (WSNs), what network topology allows data packets to hop across intermediate sensor nodes until reaching the coordinator gateway?', options: ['Mesh Topology', 'Star Topology', 'Bus Topology', 'Ring Topology'], correctAnswers: ['Mesh Topology'], explanation: 'Mesh topology provides multi-hop path redundancy, self-healing routing, and extended coverage across large physical sensor deployments.' },
        { text: 'What is the primary power-saving feature of Bluetooth Low Energy (BLE) compared to classic Bluetooth?', options: ['BLE remains in deep sleep mode until short, high-speed connection bursts occur, consuming orders of magnitude less energy', 'BLE operates without any battery at all', 'BLE transmits only infrared light', 'BLE requires 500W power amplifiers'], correctAnswers: ['BLE remains in deep sleep mode until short, high-speed connection bursts occur, consuming orders of magnitude less energy'], explanation: 'BLE is optimized for duty-cycled operations with quick connection setup (<3ms), allowing years of operation on a coin cell.' },
        { text: 'What device in a Zigbee network acts as the root coordinator, establishes network parameters, and stores security trust keys?', options: ['Zigbee Coordinator (ZC)', 'Zigbee Router (ZR)', 'Zigbee End Device (ZED)', 'Passive Repeater'], correctAnswers: ['Zigbee Coordinator (ZC)'], explanation: 'The Zigbee Coordinator initializes the network, selects the radio channel, and manages device security credentials.' },
        { text: 'In LoRaWAN network architecture, what class of end-device (Class A) provides the lowest power consumption by opening two short receive windows only after an uplink transmission?', options: ['Class A Devices', 'Class B Devices', 'Class C Devices', 'Class D Devices'], correctAnswers: ['Class A Devices'], explanation: 'Class A (All) devices sleep continuously and open two downlink receive slots only following an uplink transmission, maximizing battery life.' },
        { text: 'What is the role of a Cloud IoT Hub (e.g. AWS IoT Core, Azure IoT Hub, Google Cloud IoT)?', options: ['Provides managed bi-directional device communication, device twins, authentication certificates, and streaming data routing into cloud databases', 'Manufactures plastic sensor enclosures', 'Replaces all cellular phone towers', 'Generates physical electrical grid power'], correctAnswers: ['Provides managed bi-directional device communication, device twins, authentication certificates, and streaming data routing into cloud databases'], explanation: 'Cloud IoT Hubs act as managed cloud message brokers and device registries, handling TLS authentication and telemetry routing at massive scale.' },
        { text: 'What is a "Device Twin" (or Device Shadow) in IoT Cloud platforms?', options: ['A persistent cloud-hosted JSON document that synchronizes the current reported state and desired target state of an IoT device even when offline', 'A duplicate physical hardware clone of the sensor', 'A second battery installed inside the device', 'An identical duplicate microcontroller chip'], correctAnswers: ['A persistent cloud-hosted JSON document that synchronizes the current reported state and desired target state of an IoT device even when offline'], explanation: 'Device Twins store device state information (metadata, reported state, desired configuration) accessible to apps even if the physical device is disconnected.' },
        { text: 'Which wireless sensor routing protocol was standardized by IETF specifically for Low-power and Lossy Networks (LLNs) using Destination-Oriented Directed Acyclic Graphs (DODAG)?', options: ['RPL (Routing Protocol for LLNs)', 'OSPF', 'BGP-4', 'RIPv2'], correctAnswers: ['RPL (Routing Protocol for LLNs)'], explanation: 'RFC 6550 defines RPL, constructing DODAGs optimized for multipoint-to-point and point-to-multipoint routing over constrained wireless links.' },
        { text: 'What is the frequency band used by standard Zigbee (IEEE 802.15.4) globally?', options: ['2.4 GHz ISM Band', '5 GHz Wi-Fi Band', '900 MHz Cellular Band only', '100 MHz FM Band'], correctAnswers: ['2.4 GHz ISM Band'], explanation: 'Zigbee operates worldwide on the license-free 2.4 GHz Industrial, Scientific, and Medical (ISM) radio band with 16 channels.' },
        { text: 'What is "Data Aggregation" in Wireless Sensor Networks?', options: ['Combining telemetry from multiple adjacent sensor nodes at intermediate cluster heads to eliminate redundant packet transmissions and conserve battery power', 'Deleting all historical temperature data', 'Charging sensor batteries using solar panels', 'Compressing audio files into MP3 format'], correctAnswers: ['Combining telemetry from multiple adjacent sensor nodes at intermediate cluster heads to eliminate redundant packet transmissions and conserve battery power'], explanation: 'In-network aggregation computes statistical summaries (e.g. average, max) at cluster heads, reducing network packet volume.' },
        { text: 'In BLE Generic Attribute Profile (GATT) architecture, what is a "Characteristic"?', options: ['A data value container that includes a UUID value, descriptor metadata, and read/write/notify permission properties', 'The physical color of the circuit board', 'The brand name of the smartphone', 'The weight of the antenna'], correctAnswers: ['A data value container that includes a UUID value, descriptor metadata, and read/write/notify permission properties'], explanation: 'GATT Characteristics encapsulate a single value along with descriptors and access permissions inside a BLE Service.' }
      ]
    });

    // IoT Unit 4
    const iotQuiz4 = await createQuizWithQuestions({
      quizData: {
        title: 'IoT Unit 4: IoT Security, Analytics & Smart Case Studies',
        description: 'System Curriculum Quiz for Unit 4. Covers Threat Modeling, Mirai Botnet Attack vectors, Lightweight Ciphers (PRESENT/CLEFIA), and Smart Grid/Industrial IoT Case Studies.',
        category: catIoT._id,
        subject: subIoT._id,
        unitName: 'Unit 4: Security & Industrial Case Studies',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What major security vulnerability enabled the infamous Mirai Botnet in 2016 to hijack hundreds of thousands of IoT devices for massive DDoS attacks?', options: ['Factory default, unchangeable Telnet and SSH usernames and passwords (e.g. admin/admin, root/123456)', 'Flaws in the quantum physics of silicon chips', 'Failure of operating system graphical desktop drivers', 'Overcharging of device lithium-ion batteries'], correctAnswers: ['Factory default, unchangeable Telnet and SSH usernames and passwords (e.g. admin/admin, root/123456)'], explanation: 'Mirai scanned the internet for IoT devices running exposed Telnet/SSH services protected only by well-known default hardcoded credentials.' },
        { text: 'Why is standard RSA-4096 asymmetric cryptography often impractical for 8-bit and 16-bit battery-powered IoT edge sensors?', options: ['High computational complexity, excessive RAM consumption for big integer math, and severe battery depletion during modular exponentiation', 'RSA keys cannot be saved in flash memory', 'RSA is prohibited by international telecommunication law', 'RSA requires dedicated liquid nitrogen cooling'], correctAnswers: ['High computational complexity, excessive RAM consumption for big integer math, and severe battery depletion during modular exponentiation'], explanation: 'Asymmetric modular exponentiation consumes thousands of CPU clock cycles, depleting batteries without hardware crypto co-processors.' },
        { text: 'Which ultra-lightweight block cipher was standardized by ISO/IEC 29192-2 specifically for compact hardware implementation in RFID and sensor nodes?', options: ['PRESENT Block Cipher', 'AES-256 GCM', 'Triple DES', 'Blowfish'], correctAnswers: ['PRESENT Block Cipher'], explanation: 'PRESENT is an ultra-lightweight SPN block cipher designed with minimal silicon gate area (~1500 GE) for resource-constrained hardware.' },
        { text: 'In Industrial IoT (IIoT), what does the acronym SCADA stand for?', options: ['Supervisory Control and Data Acquisition', 'Secure Cloud Architecture for Digital Analytics', 'Sensor Calibration and Device Automation', 'Standard Computer Application for Desktop Administration'], correctAnswers: ['Supervisory Control and Data Acquisition'], explanation: 'SCADA systems provide supervisory monitoring and industrial automation control across plants and critical infrastructure.' },
        { text: 'What is a "Man-in-the-Middle" (MitM) attack in unencrypted IoT sensor communications?', options: ['An attacker intercepts, eavesdrops on, or alters telemetry packets in transit between the sensor node and the gateway router', 'A physical technician repairing wires in an electrical conduit', 'A CPU overheating failure', 'An automated unit test running on a server'], correctAnswers: ['An attacker intercepts, eavesdrops on, or alters telemetry packets in transit between the sensor node and the gateway router'], explanation: 'MitM attacks exploit lack of mutual authentication or TLS encryption to intercept and tamper with telemetry streams.' },
        { text: 'What is the role of Predictive Maintenance in Industrial IoT (IIoT)?', options: ['Using vibration, acoustic, and thermal sensor analytics to detect equipment wear and predict machinery failures before catastrophic downtime occurs', 'Replacing all factory machinery every Friday afternoon', 'Manually inspecting machines with clipboards once a year', 'Shutting down factory power plants during normal business hours'], correctAnswers: ['Using vibration, acoustic, and thermal sensor analytics to detect equipment wear and predict machinery failures before catastrophic downtime occurs'], explanation: 'Predictive maintenance utilizes ML anomaly detection on real-time vibration/thermal telemetry to schedule repairs proactively.' },
        { text: 'What security mechanism ensures that downloaded IoT firmware updates have not been tampered with and originate from the genuine manufacturer?', options: ['Cryptographic Digital Signatures verified using a manufacturer public root key before flashing', 'Renaming the firmware file extension to .EXE', 'Changing the Wi-Fi password before flashing', 'Compressing the firmware file into a RAR archive'], correctAnswers: ['Cryptographic Digital Signatures verified using a manufacturer public root key before flashing'], explanation: 'Secure Boot and signed Over-The-Air (OTA) updates verify ECDSA/RSA digital signatures against hardcoded root of trust public keys before flashing.' },
        { text: 'In Smart Grid IoT deployments, what is an Advanced Metering Infrastructure (AMI)?', options: ['An integrated system of smart meters, communication networks, and data management systems that enables two-way communication between utilities and consumers', 'A mechanical water wheel generator', 'A paper electric bill sent via postal mail', 'An analog thermometer mounted on a transformer'], correctAnswers: ['An integrated system of smart meters, communication networks, and data management systems that enables two-way communication between utilities and consumers'], explanation: 'AMI enables automated meter reading, real-time dynamic pricing, power quality monitoring, and demand-response load management.' },
        { text: 'What is a "Physical Unclonable Function" (PUF) in hardware security?', options: ['A hardware security primitive that derives a unique, unclonable cryptographic key from microscopic manufacturing variations in silicon microchips', 'A software antivirus program written in C++', 'A physical lock and key mounted on an electrical box', 'A password written on a sticky note'], correctAnswers: ['A hardware security primitive that derives a unique, unclonable cryptographic key from microscopic manufacturing variations in silicon microchips'], explanation: 'PUFs exploit physical silicon microstructure variations to generate unique chip-level digital fingerprints without storing keys in flash memory.' },
        { text: 'What is the purpose of Hardware Root of Trust (RoT) and Secure Elements (e.g. ATECC608A) in IoT edge devices?', options: ['Tamper-resistant silicon chips dedicated to securely storing private keys, executing cryptographic algorithms, and verifying secure boot integrity', 'Increasing CPU screen refresh rate', 'Powering Wi-Fi antennas with extra radio wattage', 'Formatting SD cards automatically'], correctAnswers: ['Tamper-resistant silicon chips dedicated to securely storing private keys, executing cryptographic algorithms, and verifying secure boot integrity'], explanation: 'Hardware Secure Elements isolate private keys and cryptographic operations from the main MCU application processor, preventing memory dump attacks.' }
      ]
    });

    console.log('✅ Subject 2 (Internet of Things) - 4 Unit Quizzes Seeded');

    // =========================================================================
    // SUBJECT 3: WEB SERVICES & SOA (WS) - 4 UNIT QUIZZES
    // =========================================================================

    // WS Unit 1
    const wsQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'WS Unit 1: Introduction to Web Services & SOA Architecture',
        description: 'System Curriculum Quiz for Unit 1. Covers SOA Triangle Architecture, XML Schema Definition (XSD), Namespaces, Service Provider/Requestor/Registry, and Loose Coupling.',
        category: catIT._id,
        subject: subWS._id,
        unitName: 'Unit 1: SOA Architecture & XML',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What are the three fundamental operational roles in the standard Service-Oriented Architecture (SOA) triangle?', options: ['Service Provider, Service Requestor (Consumer), and Service Registry (Broker)', 'Client Browser, Ethernet Cable, and Web Hosting Server', 'Database Administrator, Software Developer, and Quality Assurance Tester', 'Microcontroller, Sensor Node, and Actuator Relay'], correctAnswers: ['Service Provider, Service Requestor (Consumer), and Service Registry (Broker)'], explanation: 'The classic SOA triangle consists of Service Provider (publishes), Service Registry (indexes), and Service Requestor (finds and binds).' },
        { text: 'What is the core principle of "Loose Coupling" in Service-Oriented Architecture?', options: ['Services maintain minimal direct dependencies upon each other, interacting solely through well-defined, standardized interface contracts', 'Services must all reside on the exact same physical hard drive', 'Services share the exact same global variable memory pointers in C++', 'Services cannot communicate across internet networks'], correctAnswers: ['Services maintain minimal direct dependencies upon each other, interacting solely through well-defined, standardized interface contracts'], explanation: 'Loose coupling allows services to evolve, scale, and refactor internally without breaking consumers that rely on public contracts.' },
        { text: 'What is the role of XML Namespaces (xmlns) in web service XML documents?', options: ['Prevents element name collisions and distinguishes uniquely between identical tag names from different vocabularies via URIs', 'Compresses XML files into ZIP archives', 'Encrypts XML files using AES-256', 'Validates user passwords automatically'], correctAnswers: ['Prevents element name collisions and distinguishes uniquely between identical tag names from different vocabularies via URIs'], explanation: 'Namespaces qualify XML element and attribute names by associating them with unique URI namespaces, avoiding naming clashes.' },
        { text: 'What is the purpose of an XML Schema Definition (XSD) document in web services?', options: ['Defines the legal structure, data types, elements, attributes, and validation rules for XML message payloads', 'Compiles XML into machine binary code', 'Formats XML text into colorful HTML web pages', 'Acts as a web server firewall'], correctAnswers: ['Defines the legal structure, data types, elements, attributes, and validation rules for XML message payloads'], explanation: 'XSD schemas formally describe and validate the XML document structure, data types, and cardinality constraints.' },
        { text: 'In SOA, what is "Service Discoverability"?', options: ['The architectural capability allowing consumers to dynamically search registries (e.g. UDDI) to find metadata, endpoints, and interface contracts', 'Scanning local hard drives for MP3 audio files', 'Searching Google for programming tutorials', 'Recovering deleted files from the recycle bin'], correctAnswers: ['The architectural capability allowing consumers to dynamically search registries (e.g. UDDI) to find metadata, endpoints, and interface contracts'], explanation: 'Discoverability enables service metadata and capabilities to be indexed and queried programmatically by client applications.' },
        { text: 'What is the difference between Synchronous and Asynchronous web service invocations?', options: ['Synchronous invocations block the client thread until a response is returned; Asynchronous invocations return immediately, handling the response later via callbacks or polling', 'Synchronous services only work on Mondays', 'Asynchronous services require analog telephone modems', 'There is no difference'], correctAnswers: ['Synchronous invocations block the client thread until a response is returned; Asynchronous invocations return immediately, handling the response later via callbacks or polling'], explanation: 'Synchronous interactions require immediate blocking responses; asynchronous interactions decouple execution time using non-blocking message queues.' },
        { text: 'Which SOA principle ensures that services are designed to be reused across multiple business domains and diverse applications?', options: ['Service Reusability', 'Service Statefulness', 'Service Hardcoding', 'Service Tight-Coupling'], correctAnswers: ['Service Reusability'], explanation: 'Service Reusability emphasizes designing generic, highly cohesive service capabilities that solve common enterprise problems.' },
        { text: 'What does "Service Autonomy" mean in SOA system design?', options: ['Services exercise full control over the underlying logic, database, and hardware infrastructure they encapsulate', 'Services operate without electricity', 'Services modify their own source code using AI', 'Services cannot be called by external programs'], correctAnswers: ['Services exercise full control over the underlying logic, database, and hardware infrastructure they encapsulate'], explanation: 'Autonomy ensures services own their internal implementation, data stores, and execution environments independently.' },
        { text: 'In XML Schema, which element is used to define a container that allows its child elements to appear in any order?', options: ['<xs:all>', '<xs:sequence>', '<xs:choice>', '<xs:group>'], correctAnswers: ['<xs:all>'], explanation: '<xs:all> specifies that the child elements can appear in any order, while <xs:sequence> enforces strict chronological ordering.' },
        { text: 'What enterprise middleware architecture provides routing, protocol transformation, message mediation, and service orchestration across heterogeneous systems?', options: ['Enterprise Service Bus (ESB)', 'Desktop Graphics Card Driver', 'Direct Memory Access (DMA) Controller', 'Ethernet Switch Firmware'], correctAnswers: ['Enterprise Service Bus (ESB)'], explanation: 'An ESB is an integration middleware architecture providing message routing, data transformation, security, and protocol translation.' }
      ]
    });

    // WS Unit 2
    const wsQuiz2 = await createQuizWithQuestions({
      quizData: {
        title: 'WS Unit 2: SOAP Protocol, WSDL Contracts & UDDI Registries',
        description: 'System Curriculum Quiz for Unit 2. Covers SOAP Message Envelopes, WSDL 1.1/2.0 Interfaces & PortTypes, UDDI Data Models (tModels), and SOAP Fault Processing.',
        category: catIT._id,
        subject: subWS._id,
        unitName: 'Unit 2: SOAP, WSDL & UDDI',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What are the main elements comprising a standard SOAP Message envelope?', options: ['Envelope, Header (optional), Body, and Fault (optional)', 'HTML, CSS, JS, SQL', 'Header, Paragraph, Image, Link', 'Request, Response, Error, Exit'], correctAnswers: ['Envelope, Header (optional), Body, and Fault (optional)'], explanation: 'A SOAP message consists of an Envelope root, an optional Header (for metadata/security), a mandatory Body, and optional Fault.' },
        { text: 'What is WSDL (Web Services Description Language)?', options: ['An XML-based language that describes web service interfaces, operations, parameters, and binding protocols', 'A database programming language', 'A stylesheet formatting language', 'A network routing command'], correctAnswers: ['An XML-based language that describes web service interfaces, operations, parameters, and binding protocols'], explanation: 'WSDL describes web service capabilities and endpoint contracts in XML.' },
        { text: 'What is UDDI (Universal Description, Discovery, and Integration)?', options: ['An XML-based directory registry allowing enterprise web services to be published and discovered dynamically', 'A computer monitor resolution standard', 'A USB flash drive file system', 'An audio encoding format'], correctAnswers: ['An XML-based directory registry allowing enterprise web services to be published and discovered dynamically'], explanation: 'UDDI acts as an enterprise directory for web service lookup.' },
        { text: 'In WSDL 1.1 documents, what element defines the abstract set of operations and input/output messages?', options: ['<portType> (or <interface> in WSDL 2.0)', '<binding>', '<service>', '<types>'], correctAnswers: ['<portType> (or <interface> in WSDL 2.0)'], explanation: '<portType> groups web service operations and messages in WSDL 1.1.' },
        { text: 'What is the main architectural difference between SOAP and RESTful Web Services?', options: ['SOAP is a strict XML protocol specification with rigid messaging contracts, whereas REST is an architectural style using standard HTTP verbs (GET, POST, PUT, DELETE) and lightweight formats (JSON/XML)', 'SOAP is faster than REST in all cases', 'REST requires XML schema validation on every request', 'SOAP cannot run over HTTP'], correctAnswers: ['SOAP is a strict XML protocol specification with rigid messaging contracts, whereas REST is an architectural style using standard HTTP verbs (GET, POST, PUT, DELETE) and lightweight formats (JSON/XML)'], explanation: 'SOAP is a formal XML protocol; REST is an architectural style over HTTP.' },
        { text: 'In SOAP message processing, what element contains error and status information returned when a web service invocation fails?', options: ['SOAP Fault element inside the Body', 'SOAP Header token', 'HTTP 200 OK wrapper', 'XML Namespace tag'], correctAnswers: ['SOAP Fault element inside the Body'], explanation: 'The <Fault> element inside SOAP Body carries exception details.' },
        { text: 'What core data structures are defined in the UDDI specification?', options: ['businessEntity, businessService, bindingTemplate, and tModel', 'Table, Row, Column, Index', 'Class, Object, Method, Field', 'Client, Router, Server, IP'], correctAnswers: ['businessEntity, businessService, bindingTemplate, and tModel'], explanation: 'UDDI data model uses businessEntity, businessService, bindingTemplate, and tModel.' },
        { text: 'In WSDL, what element specifies concrete protocol bindings (e.g. SOAP over HTTP) and data format specifications?', options: ['<binding>', '<portType>', '<types>', '<documentation>'], correctAnswers: ['<binding>'], explanation: '<binding> binds abstract portType operations to concrete transport protocols.' },
        { text: 'In SOAP headers, what does the attribute soap:mustUnderstand="1" indicate to the receiving endpoint?', options: ['The recipient must process and understand the header block or must reject the message and fault immediately', 'The header is optional and can be ignored', 'The message is written in English', 'The message has expired'], correctAnswers: ['The recipient must process and understand the header block or must reject the message and fault immediately'], explanation: 'The mustUnderstand attribute enforces mandatory processing of critical headers (e.g. security tokens).' },
        { text: 'What is a "tModel" in the UDDI registry data model?', options: ['A technical model representing a technical specification, taxonomy classification, or abstract interface blueprint', 'A machine learning training model', 'A database table primary key', 'A 3D graphics rendering model'], correctAnswers: ['A technical model representing a technical specification, taxonomy classification, or abstract interface blueprint'], explanation: 'In UDDI, tModels represent fingerprint technical contracts and interface specifications.' }
      ]
    });

    // WS Unit 3
    const wsQuiz3 = await createQuizWithQuestions({
      quizData: {
        title: 'WS Unit 3: Conversational Web Services & WS-Coordination',
        description: 'System Curriculum Quiz for Unit 3. Covers Conversational Web Services, Session State Persistence, WS-Coordination, WS-Transaction, WSCL, and Business Process Orchestration.',
        category: catIT._id,
        subject: subWS._id,
        unitName: 'Unit 3: Conversational Web Services & WS-Coordination',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What is a Conversational Web Service?', options: ['A web service that maintains state and context across multiple message exchanges between a client and the service', 'A chatbot that speaks human voice audio', 'A web service with no memory or state', 'An offline command prompt tool'], correctAnswers: ['A web service that maintains state and context across multiple message exchanges between a client and the service'], explanation: 'Conversational web services manage multi-turn state across interactions.' },
        { text: 'Why is session state tracking necessary in complex multi-step enterprise web service transactions?', options: ['To correlate multiple requests from the same client and maintain transactional context across stateless HTTP calls', 'To increase monitor resolution', 'To change background colors dynamically', 'To delete user passwords'], correctAnswers: ['To correlate multiple requests from the same client and maintain transactional context across stateless HTTP calls'], explanation: 'Stateless HTTP requires message correlation tokens to preserve transaction state.' },
        { text: 'What specification provides an extensible framework for coordinating activities across distributed web services?', options: ['WS-Coordination', 'WS-FTP', 'WS-HTML', 'WS-ZIP'], correctAnswers: ['WS-Coordination'], explanation: 'WS-Coordination defines extensible coordination frameworks.' },
        { text: 'In enterprise SOA, what is the difference between Service Orchestration and Service Choreography?', options: ['Orchestration is controlled by a central business process execution engine (e.g. BPEL), while Choreography describes collaborative peer-to-peer message protocols without central control', 'Orchestration uses music instruments', 'Choreography is written in HTML CSS only', 'They perform identical roles'], correctAnswers: ['Orchestration is controlled by a central business process execution engine (e.g. BPEL), while Choreography describes collaborative peer-to-peer message protocols without central control'], explanation: 'Orchestration relies on a central controller (BPEL); Choreography defines peer-to-peer interactions.' },
        { text: 'Which language is widely used for executable business process orchestration in SOA environments?', options: ['WS-BPEL (Business Process Execution Language)', 'HTML5', 'SQL DDL', 'Python PyGame'], correctAnswers: ['WS-BPEL (Business Process Execution Language)'], explanation: 'BPEL specifies business processes and web service interactions.' },
        { text: 'What specification handles atomic transactions across heterogeneous distributed web services?', options: ['WS-AtomicTransaction (WS-AT)', 'WS-CSS', 'WS-Audio', 'WS-Paint'], correctAnswers: ['WS-AtomicTransaction (WS-AT)'], explanation: 'WS-AT provides two-phase commit protocol coordination for atomic transactions.' },
        { text: 'What is WSCL (Web Services Conversation Language)?', options: ['An XML format for defining legal conversation sequences and message exchange protocols between web services', 'A programming language compiler', 'A database storage engine', 'A desktop graphics editor'], correctAnswers: ['An XML format for defining legal conversation sequences and message exchange protocols between web services'], explanation: 'WSCL models legal message exchange sequences.' },
        { text: 'In WS-Transaction, what mechanism is used when long-running business activities cannot lock database resources for hours?', options: ['Compensation Transactions (WS-BusinessActivity)', 'Hard database system reboot', 'Deleting all database tables', 'Permanent table locks'], correctAnswers: ['Compensation Transactions (WS-BusinessActivity)'], explanation: 'Business Activity uses compensation actions to revert long-running transactions.' },
        { text: 'How is message correlation typically achieved in SOAP web service conversations?', options: ['By passing correlation IDs or WS-Addressing headers (e.g. <wsa:RelatesTo>) in SOAP headers', 'By changing IP addresses', 'By manual phone calls to server room', 'By printing paper receipts'], correctAnswers: ['By passing correlation IDs or WS-Addressing headers (e.g. <wsa:RelatesTo>) in SOAP headers'], explanation: 'WS-Addressing headers correlate messages in conversational flows.' },
        { text: 'What role does the Coordinator play in WS-Coordination framework?', options: ['Manages context creation, registration, and coordinates participant protocol outcomes', 'Configures Wi-Fi router passwords', 'Monitors physical room temperature', 'Prints shipping labels'], correctAnswers: ['Manages context creation, registration, and coordinates participant protocol outcomes'], explanation: 'The Coordinator manages context and coordinates protocol execution among participants.' }
      ]
    });

    // WS Unit 4
    const wsQuiz4 = await createQuizWithQuestions({
      quizData: {
        title: 'WS Unit 4: Web Services Security & Mobile Integration',
        description: 'System Curriculum Quiz for Unit 4. Covers Security Attacks, WS-Security (XML Encryption, XML Signature, SAML), Mobile Web Services, and Apache Axis Deployment.',
        category: catIT._id,
        subject: subWS._id,
        unitName: 'Unit 4: Security & Mobile Web Services',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What is WS-Security (Web Services Security)?', options: ['A flexible, XML-based security standard providing message integrity, message confidentiality, and security token propagation (XML Encryption, Digital Signatures)', 'A desktop antivirus software', 'A physical door lock', 'A Wi-Fi router brand'], correctAnswers: ['A flexible, XML-based security standard providing message integrity, message confidentiality, and security token propagation (XML Encryption, Digital Signatures)'], explanation: 'WS-Security provides end-to-end security at the message layer.' },
        { text: 'What is the primary advantage of Message-Level Security (WS-Security) over Transport-Level Security (HTTPS/SSL)?', options: ['Provides end-to-end security across multi-hop intermediary proxy nodes, securing specific XML elements independently', 'HTTPS is obsolete and no longer works', 'WS-Security requires no mathematical encryption', 'HTTPS works only on mobile phones'], correctAnswers: ['Provides end-to-end security across multi-hop intermediary proxy nodes, securing specific XML elements independently'], explanation: 'Message-level security persists security across intermediate application hops.' },
        { text: 'Which XML standard is used in WS-Security to verify sender identity and ensure payload content has not been tampered with?', options: ['XML Signature (W3C XMLDsig)', 'XML CSS Parser', 'HTML5 Canvas', 'JSON Schema'], correctAnswers: ['XML Signature (W3C XMLDsig)'], explanation: 'XML Signature provides digital signing for data integrity and non-repudiation.' },
        { text: 'What standard XML framework is used for exchanging authentication and authorization assertions between security domains?', options: ['SAML (Security Assertion Markup Language)', 'SMTP', 'FTP', 'SQL DML'], correctAnswers: ['SAML (Security Assertion Markup Language)'], explanation: 'SAML passes security assertions between identity providers and service providers.' },
        { text: 'What is a major challenge when invoking enterprise SOAP web services from mobile and wireless devices?', options: ['Constrained battery life, limited processing power, memory restrictions, and intermittent network bandwidth', 'Mobile devices cannot connect to the internet', 'Mobile screens cannot display text', 'Wireless signals delete XML files'], correctAnswers: ['Constrained battery life, limited processing power, memory restrictions, and intermittent network bandwidth'], explanation: 'Mobile Web Services face hardware constraints and wireless network variability.' },
        { text: 'In mobile web service architectures, how does a Proxy-Based Mobile Web Service Gateway assist mobile clients?', options: ['Translates heavy SOAP XML messages into lightweight binary/JSON data and handles heavy encryption on behalf of mobile devices', 'Powers the mobile battery wirelessly', 'Manufactures SIM cards', 'Prints paper receipts'], correctAnswers: ['Translates heavy SOAP XML messages into lightweight binary/JSON data and handles heavy encryption on behalf of mobile devices'], explanation: 'Mobile gateways offload XML parsing and heavy cryptographic processing.' },
        { text: 'What attack vector involves an unauthorized attacker intercepting, modifying, or replaying XML web service messages?', options: ['Man-in-the-Middle (MitM) & Replay Attack', 'Hardware RAM failure', 'Monitor burn-in', 'Printer paper jam'], correctAnswers: ['Man-in-the-Middle (MitM) & Replay Attack'], explanation: 'MitM and replay attacks compromise un-signed or un-encrypted message streams.' },
        { text: 'Which open-source Java servlet container and SOAP server combination was historically widely used to deploy SOAP web services?', options: ['Apache Tomcat Application Server & Apache Axis / CXF', 'Microsoft Paint & Notepad', 'Adobe Photoshop & Flash', 'VLC Media Player'], correctAnswers: ['Apache Tomcat Application Server & Apache Axis / CXF'], explanation: 'Tomcat and Apache Axis formed the standard Java SOAP web service deployment environment.' },
        { text: 'What WS-Security mechanism protects sensitive XML element data from unauthorized viewing by encrypting specific nodes?', options: ['XML Encryption (W3C XMLEnc)', 'XML Schema Validator', 'HTML Table border', 'CSS Color property'], correctAnswers: ['XML Encryption (W3C XMLEnc)'], explanation: 'XML Encryption encrypts specific elements or full XML payloads.' },
        { text: 'What security token type can be inserted into a WS-Security header to authenticate a user using username and hashed password digest?', options: ['UsernameToken', 'MP3 Audio Tag', 'Cookie File', 'Bluetooth Pin'], correctAnswers: ['UsernameToken'], explanation: 'UsernameToken passes user credentials and password digests in WS-Security headers.' }
      ]
    });

    console.log('✅ Subject 3 (Web Services & SOA) - 4 Unit Quizzes Seeded');

    // =========================================================================
    // SUBJECT 4: COMPUTER SCIENCE & ALGORITHMS (CS/DSA) - 4 UNIT QUIZZES
    // =========================================================================

    // CS Unit 1
    const csQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'CS Unit 1: Asymptotic Complexity & Sorting Algorithms',
        description: 'System Curriculum Quiz for Unit 1. Covers Big-O/Theta/Omega notations, Master Theorem, MergeSort, QuickSort, and HeapSort Complexity.',
        category: catCSE._id,
        subject: subDSA._id,
        unitName: 'Unit 1: Complexity & Sorting',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What is the tightest worst-case time complexity of MergeSort for an array of N elements?', options: ['O(N log N)', 'O(N²)', 'O(N)', 'O(log N)'], correctAnswers: ['O(N log N)'], explanation: 'MergeSort divides the array in half (log N levels) and merges in linear O(N) time at each level, guaranteeing O(N log N) in all cases.' },
        { text: 'What asymptotic notation describes the asymptotically tight upper bound of an algorithm\'s growth rate?', options: ['Big-O Notation (O)', 'Big-Omega Notation (Ω)', 'Little-o Notation (o)', 'Strict Infinity Notation'], correctAnswers: ['Big-O Notation (O)'], explanation: 'Big-O notation formally defines the asymptotic upper bound on function growth rate.' },
        { text: 'Under Master Theorem, what is the solution to the recurrence relation T(N) = 2T(N/2) + O(N)?', options: ['O(N log N)', 'O(N²)', 'O(N)', 'O(log N)'], correctAnswers: ['O(N log N)'], explanation: 'Since log_b(a) = log_2(2) = 1 and f(n) = O(n¹), Case 2 of Master Theorem yields T(N) = O(N log N).' },
        { text: 'What is the worst-case space complexity of standard in-place HeapSort?', options: ['O(1) auxiliary space', 'O(N) space', 'O(log N) space', 'O(N log N) space'], correctAnswers: ['O(1) auxiliary space'], explanation: 'HeapSort rearranges elements in-place within the array using heapify operations without allocating auxiliary array buffers.' },
        { text: 'Which non-comparison integer sorting algorithm runs in O(N + K) linear time where K is the range of key values?', options: ['Counting Sort', 'QuickSort', 'MergeSort', 'Bubble Sort'], correctAnswers: ['Counting Sort'], explanation: 'Counting Sort tallies key frequencies into a histogram array of size K, achieving O(N + K) linear time.' },
        { text: 'What is the best-case time complexity of standard Insertion Sort on an already sorted array?', options: ['O(N)', 'O(N²)', 'O(N log N)', 'O(1)'], correctAnswers: ['O(N)'], explanation: 'When the array is sorted, each element requires only 1 comparison to verify its position, executing in O(N) linear time.' },
        { text: 'What is a "Stable" sorting algorithm?', options: ['An algorithm that preserves the relative input order of records with equal sorting keys', 'An algorithm that never crashes', 'An algorithm stored in ROM memory', 'An algorithm running on battery power'], correctAnswers: ['An algorithm that preserves the relative input order of records with equal sorting keys'], explanation: 'Stability ensures elements with identical keys maintain their original relative sequence in the sorted output.' },
        { text: 'Which sorting algorithm has an average time complexity of O(N log N) but degrades to O(N²) in the worst-case with poor pivot selection?', options: ['QuickSort', 'MergeSort', 'HeapSort', 'TimSort'], correctAnswers: ['QuickSort'], explanation: 'QuickSort runs in average O(N log N) time, but unbalanced partitions lead to O(N²) worst-case runtime.' },
        { text: 'What is the worst-case time complexity of Binary Search in a sorted array of N elements?', options: ['O(log N)', 'O(N)', 'O(1)', 'O(N log N)'], correctAnswers: ['O(log N)'], explanation: 'Binary search halves the active search interval in each comparison step, requiring at most log_2(N) iterations.' },
        { text: 'What does Big-Omega (Ω) notation signify in algorithm analysis?', options: ['Asymptotic lower bound (best-case lower performance boundary)', 'Asymptotic upper bound', 'Exact average runtime', 'Memory byte allocation limit'], correctAnswers: ['Asymptotic lower bound (best-case lower performance boundary)'], explanation: 'Big-Omega (Ω) provides an asymptotic lower bound on the growth rate of an algorithm\'s runtime function.' }
      ]
    });

    // CS Unit 2
    const csQuiz2 = await createQuizWithQuestions({
      quizData: {
        title: 'CS Unit 2: Self-Balancing Trees & Priority Queues',
        description: 'System Curriculum Quiz for Unit 2. Covers AVL Trees, Red-Black Trees, Binary Heaps, Priority Queues, and Trie Data Structures.',
        category: catCSE._id,
        subject: subDSA._id,
        unitName: 'Unit 2: Self-Balancing Trees & Heaps',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What is the balance factor of a node in an AVL Tree?', options: ['Height(Left Subtree) - Height(Right Subtree)', 'Number of Left Nodes / Number of Right Nodes', 'Value of Node * 2', 'Depth of Node'], correctAnswers: ['Height(Left Subtree) - Height(Right Subtree)'], explanation: 'AVL balance factor is the difference between left and right subtree heights, strictly maintained in {-1, 0, +1}.' },
        { text: 'In a Red-Black Tree, what color is the root node guaranteed to be?', options: ['Black', 'Red', 'Either Red or Black', 'Blue'], correctAnswers: ['Black'], explanation: 'Red-Black Tree Property 2 strictly mandates that the root node must always be colored Black.' },
        { text: 'What rotation sequence is required in an AVL tree to rebalance a Left-Right (LR) insertion violation?', options: ['Left rotation on the left child, followed by a Right rotation on the unbalanced node', 'Single Right rotation', 'Single Left rotation', 'Two consecutive Left rotations'], correctAnswers: ['Left rotation on the left child, followed by a Right rotation on the unbalanced node'], explanation: 'An LR imbalance requires a double rotation: Left rotate the left child, then Right rotate the parent node.' },
        { text: 'In a 1-indexed array representation of a Binary Heap, what is the index formula for the parent of a node at index i?', options: ['Math.floor(i / 2)', '2 * i', '2 * i + 1', 'i - 1'], correctAnswers: ['Math.floor(i / 2)'], explanation: 'For a 1-indexed heap array, node i has parent at floor(i/2), left child at 2i, and right child at 2i+1.' },
        { text: 'What is the time complexity to build a binary heap from an unsorted array of N elements using the bottom-up Floyd build-heap algorithm?', options: ['O(N)', 'O(N log N)', 'O(N²)', 'O(log N)'], correctAnswers: ['O(N)'], explanation: 'Floyd\'s linear build-heap algorithm operates in O(N) time by sifting down from height h = 0 to log N.' },
        { text: 'What is the primary application of a Trie (Prefix Tree) data structure?', options: ['Fast string prefix lookups, dictionary search, and autocomplete systems', 'Sorting 64-bit floating point numbers', 'Calculating shortest paths on graphs', 'Rendering 3D video graphics'], correctAnswers: ['Fast string prefix lookups, dictionary search, and autocomplete systems'], explanation: 'Tries store strings where edges represent characters, allowing prefix searches in O(L) time where L is string length.' },
        { text: 'What is the maximum height of a Red-Black Tree containing N internal nodes?', options: ['2 * log₂(N + 1)', 'N', 'N / 2', 'log₁₀(N)'], correctAnswers: ['2 * log₂(N + 1)'], explanation: 'The black-height property bounds Red-Black Tree height to at most 2 log_2(N+1).' },
        { text: 'In a Max-Heap containing N elements, where is the minimum element located?', options: ['At one of the leaf nodes (indices from floor(N/2) + 1 to N)', 'Always at the root (index 1)', 'Always at index 2', 'At index N/4'], correctAnswers: ['At one of the leaf nodes (indices from floor(N/2) + 1 to N)'], explanation: 'In a Max-Heap, smaller values are pushed downward; the minimum element must reside among the leaf nodes.' },
        { text: 'What is the time complexity of inserting a key into an AVL tree containing N nodes?', options: ['O(log N)', 'O(N)', 'O(1)', 'O(N log N)'], correctAnswers: ['O(log N)'], explanation: 'BST search takes O(log N) and rebalancing rotations take O(1), yielding O(log N) total insertion time.' },
        { text: 'Which data structure efficiently supports Find and Union operations on disjoint dynamic sets?', options: ['Disjoint-Set Union-Find (DSU) with Path Compression', 'Stack', 'Doubly Linked List', 'Binary Search Tree'], correctAnswers: ['Disjoint-Set Union-Find (DSU) with Path Compression'], explanation: 'DSU with union by rank and path compression achieves near-constant amortized O(α(N)) time per operation.' }
      ]
    });

    // CS Unit 3
    const csQuiz3 = await createQuizWithQuestions({
      quizData: {
        title: 'CS Unit 3: Graph Algorithms & Network Traversal',
        description: 'System Curriculum Quiz for Unit 3. Covers BFS/DFS Traversal, Topological Sorting, Shortest Path (Dijkstra, Bellman-Ford), and Minimum Spanning Trees (Kruskal, Prim).',
        category: catCSE._id,
        subject: subDSA._id,
        unitName: 'Unit 3: Graph Algorithms & Traversal',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'Which shortest-path algorithm can correctly detect and report negative-weight cycles in directed weighted graphs?', options: ['Bellman-Ford Algorithm', 'Dijkstra\'s Algorithm', 'Breadth-First Search', 'Prim\'s Algorithm'], correctAnswers: ['Bellman-Ford Algorithm'], explanation: 'Bellman-Ford relaxes all edges V-1 times; a further relaxation indicates the presence of a negative-weight cycle.' },
        { text: 'What is the time complexity of Dijkstra\'s algorithm implemented with a Min-Heap priority queue on a graph with V vertices and E edges?', options: ['O((V + E) log V)', 'O(V²)', 'O(E²)', 'O(V * E)'], correctAnswers: ['O((V + E) log V)'], explanation: 'Min-Heap Dijkstra runs in O((V + E) log V) time, optimal for sparse graphs.' },
        { text: 'Which graph algorithm produces a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge u → v, vertex u comes before v?', options: ['Topological Sort', 'Depth-First Search Post-Order', 'Kruskal Spanning Tree', 'Hopcroft-Karp Algorithm'], correctAnswers: ['Topological Sort'], explanation: 'Topological sorting orders vertices in a DAG respecting all directional precedence dependencies.' },
        { text: 'What is the time complexity of the Floyd-Warshall All-Pairs Shortest Path algorithm?', options: ['O(V³)', 'O(V² log V)', 'O(V * E)', 'O(E log V)'], correctAnswers: ['O(V³)'], explanation: 'Floyd-Warshall uses three nested loops over V vertices, calculating all-pairs shortest paths in O(V³) cubic time.' },
        { text: 'What condition must a graph satisfy to possess an Eulerian Circuit?', options: ['All vertices with non-zero degree must belong to a single connected component, and every vertex must have an even degree', 'All edge weights must be prime numbers', 'The graph must be a tree with no cycles', 'The graph must have exactly two odd vertices'], correctAnswers: ['All vertices with non-zero degree must belong to a single connected component, and every vertex must have an even degree'], explanation: 'Euler\'s theorem states an undirected graph has an Eulerian circuit iff it is connected and all vertices have even degree.' },
        { text: 'What graph representation format is most memory-efficient for representing Sparse Graphs (where E << V²)?', options: ['Adjacency List', 'Adjacency Matrix (V x V)', 'Incidence Matrix', 'Full Dense Tensor'], correctAnswers: ['Adjacency List'], explanation: 'Adjacency lists consume O(V + E) memory, far superior to O(V²) matrices for sparse graphs.' },
        { text: 'Which greedy algorithm grows a Minimum Spanning Tree from a starting vertex by repeatedly adding the cheapest edge connected to the visited tree component?', options: ['Prim\'s Algorithm', 'Kruskal\'s Algorithm', 'Tarjan\'s Algorithm', 'Kosaraju\'s Algorithm'], correctAnswers: ['Prim\'s Algorithm'], explanation: 'Prim\'s algorithm grows a single MST tree cluster greedily by picking the minimum-weight frontier edge.' },
        { text: 'What is a Strongly Connected Component (SCC) in a directed graph?', options: ['A maximal subgraph where every vertex is reachable from every other vertex in the subgraph', 'A graph with no vertices', 'A complete bipartite clique', 'A tree with height 1'], correctAnswers: ['A maximal subgraph where every vertex is reachable from every other vertex in the subgraph'], explanation: 'An SCC is a maximal set of vertices such that mutual directed paths exist between every pair of vertices.' },
        { text: 'What algorithm decomposes a directed graph into Strongly Connected Components in two DFS passes?', options: ['Kosaraju\'s Algorithm', 'Dijkstra\'s Algorithm', 'Floyd-Warshall', 'Edmonds-Karp'], correctAnswers: ['Kosaraju\'s Algorithm'], explanation: 'Kosaraju\'s algorithm uses one DFS pass on graph G and a second DFS pass on transposed graph G^T in O(V + E) time.' },
        { text: 'What data structure is used to implement Breadth-First Search (BFS)?', options: ['FIFO Queue', 'LIFO Stack', 'Priority Queue', 'Trie'], correctAnswers: ['FIFO Queue'], explanation: 'BFS processes vertices in order of discovery using a First-In-First-Out (FIFO) queue.' }
      ]
    });

    // CS Unit 4
    const csQuiz4 = await createQuizWithQuestions({
      quizData: {
        title: 'CS Unit 4: Dynamic Programming & Greedy Paradigms',
        description: 'System Curriculum Quiz for Unit 4. Covers 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, and Fractional Knapsack Greedy Strategy.',
        category: catCSE._id,
        subject: subDSA._id,
        unitName: 'Unit 4: Dynamic Programming & Greedy',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What are the two core properties that a problem must exhibit for Dynamic Programming to be applicable?', options: ['Optimal Substructure and Overlapping Subproblems', 'Greedy Choice and Constant Time Steps', 'Linearity and Deterministic Randomness', 'Zero Memory and Exponential Branches'], correctAnswers: ['Optimal Substructure and Overlapping Subproblems'], explanation: 'DP applies when an optimal solution contains optimal solutions to subproblems (optimal substructure) and subproblems repeat (overlapping subproblems).' },
        { text: 'What is the time complexity of the standard Dynamic Programming solution to the 0/1 Knapsack problem with N items and knapsack capacity W?', options: ['O(N * W) pseudo-polynomial time', 'O(2^N) exponential time', 'O(N log N)', 'O(W²)'], correctAnswers: ['O(N * W) pseudo-polynomial time'], explanation: 'Tabulation computes a 2D table of size (N+1) x (W+1), running in O(N * W) pseudo-polynomial time.' },
        { text: 'In the Fractional Knapsack problem, which greedy strategy yields the provably optimal solution?', options: ['Sort items in descending order of value-to-weight ratio (Value / Weight) and pick greedily', 'Pick the heaviest item first', 'Pick the cheapest item first', 'Pick items in random order'], correctAnswers: ['Sort items in descending order of value-to-weight ratio (Value / Weight) and pick greedily'], explanation: 'Fractional knapsack allows item division; greedily picking highest value density (v_i / w_i) achieves optimal profit in O(N log N).' },
        { text: 'What is the time complexity to find the Longest Common Subsequence (LCS) of two strings of lengths M and N using Dynamic Programming?', options: ['O(M * N)', 'O(2^(M+N))', 'O(M + N)', 'O(M log N)'], correctAnswers: ['O(M * N)'], explanation: 'LCS constructs an (M+1) x (N+1) table where DP[i][j] stores the LCS length of prefixes, executing in O(M * N) time.' },
        { text: 'What is the difference between Memoization (Top-Down) and Tabulation (Bottom-Up) in Dynamic Programming?', options: ['Memoization uses recursion and caches subproblem results on demand; Tabulation iteratively fills an array starting from base cases without call-stack recursion', 'Memoization uses no memory', 'Tabulation is only for graphs', 'There is no difference'], correctAnswers: ['Memoization uses recursion and caches subproblem results on demand; Tabulation iteratively fills an array starting from base cases without call-stack recursion'], explanation: 'Top-down memoization evaluates subproblems on demand recursively; bottom-up tabulation builds tabular solutions from base cases iteratively.' },
        { text: 'In Matrix Chain Multiplication with N matrices, what does the Dynamic Programming algorithm optimize?', options: ['The parenthesization order to minimize the total number of scalar multiplications required', 'The physical size of RAM', 'The determinant calculation', 'The inversion of singular matrices'], correctAnswers: ['The parenthesization order to minimize the total number of scalar multiplications required'], explanation: 'Matrix multiplication is associative; optimal parenthesization minimizes total scalar arithmetic multiplications in O(N³) time.' },
        { text: 'What is the Huffman Coding algorithm used for in computer science?', options: ['Lossless data compression using variable-length prefix codes based on character occurrence frequency', 'Public key encryption', 'CPU register allocation', 'Database table indexing'], correctAnswers: ['Lossless data compression using variable-length prefix codes based on character occurrence frequency'], explanation: 'Huffman coding builds a greedy min-heap tree to assign shorter binary bit codes to frequent characters.' },
        { text: 'Which problem can be solved in O(N log N) time using Patience Sorting and Binary Search?', options: ['Longest Increasing Subsequence (LIS)', 'Travelling Salesperson Problem (TSP)', 'Hamiltonian Cycle Problem', 'Graph Coloring Problem'], correctAnswers: ['Longest Increasing Subsequence (LIS)'], explanation: 'LIS can be solved in O(N log N) time using binary search (tails array) rather than standard O(N²) DP.' },
        { text: 'Why cannot the standard 0/1 Knapsack problem be solved optimally using the greedy value-to-weight ratio strategy?', options: ['Greedy choice may leave unused empty capacity in the knapsack because items cannot be broken into fractions', '0/1 knapsack items have no weight', 'The knapsack has infinite capacity', 'Greedy algorithms only work on strings'], correctAnswers: ['Greedy choice may leave unused empty capacity in the knapsack because items cannot be broken into fractions'], explanation: 'In 0/1 knapsack, leaving empty space without fractional filling can yield sub-optimal total value.' },
        { text: 'What is the recurrence relation for the Coin Change Minimum Coins problem for target amount A and coin denominations c_1, c_2, ..., c_k?', options: ['DP(A) = 1 + min{ DP(A - c_i) } for all c_i <= A', 'DP(A) = DP(A - 1) * 2', 'DP(A) = max{ c_i }', 'DP(A) = A / k'], correctAnswers: ['DP(A) = 1 + min{ DP(A - c_i) } for all c_i <= A'], explanation: 'The optimal coin count for amount A is 1 plus the minimum coins needed for any valid remainder (A - c_i).' }
      ]
    });

    console.log('✅ Subject 4 (Computer Science & Algorithms) - 4 Unit Quizzes Seeded');

    // =========================================================================
    // SUBJECT 5: DATABASE SYSTEMS & SQL (DBMS) - 4 UNIT QUIZZES
    // =========================================================================

    // DBMS Unit 1
    const dbmsQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'DBMS Unit 1: Relational Model, ER Modeling & SQL DDL/DML',
        description: 'System Curriculum Quiz for Unit 1. Covers Entity-Relationship Diagrams, Relational Algebra, SQL Select/Join syntax, Aggregate functions, and Constraints.',
        category: catIT._id,
        subject: subDBMS._id,
        unitName: 'Unit 1: Relational Model & SQL',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'In Relational Algebra, what operation retrieves specific columns (attributes) from a relation table?', options: ['Projection (π)', 'Selection (σ)', 'Cartesian Product (×)', 'Natural Join (⋈)'], correctAnswers: ['Projection (π)'], explanation: 'Projection (π) filters vertical attribute columns, while Selection (σ) filters horizontal tuple rows.' },
        { text: 'Which SQL clause is used to filter records resulting from an aggregate GROUP BY calculation (e.g. COUNT, AVG)?', options: ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'], correctAnswers: ['HAVING'], explanation: 'WHERE filters individual records prior to grouping; HAVING filters aggregated groups.' },
        { text: 'In SQL, what is the effect of an INNER JOIN between Table A and Table B?', options: ['Returns only the records that have matching join key values in both tables', 'Returns all rows from Table A regardless of matches', 'Returns all rows from Table B regardless of matches', 'Multiplies all numerical values by two'], correctAnswers: ['Returns only the records that have matching join key values in both tables'], explanation: 'INNER JOIN combines rows from two tables when the specified join condition is satisfied in both.' },
        { text: 'In ER modeling, what entity type cannot be uniquely identified by its own attributes alone and depends on an identifying relationship?', options: ['Weak Entity', 'Strong Entity', 'Superclass Entity', 'Recursive Entity'], correctAnswers: ['Weak Entity'], explanation: 'A Weak Entity lacks a primary key and relies on an identifying relationship with an owner entity along with a partial discriminator key.' },
        { text: 'Which SQL command is classified under Data Definition Language (DDL)?', options: ['CREATE TABLE', 'INSERT INTO', 'UPDATE', 'DELETE'], correctAnswers: ['CREATE TABLE'], explanation: 'DDL commands (CREATE, ALTER, DROP, TRUNCATE) define and modify database schema structures.' },
        { text: 'What integrity constraint ensures that a foreign key value in a referencing table must match an existing primary key value in the referenced table?', options: ['Referential Integrity Constraint', 'Entity Integrity Constraint', 'Domain Constraint', 'Check Constraint'], correctAnswers: ['Referential Integrity Constraint'], explanation: 'Referential integrity guarantees relationships between foreign and primary keys remain valid without orphaned records.' },
        { text: 'What is the SQL keyword used to remove all rows from a table quickly while resetting auto-increment counters without logging individual row deletions?', options: ['TRUNCATE', 'DELETE', 'DROP', 'REMOVE'], correctAnswers: ['TRUNCATE'], explanation: 'TRUNCATE deallocates data pages quickly via DDL, whereas DELETE removes rows one by one with transaction rollback logging.' },
        { text: 'In SQL, what aggregate function returns the total number of non-NULL values in a column?', options: ['COUNT(column_name)', 'SUM(column_name)', 'TOTAL(column_name)', 'LENGTH(column_name)'], correctAnswers: ['COUNT(column_name)'], explanation: 'COUNT(column_name) evaluates and returns the number of non-null values present in the specified column.' },
        { text: 'What does the SQL command ROLLBACK perform during an active transaction?', options: ['Undoes all modifications made during the current transaction and restores the database to its previous committed state', 'Commits all changes permanently to disk', 'Deletes the database schema', 'Restarts the operating system'], correctAnswers: ['Undoes all modifications made during the current transaction and restores the database to its previous committed state'], explanation: 'ROLLBACK cancels pending transaction modifications, maintaining atomicity.' },
        { text: 'In ER diagrams, what geometric shape represents a Relationship between entities?', options: ['Diamond', 'Rectangle', 'Ellipse / Oval', 'Double Rectangle'], correctAnswers: ['Diamond'], explanation: 'In Chen\'s ER notation, rectangles represent entities, ellipses represent attributes, and diamonds represent relationships.' }
      ]
    });

    // DBMS Unit 2
    const dbmsQuiz2 = await createQuizWithQuestions({
      quizData: {
        title: 'DBMS Unit 2: Functional Dependencies & Normalization',
        description: 'System Curriculum Quiz for Unit 2. Covers 1NF, 2NF, 3NF, BCNF Normalization Rules, Lossless Join Decompositions, and Dependency Preservation.',
        category: catIT._id,
        subject: subDBMS._id,
        unitName: 'Unit 2: Normalization (1NF–BCNF)',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'A relational database table is in Boyce-Codd Normal Form (BCNF) if and only if:', options: ['For every non-trivial functional dependency X → Y, X is a superkey of the relation', 'Every attribute is atomic and there are no primary keys', 'All non-prime attributes are transitively dependent on the candidate key', 'The table contains no foreign keys'], correctAnswers: ['For every non-trivial functional dependency X → Y, X is a superkey of the relation'], explanation: 'BCNF requires that for every functional dependency X → Y, the determinant X must be a superkey.' },
        { text: 'What condition violates Second Normal Form (2NF) in a relational table?', options: ['Partial Functional Dependency (a non-prime attribute depends on a proper subset of a composite candidate key)', 'Transitive Dependency', 'Multi-valued Dependency', 'Atomic attribute values'], correctAnswers: ['Partial Functional Dependency (a non-prime attribute depends on a proper subset of a composite candidate key)'], explanation: '2NF requires 1NF plus zero partial functional dependencies on composite candidate keys.' },
        { text: 'What condition violates Third Normal Form (3NF)?', options: ['Transitive Dependency (a non-prime attribute depends on another non-prime attribute)', 'Partial Dependency', 'Atomic values in rows', 'Having a single primary key'], correctAnswers: ['Transitive Dependency (a non-prime attribute depends on another non-prime attribute)'], explanation: '3NF eliminates transitive dependencies where non-prime attribute A determines non-prime attribute B.' },
        { text: 'What is the primary requirement for First Normal Form (1NF)?', options: ['All attributes must contain atomic, indivisible values with no repeating groups or nested arrays', 'All tables must have foreign keys', 'All columns must store numbers', 'Tables cannot contain more than 10 rows'], correctAnswers: ['All attributes must contain atomic, indivisible values with no repeating groups or nested arrays'], explanation: '1NF mandates atomic column values with no multi-valued or composite attributes.' },
        { text: 'What is a "Lossless-Join Decomposition"?', options: ['A decomposition of relation R into R1 and R2 such that R1 ⋈ R2 reproduces the exact original tuples of R with zero spurious records', 'A query that deletes no rows', 'A database compression algorithm', 'A join that runs in 0 milliseconds'], correctAnswers: ['A decomposition of relation R into R1 and R2 such that R1 ⋈ R2 reproduces the exact original tuples of R with zero spurious records'], explanation: 'Lossless join guarantees natural join of decomposed tables reconstructs the original relation without false records.' },
        { text: 'In functional dependency theory, what is the "Closure of an Attribute Set X" (denoted X⁺)?', options: ['The complete set of all attributes functionally determined by X under Armstrong\'s axioms', 'The set of null values', 'The table primary key name', 'The disk sector size'], correctAnswers: ['The complete set of all attributes functionally determined by X under Armstrong\'s axioms'], explanation: 'Attribute closure X+ contains all attributes that can be functionally derived from X using given dependencies.' },
        { text: 'What inference rule in Armstrong\'s Axioms states: "If X → Y and Y → Z, then X → Z"?', options: ['Transitivity Rule', 'Reflexivity Rule', 'Augmentation Rule', 'Union Rule'], correctAnswers: ['Transitivity Rule'], explanation: 'The Transitivity Rule states functional dependencies propagate across intermediate determinants: X → Y and Y → Z imply X → Z.' },
        { text: 'What is a "Candidate Key" in relational database design?', options: ['A minimal superkey with no redundant attributes capable of uniquely identifying every tuple in a relation', 'Any column that allows NULLs', 'A foreign key pointing to an external database', 'A temporary index in RAM'], correctAnswers: ['A minimal superkey with no redundant attributes capable of uniquely identifying every tuple in a relation'], explanation: 'A Candidate Key is a minimal superkey capable of uniquely identifying relation tuples.' },
        { text: 'What is a "Prime Attribute"?', options: ['An attribute that is a member of at least one candidate key of the relation', 'An attribute storing prime numbers', 'An encrypted column', 'A column created by an admin'], correctAnswers: ['An attribute that is a member of at least one candidate key of the relation'], explanation: 'Prime attributes belong to at least one candidate key; non-prime attributes belong to no candidate keys.' },
        { text: 'Which normal form addresses Multi-Valued Dependencies (MVDs: X ↠ Y)?', options: ['Fourth Normal Form (4NF)', 'Third Normal Form (3NF)', 'Second Normal Form (2NF)', 'First Normal Form (1NF)'], correctAnswers: ['Fourth Normal Form (4NF)'], explanation: 'Ronald Fagin introduced 4NF to eliminate non-trivial multi-valued dependencies.' }
      ]
    });

    // DBMS Unit 3
    const dbmsQuiz3 = await createQuizWithQuestions({
      quizData: {
        title: 'DBMS Unit 3: Transaction Processing, Concurrency & Recovery',
        description: 'System Curriculum Quiz for Unit 3. Covers ACID Properties, Two-Phase Locking (2PL), Serializable Schedules, Deadlocks, and Write-Ahead Logging (WAL).',
        category: catIT._id,
        subject: subDBMS._id,
        unitName: 'Unit 3: Transactions & Concurrency Control',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'Which ACID property guarantees that once a transaction commits, its modifications persist permanently even in the event of a sudden power outage or system crash?', options: ['Durability', 'Atomicity', 'Consistency', 'Isolation'], correctAnswers: ['Durability'], explanation: 'Durability ensures committed transaction changes survive crashes using non-volatile write-ahead logs.' },
        { text: 'In Two-Phase Locking (2PL), what invariant must be obeyed by every transaction?', options: ['No lock can be acquired after any lock has been released (Growing phase precedes Shrinking phase)', 'All locks must be exclusive locks', 'Transactions must only lock one row at a time', 'Locks are never released'], correctAnswers: ['No lock can be acquired after any lock has been released (Growing phase precedes Shrinking phase)'], explanation: '2PL separates lock acquisition from lock release, guaranteeing conflict serializability.' },
        { text: 'What concurrency anomaly occurs when Transaction A reads uncommitted modified data from Transaction B, which subsequently rolls back?', options: ['Dirty Read (Reading Uncommitted Data)', 'Phantom Read', 'Non-Repeatable Read', 'Lost Update'], correctAnswers: ['Dirty Read (Reading Uncommitted Data)'], explanation: 'Dirty reads occur when a transaction reads uncommitted modifications that are later rolled back.' },
        { text: 'What graph algorithm is used in database engines to detect Deadlocks among concurrent transactions?', options: ['Wait-For Graph (WFG) cycle detection', 'Dijkstra Shortest Path', 'Kruskal Spanning Tree', 'B+ Tree Search'], correctAnswers: ['Wait-For Graph (WFG) cycle detection'], explanation: 'A Wait-For Graph models transactions waiting for locks held by others; a directed cycle indicates deadlock.' },
        { text: 'What mechanism in database crash recovery ensures durability by writing log records to non-volatile disk before modifying actual data pages in memory/disk?', options: ['Write-Ahead Logging (WAL)', 'Shadow Paging', 'Garbage Collection', 'Memory Swapping'], correctAnswers: ['Write-Ahead Logging (WAL)'], explanation: 'WAL mandates log records precede dirty data page writes to disk for crash recovery.' },
        { text: 'What does the ARIES recovery algorithm use to determine which transactions must be undone during crash restart?', options: ['Analysis Phase, Redo Phase, and Undo Phase', 'Format Disk Phase', 'Single Thread Re-execution', 'Deleting transaction logs'], correctAnswers: ['Analysis Phase, Redo Phase, and Undo Phase'], explanation: 'ARIES recovery executes Analysis (identifies dirty pages/active transactions), Redo (repeats history), and Undo (rolls back uncommitted transactions).' },
        { text: 'What isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads under ANSI SQL standards?', options: ['Repeatable Read', 'Read Committed', 'Read Uncommitted', 'Serializable'], correctAnswers: ['Repeatable Read'], explanation: 'Repeatable Read locks scanned rows preventing updates, but allows phantom rows inserted by concurrent transactions.' },
        { text: 'What is Multi-Version Concurrency Control (MVCC) used for in modern databases (e.g. PostgreSQL, InnoDB)?', options: ['Allows readers to read consistent point-in-time snapshots without locking out concurrent writers ("Readers do not block writers, writers do not block readers")', 'Creates duplicate hard drives', 'Runs multiple database instances on different ports', 'Encrypts user passwords'], correctAnswers: ['Allows readers to read consistent point-in-time snapshots without locking out concurrent writers ("Readers do not block writers, writers do not block readers")'], explanation: 'MVCC maintains historical row versions so read queries see consistent snapshots without acquiring exclusive locks.' },
        { text: 'What deadlock prevention strategy assigns timestamps to transactions and forces older transactions to wait while younger transactions abort/rollback when requesting a lock held by an older transaction?', options: ['Wait-Die Scheme', 'Wound-Wait Scheme', 'Random Abort Scheme', 'Strict 2PL'], correctAnswers: ['Wait-Die Scheme'], explanation: 'Wait-Die is a non-preemptive timestamp scheme where older transactions wait, but younger transactions abort (die).' },
        { text: 'In database transactions, what is a "Savepoint"?', options: ['An intermediate marker within a transaction allowing partial rollback to that point without aborting the entire transaction', 'A backup hard drive file', 'The database root administrator password', 'A permanent commit marker'], correctAnswers: ['An intermediate marker within a transaction allowing partial rollback to that point without aborting the entire transaction'], explanation: 'Savepoints allow granular rollback of nested transaction operations without canceling the entire transaction.' }
      ]
    });

    // DBMS Unit 4
    const dbmsQuiz4 = await createQuizWithQuestions({
      quizData: {
        title: 'DBMS Unit 4: Storage, B+ Tree Indexing & NoSQL Document Databases',
        description: 'System Curriculum Quiz for Unit 4. Covers B+ Tree Index Architecture, Hash Indexing, Query Optimization, and NoSQL MongoDB Document Models.',
        category: catIT._id,
        subject: subDBMS._id,
        unitName: 'Unit 4: Storage, Indexing & NoSQL',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'Why do relational database storage engines (e.g. InnoDB, PostgreSQL) predominantly utilize B+ Trees rather than standard Binary Search Trees for disk-based indexing?', options: ['B+ Trees have high fan-out leading to shallow tree depth, significantly reducing disk I/O seek operations, and leaf nodes are linked for fast range scans', 'B+ Trees require zero bytes of memory', 'Binary search trees cannot store string characters', 'B+ Trees eliminate the need for primary keys'], correctAnswers: ['B+ Trees have high fan-out leading to shallow tree depth, significantly reducing disk I/O seek operations, and leaf nodes are linked for fast range scans'], explanation: 'High fan-out keeps tree depth low, minimizing expensive disk block reads during searches.' },
        { text: 'What is a "Clustered Index" in database storage architecture?', options: ['An index that dictates the physical sorting and storage order of actual table data rows on disk', 'An index stored entirely in RAM memory', 'An index distributed across 10 servers', 'An index created only on NULL values'], correctAnswers: ['An index that dictates the physical sorting and storage order of actual table data rows on disk'], explanation: 'A clustered index sorts and stores table rows physically on disk according to the indexed key.' },
        { text: 'In MongoDB NoSQL databases, what format is used to store semi-structured document records internally on disk?', options: ['BSON (Binary JSON)', 'Plain ASCII Text', 'CSV spreadsheet', 'XML SOAP Envelopes'], correctAnswers: ['BSON (Binary JSON)'], explanation: 'MongoDB encodes documents in BSON (Binary JSON), extending JSON with data types like ObjectId and Date.' },
        { text: 'In database query optimization, what does the EXPLAIN command output?', options: ['The execution plan chosen by the query optimizer, including index usage, scan type, and estimated row costs', 'The source code of the database engine', 'The user password hash', 'The disk temperature'], correctAnswers: ['The execution plan chosen by the query optimizer, including index usage, scan type, and estimated row costs'], explanation: 'EXPLAIN displays the execution plan (e.g. index scan vs full table scan) chosen by the optimizer.' },
        { text: 'What is the primary difference between Horizontal Scaling (Sharding) and Vertical Scaling?', options: ['Horizontal scaling distributes database partitions across multiple commodity servers; Vertical scaling increases CPU, RAM, and SSD resources on a single server', 'Vertical scaling is always cheaper', 'Horizontal scaling works only on Windows', 'They are identical'], correctAnswers: ['Horizontal scaling distributes database partitions across multiple commodity servers; Vertical scaling increases CPU, RAM, and SSD resources on a single server'], explanation: 'Sharding distributes data horizontally across multiple machines to scale write throughput and storage capacity.' },
        { text: 'What is a "Covering Index" in SQL query execution?', options: ['An index that contains all columns requested by a SELECT query, allowing the database to satisfy the query entirely from the index without reading table data pages', 'An index that covers the entire hard drive', 'An encrypted backup file', 'A primary key with auto-increment'], correctAnswers: ['An index that contains all columns requested by a SELECT query, allowing the database to satisfy the query entirely from the index without reading table data pages'], explanation: 'A covering index satisfies a query entirely from the index B+ Tree without reading base table row pages.' },
        { text: 'In the CAP Theorem for distributed data stores, what does CAP stand for?', options: ['Consistency, Availability, and Partition Tolerance', 'Computers, Algorithms, and Protocols', 'Caches, Arrays, and Pointers', 'Concurrency, Atomicity, and Performance'], correctAnswers: ['Consistency, Availability, and Partition Tolerance'], explanation: 'Eric Brewer\'s CAP theorem states a distributed system can guarantee at most two of Consistency, Availability, and Partition Tolerance.' },
        { text: 'In MongoDB, what pipeline framework is used to filter, group, transform, and compute aggregated analytics over document collections?', options: ['MongoDB Aggregation Pipeline ($match, $group, $project)', 'MapReduce in Java only', 'SQL Stored Procedures', 'CSS Flexbox'], correctAnswers: ['MongoDB Aggregation Pipeline ($match, $group, $project)'], explanation: 'The MongoDB Aggregation Pipeline processes documents through stages ($match, $group, $sort) to transform and calculate aggregations.' },
        { text: 'What is the disadvantage of creating too many indexes on a frequently updated database table?', options: ['Every INSERT, UPDATE, and DELETE operation must update all associated B+ Tree indexes, increasing write latency and storage overhead', 'Read queries become slower', 'The database becomes read-only', 'Indexes delete primary keys'], correctAnswers: ['Every INSERT, UPDATE, and DELETE operation must update all associated B+ Tree indexes, increasing write latency and storage overhead'], explanation: 'Indexes speed up reads but incur write overhead because all index trees must be balanced and updated on writes.' },
        { text: 'What is "Eventual Consistency" in distributed NoSQL databases (e.g. DynamoDB, Cassandra)?', options: ['A consistency model where all replicas will converge to the same consistent value over time given no new updates', 'Immediate strict serializability on every node', 'Zero data replication', 'Deleting old data automatically'], correctAnswers: ['A consistency model where all replicas will converge to the same consistent value over time given no new updates'], explanation: 'Eventual consistency guarantees that in the absence of new updates, all replica nodes will eventually become consistent.' }
      ]
    });

    console.log('✅ Subject 5 (Database Systems & SQL) - 4 Unit Quizzes Seeded');

    // =========================================================================
    // SUBJECT 6: ARTIFICIAL INTELLIGENCE & DATA SCIENCE (AI) - 4 UNIT QUIZZES
    // =========================================================================

    // AI Unit 1
    const aiQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'AI Unit 1: Classical AI, Search Strategies & Knowledge Representation',
        description: 'System Curriculum Quiz for Unit 1. Covers State Space Search, A* Heuristic Search, Minimax with Alpha-Beta Pruning, Propositional Logic, and Knowledge Graphs.',
        category: catAI._id,
        subject: subAI._id,
        unitName: 'Unit 1: Classical AI & Search Algorithms',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What condition must a heuristic function h(n) satisfy for the A* Search algorithm to be guaranteed admissible (optimal on trees)?', options: ['h(n) must never overestimate the true cost to reach the goal (h(n) <= h*(n))', 'h(n) must equal zero for all nodes', 'h(n) must be negative', 'h(n) must be calculated using neural networks'], correctAnswers: ['h(n) must never overestimate the true cost to reach the goal (h(n) <= h*(n))'], explanation: 'An admissible heuristic never overestimates the actual minimal cost to the goal, ensuring A* finds the optimal path.' },
        { text: 'In game theory, what is the purpose of Alpha-Beta Pruning in the Minimax algorithm?', options: ['Eliminates evaluation of game tree branches that cannot possibly influence the final minimax decision, reducing search time without altering the optimal move', 'Increases computer monitor framerate', 'Forces the opponent to resign', 'Randomizes chess moves'], correctAnswers: ['Eliminates evaluation of game tree branches that cannot possibly influence the final minimax decision, reducing search time without altering the optimal move'], explanation: 'Alpha-Beta pruning prunes branches where alpha >= beta, doubling search depth without affecting the result.' },
        { text: 'What evaluation function f(n) is computed by the A* Search algorithm at node n?', options: ['f(n) = g(n) + h(n) (where g(n) = exact cost from start to n, h(n) = heuristic estimate from n to goal)', 'f(n) = g(n) * h(n)', 'f(n) = g(n) / h(n)', 'f(n) = h(n) only'], correctAnswers: ['f(n) = g(n) + h(n) (where g(n) = exact cost from start to n, h(n) = heuristic estimate from n to goal)'], explanation: 'A* ranks nodes by f(n) = g(n) + h(n), balancing known path cost with estimated distance to goal.' },
        { text: 'What search algorithm expands nodes in order of their heuristic value h(n) alone, ignoring path cost g(n)?', options: ['Greedy Best-First Search', 'A* Search', 'Uniform Cost Search', 'Iterative Deepening Search'], correctAnswers: ['Greedy Best-First Search'], explanation: 'Greedy Best-First Search evaluates nodes solely by h(n), which is fast but not guaranteed to find the optimal path.' },
        { text: 'In adversarial game playing, what does the MIN node in a Minimax tree attempt to do?', options: ['Minimize the maximum possible payout/score of the MAX player', 'Maximize the player score', 'Randomly select moves', 'Quit the game'], correctAnswers: ['Minimize the maximum possible payout/score of the MAX player'], explanation: 'The MIN player chooses moves that minimize the payoff evaluation for the maximizing player.' },
        { text: 'What is a "Consistent" (Monotonic) heuristic in A* graph search?', options: ['For every node n and successor n\' via action a: h(n) <= c(n, a, n\') + h(n\') and h(Goal) = 0 (satisfies triangle inequality)', 'h(n) changes randomly', 'h(n) is always 100', 'h(n) is strictly negative'], correctAnswers: ['For every node n and successor n\' via action a: h(n) <= c(n, a, n\') + h(n\') and h(Goal) = 0 (satisfies triangle inequality)'], explanation: 'Consistency satisfies the triangle inequality, ensuring A* never needs to re-expand previously closed nodes.' },
        { text: 'In first-order logic and knowledge representation, what is "Unification"?', options: ['An algorithmic process of finding a variable substitution mapping that makes two distinct logical expressions identical', 'Combining two databases', 'Encrypting logical formulas', 'Deleting duplicate records'], correctAnswers: ['An algorithmic process of finding a variable substitution mapping that makes two distinct logical expressions identical'], explanation: 'Unification finds variable substitutions θ such that Subst(θ, p) = Subst(θ, q), essential for automated theorem proving.' },
        { text: 'What inference rule states: "From P and P → Q, infer Q"?', options: ['Modus Ponens', 'Modus Tollens', 'Resolution Principle', 'De Morgan\'s Law'], correctAnswers: ['Modus Ponens'], explanation: 'Modus Ponens is a fundamental deductive inference rule: if conditional statement P → Q is true and antecedent P is true, then consequent Q is true.' },
        { text: 'Which search algorithm combines the space efficiency of Depth-First Search with the completeness and optimality of Breadth-First Search?', options: ['Iterative Deepening Depth-First Search (IDDFS)', 'Breadth-First Search only', 'Bidirectional Search', 'Hill Climbing'], correctAnswers: ['Iterative Deepening Depth-First Search (IDDFS)'], explanation: 'IDDFS repeatedly runs depth-limited DFS with increasing depth limits, combining O(bd) space with O(b^d) completeness.' },
        { text: 'What is the primary failure mode of simple Hill Climbing search in complex state spaces?', options: ['Getting stuck on local maxima, plateaus, and ridges before reaching the global optimum', 'Memory buffer overflow', 'Division by zero', 'Slow network latency'], correctAnswers: ['Getting stuck on local maxima, plateaus, and ridges before reaching the global optimum'], explanation: 'Hill climbing makes greedy local moves and terminates when no neighbor is better, becoming trapped in local optima.' }
      ]
    });

    // AI Unit 2
    const aiQuiz2 = await createQuizWithQuestions({
      quizData: {
        title: 'AI Unit 2: Supervised Learning & Statistical Classification',
        description: 'System Curriculum Quiz for Unit 2. Covers Linear/Logistic Regression, Decision Trees, Random Forests, Support Vector Machines (SVMs), and Bias-Variance Tradeoff.',
        category: catAI._id,
        subject: subAI._id,
        unitName: 'Unit 2: Supervised Learning & Models',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'In Support Vector Machines (SVM), what is the "Margin"?', options: ['The geometric distance between the separating hyperplane and the closest training data points (support vectors)', 'The number of training samples', 'The learning rate', 'The percentage of errors'], correctAnswers: ['The geometric distance between the separating hyperplane and the closest training data points (support vectors)'], explanation: 'SVM maximizes the margin (2 / ||w||) between the decision hyperplane and the closest support vector data points.' },
        { text: 'What algorithm is used in Decision Trees (e.g. ID3, C4.5) to select the best attribute for splitting at each node?', options: ['Information Gain (or Gini Impurity reduction)', 'Gradient Descent', 'K-Means Clustering', 'A* Search'], correctAnswers: ['Information Gain (or Gini Impurity reduction)'], explanation: 'Decision tree algorithms choose splits that maximize Information Gain (entropy reduction) or minimize Gini impurity.' },
        { text: 'What is the "Kernel Trick" in Support Vector Machines?', options: ['Implicitly mapping non-linearly separable input data into higher-dimensional feature spaces using inner-product kernel functions without explicit coordinate transformations', 'A cheat code in machine learning games', 'Deleting outlier data points', 'Running SVM on GPUs'], correctAnswers: ['Implicitly mapping non-linearly separable input data into higher-dimensional feature spaces using inner-product kernel functions without explicit coordinate transformations'], explanation: 'Kernel functions (e.g. RBF, Polynomial) compute inner products in high-dimensional Hilbert spaces without computing coordinates explicitly.' },
        { text: 'In Logistic Regression, what activation function maps real-valued outputs to probabilities between 0 and 1?', options: ['Sigmoid (Logistic) Function: σ(z) = 1 / (1 + e⁻ᶻ)', 'ReLU Function: max(0, z)', 'Linear Function: f(z) = z', 'Step Function'], correctAnswers: ['Sigmoid (Logistic) Function: σ(z) = 1 / (1 + e⁻ᶻ)'], explanation: 'The Sigmoid function squashes linear combinations into the (0, 1) probability range for binary classification.' },
        { text: 'What is the Bias-Variance Tradeoff in machine learning?', options: ['Models with high bias underfit by oversimplifying patterns; models with high variance overfit by memorizing training noise; optimal generalization balances both', 'Bias is memory and variance is CPU speed', 'Tradeoff between buying GPUs vs CPUs', 'Tradeoff between Python vs R'], correctAnswers: ['Models with high bias underfit by oversimplifying patterns; models with high variance overfit by memorizing training noise; optimal generalization balances both'], explanation: 'Total expected test error = Bias² + Variance + Irreducible Error. Minimizing generalization error requires balancing bias and variance.' },
        { text: 'How does an ensemble Random Forest reduce the variance of individual Decision Trees?', options: ['By building multiple decorrelated trees using Bootstrap Aggregation (Bagging) and random feature subspace sampling, then averaging predictions', 'By pruning all trees to height 1', 'By running only one tree on 100% of data', 'By converting trees into neural networks'], correctAnswers: ['By building multiple decorrelated trees using Bootstrap Aggregation (Bagging) and random feature subspace sampling, then averaging predictions'], explanation: 'Random Forests combine bagging with random feature selection to decorrelate individual trees, reducing ensemble variance.' },
        { text: 'What cost function is minimized in standard Ordinary Least Squares (OLS) Linear Regression?', options: ['Mean Squared Error (MSE) / Sum of Squared Residuals', 'Cross-Entropy Loss', 'Hinge Loss', 'Gini Index'], correctAnswers: ['Mean Squared Error (MSE) / Sum of Squared Residuals'], explanation: 'Linear regression minimizes the sum of squared differences between predicted values and actual continuous targets.' },
        { text: 'What is L1 Regularization (Lasso) in regression models known for?', options: ['Adding an absolute weight penalty (λ Σ|w|) to the loss, driving non-essential feature coefficients strictly to zero (feature selection / sparsity)', 'Squaring weights', 'Doubling learning rates', 'Preventing GPU memory leaks'], correctAnswers: ['Adding an absolute weight penalty (λ Σ|w|) to the loss, driving non-essential feature coefficients strictly to zero (feature selection / sparsity)'], explanation: 'L1 Lasso introduces diamond-shaped parameter constraints that drive insignificant coefficients to zero, creating sparse models.' },
        { text: 'In K-Nearest Neighbors (KNN) classification, how is a new sample point classified?', options: ['By taking the majority vote among the K closest training instances based on a distance metric (e.g. Euclidean distance)', 'By building a decision tree', 'By calculating neural weights', 'By random coin toss'], correctAnswers: ['By taking the majority vote among the K closest training instances based on a distance metric (e.g. Euclidean distance)'], explanation: 'KNN is an instance-based lazy learner that classifies query points based on the majority label of its K nearest neighbors.' },
        { text: 'What evaluation metric calculates the Area Under the Receiver Operating Characteristic curve (ROC-AUC)?', options: ['Measures the classifier\'s ability to discriminate between positive and negative classes across all possible classification thresholds', 'Measures training time in seconds', 'Calculates hard drive file size', 'Counts lines of Python code'], correctAnswers: ['Measures the classifier\'s ability to discriminate between positive and negative classes across all possible classification thresholds'], explanation: 'ROC-AUC plots True Positive Rate vs False Positive Rate across all thresholds; 1.0 represents perfect discrimination.' }
      ]
    });

    // AI Unit 3
    const aiQuiz3 = await createQuizWithQuestions({
      quizData: {
        title: 'AI Unit 3: Neural Networks, Backpropagation & Deep Learning',
        description: 'System Curriculum Quiz for Unit 3. Covers Multi-Layer Perceptrons (MLPs), Backpropagation Calculus, Activation Functions (ReLU, Sigmoid, Softmax), and Optimization (SGD, Adam).',
        category: catAI._id,
        subject: subAI._id,
        unitName: 'Unit 3: Neural Networks & Deep Learning',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'In training artificial neural networks, what is the primary role of the Backpropagation algorithm?', options: ['Computes the gradient of the loss function with respect to each network weight using the multivariate Chain Rule of calculus', 'Multiplies image pixel resolutions by two', 'Compresses trained model files into ZIP archives', 'Converts Python scripts into machine assembly code'], correctAnswers: ['Computes the gradient of the loss function with respect to each network weight using the multivariate Chain Rule of calculus'], explanation: 'Backpropagation applies the chain rule backwards from the output layer to compute partial derivatives of the loss with respect to all weights.' },
        { text: 'Why is the Rectified Linear Unit (ReLU: f(x) = max(0, x)) widely preferred over Sigmoid in deep hidden layers?', options: ['Avoids the vanishing gradient problem for positive inputs (derivative is constant 1) and enables faster computational convergence', 'ReLU compresses output between 0 and 1', 'ReLU eliminates the need for training data', 'ReLU only works on quantum computers'], correctAnswers: ['Avoids the vanishing gradient problem for positive inputs (derivative is constant 1) and enables faster computational convergence'], explanation: 'ReLU does not saturate for positive activations, mitigating vanishing gradients and computing fast without exponentials.' },
        { text: 'What is the purpose of the Softmax activation function in multi-class classification output layers?', options: ['Converts a vector of raw un-normalized real-valued logits into a normalized probability distribution that sums to 1', 'Clamps all negative values strictly to zero', 'Computes the square root of all weights', 'Deletes duplicate training records'], correctAnswers: ['Converts a vector of raw un-normalized real-valued logits into a normalized probability distribution that sums to 1'], explanation: 'Softmax exponentiates logits and normalizes them so outputs represent valid categorical probabilities summing to 1.' },
        { text: 'What is the Adam (Adaptive Moment Estimation) optimizer in deep learning?', options: ['An adaptive learning rate optimization algorithm that maintains exponentially decaying running averages of past gradients (momentum) and squared gradients (RMSProp)', 'A hardware graphics card', 'A neural network architecture for audio', 'A database query language'], correctAnswers: ['An adaptive learning rate optimization algorithm that maintains exponentially decaying running averages of past gradients (momentum) and squared gradients (RMSProp)'], explanation: 'Kingma & Ba\'s Adam combines first-moment momentum with second-moment adaptive scaling to achieve robust gradient updates.' },
        { text: 'What deep neural network regularization technique randomly sets a fraction p of hidden neuron activations to zero during training forward passes?', options: ['Dropout Regularization', 'Batch Normalization', 'Early Stopping', 'Weight Pruning'], correctAnswers: ['Dropout Regularization'], explanation: 'Dropout breaks complex co-adaptations between neurons by randomly dropping units during training.' },
        { text: 'What is the "Dying ReLU" problem in neural network training?', options: ['When a neuron\'s inputs fall into the negative region (x <= 0), resulting in zero gradient (f\'(x) = 0), permanently deactivating weight updates for that neuron', 'When the computer battery dies', 'When training loss becomes infinite', 'When model weights are deleted from disk'], correctAnswers: ['When a neuron\'s inputs fall into the negative region (x <= 0), resulting in zero gradient (f\'(x) = 0), permanently deactivating weight updates for that neuron'], explanation: 'If a ReLU neuron outputs 0 for all training data, its gradient is 0 and it can never recover (mitigated by Leaky ReLU).' },
        { text: 'What is the purpose of Batch Normalization in deep neural architectures?', options: ['Normalizes layer inputs across mini-batches to have zero mean and unit variance, stabilizing training and allowing higher learning rates', 'Compresses training images into ZIP files', 'Encrypts network weights for security', 'Splits datasets into train/test sets'], correctAnswers: ['Normalizes layer inputs across mini-batches to have zero mean and unit variance, stabilizing training and allowing higher learning rates'], explanation: 'Ioffe & Szegedy introduced Batch Normalization to reduce internal covariate shift and accelerate convergence.' },
        { text: 'What loss function is standard for training neural networks on multi-class classification tasks with Softmax outputs?', options: ['Categorical Cross-Entropy Loss', 'Mean Squared Error (MSE)', 'Mean Absolute Error (MAE)', 'Hinge Loss'], correctAnswers: ['Categorical Cross-Entropy Loss'], explanation: 'Categorical Cross-Entropy measures the divergence between true one-hot probability distributions and predicted Softmax probabilities.' },
        { text: 'What is an "Epoch" in machine learning model training?', options: ['One complete forward and backward pass of the entire training dataset through the neural network', 'A single training batch of 32 images', 'The time it takes to compile code', 'A single weight update step'], correctAnswers: ['One complete forward and backward pass of the entire training dataset through the neural network'], explanation: 'An epoch represents one full iteration through all training samples in the dataset.' },
        { text: 'What phenomenon occurs when neural network weights grow excessively large during training, leading to numerical overflow (NaN)?', options: ['Exploding Gradient Problem', 'Vanishing Gradient Problem', 'Underfitting', 'Quantization Error'], correctAnswers: ['Exploding Gradient Problem'], explanation: 'Exploding gradients cause massive parameter updates and numerical instability, mitigated by Gradient Clipping.' }
      ]
    });

    // AI Unit 4
    const aiQuiz4 = await createQuizWithQuestions({
      quizData: {
        title: 'AI Unit 4: Computer Vision, Transformers & Natural Language Processing',
        description: 'System Curriculum Quiz for Unit 4. Covers CNNs (Convolution, Pooling), Recurrent Networks (LSTM/GRU), Transformer Self-Attention, and Tokenization.',
        category: catAI._id,
        subject: subAI._id,
        unitName: 'Unit 4: CNNs, Transformers & NLP',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: admin._id,
        creatorModel: 'Admin',
        isPublished: true
      },
      questionsData: [
        { text: 'What is the Self-Attention mechanism in the Transformer architecture mathematically designed to calculate?', options: ['Dynamic relationship weights between every token in a sequence and all other tokens: Attention(Q,K,V) = softmax(QKᵀ / √dₖ) V', 'The physical clock speed of the graphics processing unit (GPU)', 'The number of characters in a text file', 'A fixed linear regression line with zero intercept'], correctAnswers: ['Dynamic relationship weights between every token in a sequence and all other tokens: Attention(Q,K,V) = softmax(QKᵀ / √dₖ) V'], explanation: 'Vaswani et al. introduced Scaled Dot-Product Attention to compute contextual relationships across all tokens in parallel.' },
        { text: 'What deep learning layer in Convolutional Neural Networks (CNNs) applies learnable sliding filters to extract local spatial features (edges, textures)?', options: ['Convolutional Layer', 'Max-Pooling Layer', 'Dense Fully-Connected Layer', 'Softmax Layer'], correctAnswers: ['Convolutional Layer'], explanation: 'Convolutional layers perform cross-correlation with learnable kernel filters, preserving 2D spatial image hierarchies.' },
        { text: 'In Long Short-Term Memory (LSTM) networks, which gate controls what proportion of previous memory cell state to discard?', options: ['Forget Gate (f_t = σ(W_f · [h_{t-1}, x_t] + b_f))', 'Input Gate', 'Output Gate', 'Update Gate'], correctAnswers: ['Forget Gate (f_t = σ(W_f · [h_{t-1}, x_t] + b_f))'], explanation: 'The Forget Gate applies a sigmoid layer to decide what historical information to discard from the cell state.' },
        { text: 'What is the primary advantage of the Transformer architecture over traditional Recurrent Neural Networks (RNNs)?', options: ['Transformers process entire input sequences in parallel using self-attention without sequential recurrence, enabling massive GPU training scalability', 'Transformers do not require any training data', 'Transformers run only on CPU chips', 'Transformers cannot process text'], correctAnswers: ['Transformers process entire input sequences in parallel using self-attention without sequential recurrence, enabling massive GPU training scalability'], explanation: 'Eliminating sequential recurrent bottlenecks allows Transformers to parallelize computation across entire contexts efficiently.' },
        { text: 'Why is Positional Encoding added to token embeddings in Transformer models?', options: ['Because self-attention operations are permutation-invariant and do not inherently encode word order sequence information', 'To encrypt token embeddings for security', 'To reduce model parameter count', 'To format text into uppercase'], correctAnswers: ['Because self-attention operations are permutation-invariant and do not inherently encode word order sequence information'], explanation: 'Self-attention treats tokens as an unordered set; sinusoidal or learned positional encodings inject token sequence ordering.' },
        { text: 'What is Byte-Pair Encoding (BPE) in modern NLP language models (e.g. GPT, LLaMA)?', options: ['A subword tokenization algorithm that iteratively merges the most frequent pairs of bytes/characters into vocabulary tokens', 'An audio compression format', 'A database index strategy', 'A network firewall protocol'], correctAnswers: ['A subword tokenization algorithm that iteratively merges the most frequent pairs of bytes/characters into vocabulary tokens'], explanation: 'BPE handles out-of-vocabulary words by decomposing unknown text into frequent subword units and byte tokens.' },
        { text: 'What is the purpose of Max-Pooling in Convolutional Neural Networks (CNNs)?', options: ['Reduces spatial dimensions (height and width) of feature maps, providing translational invariance and reducing computational parameters', 'Increases image resolution', 'Inverts pixel colors', 'Deletes dark images'], correctAnswers: ['Reduces spatial dimensions (height and width) of feature maps, providing translational invariance and reducing computational parameters'], explanation: 'Max-pooling extracts the maximum value within sliding windows, down-sampling feature maps while preserving dominant features.' },
        { text: 'What is "Transfer Learning" in deep learning applications?', options: ['Taking a deep model pre-trained on a massive dataset (e.g. ImageNet or Common Crawl) and fine-tuning it on a specific downstream task with limited labeled data', 'Copying files over a USB cable', 'Transferring money between bank accounts', 'Moving servers between data centers'], correctAnswers: ['Taking a deep model pre-trained on a massive dataset (e.g. ImageNet or Common Crawl) and fine-tuning it on a specific downstream task with limited labeled data'], explanation: 'Transfer learning leverages learned representations from large foundation models, achieving high accuracy on smaller downstream datasets.' },
        { text: 'What is Multi-Head Attention in Transformer architectures?', options: ['Projecting Queries, Keys, and Values multiple times with distinct learned linear projections, allowing the model to jointly attend to information from different representation subspaces', 'Using multiple monitors while coding', 'Connecting multiple GPUs with SLI cables', 'Using multiple keyboards'], correctAnswers: ['Projecting Queries, Keys, and Values multiple times with distinct learned linear projections, allowing the model to jointly attend to information from different representation subspaces'], explanation: 'Multi-Head Attention expands model capacity by attending to varied contextual subspaces (syntactic, semantic) simultaneously.' },
        { text: 'What is the BLEU (Bilingual Evaluation Understudy) metric used for in NLP?', options: ['Evaluating the quality of machine-translated text by computing n-gram precision overlap against human reference translations', 'Measuring GPU power consumption', 'Checking spelling in Python files', 'Counting words in an essay'], correctAnswers: ['Evaluating the quality of machine-translated text by computing n-gram precision overlap against human reference translations'], explanation: 'Papineni et al. designed BLEU to score machine translation accuracy by evaluating modified n-gram precision against human references.' }
      ]
    });

    console.log('✅ Subject 6 (Artificial Intelligence & Data Science) - 4 Unit Quizzes Seeded');

    // ─── 8. GENERATE AUTHENTIC STUDENT RESULTS & CERTIFICATES ────────────────
    const resAarav1 = await Result.create({
      studentId: studentAarav._id,
      quizId: seQuiz1._id,
      score: 9,
      totalQuestions: 10,
      percentage: 90,
      passed: true,
      timeTaken: 620,
      integrityScore: 100,
      wasDisqualified: false,
      tabChangeCount: 0,
      status: 'COMPLETED',
      answers: []
    });

    await Certificate.create({
      certificateId: 'CERT-SE302-2026-0089',
      studentId: studentAarav._id,
      quizId: seQuiz1._id,
      resultId: resAarav1._id,
      issueDate: new Date(),
      percentage: 90
    });

    const resDiya1 = await Result.create({
      studentId: studentDiya._id,
      quizId: iotQuiz1._id,
      score: 10,
      totalQuestions: 10,
      percentage: 100,
      passed: true,
      timeTaken: 540,
      integrityScore: 98,
      wasDisqualified: false,
      tabChangeCount: 0,
      status: 'COMPLETED',
      answers: []
    });

    await Certificate.create({
      certificateId: 'CERT-IOT401-2026-0042',
      studentId: studentDiya._id,
      quizId: iotQuiz1._id,
      resultId: resDiya1._id,
      issueDate: new Date(),
      percentage: 100
    });

    const resRohan1 = await Result.create({
      studentId: studentRohan._id,
      quizId: aiQuiz1._id,
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      passed: true,
      timeTaken: 710,
      integrityScore: 95,
      wasDisqualified: false,
      tabChangeCount: 1,
      status: 'COMPLETED',
      answers: []
    });

    await Certificate.create({
      certificateId: 'CERT-AI404-2026-0017',
      studentId: studentRohan._id,
      quizId: aiQuiz1._id,
      resultId: resRohan1._id,
      issueDate: new Date(),
      percentage: 80
    });

    console.log('🏆 3 Verified Student Exam Results & Digital Certificates Created');

    // ─── 9. NOTIFICATIONS & INQUIRIES ────────────────────────────────────────
    await Notification.create({
      recipientId: studentAarav._id,
      recipientModel: 'Student',
      senderId: admin._id,
      senderModel: 'Admin',
      title: 'Examination Grade Published 📜',
      message: 'Your official graded evaluation for "SE Unit 1: SDLC Models & Agile Scrum" is now certified with a 90% Distinction score.',
      isRead: false,
      type: 'certificate_ready'
    });

    await Message.create({
      name: 'Aditya Kulkarni',
      email: 'aditya.k@external.edu',
      subject: 'Inquiry regarding ABET Curriculum Alignment',
      message: 'Greetings, I would like to verify if the examination proctoring logs comply with ABET engineering accreditation audits.',
      isResolved: false
    });

    console.log('\n========================================================================');
    console.log('🎉 100% ORIGINAL ACADEMIC DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('   • 4 Academic Engineering Disciplines');
    console.log('   • 6 Core University Subjects');
    console.log('   • 24 Official Unit-Wise Curriculum Quizzes (4 Units / Subject)');
    console.log('   • 240 Peer-Reviewed, Rigorous Academic Questions');
    console.log('   • 4 University Faculty Profiles');
    console.log('   • 5 Verified University Student Profiles');
    console.log('   • Proctored Exam Results & Digital Award Certificates');
    console.log('========================================================================\n');

    return { success: true, count: 240 };
  } catch (error) {
    console.error('❌ Error during 100% Original Seeding:', error);
    throw error;
  }
};

// If run directly from CLI (e.g. node seedOriginalDatabase.js)
if (require.main === module) {
  seedOriginalDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedOriginalDatabase;
