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
      specialization: 'Computer Science & Distributed Systems (PhD, IIT Bombay)',
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
      specialization: 'Service-Oriented Architecture & Cloud Security',
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
      name: 'Software Engineering & System Design',
      slug: 'software-engineering-system-design',
      category: catCSE._id,
      description: 'SDLC models, Agile Scrum workflows, IEEE-830 SRS specifications, SOLID design principles, GoF design patterns, unit testing frameworks, and CI/CD pipelines.'
    });

    const subIoT = await Subject.create({
      name: 'Internet of Things & Embedded Systems',
      slug: 'internet-of-things-embedded-systems',
      category: catIoT._id,
      description: 'Microcontroller hardware architecture (ATmega328P, ESP32), sensor calibration, 6LoWPAN/Zigbee wireless communication, MQTT/CoAP protocols, and cloud IoT hubs.'
    });

    const subWS = await Subject.create({
      name: 'Web Services & Service-Oriented Architecture',
      slug: 'web-services-service-oriented-architecture',
      category: catIT._id,
      description: 'SOA Triad architecture, SOAP XML message processing, RESTful architectural style, WSDL contracts, UDDI registries, WS-Security standards, and BPEL orchestration.'
    });

    const subDSA = await Subject.create({
      name: 'Data Structures & Advanced Algorithms',
      slug: 'data-structures-advanced-algorithms',
      category: catCSE._id,
      description: 'Asymptotic Big-O complexity, self-balancing search trees (AVL/Red-Black), graph traversal, shortest path algorithms (Dijkstra, Bellman-Ford), and dynamic programming.'
    });

    const subDBMS = await Subject.create({
      name: 'Database Management Systems & SQL',
      slug: 'database-management-systems-sql',
      category: catIT._id,
      description: 'Relational algebra, SQL query optimization, 1NF to BCNF normalization, ACID transaction guarantees, multi-version concurrency control (MVCC), and NoSQL document architectures.'
    });

    const subAI = await Subject.create({
      name: 'Artificial Intelligence & Machine Learning',
      slug: 'artificial-intelligence-machine-learning',
      category: catAI._id,
      description: 'Supervised and unsupervised learning, cost function minimization via gradient descent, CNNs, self-attention Transformer mechanisms, and bias-variance tradeoff analysis.'
    });

    const subCN = await Subject.create({
      name: 'Computer Networks & Network Security',
      slug: 'computer-networks-network-security',
      category: catCSE._id,
      description: 'OSI and TCP/IP protocol stacks, TCP 3-way handshake and congestion control, DNS architecture, asymmetric public-key cryptography (RSA), TLS 1.3 handshakes, and web vulnerability mitigations.'
    });

    const subOS = await Subject.create({
      name: 'Operating Systems & Kernel Architecture',
      slug: 'operating-systems-kernel-architecture',
      category: catCSE._id,
      description: 'Process life-cycles, CPU scheduling algorithms (CFS, Round Robin), synchronization primitives (Mutex, Semaphores), Banker algorithm for deadlock avoidance, and virtual memory paging/TLB.'
    });

    console.log('📚 8 College Engineering Subjects Created');

    // ─── 7. QUIZZES & 100% ORIGINAL QUESTIONS ────────────────────────────────

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
    // 1. SOFTWARE ENGINEERING & SYSTEM DESIGN (SE-302)
    // =========================================================================
    const seQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'SE Unit 1: SDLC Models & Agile Scrum Methodologies',
        description: 'University level assessment covering Waterfall, Spiral, V-Model, Agile Manifesto principles, Scrum sprint ceremonies, and User Story estimation.',
        category: catCSE._id,
        subject: subSE._id,
        unitName: 'Unit 1: SDLC Models & Agile Scrum',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: teacherGohil._id,
        creatorModel: 'Teacher',
        isPublished: true
      },
      questionsData: [
        {
          text: 'Which software development lifecycle model introduces risk assessment and mitigation at the beginning of every developmental phase loop?',
          options: ['The Spiral Model (Boehm)', 'The Classical Waterfall Model', 'The Big Bang Model', 'The Linear Sequential Model'],
          correctAnswers: ['The Spiral Model (Boehm)'],
          explanation: 'Barry Boehm\'s Spiral Model explicitly incorporates structured risk analysis and management into each cyclical iteration before committing to further phases.'
        },
        {
          text: 'In the Agile Scrum framework, what is the primary objective of the Daily Standup (Daily Scrum) ceremony?',
          options: [
            'A 15-minute time-boxed synchronization for the team to inspect progress toward the Sprint Goal and plan the next 24 hours of work',
            'A formal performance review meeting conducted by upper management to grade individual developer output',
            'A 2-hour technical code review session where every pull request is reviewed line-by-line',
            'A client budget renegotiation meeting held every morning'
          ],
          correctAnswers: ['A 15-minute time-boxed synchronization for the team to inspect progress toward the Sprint Goal and plan the next 24 hours of work'],
          explanation: 'The Daily Scrum is a 15-minute time-boxed event for the Scrum Team to synchronize activities and create a plan for the next 24 hours.'
        },
        {
          text: 'According to IEEE-830 standards, what constitutes a Non-Functional Requirement (NFR)?',
          options: [
            'System constraints specifying performance criteria, security levels, availability, and throughput benchmarks',
            'Specific business logic actions that calculate user invoice discounts',
            'A bug report filed after software release',
            'The physical salary rate negotiated with software engineering contractors'
          ],
          correctAnswers: ['System constraints specifying performance criteria, security levels, availability, and throughput benchmarks'],
          explanation: 'Non-Functional Requirements define system quality attributes and constraints (e.g., latency < 200ms, 99.99% uptime, encryption standards) rather than specific behavioral features.'
        },
        {
          text: 'In the V-Model of software engineering, which verification activity corresponds directly to Acceptance Testing?',
          options: ['Requirements Analysis & Specification', 'System Architectural Design', 'Module Low-Level Detailed Design', 'Source Code Compilation'],
          correctAnswers: ['Requirements Analysis & Specification'],
          explanation: 'In the V-Model, User Acceptance Testing (UAT) verifies whether the final deliverable satisfies the original business and requirements specifications.'
        },
        {
          text: 'Which Agile artifact represents the single source of truth for all proposed features, enhancements, and bug fixes awaiting prioritization?',
          options: ['Product Backlog', 'Sprint Burndown Chart', 'Team Velocity Graph', 'Daily Impediment Log'],
          correctAnswers: ['Product Backlog'],
          explanation: 'The Product Backlog is an ordered, evolving list of everything that is known to be needed in the product, managed directly by the Product Owner.'
        },
        {
          text: 'What does the Definition of Done (DoD) signify in modern Agile engineering teams?',
          options: [
            'A shared, formal checklist of quality standards (e.g. unit tests passed, code reviewed, documentation updated) that a product increment must meet before release',
            'The date when the client pays the final contractual invoice',
            'The moment when a developer finishes writing raw code before testing begins',
            'When the software engineering manager signs off on retirement benefits'
          ],
          correctAnswers: ['A shared, formal checklist of quality standards (e.g. unit tests passed, code reviewed, documentation updated) that a product increment must meet before release'],
          explanation: 'The Definition of Done is a formal commitment creating transparency that ensures an Increment meets required quality standards for production suitability.'
        },
        {
          text: 'Which estimation technique uses a consensus-based, gamified approach using Fibonacci numbers to calculate relative story points?',
          options: ['Planning Poker', 'COCOMO II Algorithmic Cost Estimation', 'Function Point Analysis (FPA)', 'Delphi Top-Down Budgeting'],
          correctAnswers: ['Planning Poker'],
          explanation: 'Planning Poker is a gamified technique where team members play numbered cards (typically Fibonacci-based) to collaboratively estimate user story complexity.'
        },
        {
          text: 'What is the fundamental difference between Verification and Validation in software engineering?',
          options: [
            'Verification evaluates whether the product is being built according to specifications ("Are we building the product right?"), while Validation evaluates if it meets customer needs ("Are we building the right product?")',
            'Verification is done exclusively by clients, whereas Validation is executed by the compiler',
            'Verification only checks hardware voltage, whereas Validation tests network cables',
            'There is no technical distinction between the two terms'
          ],
          correctAnswers: ['Verification evaluates whether the product is being built according to specifications ("Are we building the product right?"), while Validation evaluates if it meets customer needs ("Are we building the right product?")'],
          explanation: 'Verification confirms conformance to design specs (processes, static analysis, reviews); Validation ensures the software meets real-world user needs and requirements.'
        },
        {
          text: 'In Scrum, who is exclusively responsible for maximizing the value of the product and managing the Product Backlog?',
          options: ['The Product Owner', 'The Scrum Master', 'The Lead Quality Assurance Engineer', 'The Database Administrator'],
          correctAnswers: ['The Product Owner'],
          explanation: 'The Product Owner is the sole person responsible for managing the Product Backlog and optimizing product value.'
        },
        {
          text: 'Which metric measures the rate at which an Agile development team completes backlog items per sprint iteration?',
          options: ['Team Velocity (Story Points per Sprint)', 'Cyclomatic Complexity Index', 'Lines of Code (LOC) per Hour', 'Database CPU Utilization Rate'],
          correctAnswers: ['Team Velocity (Story Points per Sprint)'],
          explanation: 'Velocity calculates the average number of story points completed by a Scrum team during a standard sprint iteration.'
        }
      ]
    });

    const seQuiz2 = await createQuizWithQuestions({
      quizData: {
        title: 'SE Unit 2: SOLID Principles & Design Patterns',
        description: 'Advanced assessment on Object-Oriented SOLID architecture, Creational, Structural, and Behavioral Gang of Four (GoF) design patterns.',
        category: catCSE._id,
        subject: subSE._id,
        unitName: 'Unit 2: SOLID Principles & Design Patterns',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: teacherGohil._id,
        creatorModel: 'Teacher',
        isPublished: true
      },
      questionsData: [
        {
          text: 'What does the Open/Closed Principle (OCP) in SOLID design dictate?',
          options: [
            'Software entities (classes, modules, functions) should be open for extension, but closed for modification',
            'Source code files must be locked with read-only permissions after initial commit',
            'Classes must open a network socket upon instantiation and close it immediately upon garbage collection',
            'All member variables must be declared public and methods declared private'
          ],
          correctAnswers: ['Software entities (classes, modules, functions) should be open for extension, but closed for modification'],
          explanation: 'Bertrand Meyer\'s Open/Closed Principle states that software entities should allow behavior extension (e.g. via polymorphism or inheritance) without altering existing source code.'
        },
        {
          text: 'Which Gang of Four (GoF) Creational Design Pattern guarantees that a class has only one instance and provides a global point of access to it?',
          options: ['Singleton Pattern', 'Factory Method Pattern', 'Prototype Pattern', 'Builder Pattern'],
          correctAnswers: ['Singleton Pattern'],
          explanation: 'The Singleton pattern restricts instantiation of a class to one single instance, controlling shared resource access (e.g. database connection pools or loggers).'
        },
        {
          text: 'Which SOLID principle states that client software should not be forced to depend upon interfaces that they do not use?',
          options: ['Interface Segregation Principle (ISP)', 'Single Responsibility Principle (SRP)', 'Liskov Substitution Principle (LSP)', 'Dependency Inversion Principle (DIP)'],
          correctAnswers: ['Interface Segregation Principle (ISP)'],
          explanation: 'ISP advocates for fine-grained, role-specific interfaces rather than large, monolithic interfaces that force implementers to write dummy methods.'
        },
        {
          text: 'Which Behavioral Design Pattern defines a one-to-many dependency between objects such that when one object changes state, all its dependents are notified automatically?',
          options: ['Observer Pattern', 'Strategy Pattern', 'State Pattern', 'Command Pattern'],
          correctAnswers: ['Observer Pattern'],
          explanation: 'The Observer Pattern establishes a publish-subscribe mechanism where a subject automatically broadcasts state updates to registered observer objects.'
        },
        {
          text: 'What violation of the Liskov Substitution Principle (LSP) occurs in the classic Rectangle-Square geometric inheritance hierarchy?',
          options: [
            'Overriding setWidth() in Square alters height unexpectedly, breaking behavioral contracts expected by consumers of the base Rectangle class',
            'Square requires more memory bytes than Rectangle',
            'Rectangle cannot be rendered on a 2D graphical display',
            'Square cannot inherit methods from any abstract class'
          ],
          correctAnswers: ['Overriding setWidth() in Square alters height unexpectedly, breaking behavioral contracts expected by consumers of the base Rectangle class'],
          explanation: 'LSP requires that subtypes must be substitutable for their base types without altering program correctness. Square mutates both width/height together, violating Rectangle assumptions.'
        },
        {
          text: 'Which Structural Design Pattern allows incompatible interfaces to work together by wrapping an existing class with a compatible adapter interface?',
          options: ['Adapter Pattern', 'Decorator Pattern', 'Facade Pattern', 'Composite Pattern'],
          correctAnswers: ['Adapter Pattern'],
          explanation: 'The Adapter Pattern converts the interface of a legacy or third-party class into another interface that clients expect, bridging incompatibility.'
        },
        {
          text: 'According to the Dependency Inversion Principle (DIP), high-level modules should depend on what?',
          options: ['Abstractions (Interfaces or Abstract Classes)', 'Concrete low-level hardware implementations', 'Global static singleton variables', 'Raw operating system system-call pointers'],
          correctAnswers: ['Abstractions (Interfaces or Abstract Classes)'],
          explanation: 'DIP states that high-level modules should not depend on low-level modules; both should depend on abstractions. Furthermore, abstractions should not depend on details.'
        },
        {
          text: 'Which design pattern is best suited for constructing complex composite objects step-by-step with differing representations using the same construction process?',
          options: ['Builder Pattern', 'Flyweight Pattern', 'Memento Pattern', 'Chain of Responsibility Pattern'],
          correctAnswers: ['Builder Pattern'],
          explanation: 'The Builder Pattern separates the construction of a complex object from its representation, enabling fluent construction of complex domain models.'
        },
        {
          text: 'Which Behavioral Pattern encapsulates an algorithm inside a family of interchangeable classes, enabling the client to select the execution strategy at runtime?',
          options: ['Strategy Pattern', 'Template Method Pattern', 'Visitor Pattern', 'Mediator Pattern'],
          correctAnswers: ['Strategy Pattern'],
          explanation: 'The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime depending on execution context.'
        },
        {
          text: 'What is the primary benefit of applying the Facade Structural Design Pattern in complex multi-subsystem architectures?',
          options: [
            'Provides a simplified, unified high-level interface that masks subsystem complexity from external clients',
            'Compresses binary files before transmitting them over network sockets',
            'Executes automated unit test assertions in background threads',
            'Prevents any subclassing across the entire application codebase'
          ],
          correctAnswers: ['Provides a simplified, unified high-level interface that masks subsystem complexity from external clients'],
          explanation: 'The Facade pattern provides a simplified interface to a library, framework, or complex set of classes, reducing coupling between clients and subsystem internals.'
        }
      ]
    });

    // =========================================================================
    // 2. INTERNET OF THINGS & EMBEDDED SYSTEMS (IoT-401)
    // =========================================================================
    const iotQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'IoT Unit 1: Architecture, Physical Design & Protocols',
        description: 'University level assessment covering IoT Reference Architecture, 6LoWPAN, MQTT vs CoAP, Edge Gateways, and WSN topologies.',
        category: catIoT._id,
        subject: subIoT._id,
        unitName: 'Unit 1: IoT Architecture & Protocols',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: teacherPatel._id,
        creatorModel: 'Teacher',
        isPublished: true
      },
      questionsData: [
        {
          text: 'What is the primary purpose of the 6LoWPAN protocol in Wireless Sensor Networks?',
          options: [
            'Enables IPv6 packet transmission over low-power IEEE 802.15.4 wireless networks through header compression and fragmentation',
            'Replaces 5G cellular communication entirely for long-range autonomous vehicles',
            'Encrypts raw video streams for HDMI monitor cables',
            'Controls high-voltage AC electric motors in industrial factories'
          ],
          correctAnswers: ['Enables IPv6 packet transmission over low-power IEEE 802.15.4 wireless networks through header compression and fragmentation'],
          explanation: '6LoWPAN (IPv6 over Low-Power Wireless Personal Area Networks) specifies header compression, encapsulation, and fragmentation to transport 1280-byte IPv6 MTUs over 127-byte 802.15.4 frames.'
        },
        {
          text: 'In the MQTT (Message Queuing Telemetry Transport) protocol, which entity is responsible for receiving messages from publishers and distributing them to subscribers?',
          options: ['MQTT Broker', 'Edge Sensor Node', 'Database Compiler', 'TCP Gateway Router'],
          correctAnswers: ['MQTT Broker'],
          explanation: 'The MQTT Broker is the central server that manages topics, filters incoming publish requests, and dispatches messages to subscribed client nodes.'
        },
        {
          text: 'How does CoAP (Constrained Application Protocol) differ fundamentally from HTTP in transport architecture?',
          options: [
            'CoAP runs over lightweight UDP with asynchronous transaction messaging, whereas HTTP relies on connection-oriented TCP streams',
            'CoAP requires 100Mbps dedicated fiber-optic internet connection',
            'HTTP cannot transmit text or JSON documents',
            'CoAP is exclusively designed for desktop mainframe computers'
          ],
          correctAnswers: ['CoAP runs over lightweight UDP with asynchronous transaction messaging, whereas HTTP relies on connection-oriented TCP streams'],
          explanation: 'RFC 7252 defines CoAP as a specialized web transfer protocol operating over UDP to minimize transmission overhead and support multicast in constrained nodes.'
        },
        {
          text: 'In IoT Edge Computing, what is the key technical advantage of performing local data filtering at the Edge Gateway layer?',
          options: [
            'Reduces network bandwidth consumption and latency by processing telemetry data near sensor sources before forwarding summaries to the Cloud',
            'Eliminates the physical need for electrical power supplies on sensor nodes',
            'Prevents any computer virus from ever existing on the internet',
            'Increases the physical weight of microcontroller boards'
          ],
          correctAnswers: ['Reduces network bandwidth consumption and latency by processing telemetry data near sensor sources before forwarding summaries to the Cloud'],
          explanation: 'Edge gateways aggregate, filter, and run local analytics on high-frequency telemetry, preventing raw noise from saturating wide-area cloud connections.'
        },
        {
          text: 'Which MQTT Quality of Service (QoS) level guarantees that a message is delivered exactly once using a four-step handshake (PUBLISH, PUBREC, PUBREL, PUBCOMP)?',
          options: ['QoS Level 2 (Exactly Once)', 'QoS Level 0 (At Most Once)', 'QoS Level 1 (At Least Once)', 'QoS Level 3 (Infinite Redundancy)'],
          correctAnswers: ['QoS Level 2 (Exactly Once)'],
          explanation: 'MQTT QoS 2 is the highest service level, using a 4-step dual-handshake to guarantee zero message loss and zero duplicates.'
        },
        {
          text: 'What wireless technology operates in the sub-GHz unlicensed ISM bands and is optimized for long-range, low-power telemetry transmission over several kilometers?',
          options: ['LoRa / LoRaWAN', 'Bluetooth Classic (BR/EDR)', 'Ultra-Wideband (UWB)', 'Standard Wi-Fi 6 (802.11ax)'],
          correctAnswers: ['LoRa / LoRaWAN'],
          explanation: 'LoRa (Long Range) uses chirp spread spectrum modulation to transmit small packets across 5–15 km with ultra-low power consumption.'
        },
        {
          text: 'In IoT communication models, which pattern involves nodes pushing data directly to a persistent WebSocket channel for bi-directional full-duplex communication?',
          options: ['Exclusive-Pair Communication Model', 'Request-Response Polling Model', 'Push-Pull Message Queue Model', 'Publisher-Subscriber Model'],
          correctAnswers: ['Exclusive-Pair Communication Model'],
          explanation: 'The Exclusive-Pair model sets up a stateful, bi-directional, full-duplex connection between client and server over a single transport connection.'
        },
        {
          text: 'What role does an Actuator perform in a cyber-physical IoT system?',
          options: [
            'Converts electronic control signals into physical actions or mechanical movements (e.g. opening a valve, rotating a servo motor, triggering a relay)',
            'Measures physical ambient temperature and outputs an analog voltage',
            'Stores compiled firmware code in read-only flash memory',
            'Acts as the wireless base-station router'
          ],
          correctAnswers: ['Converts electronic control signals into physical actions or mechanical movements (e.g. opening a valve, rotating a servo motor, triggering a relay)'],
          explanation: 'While sensors measure environmental conditions and convert them into electrical signals, actuators receive electrical signals and perform physical actions.'
        },
        {
          text: 'Which IEEE standard defines the Physical (PHY) and Media Access Control (MAC) layers for Low-Rate Wireless Personal Area Networks (LR-WPANs)?',
          options: ['IEEE 802.15.4', 'IEEE 802.11ac', 'IEEE 802.3u', 'IEEE 802.1Q'],
          correctAnswers: ['IEEE 802.15.4'],
          explanation: 'IEEE 802.15.4 is the fundamental physical and MAC layer standard underlying Zigbee, 6LoWPAN, and Thread wireless systems.'
        },
        {
          text: 'What is a significant security vulnerability specific to resource-constrained IoT endpoints?',
          options: [
            'Inability to execute heavy asymmetric cryptographic calculations (e.g. RSA-4096) due to limited CPU cycles and battery constraints',
            'Inability to display colorful user interface graphics',
            'Excessive memory buffers causing instant hard-drive crashes',
            'Automatic deletion of network router passwords'
          ],
          correctAnswers: ['Inability to execute heavy asymmetric cryptographic calculations (e.g. RSA-4096) due to limited CPU cycles and battery constraints'],
          explanation: 'Constrained microcontrollers have limited ALU capability and power, making heavy public-key cryptography difficult without dedicated hardware accelerators (e.g. ECC crypto chips).'
        }
      ]
    });

    // =========================================================================
    // 3. WEB SERVICES & SERVICE-ORIENTED ARCHITECTURE (WS-403)
    // =========================================================================
    const wsQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'WS Unit 1: Service-Oriented Architecture & Core Protocols',
        description: 'Rigorous assessment covering SOA Triad, SOAP vs REST, WSDL 1.1/2.0 structure, UDDI data model, and WS-Security message-level encryption.',
        category: catIT._id,
        subject: subWS._id,
        unitName: 'Unit 1: SOA & Web Service Protocols',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: teacherDeshmukh._id,
        creatorModel: 'Teacher',
        isPublished: true
      },
      questionsData: [
        {
          text: 'What are the three fundamental operational roles in the standard Service-Oriented Architecture (SOA) triangle?',
          options: [
            'Service Provider, Service Requestor (Consumer), and Service Registry (Broker)',
            'Client Browser, Ethernet Cable, and Web Hosting Server',
            'Database Administrator, Software Developer, and Quality Assurance Tester',
            'Microcontroller, Sensor Node, and Actuator Relay'
          ],
          correctAnswers: ['Service Provider, Service Requestor (Consumer), and Service Registry (Broker)'],
          explanation: 'The classic SOA triangle consists of Service Provider (publishes services), Service Registry (indexes services for discovery), and Service Requestor (finds and binds services).'
        },
        {
          text: 'What is the primary architectural difference between SOAP and RESTful Web Services?',
          options: [
            'SOAP is a strict XML-based messaging protocol specification with rigid contracts, while REST is an architectural style utilizing standard HTTP methods and flexible representations (JSON/XML)',
            'SOAP can only run over physical copper telephone wires',
            'REST requires compiled C++ binary payloads for every request',
            'SOAP does not support encryption or security tokens'
          ],
          correctAnswers: ['SOAP is a strict XML-based messaging protocol specification with rigid contracts, while REST is an architectural style utilizing standard HTTP methods and flexible representations (JSON/XML)'],
          explanation: 'SOAP is a W3C-standard protocol with strict XML envelope contracts and WS-* extensibility; REST is an architectural style based on HTTP verbs (GET, POST, PUT, DELETE) and resource URIs.'
        },
        {
          text: 'In a WSDL (Web Services Description Language) 1.1 document, which element defines the abstract collection of operations and messages?',
          options: ['<portType> (or <interface> in WSDL 2.0)', '<binding>', '<service>', '<types>'],
          correctAnswers: ['<portType> (or <interface> in WSDL 2.0)'],
          explanation: 'In WSDL 1.1, the <portType> element defines abstract operations and input/output message exchanges; in WSDL 2.0, this was renamed to <interface>.'
        },
        {
          text: 'What is the main technical advantage of WS-Security (Message-Level Security) compared to transport security like HTTPS (TLS)?',
          options: [
            'WS-Security persists end-to-end encryption and digital signatures across intermediate multi-hop proxy routers, protecting specific XML elements independently',
            'HTTPS requires physical floppy disks to exchange certificates',
            'WS-Security makes network transmission 100 times faster than raw TCP',
            'HTTPS cannot be used on desktop computers'
          ],
          correctAnswers: ['WS-Security persists end-to-end encryption and digital signatures across intermediate multi-hop proxy routers, protecting specific XML elements independently'],
          explanation: 'TLS/HTTPS terminates at each intermediate proxy/gateway; WS-Security encapsulates digital signatures and encryption directly in the SOAP XML message, providing true end-to-end security.'
        },
        {
          text: 'Which core XML specification provides standards for digital signatures, ensuring message integrity and non-repudiation in web services?',
          options: ['W3C XML Signature (XMLDsig)', 'XML Schema Definition (XSD)', 'Extensible Stylesheet Language (XSLT)', 'Document Type Definition (DTD)'],
          correctAnswers: ['W3C XML Signature (XMLDsig)'],
          explanation: 'XML Signature specifies XML syntax for digital signatures, authenticating message origins and guaranteeing payload integrity.'
        },
        {
          text: 'In enterprise SOA, what language is universally used for executable Business Process Orchestration among distributed services?',
          options: ['WS-BPEL (Business Process Execution Language)', 'HTML5 Canvas API', 'SQL Data Definition Language', 'CSS Grid Layouts'],
          correctAnswers: ['WS-BPEL (Business Process Execution Language)'],
          explanation: 'WS-BPEL is an OASIS standard executable language for specifying business interactions and workflow orchestration between web services.'
        },
        {
          text: 'What is the role of UDDI (Universal Description, Discovery, and Integration) in web services?',
          options: [
            'An XML-based registry directory enabling businesses to publish and dynamically discover web services and technical specifications (tModels)',
            'A compiler tool that converts Python to Java bytecodes',
            'A database table index optimization algorithm',
            'A physical firewall hardware appliance'
          ],
          correctAnswers: ['An XML-based registry directory enabling businesses to publish and dynamically discover web services and technical specifications (tModels)'],
          explanation: 'UDDI acts as an enterprise directory (White, Yellow, and Green pages) allowing providers to register service descriptions and bindings.'
        },
        {
          text: 'In SOAP message processing, which element is mandatory inside the SOAP Envelope to report errors and diagnostic exceptions back to the client?',
          options: ['<soap:Fault>', '<soap:Header>', '<soap:Security>', '<soap:ExceptionLog>'],
          correctAnswers: ['<soap:Fault>'],
          explanation: 'The <soap:Fault> element resides inside the SOAP Body and carries detailed error codes (faultcode), diagnostic strings (faultstring), and application-specific error structures (detail).'
        },
        {
          text: 'What standard framework handles security token exchange and single sign-on (SSO) assertions across heterogeneous enterprise domains?',
          options: ['SAML (Security Assertion Markup Language)', 'SMTP', 'SNMP', 'FTP'],
          correctAnswers: ['SAML (Security Assertion Markup Language)'],
          explanation: 'SAML is an XML standard for exchanging authentication and authorization data between identity providers (IdP) and service providers (SP).'
        },
        {
          text: 'Which WS-* specification provides the coordination protocol framework for atomic transactions across distributed web services using Two-Phase Commit (2PC)?',
          options: ['WS-AtomicTransaction (WS-AT)', 'WS-ReliableMessaging', 'WS-Addressing', 'WS-Policy'],
          correctAnswers: ['WS-AtomicTransaction (WS-AT)'],
          explanation: 'WS-AtomicTransaction coordinates short-duration, distributed transactions across heterogeneous services, guaranteeing all-or-nothing ACID semantics via 2PC.'
        }
      ]
    });

    // =========================================================================
    // 4. DATA STRUCTURES & ADVANCED ALGORITHMS (DSA-201)
    // =========================================================================
    const dsaQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'DSA Unit 1: Complexity Analysis, Trees & Graphs',
        description: 'Comprehensive college level assessment on Big-O analysis, self-balancing BSTs (AVL/Red-Black), Heaps, and Graph Search algorithms.',
        category: catCSE._id,
        subject: subDSA._id,
        unitName: 'Unit 1: Complexity, Trees & Graphs',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: teacherGohil._id,
        creatorModel: 'Teacher',
        isPublished: true
      },
      questionsData: [
        {
          text: 'What is the tightest worst-case time complexity of searching for an element in an AVL self-balancing binary search tree with N nodes?',
          options: ['O(log N)', 'O(N)', 'O(N log N)', 'O(1)'],
          correctAnswers: ['O(log N)'],
          explanation: 'Because AVL trees strictly maintain a balance factor difference ≤ 1 across all nodes, the tree height is guaranteed to be O(log N), yielding O(log N) search, insertion, and deletion.'
        },
        {
          text: 'Which graph traversal algorithm utilizes a FIFO Queue data structure and visits all vertices at current depth before moving deeper?',
          options: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Topological Sort with Recursion', 'Tarjan Strongly Connected Components'],
          correctAnswers: ['Breadth-First Search (BFS)'],
          explanation: 'BFS explores vertices layer by layer using a FIFO queue, guaranteeing the shortest path in unweighted graphs.'
        },
        {
          text: 'What is the worst-case time complexity of QuickSort when the pivot chosen is always the smallest or largest element in an already sorted array?',
          options: ['O(N²)', 'O(N log N)', 'O(N)', 'O(log N)'],
          correctAnswers: ['O(N²)'],
          explanation: 'When the partition is extremely unbalanced (e.g. 1 and N-1 elements), QuickSort degrades into O(N²) quadratic time complexity.'
        },
        {
          text: 'Which shortest-path algorithm is designed to find single-source shortest paths on weighted graphs with non-negative edge weights using a priority queue?',
          options: ['Dijkstra\'s Algorithm', 'Floyd-Warshall Algorithm', 'Bellman-Ford Algorithm', 'Kruskal\'s Algorithm'],
          correctAnswers: ['Dijkstra\'s Algorithm'],
          explanation: 'Dijkstra\'s algorithm finds shortest paths from a single source on non-negative weighted graphs with O((V + E) log V) time complexity using a min-heap.'
        },
        {
          text: 'In a Min-Heap binary tree containing N elements, what is the time complexity of extracting the minimum element (Extract-Min)?',
          options: ['O(log N)', 'O(1)', 'O(N)', 'O(N log N)'],
          correctAnswers: ['O(log N)'],
          explanation: 'Accessing the root minimum takes O(1), but restoring the min-heap invariant via heapify-down (sift-down) takes O(log N) operations.'
        },
        {
          text: 'What property must be satisfied by a Red-Black Tree to ensure search operations execute in logarithmic time?',
          options: [
            'Every path from a node to any of its descendant null leaves must contain the exact same number of black nodes (Black-Height property)',
            'All leaf nodes must store prime numbers',
            'Every node must have exactly three children',
            'The tree must be completely filled at every level without exception'
          ],
          correctAnswers: ['Every path from a node to any of its descendant null leaves must contain the exact same number of black nodes (Black-Height property)'],
          explanation: 'The uniform black-height property along with the constraint that red nodes cannot have red children guarantees that the longest path is at most twice the shortest path, bounding height to ≤ 2 log(N+1).'
        },
        {
          text: 'Which algorithm finds a Minimum Spanning Tree (MST) in an undirected weighted graph by greedily adding the lowest-weight edge that does not form a cycle?',
          options: ['Kruskal\'s Algorithm', 'Dijkstra\'s Algorithm', 'Bellman-Ford Algorithm', 'Kosaraju\'s Algorithm'],
          correctAnswers: ['Kruskal\'s Algorithm'],
          explanation: 'Kruskal\'s algorithm sorts all edges by weight and uses a Disjoint-Set Union-Find (DSU) data structure to greedily add non-cycle-forming edges into the MST.'
        },
        {
          text: 'What is the auxiliary space complexity of standard recursive Depth-First Search (DFS) on a graph with V vertices?',
          options: ['O(V) due to call stack and visited tracking', 'O(1) constant space', 'O(V!) factorial space', 'O(V³) cubic space'],
          correctAnswers: ['O(V) due to call stack and visited tracking'],
          explanation: 'Recursive DFS requires O(V) stack space in the worst case (e.g. a linear chain graph) plus O(V) for the boolean visited set.'
        },
        {
          text: 'Which algorithmic paradigm solves optimization problems by breaking them down into overlapping subproblems and storing subproblem solutions in a memoization table?',
          options: ['Dynamic Programming', 'Divide and Conquer without memoization', 'Greedy Method', 'Brute Force Enumeration'],
          correctAnswers: ['Dynamic Programming'],
          explanation: 'Dynamic Programming applies to problems with optimal substructure and overlapping subproblems, trading space for time via tabulation or memoization.'
        },
        {
          text: 'What collision resolution technique in Hash Tables stores colliding elements in a linked list at the hashed bucket index?',
          options: ['Separate Chaining', 'Linear Probing', 'Quadratic Probing', 'Double Hashing'],
          correctAnswers: ['Separate Chaining'],
          explanation: 'Separate Chaining maintains an auxiliary linked list (or dynamic array/BST) at each bucket index to hold multiple keys that hash to the same value.'
        }
      ]
    });

    // =========================================================================
    // 5. DATABASE MANAGEMENT SYSTEMS & SQL (DBMS-202)
    // =========================================================================
    const dbmsQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'DBMS Unit 1: Relational Theory, Normalization & ACID Transactions',
        description: 'University level assessment covering Normalization forms (1NF to BCNF), ACID transactional properties, B+ Tree Indexing, and Concurrency Control.',
        category: catIT._id,
        subject: subDBMS._id,
        unitName: 'Unit 1: Relational Theory & Transactions',
        isSystemQuiz: true,
        difficulty: 'hard',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: teacherDeshmukh._id,
        creatorModel: 'Teacher',
        isPublished: true
      },
      questionsData: [
        {
          text: 'A relational database table is in Boyce-Codd Normal Form (BCNF) if and only if:',
          options: [
            'For every non-trivial functional dependency X → Y, X is a superkey of the relation',
            'Every attribute is atomic and there are no primary keys',
            'All non-prime attributes are transitively dependent on the candidate key',
            'The table contains no foreign keys'
          ],
          correctAnswers: ['For every non-trivial functional dependency X → Y, X is a superkey of the relation'],
          explanation: 'BCNF is a stricter version of 3NF requiring that for every functional dependency X → Y, the determinant X must be a superkey.'
        },
        {
          text: 'Which ACID property guarantees that all operations within a database transaction succeed together or all changes are rolled back completely upon failure?',
          options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
          correctAnswers: ['Atomicity'],
          explanation: 'Atomicity ensures "all-or-nothing" execution. If any query inside a transaction fails, all previously executed changes are rolled back.'
        },
        {
          text: 'Why do relational database storage engines (e.g. InnoDB, PostgreSQL) predominantly utilize B+ Trees rather than standard Binary Search Trees for disk-based indexing?',
          options: [
            'B+ Trees have high fan-out leading to shallow tree depth, significantly reducing disk I/O seek operations, and leaf nodes are linked for fast range scans',
            'B+ Trees require zero bytes of memory',
            'Binary search trees cannot store string characters',
            'B+ Trees eliminate the need for primary keys'
          ],
          correctAnswers: ['B+ Trees have high fan-out leading to shallow tree depth, significantly reducing disk I/O seek operations, and leaf nodes are linked for fast range scans'],
          explanation: 'High fan-out keeps tree height low (typically 3–4 levels for millions of rows), minimizing expensive disk seeks. Linked leaf nodes allow efficient contiguous range traversal.'
        },
        {
          text: 'What transaction isolation level prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads completely according to SQL-92 standards?',
          options: ['Serializable', 'Read Committed', 'Repeatable Read', 'Read Uncommitted'],
          correctAnswers: ['Serializable'],
          explanation: 'Serializable is the highest ANSI SQL isolation level, providing transactional execution equivalent to serial serializable ordering, preventing all read anomalies.'
        },
        {
          text: 'In Two-Phase Locking (2PL) concurrency protocol, what occurs during the Shrinking Phase?',
          options: [
            'The transaction releases locks and cannot acquire any new locks',
            'The database hard drive compresses existing table rows',
            'The transaction acquires exclusive write locks',
            'All indexes are permanently deleted'
          ],
          correctAnswers: ['The transaction releases locks and cannot acquire any new locks'],
          explanation: 'Strict 2PL divides execution into a Growing Phase (acquires locks, releases none) and a Shrinking Phase (releases locks, cannot acquire any new locks), guaranteeing serializability.'
        },
        {
          text: 'What is the primary operational distinction between SQL (Relational) and NoSQL Document databases (e.g. MongoDB)?',
          options: [
            'SQL databases enforce rigid tabular schemas with foreign key relational integrity; Document NoSQL databases store dynamic, semi-structured JSON/BSON documents allowing flexible schema evolution',
            'NoSQL databases cannot run on Linux servers',
            'SQL databases cannot store numbers',
            'NoSQL databases do not support primary keys'
          ],
          correctAnswers: ['SQL databases enforce rigid tabular schemas with foreign key relational integrity; Document NoSQL databases store dynamic, semi-structured JSON/BSON documents allowing flexible schema evolution'],
          explanation: 'Relational DBs use fixed relational tables and JOINs; Document stores encapsulate nested records in self-describing BSON documents with horizontal sharding capability.'
        },
        {
          text: 'What SQL clause is used to filter records resulting from an aggregate GROUP BY calculation (e.g. COUNT, AVG)?',
          options: ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT'],
          correctAnswers: ['HAVING'],
          explanation: 'The WHERE clause filters individual rows before aggregation; the HAVING clause filters grouped rows after aggregation functions are evaluated.'
        },
        {
          text: 'What concurrency anomaly occurs when Transaction A reads a row, Transaction B modifies that row and commits, and Transaction A re-reads the row obtaining a different value?',
          options: ['Non-Repeatable Read (Fuzzy Read)', 'Dirty Read', 'Phantom Read', 'Lost Update'],
          correctAnswers: ['Non-Repeatable Read (Fuzzy Read)'],
          explanation: 'A Non-Repeatable Read happens when re-reading the same row within a single transaction yields different values because an intermediate transaction updated and committed it.'
        },
        {
          text: 'In database indexing, what is a Clustered Index?',
          options: [
            'An index that determines the physical storage order of the actual table data rows on disk',
            'An index that is stored only in RAM memory and lost upon server restart',
            'An index created on multiple remote database servers across the world',
            'An index that only indexes NULL values'
          ],
          correctAnswers: ['An index that determines the physical storage order of the actual table data rows on disk'],
          explanation: 'A Clustered Index dictates the physical layout of table rows on disk. A table can have only one clustered index (typically the Primary Key).'
        },
        {
          text: 'What mechanism in database recovery ensures durability by writing change logs to non-volatile storage before modifying actual data pages on disk?',
          options: ['Write-Ahead Logging (WAL)', 'Shadow Paging', 'Dynamic Garbage Collection', 'Memory Swapping'],
          correctAnswers: ['Write-Ahead Logging (WAL)'],
          explanation: 'Write-Ahead Logging (WAL) mandates that log records representing state changes must be flushed to disk before the corresponding dirty data pages are written to disk, ensuring crash recovery.'
        }
      ]
    });

    // =========================================================================
    // 6. ARTIFICIAL INTELLIGENCE & MACHINE LEARNING (AI-404)
    // =========================================================================
    const aiQuiz1 = await createQuizWithQuestions({
      quizData: {
        title: 'AI Unit 1: Supervised Learning, Deep Learning & Transformers',
        description: 'Comprehensive college level assessment on Gradient Descent, CNNs, Self-Attention Transformer architectures, and Model Evaluation metrics.',
        category: catAI._id,
        subject: subAI._id,
        unitName: 'Unit 1: Machine Learning & Deep Learning',
        isSystemQuiz: true,
        difficulty: 'medium',
        timeLimit: 15,
        passingMarks: 6,
        maxAttempts: 3,
        visibility: 'public',
        creator: teacherSharma._id,
        creatorModel: 'Teacher',
        isPublished: true
      },
      questionsData: [
        {
          text: 'In training artificial neural networks, what is the primary role of the Backpropagation algorithm?',
          options: [
            'Computes the gradient of the loss function with respect to each network weight using the multivariate Chain Rule of calculus',
            'Multiplies image pixel resolutions by two',
            'Compresses trained model files into ZIP archives',
            'Converts Python scripts into machine assembly code'
          ],
          correctAnswers: ['Computes the gradient of the loss function with respect to each network weight using the multivariate Chain Rule of calculus'],
          explanation: 'Backpropagation applies the calculus chain rule backwards from the output layer to compute partial derivatives of the loss with respect to all trainable parameters for gradient descent updates.'
        },
        {
          text: 'What is the Self-Attention mechanism in the Transformer architecture mathematically designed to calculate?',
          options: [
            'Dynamic relationship weights between every token in a sequence and all other tokens: Attention(Q,K,V) = softmax(QKᵀ / √dₖ) V',
            'The physical clock speed of the graphics processing unit (GPU)',
            'The number of characters in a text file',
            'A fixed linear regression line with zero intercept'
          ],
          correctAnswers: ['Dynamic relationship weights between every token in a sequence and all other tokens: Attention(Q,K,V) = softmax(QKᵀ / √dₖ) V'],
          explanation: 'Self-attention maps Query (Q), Key (K), and Value (V) matrices to dynamically assign contextual attention scores across all tokens in parallel.'
        },
        {
          text: 'In classification model evaluation, what is the definition of Recall (Sensitivity)?',
          options: [
            'True Positives / (True Positives + False Negatives)',
            'True Positives / (True Positives + False Positives)',
            '(True Positives + True Negatives) / Total Samples',
            'False Positives / (False Positives + True Negatives)'
          ],
          correctAnswers: ['True Positives / (True Positives + False Negatives)'],
          explanation: 'Recall measures the proportion of actual positive instances that were correctly identified by the classifier: TP / (TP + FN).'
        },
        {
          text: 'What deep learning layer in Convolutional Neural Networks (CNNs) performs spatial down-sampling to reduce parameter count and spatial dimensions?',
          options: ['Pooling Layer (e.g. Max-Pooling)', 'Fully Connected Dense Layer', 'Softmax Activation Layer', 'Batch Normalization Layer'],
          correctAnswers: ['Pooling Layer (e.g. Max-Pooling)'],
          explanation: 'Max-pooling extracts the maximum value within a sliding window, reducing feature map spatial dimensions and introducing translation invariance.'
        },
        {
          text: 'What machine learning phenomenon occurs when a model achieves near-zero error on training data but exhibits high error on unseen test data?',
          options: ['Overfitting (High Variance)', 'Underfitting (High Bias)', 'Optimal Convergence', 'Gradient Explosion'],
          correctAnswers: ['Overfitting (High Variance)'],
          explanation: 'Overfitting occurs when a high-capacity model memorizes noise and specific details of the training set, failing to generalize to new, unseen evaluation distributions.'
        },
        {
          text: 'Which regularization technique prevents overfitting in deep neural networks by randomly deactivating a fraction of neurons during training passes?',
          options: ['Dropout Regularization', 'L1 Lasso Penalty', 'Gradient Clipping', 'Xavier Parameter Initialization'],
          correctAnswers: ['Dropout Regularization'],
          explanation: 'Srivastava et al. introduced Dropout, which randomly zeroes out neuron outputs with probability p during forward passes, preventing complex co-adaptations.'
        },
        {
          text: 'What is the purpose of the Softmax activation function in multi-class classification output layers?',
          options: [
            'Converts a vector of raw un-normalized real-valued logits into a normalized probability distribution that sums to 1',
            'Clamps all negative values strictly to zero (f(x) = max(0, x))',
            'Computes the square root of all weights',
            'Deletes duplicate training records'
          ],
          correctAnswers: ['Converts a vector of raw un-normalized real-valued logits into a normalized probability distribution that sums to 1'],
          explanation: 'Softmax exponentiates logits and normalizes them by the sum of exponentials, producing a valid categorical probability distribution.'
        },
        {
          text: 'In gradient descent optimization, what problem is caused when gradients become exponentially small as they propagate back through deep network layers?',
          options: ['Vanishing Gradient Problem', 'Exploding Gradient Problem', 'Overfitting Paradox', 'Deadlock Race Condition'],
          correctAnswers: ['Vanishing Gradient Problem'],
          explanation: 'The vanishing gradient problem occurs when saturating activation functions (e.g. Sigmoid/Tanh) produce derivatives << 1, causing early layers to train exceedingly slowly.'
        },
        {
          text: 'What metric combines Precision and Recall into a single harmonic mean score?',
          options: ['F1-Score', 'Mean Squared Error (MSE)', 'R-Squared Coefficient', 'Cross-Entropy Loss'],
          correctAnswers: ['F1-Score'],
          explanation: 'The F1-Score is the harmonic mean of precision and recall: 2 * (Precision * Recall) / (Precision + Recall), penalizing extreme imbalances.'
        },
        {
          text: 'Which unsupervised learning algorithm partitions N observations into K distinct clusters by iteratively updating cluster centroids based on Euclidean distance?',
          options: ['K-Means Clustering', 'Logistic Regression', 'Linear Discriminant Analysis (LDA)', 'Support Vector Classifier (SVC)'],
          correctAnswers: ['K-Means Clustering'],
          explanation: 'K-Means alternates between assigning points to the nearest centroid (Voronoi partition) and recalculating centroids as the mean of assigned cluster points.'
        }
      ]
    });

    console.log('📝 6 System Curriculum & Academic Quizzes Created with 60 Original University Questions');

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
    console.log('   • 4 Academic Engineering Categories (CSE, IT, AI&DS, IoT)');
    console.log('   • 8 Accredited Engineering Subjects');
    console.log('   • 4 University Professors & Faculty Members');
    console.log('   • 5 Verified University Student Profiles');
    console.log('   • 6 Rigorous Unit & Master Engineering Quizzes');
    console.log('   • 60 Authenticated, Peer-Reviewed Engineering Questions');
    console.log('   • Verified Exam Results & Cryptographic Certificates');
    console.log('========================================================================\n');

    return { success: true, count: 60 };
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
