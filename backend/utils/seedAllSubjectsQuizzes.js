const mongoose = require('mongoose');
const Category = require('../models/Category');
const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const seedAllSubjectsQuizzes = async () => {
  try {
    await connectDB();
    console.log('🚀 SEEDING ALL SUBJECTS & UNIT-WISE SYSTEM CURRICULUM QUIZZES...');

    // 1. Ensure System Admin exists
    let admin = await Admin.findOne({ email: 'admin@quizsystem.com' });
    if (!admin) {
      admin = await Admin.create({
        name: 'System Administrator',
        email: 'admin@quizsystem.com',
        phone: '9999999999',
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
    }

    // 2. Ensure Main Category
    let category = await Category.findOne({ slug: 'computer-science-engineering' });
    if (!category) {
      category = await Category.create({
        name: 'Computer Science / Engineering',
        slug: 'computer-science-engineering',
        description: 'Core Computer Science & Engineering Curriculum Modules'
      });
    }

    // -------------------------------------------------------------
    // SUBJECT 1: INTERNET OF THINGS (IoT)
    // -------------------------------------------------------------
    let iotSubject = await Subject.findOne({ slug: 'internet-of-things-iot' });
    if (!iotSubject) {
      iotSubject = await Subject.create({
        name: 'Internet of Things (IoT)',
        slug: 'internet-of-things-iot',
        category: category._id,
        description: 'Comprehensive IoT Curriculum covering Architecture, Protocols, Sensors, Arduino & WSN Cloud Integration'
      });
    }

    // Clear previous IoT system quizzes
    const prevIot = await Quiz.find({ subject: iotSubject._id, isSystemQuiz: true });
    for (const q of prevIot) {
      await Question.deleteMany({ quizId: q._id });
      await q.deleteOne();
    }

    // IoT Unit 1
    const iotU1 = await Quiz.create({
      title: 'IoT Unit 1: Introduction to IoT & Protocols',
      description: 'System Curriculum Quiz for Unit 1. Covers Physical & Logical Architecture, Network Layer Protocols (IPv6, 6LoWPAN), Transport Layer (TCP, UDP), and Application Layer Protocols (MQTT, CoAP, AMQP).',
      category: category._id,
      subject: iotSubject._id,
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
    });

    const iotU1Q = [
      { text: 'What is the core technical definition of the Internet of Things (IoT)?', options: ['A global network of physical objects embedded with sensors, software, and connectivity to exchange data', 'A standalone desktop operating system with no network interfaces', 'A closed local ethernet network connecting only desktop printers', 'A central database server architecture used exclusively for offline data storage'], correctAnswers: ['A global network of physical objects embedded with sensors, software, and connectivity to exchange data'], explanation: 'IoT is a network of physical devices embedded with electronics, software, sensors, and network connectivity allowing data exchange.' },
      { text: 'Which application layer protocol is lightweight, uses a Publish-Subscribe architecture, and is specifically optimized for constrained IoT networks?', options: ['MQTT (Message Queuing Telemetry Transport)', 'HTTP/1.1 REST Web Services', 'FTP (File Transfer Protocol)', 'POP3 Mail Protocol'], correctAnswers: ['MQTT (Message Queuing Telemetry Transport)'], explanation: 'MQTT is a publish-subscribe protocol ideal for resource-constrained IoT devices due to minimal overhead.' },
      { text: 'Which Network Layer protocol enables IPv6 packets to be transmitted over low-power IEEE 802.15.4 wireless networks?', options: ['6LoWPAN', 'Standard TCP/IP', 'DHCP Server', 'NAT Gateway'], correctAnswers: ['6LoWPAN'], explanation: '6LoWPAN enables IPv6 encapsulation for constrained wireless devices.' },
      { text: 'In IoT system architectures, what is the primary role of an Edge Analytics Gateway?', options: ['Process and filter sensor data locally near the source to minimize latency and bandwidth consumption', 'Charge the physical batteries of sensor nodes wirelessly', 'Store hard copy paper documents', 'Perform manual teacher grading on paper answer sheets'], correctAnswers: ['Process and filter sensor data locally near the source to minimize latency and bandwidth consumption'], explanation: 'Edge gateways perform local data processing and analytics near sensors.' },
      { text: 'Which protocol operates over UDP and is designed as a lightweight RESTful web transfer protocol for constrained nodes?', options: ['CoAP (Constrained Application Protocol)', 'HTTPS', 'SMTP', 'SSH'], correctAnswers: ['CoAP (Constrained Application Protocol)'], explanation: 'CoAP is designed for constrained devices over UDP.' },
      { text: 'In IoT Deployment Templates, Template 1 (Single Device Deployment) represents which processing flow?', options: ['Sensor → Microcontroller → User Interface', 'Multiple Gateways → Supercomputer → Satellite', 'Cloud Server → Distributed Database → Drone', 'Blockchain → Smart Contract → Physical Relay'], correctAnswers: ['Sensor → Microcontroller → User Interface'], explanation: 'Template 1 defines standalone deployment where a single sensor connects directly to a microcontroller.' },
      { text: 'Which of the following is a Transport Layer protocol widely used in IoT for low-overhead, connectionless data transmission?', options: ['UDP (User Datagram Protocol)', 'HTTP', 'HTML5', 'JSON Schema'], correctAnswers: ['UDP (User Datagram Protocol)'], explanation: 'UDP provides low-latency, connectionless transport.' },
      { text: 'What is a fundamental requirement for IoT communication protocols in resource-constrained environments?', options: ['Low power consumption, small header overhead, and resilience against intermittent connectivity', 'High gigabit bandwidth requirements and AC mains power', 'Constant manual user interaction for every packet transmitted', 'Requirement of 64GB RAM per sensor node'], correctAnswers: ['Low power consumption, small header overhead, and resilience against intermittent connectivity'], explanation: 'IoT protocols must be lightweight, energy-efficient, and bandwidth tolerant.' },
      { text: 'AMQP (Advanced Message Queuing Protocol) operates at which layer of the IoT protocol stack?', options: ['Application Layer', 'Physical Layer', 'Data Link Layer', 'Hardware Layer'], correctAnswers: ['Application Layer'], explanation: 'AMQP is an open-standard Application Layer protocol.' },
      { text: 'What differentiates IoT from traditional M2M (Machine-to-Machine) communication?', options: ['IoT relies on open IP-based cloud networks and scalable standards, while legacy M2M uses isolated point-to-point hardware links', 'IoT does not use sensors or actuators', 'M2M is only used for smartphone gaming', 'M2M does not require electricity'], correctAnswers: ['IoT relies on open IP-based cloud networks and scalable standards, while legacy M2M uses isolated point-to-point hardware links'], explanation: 'IoT integrates machine data into open web and cloud ecosystems.' }
    ];
    for (const q of iotU1Q) await Question.create({ ...q, quizId: iotU1._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // IoT Unit 2
    const iotU2 = await Quiz.create({
      title: 'IoT Unit 2: Sensors, Microcontrollers & Interfacing',
      description: 'System Curriculum Quiz for Unit 2. Covers Microcontroller Architectures (ATmega328P, PIC, 8051), Arduino Uno Hardware Pinouts, Sensors (DHT11, PIR, HC-SR04, MQ-2), and ADC Interfacing.',
      category: category._id,
      subject: iotSubject._id,
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
    });

    const iotU2Q = [
      { text: 'Which 8-bit AVR microcontroller IC is embedded at the core of the Arduino Uno development board?', options: ['ATmega328P', 'Intel Core i7', 'PIC16F877A', 'ARM Cortex-A72'], correctAnswers: ['ATmega328P'], explanation: 'Arduino Uno uses Microchip ATmega328P 8-bit AVR microcontroller.' },
      { text: 'What is the standard operating voltage level of the ATmega328P microcontroller on an Arduino Uno board?', options: ['5V DC', '24V AC', '120V AC', '0.5V DC'], correctAnswers: ['5V DC'], explanation: 'Arduino Uno operating voltage is 5V DC.' },
      { text: 'What type of environmental parameters is the MQ-2 sensor module designed to measure in IoT systems?', options: ['Combustible Gas and Smoke Concentration', 'Water Flow Rate and Hydrostatic Pressure', 'Ultrasonic Echo Timing for Obstacle Distances', 'Soil Moisture and pH levels'], correctAnswers: ['Combustible Gas and Smoke Concentration'], explanation: 'MQ-2 detects LPG, smoke, alcohol, propane, and hydrogen.' },
      { text: 'How does an HC-SR04 Ultrasonic Sensor measure distance to an obstacle?', options: ['Emits a 40kHz ultrasonic sound burst and calculates distance based on time of flight for the echo to return', 'Reads ambient infrared light reflection intensity', 'Measures magnetic field fluctuations', 'Detects surface temperature changes using thermal camera'], correctAnswers: ['Emits a 40kHz ultrasonic sound burst and calculates distance based on time of flight for the echo to return'], explanation: 'HC-SR04 calculates distance by measuring echo delay time.' },
      { text: 'Which sensor module is specifically designed for passive infrared human motion detection?', options: ['PIR Motion Sensor (HC-SR501)', 'DHT11 Temperature Sensor', 'LDR Photoresistor', 'MPU6050 Accelerometer'], correctAnswers: ['PIR Motion Sensor (HC-SR501)'], explanation: 'PIR sensors measure IR light radiating from objects in their field of view.' },
      { text: 'In microcontrollers, what is the primary function of an ADC (Analog-to-Digital Converter)?', options: ['Converts continuous analog sensor voltage signals into discrete digital values for CPU processing', 'Amplifies audio output signals for loudspeakers', 'Increases the main CPU clock frequency dynamically', 'Stores permanent flash memory code'], correctAnswers: ['Converts continuous analog sensor voltage signals into discrete digital values for CPU processing'], explanation: 'ADCs convert continuous analog voltage inputs (0-5V) into digital numbers.' },
      { text: 'How many digital I/O pins are available on a standard Arduino Uno board?', options: ['14 Digital Pins (with 6 providing PWM output)', '40 Pins', '2 Pins', '100 Pins'], correctAnswers: ['14 Digital Pins (with 6 providing PWM output)'], explanation: 'Arduino Uno features 14 digital input/output pins (pins 0-13).' },
      { text: 'What is the resolution of the built-in ADC on the ATmega328P microcontroller?', options: ['10-bit resolution (maps 0-5V to 0-1023 integer steps)', '2-bit resolution', '64-bit resolution', '1-bit resolution'], correctAnswers: ['10-bit resolution (maps 0-5V to 0-1023 integer steps)'], explanation: 'ATmega328P has a 10-bit ADC (1024 discrete levels).' },
      { text: 'Which component is mandatory when interfacing a 5V electromagnetic relay module with a microcontroller to protect against back-EMF voltage spikes?', options: ['Flyback (Freewheeling) Diode connected in reverse parallel across the relay coil', 'Step-down Transformer', 'Electric Heating Element', 'Quartz Crystal Oscillator'], correctAnswers: ['Flyback (Freewheeling) Diode connected in reverse parallel across the relay coil'], explanation: 'A flyback diode eliminates voltage spikes created when inductive coils de-energize.' },
      { text: 'Which microcontrollers belong to the Microchip PIC family?', options: ['PIC16F877A & PIC18F452', 'ATmega328P & ATmega16', '8051 & 8086', 'STM32F407'], correctAnswers: ['PIC16F877A & PIC18F452'], explanation: 'PIC16F877A and PIC18F452 are popular PIC microcontrollers.' }
    ];
    for (const q of iotU2Q) await Question.create({ ...q, quizId: iotU2._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // IoT Unit 3
    const iotU3 = await Quiz.create({
      title: 'IoT Unit 3: Arduino C++ Library Functions & Programming',
      description: 'System Curriculum Quiz for Unit 3. Covers I/O Library Functions (pinMode, digitalWrite, digitalRead, analogRead, analogWrite), Serial Communication (Serial.begin, Serial.println), and Hardware Timers.',
      category: category._id,
      subject: iotSubject._id,
      unitName: 'Unit 3: Library Functions & Programming',
      isSystemQuiz: true,
      difficulty: 'medium',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 3,
      visibility: 'public',
      creator: admin._id,
      creatorModel: 'Admin',
      isPublished: true
    });

    const iotU3Q = [
      { text: 'What is the purpose of the pinMode(pin, mode) function in Arduino C++ programming?', options: ['Configures a specific digital pin to act as an INPUT, OUTPUT, or INPUT_PULLUP', 'Measures analog AC voltage', 'Deletes memory from flash storage', 'Formats the SD card module'], correctAnswers: ['Configures a specific digital pin to act as an INPUT, OUTPUT, or INPUT_PULLUP'], explanation: 'pinMode() configures the specified pin to behave as an input or output pin.' },
      { text: 'Which function is used to read an analog voltage value from Arduino analog pins A0 through A5?', options: ['analogRead(pin)', 'digitalRead(pin)', 'pinMode(pin)', 'Serial.read()'], correctAnswers: ['analogRead(pin)'], explanation: 'analogRead() reads the value from the specified analog pin (0-1023).' },
      { text: 'What range of digital values does analogRead() return on an Arduino Uno board?', options: ['0 to 1023', '0 to 255', '0 to 1', '-128 to 127'], correctAnswers: ['0 to 1023'], explanation: '10-bit ADC yields 1024 possible values ranging from 0 to 1023.' },
      { text: 'Which function outputs a Pulse Width Modulation (PWM) signal to a PWM-enabled digital pin?', options: ['analogWrite(pin, value)', 'digitalWrite(pin, value)', 'pwmStart(pin)', 'shiftOut(pin)'], correctAnswers: ['analogWrite(pin, value)'], explanation: 'analogWrite() writes an analog PWM wave to a PWM pin.' },
      { text: 'What range of duty cycle values is accepted by analogWrite(pin, value)?', options: ['0 to 255 (0 = 0% duty cycle / 0V, 255 = 100% duty cycle / 5V)', '0 to 1023', '0 to 10000', '1 to 12'], correctAnswers: ['0 to 255 (0 = 0% duty cycle / 0V, 255 = 100% duty cycle / 5V)'], explanation: 'analogWrite() duty cycle value is specified as an 8-bit integer between 0 and 255.' },
      { text: 'Which Arduino code statement initializes serial communication at a baud rate of 9600 bits per second?', options: ['Serial.begin(9600);', 'Serial.open(9600);', 'Serial.start(9600);', 'Baud.set(9600);'], correctAnswers: ['Serial.begin(9600);'], explanation: 'Serial.begin() sets the data rate in bits per second for serial data transmission.' },
      { text: 'What is the primary operational difference between digitalRead(pin) and analogRead(pin)?', options: ['digitalRead returns discrete binary states HIGH (1) or LOW (0), whereas analogRead returns continuous integer values from 0 to 1023', 'digitalRead measures temperature directly', 'analogRead works only on digital pins 0 to 13', 'They perform identical tasks'], correctAnswers: ['digitalRead returns discrete binary states HIGH (1) or LOW (0), whereas analogRead returns continuous integer values from 0 to 1023'], explanation: 'digitalRead is binary (HIGH/LOW), while analogRead converts analog voltages.' },
      { text: 'In Arduino programming, what is the role of the setup() function?', options: ['Executes exactly once when the board powers up or resets to initialize pin modes and start libraries', 'Loops infinitely until powered off', 'Translates C++ code into Python', 'Generates random numbers continuously'], correctAnswers: ['Executes exactly once when the sketch starts to initialize variables and pin modes.'], explanation: 'setup() runs once on boot.' },
      { text: 'Which library function causes the microcontroller to pause program execution for a specified duration in milliseconds?', options: ['delay(ms)', 'pause(ms)', 'sleep(ms)', 'wait(ms)'], correctAnswers: ['delay(ms)'], explanation: 'delay(ms) pauses program execution for specified milliseconds.' },
      { text: 'Which statement correctly prints data to the Arduino Serial Monitor followed by a carriage return and new line?', options: ['Serial.println(data);', 'Serial.print(data);', 'Console.log(data);', 'printf(data);'], correctAnswers: ['Serial.println(data);'], explanation: 'Serial.println() prints data to the serial port followed by a carriage return and newline.' }
    ];
    for (const q of iotU3Q) await Question.create({ ...q, quizId: iotU3._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // IoT Unit 4
    const iotU4 = await Quiz.create({
      title: 'IoT Unit 4: WSN, Cloud & Edge Technologies',
      description: 'System Curriculum Quiz for Unit 4. Covers Wireless Sensor Networks (WSN, Base Station, Sink Node), Communication Standards (Zigbee, BLE, RFID), and Cloud/Edge/Fog Computing architectures.',
      category: category._id,
      subject: iotSubject._id,
      unitName: 'Unit 4: WSN, Cloud & Edge Technologies',
      isSystemQuiz: true,
      difficulty: 'hard',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 3,
      visibility: 'public',
      creator: admin._id,
      creatorModel: 'Admin',
      isPublished: true
    });

    const iotU4Q = [
      { text: 'What is a Wireless Sensor Network (WSN) in IoT enabling technologies?', options: ['A collection of low-cost, low-power sensor nodes deployed to monitor environmental conditions and transmit data wirelessly to a Base Station', 'A single standalone desktop workstation connected via fiber optic cable', 'A high-power television broadcast satellite dish', 'A physical Ethernet cable network connecting office printers'], correctAnswers: ['A collection of low-cost, low-power sensor nodes deployed to monitor environmental conditions and transmit data wirelessly to a Base Station'], explanation: 'WSNs consist of spatially distributed autonomous sensor nodes.' },
      { text: 'In a Wireless Sensor Network, what is the primary role of the Base Station (Sink Node)?', options: ['Collects data from distributed sensor nodes and forwards it to cloud servers or central management units', 'Powers sensor nodes wirelessly', 'Manufactures microcontroller chips', 'Acts as a solar collector'], correctAnswers: ['Collects data from distributed sensor nodes and forwards it to cloud servers or central management units'], explanation: 'The Base Station serves as a gateway between sensor nodes and external network infrastructure.' },
      { text: 'Which low-power, short-range wireless networking standard based on IEEE 802.15.4 is widely used in WSNs for mesh automation?', options: ['Zigbee', '5G Cellular NR', 'Fiber Optic Cable', 'Geostationary Satellite Transponder'], correctAnswers: ['Zigbee'], explanation: 'Zigbee is an IEEE 802.15.4 specification for low-power personal area networks.' },
      { text: 'What is Edge Computing in an enterprise IoT system architecture?', options: ['Performing data processing, analytics, and filtering locally near the data source at the network edge to reduce cloud latency', 'Storing files on legacy floppy disks', 'Running servers underground', 'Printing paper reports for manual filing'], correctAnswers: ['Performing data processing, analytics, and filtering locally near the data source at the network edge to reduce cloud latency'], explanation: 'Edge computing brings computation closer to the devices where data is gathered.' },
      { text: 'What is the key operational advantage of Fog Computing positioned between IoT edge devices and Cloud data centers?', options: ['Reduces network latency, saves bandwidth, and provides real-time response for critical local decision-making', 'Increases power consumption', 'Replaces physical hardware sensors', 'Requires manual paper delivery'], correctAnswers: ['Reduces network latency, saves bandwidth, and provides real-time response for critical local decision-making'], explanation: 'Fog computing extends cloud computing to the edge of an enterprise network.' },
      { text: 'Which technology uses radio-frequency electromagnetic fields to identify and track tags attached to physical objects automatically?', options: ['RFID (Radio-Frequency Identification)', 'HDMI Video Output', 'VGA Interface', 'USB 3.0 Bus'], correctAnswers: ['RFID (Radio-Frequency Identification)'], explanation: 'RFID uses electromagnetic fields to identify and track tags.' },
      { text: 'What is a key advantage of Bluetooth Low Energy (BLE) compared to classic Bluetooth in IoT applications?', options: ['Significantly reduced power consumption, allowing sensors to run for years on small coin-cell batteries', 'Requires constant 220V AC power supply', 'Transmits raw uncompressed 4K video streams', 'Operates exclusively underwater'], correctAnswers: ['Significantly reduced power consumption, allowing sensors to run for years on small coin-cell batteries'], explanation: 'BLE is optimized for low duty-cycle, low-power communications.' },
      { text: 'What is a defining feature of self-organizing Wireless Sensor Networks (WSNs)?', options: ['Nodes automatically discover neighbors and form dynamic multi-hop routing paths without manual configuration', 'Requires manual IP address configuration for every node', 'Nodes cannot change their positions', 'Requires physical Ethernet cabling between nodes'], correctAnswers: ['Nodes automatically discover neighbors and form dynamic multi-hop routing paths without manual configuration'], explanation: 'Self-organizing WSNs establish wireless links and adapt topology dynamically.' },
      { text: 'In Cloud IoT platforms, what is the main benefit of cloud analytics services?', options: ['Scalable long-term data storage, complex machine learning processing, and global dashboard visualizations', 'Replaces physical microcontrollers', 'Slows down network communications', 'Deletes historical telemetry'], correctAnswers: ['Scalable long-term data storage, complex machine learning processing, and global dashboard visualizations'], explanation: 'Cloud platforms provide massive storage capacity and compute power.' },
      { text: 'Which of the following represents the combination of core IoT enabling technologies?', options: ['Wireless Sensor Networks, RFID, Cloud/Edge Computing, and Embedded Microcontrollers', 'Manual typewriters and paper carbon sheets', 'Analog landline telephones', 'Pneumatic message tubes'], correctAnswers: ['Wireless Sensor Networks, RFID, Cloud/Edge Computing, and Embedded Microcontrollers'], explanation: 'WSN, RFID, Cloud/Edge Computing, and Microcontrollers form the foundation of modern IoT.' }
    ];
    for (const q of iotU4Q) await Question.create({ ...q, quizId: iotU4._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // -------------------------------------------------------------
    // SUBJECT 2: SOFTWARE ENGINEERING (SE)
    // -------------------------------------------------------------
    let seSubject = await Subject.findOne({ slug: 'software-engineering-se' });
    if (!seSubject) {
      seSubject = await Subject.create({
        name: 'Software Engineering (SE)',
        slug: 'software-engineering-se',
        category: category._id,
        description: 'Comprehensive Software Engineering Curriculum covering SDLC Models, Requirements Engineering, Architectural Design & Quality Assurance'
      });
    }

    const prevSe = await Quiz.find({ subject: seSubject._id, isSystemQuiz: true });
    for (const q of prevSe) {
      await Question.deleteMany({ quizId: q._id });
      await q.deleteOne();
    }

    // SE Unit 1
    const seU1 = await Quiz.create({
      title: 'SE Unit 1: Introduction & SDLC Process Models',
      description: 'System Curriculum Quiz for Unit 1. Covers Software Engineering Fundamentals, Waterfall Model, Incremental Process, Spiral Model, Agile Framework, and Scrum Methodology.',
      category: category._id,
      subject: seSubject._id,
      unitName: 'Unit 1: Introduction & Process Models',
      isSystemQuiz: true,
      difficulty: 'easy',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 3,
      visibility: 'public',
      creator: admin._id,
      creatorModel: 'Admin',
      isPublished: true
    });

    const seU1Q = [
      { text: 'What is the primary objective of Software Engineering as a discipline?', options: ['Systematic, disciplined, and quantifiable approach to the development, operation, and maintenance of software', 'Writing raw assembly code without documentation', 'Designing hardware integrated circuit chips', 'Manually repairing physical computer monitors'], correctAnswers: ['Systematic, disciplined, and quantifiable approach to the development, operation, and maintenance of software'], explanation: 'IEEE defines Software Engineering as the application of a systematic approach to software development.' },
      { text: 'Which classic SDLC model follows a strict sequential phase flow where each phase must complete before the next begins?', options: ['Waterfall Model', 'Agile Scrum', 'Extreme Programming (XP)', 'Kanban Board'], correctAnswers: ['Waterfall Model'], explanation: 'Waterfall is a linear sequential life-cycle model.' },
      { text: 'What is the key feature of the Spiral Model proposed by Barry Boehm?', options: ['Explicit risk assessment and management iteration loops at every evolutionary cycle', 'Complete lack of documentation', 'No customer feedback until project delivery', 'Prohibits any changes after coding starts'], correctAnswers: ['Explicit risk assessment and management iteration loops at every evolutionary cycle'], explanation: 'Spiral model combines iterative development with systematic risk analysis.' },
      { text: 'In Agile Scrum development, what is a Sprint?', options: ['A time-boxed iteration (typically 2 to 4 weeks) in which a workable increment of software is developed', 'A 100-meter physical running test for developers', 'A permanent freeze of software requirements', 'A manual code compilation tool'], correctAnswers: ['A time-boxed iteration (typically 2 to 4 weeks) in which a workable increment of software is developed'], explanation: 'Sprints are time-boxed iterations in Scrum.' },
      { text: 'Which process model is best suited when software requirements are well-understood, stable, and unlikely to change during development?', options: ['Waterfall Model', 'Agile XP', 'Prototyping Model', 'DevOps Continuous Delivery'], correctAnswers: ['Waterfall Model'], explanation: 'Waterfall works best for projects with stable, un-changing requirements.' },
      { text: 'What is the primary role of the Product Owner in a Scrum team?', options: ['Defines user stories, manages the Product Backlog, and prioritizes project requirements', 'Writes C++ unit tests exclusively', 'Configures Linux server firewalls', 'Manages physical office supplies'], correctAnswers: ['Defines user stories, manages the Product Backlog, and prioritizes project requirements'], explanation: 'The Product Owner represents stakeholders and manages the product backlog.' },
      { text: 'What does the Agile Manifesto prioritize over comprehensive documentation?', options: ['Working software', 'Contract negotiation', 'Following a rigid plan', 'Hardware purchasing'], correctAnswers: ['Working software'], explanation: 'Agile manifesto values working software over comprehensive documentation.' },
      { text: 'In software development, what is Evolutionary Prototyping?', options: ['Building an initial prototype to explore requirements, then iteratively refining it into the final product', 'Throwing away all code after 1 hour', 'Using paper mockups exclusively with no computer', 'Deleting the source repository daily'], correctAnswers: ['Building an initial prototype to explore requirements, then iteratively refining it into the final product'], explanation: 'Evolutionary prototyping incrementally converts initial prototypes into working systems.' },
      { text: 'Which phase of the SDLC involves gathering user needs, analyzing system feasibility, and documenting requirements?', options: ['Requirements Analysis and Specification', 'Unit Testing', 'Deployment', 'Hardware Soldering'], correctAnswers: ['Requirements Analysis and Specification'], explanation: 'Requirements gathering defines functional and non-functional user needs.' },
      { text: 'What is the main benefit of adopting Incremental Software Development process models?', options: ['Delivers usable software increments to customers early, allowing faster feedback and reduced risk', 'Eliminates the need for software testing', 'Guarantees zero bug occurrences forever', 'Reduces developer salary costs to zero'], correctAnswers: ['Delivers usable software increments to customers early, allowing faster feedback and reduced risk'], explanation: 'Incremental delivery provides early business value and user feedback.' }
    ];
    for (const q of seU1Q) await Question.create({ ...q, quizId: seU1._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // SE Unit 2
    const seU2 = await Quiz.create({
      title: 'SE Unit 2: Requirements Engineering & SRS',
      description: 'System Curriculum Quiz for Unit 2. Covers Requirements Elicitation, Functional vs Non-Functional Requirements, Use Case Diagrams, and Software Requirements Specification (SRS).',
      category: category._id,
      subject: seSubject._id,
      unitName: 'Unit 2: Requirements Engineering & SRS',
      isSystemQuiz: true,
      difficulty: 'medium',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 3,
      visibility: 'public',
      creator: admin._id,
      creatorModel: 'Admin',
      isPublished: true
    });

    const seU2Q = [
      { text: 'What is the difference between Functional and Non-Functional requirements in software engineering?', options: ['Functional requirements specify what the system should do, while Non-Functional requirements specify quality attributes and constraints (performance, security, usability)', 'Functional requirements apply to hardware only', 'Non-functional requirements are useless comments', 'Functional requirements cannot be tested'], correctAnswers: ['Functional requirements specify what the system should do, while Non-Functional requirements specify quality attributes and constraints (performance, security, usability)'], explanation: 'Functional requirements describe system features; non-functional requirements describe quality attributes.' },
      { text: 'Which document serves as a formal contract between software developers and clients specifying complete system behaviors?', options: ['Software Requirements Specification (SRS)', 'Database Schema SQL file', 'User Desktop Wallpaper', 'Compiler Assembly Log'], correctAnswers: ['Software Requirements Specification (SRS)'], explanation: 'The SRS document outlines expectations, scope, and technical constraints.' },
      { text: 'In UML notation, what does a Use Case Diagram visualize?', options: ['The interactions between external actors and system use cases representing functional requirements', 'Memory stack pointer allocation', 'Database B-Tree indexing algorithms', 'Network cable pin configurations'], correctAnswers: ['The interactions between external actors and system use cases representing functional requirements'], explanation: 'Use Case diagrams depict relationships between actors and system functions.' },
      { text: 'Which of the following is considered a Non-Functional requirement attribute according to ISO/IEC 25010 standards?', options: ['Response time under 500ms and 99.9% uptime availability', 'User login button position', 'Calculate invoice subtotal function', 'Print PDF report feature'], correctAnswers: ['Response time under 500ms and 99.9% uptime availability'], explanation: 'Performance and availability are classic non-functional quality attributes.' },
      { text: 'What is Requirements Elicitation in software engineering?', options: ['The process of discovering, gathering, and uncovering user needs from stakeholders', 'Writing SQL database triggers', 'Deleting old project source code', 'Formatting hard drives'], correctAnswers: ['The process of discovering, gathering, and uncovering user needs from stakeholders'], explanation: 'Elicitation involves interviews, surveys, and workshops with stakeholders.' },
      { text: 'In SRS document evaluation, what does the quality attribute "Verifiability" mean?', options: ['Every requirement specified can be independently tested and verified by a finite cost-effective process', 'Requirements are written in French only', 'Requirements cannot be changed ever', 'Requirement text spans 1000 pages'], correctAnswers: ['Every requirement specified can be independently tested and verified by a finite cost-effective process'], explanation: 'A requirement is verifiable if there exists a cost-effective test to verify fulfillment.' },
      { text: 'What is the main goal of Feasibility Study during the initial software phase?', options: ['Determine whether the proposed project is financially, technically, and operationally viable', 'Write 50,000 lines of Java code', 'Purchase 100 laptops', 'Create company marketing logos'], correctAnswers: ['Determine whether the proposed project is financially, technically, and operationally viable'], explanation: 'Feasibility studies evaluate financial, technical, and operational viability.' },
      { text: 'Which UML relationship is used when a base Use Case optionally incorporates the behavior of another Use Case under specific conditions?', options: ['<<extend>> relationship', '<<include>> relationship', 'Generalization inheritance', 'Composition association'], correctAnswers: ['<<extend>> relationship'], explanation: '<<extend>> specifies conditional optional behavior in use case diagrams.' },
      { text: 'What is Requirements Traceability in software quality management?', options: ['Ability to link and trace requirements throughout the lifecycle from origin to design, implementation, and test cases', 'Tracking GPS location of developers', 'Tracing network IP sockets', 'Drawing flowchart arrows on paper'], correctAnswers: ['Ability to link and trace requirements throughout the lifecycle from origin to design, implementation, and test cases'], explanation: 'Traceability ensures every requirement maps to implementation and test suites.' },
      { text: 'In Use Case modeling, what is an "Actor"?', options: ['An external entity (user, external system, or physical device) that interacts directly with the software system', 'A Hollywood movie star', 'A Java class variable', 'A database index table'], correctAnswers: ['An external entity (user, external system, or physical device) that interacts directly with the software system'], explanation: 'Actors represent role played by users or external systems.' }
    ];
    for (const q of seU2Q) await Question.create({ ...q, quizId: seU2._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // SE Unit 3
    const seU3 = await Quiz.create({
      title: 'SE Unit 3: Software Design Architecture & UML',
      description: 'System Curriculum Quiz for Unit 3. Covers Architectural Design Patterns, Modular Design (Coupling & Cohesion), Object-Oriented Design, and UML Diagrams (Class, Sequence, State).',
      category: category._id,
      subject: seSubject._id,
      unitName: 'Unit 3: Design Architecture & UML',
      isSystemQuiz: true,
      difficulty: 'medium',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 3,
      visibility: 'public',
      creator: admin._id,
      creatorModel: 'Admin',
      isPublished: true
    });

    const seU3Q = [
      { text: 'What is the fundamental goal of Modular Design principles in software architecture?', options: ['High Cohesion within modules and Low Coupling between modules', 'Low Cohesion and High Coupling', 'High Coupling and Zero Functions', 'Single monolithic 1,000,000 line file'], correctAnswers: ['High Cohesion within modules and Low Coupling between modules'], explanation: 'Effective modular design strives for high cohesion (focused responsibilities) and low coupling (minimal interdependencies).' },
      { text: 'What does "Coupling" measure in software design analysis?', options: ['The degree of interdependence and connection between different software modules', 'The execution speed of a CPU loop', 'The number of comments in a file', 'The physical length of Ethernet cables'], correctAnswers: ['The degree of interdependence and connection between different software modules'], explanation: 'Coupling measures how strongly one module depends on or interacts with other modules.' },
      { text: 'What does "Cohesion" measure within a software component module?', options: ['How tightly focused and related the internal responsibilities of a single module are', 'How many modules are stored on disk', 'The color theme of the user interface', 'The compiler output file size'], correctAnswers: ['How tightly focused and related the internal responsibilities of a single module are'], explanation: 'Cohesion indicates how strongly related the internal elements of a module are.' },
      { text: 'Which UML diagram represents the dynamic interaction between objects ordered in a time sequence?', options: ['Sequence Diagram', 'Class Diagram', 'Deployment Diagram', 'Component Diagram'], correctAnswers: ['Sequence Diagram'], explanation: 'Sequence diagrams illustrate how objects interact along a vertical time timeline.' },
      { text: 'In Object-Oriented Design, what is the Model-View-Controller (MVC) architectural pattern?', options: ['Splits an application into Model (Data/Logic), View (UI), and Controller (Input Handler)', 'Combines HTML and SQL into one function', 'A hardware graphics card architecture', 'A network routing protocol'], correctAnswers: ['Splits an application into Model (Data/Logic), View (UI), and Controller (Input Handler)'], explanation: 'MVC separates internal information representation from user presentation and interaction logic.' },
      { text: 'Which UML diagram displays static system structure by showing classes, attributes, methods, and relationships?', options: ['Class Diagram', 'Activity Diagram', 'Use Case Diagram', 'State Machine Diagram'], correctAnswers: ['Class Diagram'], explanation: 'Class diagrams show the static structure of OO systems.' },
      { text: 'What type of coupling occurs when modules share global data variables across the application?', options: ['Common (Global) Coupling', 'Content Coupling', 'Data Coupling', 'No Coupling'], correctAnswers: ['Common (Global) Coupling'], explanation: 'Common coupling occurs when multiple modules share access to global data.' },
      { text: 'In UML Class Diagrams, what does a solid diamond arrowhead at the end of an association line represent?', options: ['Composition (strong ownership with dependent lifecycles)', 'Aggregation (weak ownership)', 'Generalization (Inheritance)', 'Dependency'], correctAnswers: ['Composition (strong ownership with dependent lifecycles)'], explanation: 'Composition denotes strong whole-part ownership where parts cannot exist without the whole.' },
      { text: 'Which Design Pattern ensures a class has only one single instance globally and provides a global point of access to it?', options: ['Singleton Pattern', 'Factory Method Pattern', 'Observer Pattern', 'Strategy Pattern'], correctAnswers: ['Singleton Pattern'], explanation: 'Singleton pattern restricts instantiation of a class to one single object.' },
      { text: 'What is the purpose of a State Machine Diagram in UML software modeling?', options: ['Modeled behavior of an object specifying the sequence of states it undergoes during its lifecycle in response to events', 'Displays database backup schedules', 'Shows physical server rack positions', 'Calculates CPU clock frequency'], correctAnswers: ['Modeled behavior of an object specifying the sequence of states it undergoes during its lifecycle in response to events'], explanation: 'State diagrams capture dynamic state transitions of reactive systems.' }
    ];
    for (const q of seU3Q) await Question.create({ ...q, quizId: seU3._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // SE Unit 4
    const seU4 = await Quiz.create({
      title: 'SE Unit 4: Software Testing & Quality Assurance',
      description: 'System Curriculum Quiz for Unit 4. Covers Software Testing Techniques (Black-Box, White-Box), Testing Levels (Unit, Integration, System, Acceptance), Regression Testing, and Maintenance.',
      category: category._id,
      subject: seSubject._id,
      unitName: 'Unit 4: Testing & Quality Assurance',
      isSystemQuiz: true,
      difficulty: 'hard',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 3,
      visibility: 'public',
      creator: admin._id,
      creatorModel: 'Admin',
      isPublished: true
    });

    const seU4Q = [
      { text: 'What is the fundamental difference between Black-Box and White-Box testing techniques?', options: ['Black-Box tests system functionality without knowledge of internal code structure, while White-Box tests internal code logic, control flow, and branch paths', 'Black-Box tests hardware screens only', 'White-Box testing is performed exclusively by end users', 'They are identical testing methods'], correctAnswers: ['Black-Box tests system functionality without knowledge of internal code structure, while White-Box tests internal code logic, control flow, and branch paths'], explanation: 'Black-box focuses on inputs/outputs; white-box examines internal source code paths.' },
      { text: 'Which testing level verifies that individual software units or components work correctly in isolation?', options: ['Unit Testing', 'System Testing', 'Acceptance Testing', 'Beta Testing'], correctAnswers: ['Unit Testing'], explanation: 'Unit testing tests individual functions or components in isolation.' },
      { text: 'What is Regression Testing in software maintenance?', options: ['Re-testing existing software functionality to ensure recent code changes or bug fixes have not broken previously working features', 'Testing hardware battery drain', 'Deleting database backup tables', 'Writing user documentation'], correctAnswers: ['Re-testing existing software functionality to ensure recent code changes or bug fixes have not broken previously working features'], explanation: 'Regression testing verifies that software changes do not adversely affect existing features.' },
      { text: 'In Software Quality Assurance, what is the difference between Verification and Validation (V&V)?', options: ['Verification asks "Are we building the product right?" (process checks), while Validation asks "Are we building the right product?" (user requirement checks)', 'Verification is for hardware, validation is for software', 'Validation is performed before writing code', 'Verification means deleting source code'], correctAnswers: ['Verification asks "Are we building the product right?" (process checks), while Validation asks "Are we building the right product?" (user requirement checks)'], explanation: 'Verification evaluates artifacts against specs; validation evaluates software against customer needs.' },
      { text: 'What Black-Box testing technique divides input domain data into equivalence classes to design test cases?', options: ['Equivalence Partitioning', 'Cyclomatic Complexity', 'Basis Path Testing', 'Mutation Analysis'], correctAnswers: ['Equivalence Partitioning'], explanation: 'Equivalence partitioning divides inputs into valid/invalid partitions to optimize test cases.' },
      { text: 'Which testing technique evaluates system behavior at the upper and lower boundaries of valid/invalid input ranges?', options: ['Boundary Value Analysis (BVA)', 'Stress Testing', 'Alpha Testing', 'Sanity Testing'], correctAnswers: ['Boundary Value Analysis (BVA)'], explanation: 'BVA tests values at domain boundaries where defects statistically cluster.' },
      { text: 'What is Cyclomatic Complexity in White-Box software testing analysis?', options: ['A quantitative software metric measuring the number of linearly independent paths through program control flow graph', 'CPU clock cycles per second', 'Database hard drive rotation speed', 'Number of lines of HTML CSS code'], correctAnswers: ['A quantitative software metric measuring the number of linearly independent paths through program control flow graph'], explanation: 'Thomas McCabe developed Cyclomatic Complexity to compute minimum independent path test cases.' },
      { text: 'Which type of software maintenance modifies software to correct discovered defects and errors in operational use?', options: ['Corrective Maintenance', 'Adaptive Maintenance', 'Perfective Maintenance', 'Preventive Maintenance'], correctAnswers: ['Corrective Maintenance'], explanation: 'Corrective maintenance repairs reported software bugs.' },
      { text: 'What is Integration Testing in software engineering?', options: ['Testing combined software modules together to evaluate functional interaction and interface communication', 'Testing a single isolated function', 'Testing physical power cables', 'Printing paper manuals'], correctAnswers: ['Testing combined software modules together to evaluate functional interaction and interface communication'], explanation: 'Integration testing exposes defects in interfaces and interaction between integrated units.' },
      { text: 'What is User Acceptance Testing (UAT)?', options: ['Formal testing conducted by end users/clients to evaluate system readiness for deployment and operational use', 'Automated C++ memory check', 'Compiler syntax checking', 'Server hardware rack installation'], correctAnswers: ['Formal testing conducted by end users/clients to evaluate system readiness for deployment and operational use'], explanation: 'UAT determines whether the system satisfies acceptance criteria for client sign-off.' }
    ];
    for (const q of seU4Q) await Question.create({ ...q, quizId: seU4._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // -------------------------------------------------------------
    // SUBJECT 3: WEB SERVICES (WS)
    // -------------------------------------------------------------
    let wsSubject = await Subject.findOne({ slug: 'web-services-ws' });
    if (!wsSubject) {
      wsSubject = await Subject.create({
        name: 'Web Services & Enterprise SOA (WS)',
        slug: 'web-services-ws',
        category: category._id,
        description: 'Enterprise Web Services Curriculum covering XML Schemas, SOAP, WSDL, UDDI, Conversational Services, and WS-Security'
      });
    }

    const prevWs = await Quiz.find({ subject: wsSubject._id, isSystemQuiz: true });
    for (const q of prevWs) {
      await Question.deleteMany({ quizId: q._id });
      await q.deleteOne();
    }

    // WS Unit 1
    const wsU1 = await Quiz.create({
      title: 'WS Unit 1: Introduction to Web Services & XML',
      description: 'System Curriculum Quiz for Unit 1. Covers Enterprise Web Services, XML Fundamentals (Namespaces, Schema, DOM/SAX), and Distributed Computing Evolution (CORBA, RMI, DCOM, MOM).',
      category: category._id,
      subject: wsSubject._id,
      unitName: 'Unit 1: Introduction & XML Fundamentals',
      isSystemQuiz: true,
      difficulty: 'medium',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 3,
      visibility: 'public',
      creator: admin._id,
      creatorModel: 'Admin',
      isPublished: true
    });

    const wsU1Q = [
      { text: 'What is the primary definition of a Web Service according to W3C standards?', options: ['A software system designed to support interoperable machine-to-machine interaction over a network using XML/JSON web protocols', 'A desktop wallpaper application', 'A physical Ethernet router hardware box', 'An offline Microsoft Word document'], correctAnswers: ['A software system designed to support interoperable machine-to-machine interaction over a network using XML/JSON web protocols'], explanation: 'W3C defines a Web Service as a software system designed to support machine-to-machine interaction.' },
      { text: 'In XML fundamentals, what is the role of XML Namespaces?', options: ['To provide uniquely named elements and attributes to avoid name collisions in combined XML documents', 'To format XML text in bold font', 'To compress XML file size', 'To encrypt XML passwords'], correctAnswers: ['To provide uniquely named elements and attributes to avoid name collisions in combined XML documents'], explanation: 'XML Namespaces eliminate element name conflicts.' },
      { text: 'Which XML schema language defines legal elements, data types, and structural rules for XML documents?', options: ['XSD (XML Schema Definition)', 'HTML5', 'CSS3', 'SQL DDL'], correctAnswers: ['XSD (XML Schema Definition)'], explanation: 'XSD defines structure, elements, and data types of XML documents.' },
      { text: 'What legacy distributed computing technology used Remote Procedure Calls over proprietary binary protocols in Microsoft environments?', options: ['DCOM (Distributed Component Object Model)', 'REST Web API', 'GraphQL', 'JSON-RPC'], correctAnswers: ['DCOM (Distributed Component Object Model)'], explanation: 'DCOM was Microsoft legacy distributed object technology.' },
      { text: 'What is Java RMI (Remote Method Invocation)?', options: ['A Java API that enables a Java object on one JVM to invoke methods on a Java object in another JVM', 'A database query language', 'A web browser layout engine', 'An Android touchscreen driver'], correctAnswers: ['A Java API that enables a Java object on one JVM to invoke methods on a Java object in another JVM'], explanation: 'Java RMI provides distributed object communication between JVMs.' },
      { text: 'What is the main operational advantage of Web Services over legacy distributed systems (CORBA, DCOM)?', options: ['Platform independence using standard HTTP/HTTPS protocols and open XML/JSON payloads through firewalls', 'Requires Windows OS only', 'Uses binary proprietary sockets blocked by firewalls', 'Runs without computer processors'], correctAnswers: ['Platform independence using standard HTTP/HTTPS protocols and open XML/JSON payloads through firewalls'], explanation: 'Web Services leverage open web standards (HTTP/XML) that navigate firewalls easily.' },
      { text: 'In XML parsing, what is the difference between DOM (Document Object Model) and SAX (Simple API for XML)?', options: ['DOM builds an in-memory tree structure of the full XML document, while SAX is an event-driven sequential stream parser', 'DOM is written in Python, SAX is written in HTML', 'SAX requires 100GB RAM', 'DOM cannot read XML text'], correctAnswers: ['DOM builds an in-memory tree structure of the full XML document, while SAX is an event-driven sequential stream parser'], explanation: 'DOM loads tree into memory; SAX streams events sequentially for high efficiency.' },
      { text: 'What is Message-Oriented Middleware (MOM) in enterprise systems?', options: ['Infrastructure supporting asynchronous message exchange between distributed applications via message queues', 'A video streaming player', 'A physical Ethernet cable tester', 'An email client inbox font'], correctAnswers: ['Infrastructure supporting asynchronous message exchange between distributed applications via message queues'], explanation: 'MOM provides loose coupling via asynchronous queueing.' },
      { text: 'What challenge in distributed computing is solved by adopting Service-Oriented Architecture (SOA)?', options: ['Loose coupling, high interoperability among heterogeneous systems, and reusable business services', 'Increasing hardware manufacturing costs', 'Creating offline paper spreadsheets', 'Decreasing monitor brightness'], correctAnswers: ['Loose coupling, high interoperability among heterogeneous systems, and reusable business services'], explanation: 'SOA promotes loose coupling and service reusability across heterogeneous technology stacks.' },
      { text: 'In XML documents, what makes an XML file "Well-Formed"?', options: ['It satisfies XML syntax rules (root element, matching tags, proper nesting, quoted attributes)', 'It contains no text words', 'It is stored on a flash drive', 'It is 1MB in size'], correctAnswers: ['It satisfies XML syntax rules (root element, matching tags, proper nesting, quoted attributes)'], explanation: 'Well-formed XML adheres strictly to standard XML syntax rules.' }
    ];
    for (const q of wsU1Q) await Question.create({ ...q, quizId: wsU1._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // WS Unit 2
    const wsU2 = await Quiz.create({
      title: 'WS Unit 2: Web Service Architecture, SOAP & WSDL',
      description: 'System Curriculum Quiz for Unit 2. Covers Web Service Architecture, SOAP Protocol (Structure, Encodings, RPC vs Document), WSDL Definitions, and UDDI Business Registry.',
      category: category._id,
      subject: wsSubject._id,
      unitName: 'Unit 2: Architecture, SOAP & WSDL',
      isSystemQuiz: true,
      difficulty: 'medium',
      timeLimit: 15,
      passingMarks: 6,
      maxAttempts: 3,
      visibility: 'public',
      creator: admin._id,
      creatorModel: 'Admin',
      isPublished: true
    });

    const wsU2Q = [
      { text: 'What are the three core operational roles defined in the Web Services Architecture triangle?', options: ['Service Provider, Service Requestor, and Service Registry (UDDI)', 'Database, Hard Drive, CPU', 'Client, Server, Cable', 'Teacher, Student, Admin'], correctAnswers: ['Service Provider, Service Requestor, and Service Registry (UDDI)'], explanation: 'The SOA triad consists of Provider (publishes), Requestor (binds/invokes), and Registry (finds).' },
      { text: 'What is SOAP (Simple Object Access Protocol)?', options: ['An XML-based messaging protocol specification for exchanging structured information in web services', 'A bathroom cleaning product', 'A JavaScript layout framework', 'A database table format'], correctAnswers: ['An XML-based messaging protocol specification for exchanging structured information in web services'], explanation: 'SOAP is a standardized XML messaging protocol.' },
      { text: 'What are the main elements comprising a standard SOAP Message envelope?', options: ['Envelope, Header (optional), Body, and Fault (optional)', 'HTML, CSS, JS, SQL', 'Header, Paragraph, Image, Link', 'Request, Response, Error, Exit'], correctAnswers: ['Envelope, Header (optional), Body, and Fault (optional)'], explanation: 'A SOAP message consists of Envelope, optional Header, Body, and optional Fault.' },
      { text: 'What is WSDL (Web Services Description Language)?', options: ['An XML-based language that describes web service interfaces, operations, parameters, and binding protocols', 'A database programming language', 'A stylesheet formatting language', 'A network routing command'], correctAnswers: ['WSDL (Web Services Description Language)'], explanation: 'WSDL describes web service capabilities and endpoint contracts in XML.' },
      { text: 'What is UDDI (Universal Description, Discovery, and Integration)?', options: ['An XML-based directory registry allowing enterprise web services to be published and discovered dynamically', 'A computer monitor resolution standard', 'A USB flash drive file system', 'An audio encoding format'], correctAnswers: ['An XML-based directory registry allowing enterprise web services to be published and discovered dynamically'], explanation: 'UDDI acts as an enterprise directory for web service lookup.' },
      { text: 'In WSDL 1.1 documents, what element defines the abstract set of operations and input/output messages?', options: ['<portType> (or <interface> in WSDL 2.0)', '<binding>', '<service>', '<types>'], correctAnswers: ['<portType> (or <interface> in WSDL 2.0)'], explanation: '<portType> groups web service operations and messages.' },
      { text: 'What is the main architectural difference between SOAP and RESTful Web Services?', options: ['SOAP is a strict XML protocol specification with rigid messaging contracts, whereas REST is an architectural style using standard HTTP verbs (GET, POST, PUT, DELETE) and lightweight formats (JSON/XML)', 'SOAP is faster than REST in all cases', 'REST requires XML schema validation on every request', 'SOAP cannot run over HTTP'], correctAnswers: ['SOAP is a strict XML protocol specification with rigid messaging contracts, whereas REST is an architectural style using standard HTTP verbs (GET, POST, PUT, DELETE) and lightweight formats (JSON/XML)'], explanation: 'SOAP is a formal XML protocol; REST is a architectural style over HTTP.' },
      { text: 'In SOAP message processing, what element contains error and status information returned when a web service invocation fails?', options: ['SOAP Fault element inside the Body', 'SOAP Header token', 'HTTP 200 OK wrapper', 'XML Namespace tag'], correctAnswers: ['SOAP Fault element inside the Body'], explanation: 'The <Fault> element inside SOAP Body carries exception details.' },
      { text: 'What core data structures are defined in the UDDI specification?', options: ['businessEntity, businessService, bindingTemplate, and tModel', 'Table, Row, Column, Index', 'Class, Object, Method, Field', 'Client, Router, Server, IP'], correctAnswers: ['businessEntity, businessService, bindingTemplate, and tModel'], explanation: 'UDDI data model uses businessEntity, businessService, bindingTemplate, and tModel.' },
      { text: 'In WSDL, what element specifies concrete protocol bindings (e.g. SOAP over HTTP) and data format specifications?', options: ['<binding>', '<portType>', '<types>', '<documentation>'], correctAnswers: ['<binding>'], explanation: '<binding> binds abstract portType operations to concrete transport protocols.' }
    ];
    for (const q of wsU2Q) await Question.create({ ...q, quizId: wsU2._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // WS Unit 3
    const wsU3 = await Quiz.create({
      title: 'WS Unit 3: Conversational Web Services & WS-Coordination',
      description: 'System Curriculum Quiz for Unit 3. Covers Conversational Web Services, Session State Persistence, WS-Coordination, WS-Transaction, WSCL, and Business Process Orchestration.',
      category: category._id,
      subject: wsSubject._id,
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
    });

    const wsU3Q = [
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
    ];
    for (const q of iotU3Q) await Question.create({ ...q, quizId: wsU3._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    // WS Unit 4
    const wsU4 = await Quiz.create({
      title: 'WS Unit 4: Web Services Security & Mobile Integration',
      description: 'System Curriculum Quiz for Unit 4. Covers Security Attacks, WS-Security (XML Encryption, XML Signature, SAML), Mobile Web Services, J2ME/Android Integration, and Apache Axis/Tomcat Deployment.',
      category: category._id,
      subject: wsSubject._id,
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
    });

    const wsU4Q = [
      { text: 'What is WS-Security (Web Services Security)?', options: ['A flexible, XML-based security standard providing message integrity, message confidentiality, and security token propagation (XML Encryption, Digital Signatures)', 'A desktop antivirus software', 'A physical door lock', 'A Wi-Fi router brand'], correctAnswers: ['A flexible, XML-based security standard providing message integrity, message confidentiality, and security token propagation (XML Encryption, Digital Signatures)'], explanation: 'WS-Security provides end-to-end security at the message layer.' },
      { text: 'What is the primary advantage of Message-Level Security (WS-Security) over Transport-Level Security (HTTPS/SSL)?', options: ['Provides end-to-end security across multi-hop intermediary proxy nodes, securing specific XML elements independently', 'HTTPS is obsolete and no longer works', 'WS-Security requires no mathematical encryption', 'HTTPS works only on mobile phones'], correctAnswers: ['Provides end-to-end security across multi-hop intermediary proxy nodes, securing specific XML elements independently'], explanation: 'Message-level security persists security across intermediate application hops, whereas SSL/TLS terminates at each hop.' },
      { text: 'Which XML standard is used in WS-Security to verify sender identity and ensure payload content has not been tampered with?', options: ['XML Signature (W3C XMLDsig)', 'XML CSS Parser', 'HTML5 Canvas', 'JSON Schema'], correctAnswers: ['XML Signature (W3C XMLDsig)'], explanation: 'XML Signature provides digital signing for data integrity and non-repudiation.' },
      { text: 'What standard XML framework is used for exchanging authentication and authorization assertions between security domains?', options: ['SAML (Security Assertion Markup Language)', 'SMTP', 'FTP', 'SQL DML'], correctAnswers: ['SAML (Security Assertion Markup Language)'], explanation: 'SAML passes security assertions between identity providers and service providers.' },
      { text: 'What is a major challenge when invoking enterprise SOAP web services from mobile and wireless devices?', options: ['Constrained battery life, limited processing power, memory restrictions, and intermittent network bandwidth', 'Mobile devices cannot connect to the internet', 'Mobile screens cannot display text', 'Wireless signals delete XML files'], correctAnswers: ['Constrained battery life, limited processing power, memory restrictions, and intermittent network bandwidth'], explanation: 'Mobile Web Services face hardware constraints and wireless network variability.' },
      { text: 'In mobile web service architectures, how does a Proxy-Based Mobile Web Service Gateway assist mobile clients?', options: ['Translates heavy SOAP XML messages into lightweight binary/JSON data and handles heavy encryption on behalf of mobile devices', 'Powers the mobile battery wirelessly', 'Manufactures SIM cards', 'Prints paper receipts'], correctAnswers: ['Translates heavy SOAP XML messages into lightweight binary/JSON data and handles heavy encryption on behalf of mobile devices'], explanation: 'Mobile gateways offload XML parsing and heavy cryptographic processing.' },
      { text: 'What attack vector involves an unauthorized attacker intercepting, modifying, or replaying XML web service messages?', options: ['Man-in-the-Middle (MitM) & Replay Attack', 'Hardware RAM failure', 'Monitor burn-in', 'Printer paper jam'], correctAnswers: ['Man-in-the-Middle (MitM) & Replay Attack'], explanation: 'MitM and replay attacks compromise un-signed or un-encrypted message streams.' },
      { text: 'Which open-source Java servlet container and SOAP server combination was historically widely used to deploy SOAP web services?', options: ['Apache Tomcat Application Server & Apache Axis / CXF', 'Microsoft Paint & Notepad', 'Adobe Photoshop & Flash', 'VLC Media Player'], correctAnswers: ['Apache Tomcat Application Server & Apache Axis / CXF'], explanation: 'Tomcat and Apache Axis formed the standard Java SOAP web service deployment environment.' },
      { text: 'What WS-Security mechanism protects sensitive XML element data from unauthorized viewing by encrypting specific nodes?', options: ['XML Encryption (W3C XMLEnc)', 'XML Schema Validator', 'HTML Table border', 'CSS Color property'], correctAnswers: ['XML Encryption (W3C XMLEnc)'], explanation: 'XML Encryption encrypts specific elements or full XML payloads.' },
      { text: 'What security token type can be inserted into a WS-Security header to authenticate a user using username and hashed password digest?', options: ['UsernameToken', 'MP3 Audio Tag', 'Cookie File', 'Bluetooth Pin'], correctAnswers: ['UsernameToken'], explanation: 'UsernameToken passes user credentials and password digests in WS-Security headers.' }
    ];
    for (const q of wsU4Q) await Question.create({ ...q, quizId: wsU4._id, type: 'mcq', marks: 1, negativeMarks: 0.25 });

    console.log('🎉 ALL 3 SUBJECTS (IoT, SE, WS) & 12 UNIT QUIZZES WITH 120 QUESTIONS SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding all subjects quizzes:', err);
    process.exit(1);
  }
};

seedAllSubjectsQuizzes();
