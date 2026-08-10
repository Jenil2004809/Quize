const mongoose = require('mongoose');
const Category = require('../models/Category');
const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const seedIotQuizzes = async () => {
  try {
    await connectDB();
    console.log('🚀 SEEDING SYSTEM CURRICULUM IOT UNIT QUIZZES...');

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

    // 2. Ensure Category "Computer Science / Engineering"
    let category = await Category.findOne({ slug: 'computer-science-engineering' });
    if (!category) {
      category = await Category.create({
        name: 'Computer Science / Engineering',
        slug: 'computer-science-engineering',
        description: 'Core Engineering and Computer Science Curriculum Modules'
      });
    }

    // 3. Ensure Subject "Internet of Things (IoT)"
    let subject = await Subject.findOne({ slug: 'internet-of-things-iot' });
    if (!subject) {
      subject = await Subject.create({
        name: 'Internet of Things (IoT)',
        slug: 'internet-of-things-iot',
        category: category._id,
        description: 'Comprehensive IoT Curriculum covering Protocols, Sensors, Arduino, WSN & Cloud Integration'
      });
    }

    // 4. Clear any previous system IoT quizzes to re-seed cleanly
    const existingIotQuizzes = await Quiz.find({ subject: subject._id, isSystemQuiz: true });
    for (const q of existingIotQuizzes) {
      await Question.deleteMany({ quizId: q._id });
      await q.deleteOne();
    }

    // --- UNIT 1 DATA ---
    const unit1Quiz = await Quiz.create({
      title: 'IoT Unit 1: Introduction to IoT & Communication Protocols',
      description: 'System Curriculum Quiz for Unit 1. Covers Physical & Logical IoT Architecture, Network Layer Protocols (IPv6, 6LoWPAN), Transport Layer (TCP, UDP), and Application Layer Protocols (MQTT, CoAP, AMQP).',
      category: category._id,
      subject: subject._id,
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

    const unit1Questions = [
      {
        text: 'What is the core technical definition of the Internet of Things (IoT)?',
        options: [
          'A global network of physical objects embedded with sensors, software, and connectivity to exchange data',
          'A standalone desktop operating system with no network interfaces',
          'A closed local ethernet network connecting only desktop printers',
          'A central database server architecture used exclusively for offline data storage'
        ],
        correctAnswers: ['A global network of physical objects embedded with sensors, software, and connectivity to exchange data'],
        explanation: 'IoT is a network of physical devices embedded with electronics, software, sensors, and network connectivity allowing data collection and exchange.'
      },
      {
        text: 'Which application layer protocol is lightweight, uses a Publish-Subscribe architecture, and is specifically optimized for constrained IoT networks?',
        options: [
          'MQTT (Message Queuing Telemetry Transport)',
          'HTTP/1.1 REST Web Services',
          'FTP (File Transfer Protocol)',
          'POP3 Mail Protocol'
        ],
        correctAnswers: ['MQTT (Message Queuing Telemetry Transport)'],
        explanation: 'MQTT is a publish-subscribe protocol ideal for resource-constrained IoT devices due to its minimal packet overhead.'
      },
      {
        text: 'Which Network Layer protocol enables IPv6 packets to be transmitted over low-power IEEE 802.15.4 wireless networks?',
        options: [
          '6LoWPAN',
          'Standard TCP/IP',
          'DHCP Server',
          'NAT Gateway'
        ],
        correctAnswers: ['6LoWPAN'],
        explanation: '6LoWPAN (IPv6 over Low-Power Wireless Personal Area Networks) enables IPv6 encapsulation for constrained wireless devices.'
      },
      {
        text: 'In IoT system architectures, what is the primary role of an Edge Analytics Gateway?',
        options: [
          'Process and filter sensor data locally near the source to minimize latency and bandwidth consumption',
          'Charge the physical batteries of sensor nodes wirelessly',
          'Store hard copy paper documents',
          'Perform manual teacher grading on paper answer sheets'
        ],
        correctAnswers: ['Process and filter sensor data locally near the source to minimize latency and bandwidth consumption'],
        explanation: 'Edge gateways perform local data processing and analytics near sensors before transmitting filtered insights to cloud servers.'
      },
      {
        text: 'Which protocol operates over UDP and is designed as a lightweight RESTful web transfer protocol for constrained nodes?',
        options: [
          'CoAP (Constrained Application Protocol)',
          'HTTPS',
          'SMTP',
          'SSH'
        ],
        correctAnswers: ['CoAP (Constrained Application Protocol)'],
        explanation: 'CoAP is designed for constrained devices over UDP, translating easily to HTTP for web integration.'
      },
      {
        text: 'In IoT Deployment Templates, Template 1 (Single Device Deployment) represents which processing flow?',
        options: [
          'Sensor → Microcontroller → User Interface',
          'Multiple Gateways → Supercomputer → Satellite',
          'Cloud Server → Distributed Database → Drone',
          'Blockchain → Smart Contract → Physical Relay'
        ],
        correctAnswers: ['Sensor → Microcontroller → User Interface'],
        explanation: 'Template 1 defines standalone deployment where a single sensor connects directly to a microcontroller and local UI.'
      },
      {
        text: 'Which of the following is a Transport Layer protocol widely used in IoT for low-overhead, connectionless data transmission?',
        options: [
          'UDP (User Datagram Protocol)',
          'HTTP',
          'HTML5',
          'JSON Schema'
        ],
        correctAnswers: ['UDP (User Datagram Protocol)'],
        explanation: 'UDP provides low-latency, connectionless transport without handshake overhead, making it ideal for real-time sensor streams.'
      },
      {
        text: 'What is a fundamental requirement for IoT communication protocols in resource-constrained environments?',
        options: [
          'Low power consumption, small header overhead, and resilience against intermittent connectivity',
          'High gigabit bandwidth requirements and AC mains power',
          'Constant manual user interaction for every packet transmitted',
          'Requirement of 64GB RAM per sensor node'
        ],
        correctAnswers: ['Low power consumption, small header overhead, and resilience against intermittent connectivity'],
        explanation: 'IoT protocols must be lightweight, energy-efficient, and capable of operating under restricted bandwidth and battery power.'
      },
      {
        text: 'AMQP (Advanced Message Queuing Protocol) operates at which layer of the IoT protocol stack?',
        options: [
          'Application Layer',
          'Physical Layer',
          'Data Link Layer',
          'Hardware Layer'
        ],
        correctAnswers: ['Application Layer'],
        explanation: 'AMQP is an open-standard Application Layer protocol for message-oriented middleware.'
      },
      {
        text: 'What differentiates IoT from traditional M2M (Machine-to-Machine) communication?',
        options: [
          'IoT relies on open IP-based cloud networks and scalable standards, while legacy M2M uses isolated point-to-point hardware links',
          'IoT does not use sensors or actuators',
          'M2M is only used for smartphone gaming',
          'M2M does not require electricity'
        ],
        correctAnswers: ['IoT relies on open IP-based cloud networks and scalable standards, while legacy M2M uses isolated point-to-point hardware links'],
        explanation: 'IoT integrates machine data into open web and cloud ecosystems, whereas legacy M2M relies on proprietary isolated connections.'
      }
    ];

    for (const q of unit1Questions) {
      await Question.create({
        quizId: unit1Quiz._id,
        type: 'mcq',
        text: q.text,
        options: q.options,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
        marks: 1,
        negativeMarks: 0.25
      });
    }

    // --- UNIT 2 DATA ---
    const unit2Quiz = await Quiz.create({
      title: 'IoT Unit 2: Sensors, Microcontrollers & Hardware Interfacing',
      description: 'System Curriculum Quiz for Unit 2. Covers Microcontroller Architectures (ATmega328P, PIC, 8051), Arduino Uno Hardware Pinouts, Sensors (DHT11, PIR, HC-SR04, MQ-2), and ADC Interfacing.',
      category: category._id,
      subject: subject._id,
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

    const unit2Questions = [
      {
        text: 'Which 8-bit AVR microcontroller IC is embedded at the core of the Arduino Uno development board?',
        options: [
          'ATmega328P',
          'Intel Core i7',
          'PIC16F877A',
          'ARM Cortex-A72'
        ],
        correctAnswers: ['ATmega328P'],
        explanation: 'The Arduino Uno board uses Microchip ATmega328P 8-bit AVR microcontroller.'
      },
      {
        text: 'What is the standard operating voltage level of the ATmega328P microcontroller on an Arduino Uno board?',
        options: [
          '5V DC',
          '24V AC',
          '120V AC',
          '0.5V DC'
        ],
        correctAnswers: ['5V DC'],
        explanation: 'Arduino Uno operating voltage is 5V DC.'
      },
      {
        text: 'What type of environmental parameters is the MQ-2 sensor module designed to measure in IoT systems?',
        options: [
          'Combustible Gas and Smoke Concentration',
          'Water Flow Rate and Hydrostatic Pressure',
          'Ultrasonic Echo Timing for Obstacle Distances',
          'Soil Moisture and pH levels'
        ],
        correctAnswers: ['Combustible Gas and Smoke Concentration'],
        explanation: 'MQ-2 is a semiconductor gas sensor used to detect LPG, smoke, alcohol, propane, and hydrogen.'
      },
      {
        text: 'How does an HC-SR04 Ultrasonic Sensor measure distance to an obstacle?',
        options: [
          'Emits an 40kHz ultrasonic sound burst and calculates distance based on time of flight for the echo to return',
          'Reads ambient infrared light reflection intensity',
          'Measures magnetic field fluctuations',
          'Detects surface temperature changes using thermal camera'
        ],
        correctAnswers: ['Emits an 40kHz ultrasonic sound burst and calculates distance based on time of flight for the echo to return'],
        explanation: 'HC-SR04 calculates distance by transmitting ultrasonic waves and measuring the echo delay time: Distance = (Time × Sound Speed) / 2.'
      },
      {
        text: 'Which sensor module is specifically designed for passive infrared human motion detection?',
        options: [
          'PIR Motion Sensor (HC-SR501)',
          'DHT11 Temperature Sensor',
          'LDR Photoresistor',
          'MPU6050 Accelerometer'
        ],
        correctAnswers: ['PIR Motion Sensor (HC-SR501)'],
        explanation: 'PIR (Passive Infrared) sensors measure IR light radiating from objects in their field of view to detect human motion.'
      },
      {
        text: 'In microcontrollers, what is the primary function of an ADC (Analog-to-Digital Converter)?',
        options: [
          'Converts continuous analog sensor voltage signals into discrete digital values for CPU processing',
          'Amplifies audio output signals for loudspeakers',
          'Increases the main CPU clock frequency dynamically',
          'Stores permanent flash memory code'
        ],
        correctAnswers: ['Converts continuous analog sensor voltage signals into discrete digital values for CPU processing'],
        explanation: 'ADCs convert continuous analog voltage inputs (0-5V) into digital numbers (e.g. 0-1023).'
      },
      {
        text: 'How many digital I/O pins are available on a standard Arduino Uno board?',
        options: [
          '14 Digital Pins (with 6 providing PWM output)',
          '40 Pins',
          '2 Pins',
          '100 Pins'
        ],
        correctAnswers: ['14 Digital Pins (with 6 providing PWM output)'],
        explanation: 'Arduino Uno features 14 digital input/output pins (pins 0-13), of which pins 3, 5, 6, 9, 10, and 11 support PWM output.'
      },
      {
        text: 'What is the resolution of the built-in ADC on the ATmega328P microcontroller?',
        options: [
          '10-bit resolution (maps 0-5V to 0-1023 integer steps)',
          '2-bit resolution',
          '64-bit resolution',
          '1-bit resolution'
        ],
        correctAnswers: ['10-bit resolution (maps 0-5V to 0-1023 integer steps)'],
        explanation: 'ATmega328P has a 10-bit ADC, providing $2^{10} = 1024$ discrete digital levels.'
      },
      {
        text: 'Which component is mandatory when interfacing a 5V electromagnetic relay module with a microcontroller to protect against back-EMF voltage spikes?',
        options: [
          'Flyback (Freewheeling) Diode connected in reverse parallel across the relay coil',
          'Step-down Transformer',
          'Electric Heating Element',
          'Quartz Crystal Oscillator'
        ],
        correctAnswers: ['Flyback (Freewheeling) Diode connected in reverse parallel across the relay coil'],
        explanation: 'A flyback diode eliminates flyback voltage spikes created when the relay inductive coil is de-energized.'
      },
      {
        text: 'Which microcontrollers belong to the Microchip PIC family?',
        options: [
          'PIC16F877A & PIC18F452',
          'ATmega328P & ATmega16',
          '8051 & 8086',
          'STM32F407'
        ],
        correctAnswers: ['PIC16F877A & PIC18F452'],
        explanation: 'PIC16F877A and PIC18F452 are popular microcontrollers manufactured by Microchip Technology in the PIC family.'
      }
    ];

    for (const q of unit2Questions) {
      await Question.create({
        quizId: unit2Quiz._id,
        type: 'mcq',
        text: q.text,
        options: q.options,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
        marks: 1,
        negativeMarks: 0.25
      });
    }

    // --- UNIT 3 DATA ---
    const unit3Quiz = await Quiz.create({
      title: 'IoT Unit 3: Arduino C++ Library Functions & Serial Programming',
      description: 'System Curriculum Quiz for Unit 3. Covers I/O Library Functions (pinMode, digitalWrite, digitalRead, analogRead, analogWrite), Serial Communication (Serial.begin, Serial.println), and Hardware Timers.',
      category: category._id,
      subject: subject._id,
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

    const unit3Questions = [
      {
        text: 'What is the purpose of the pinMode(pin, mode) function in Arduino C++ programming?',
        options: [
          'Configures a specific digital pin to act as an INPUT, OUTPUT, or INPUT_PULLUP',
          'Measures analog AC voltage',
          'Deletes memory from flash storage',
          'Formats the SD card module'
        ],
        correctAnswers: ['Configures a specific digital pin to act as an INPUT, OUTPUT, or INPUT_PULLUP'],
        explanation: 'pinMode() configures the specified pin to behave as an input or output pin.'
      },
      {
        text: 'Which function is used to read an analog voltage value from Arduino analog pins A0 through A5?',
        options: [
          'analogRead(pin)',
          'digitalRead(pin)',
          'pinMode(pin)',
          'Serial.read()'
        ],
        correctAnswers: ['analogRead(pin)'],
        explanation: 'analogRead() reads the value from the specified analog pin (10-bit ADC mapping 0-5V to 0-1023).'
      },
      {
        text: 'What range of digital values does analogRead() return on an Arduino Uno board?',
        options: [
          '0 to 1023',
          '0 to 255',
          '0 to 1',
          '-128 to 127'
        ],
        correctAnswers: ['0 to 1023'],
        explanation: '10-bit ADC yields $2^{10} = 1024$ possible values ranging from 0 to 1023.'
      },
      {
        text: 'Which function outputs a Pulse Width Modulation (PWM) signal to a PWM-enabled digital pin?',
        options: [
          'analogWrite(pin, value)',
          'digitalWrite(pin, value)',
          'pwmStart(pin)',
          'shiftOut(pin)'
        ],
        correctAnswers: ['analogWrite(pin, value)'],
        explanation: 'analogWrite() writes an analog value (PWM wave) to a PWM pin.'
      },
      {
        text: 'What range of duty cycle values is accepted by analogWrite(pin, value)?',
        options: [
          '0 to 255 (0 = 0% duty cycle / 0V, 255 = 100% duty cycle / 5V)',
          '0 to 1023',
          '0 to 10000',
          '1 to 12'
        ],
        correctAnswers: ['0 to 255 (0 = 0% duty cycle / 0V, 255 = 100% duty cycle / 5V)'],
        explanation: 'analogWrite() duty cycle value is specified as an 8-bit integer between 0 and 255.'
      },
      {
        text: 'Which Arduino code statement initializes serial communication at a baud rate of 9600 bits per second?',
        options: [
          'Serial.begin(9600);',
          'Serial.open(9600);',
          'Serial.start(9600);',
          'Baud.set(9600);'
        ],
        correctAnswers: ['Serial.begin(9600);'],
        explanation: 'Serial.begin(speed) sets the data rate in bits per second (baud) for serial data transmission.'
      },
      {
        text: 'What is the primary operational difference between digitalRead(pin) and analogRead(pin)?',
        options: [
          'digitalRead returns discrete binary states HIGH (1) or LOW (0), whereas analogRead returns continuous integer values from 0 to 1023',
          'digitalRead measures temperature directly',
          'analogRead works only on digital pins 0 to 13',
          'They perform identical tasks'
        ],
        correctAnswers: ['digitalRead returns discrete binary states HIGH (1) or LOW (0), whereas analogRead returns continuous integer values from 0 to 1023'],
        explanation: 'digitalRead is binary (HIGH/LOW), while analogRead converts analog voltages using 10-bit ADC.'
      },
      {
        text: 'In Arduino programming, what is the role of the setup() function?',
        options: [
          'Executes exactly once when the board powers up or resets to initialize pin modes and start libraries',
          'Loops infinitely until powered off',
          'Translates C++ code into Python',
          'Generates random numbers continuously'
        ],
        correctAnswers: ['Executes exactly once when the board powers up or resets to initialize pin modes and start libraries'],
        explanation: 'The setup() function is called once when the sketch starts to initialize variables, pin modes, and libraries.'
      },
      {
        text: 'Which library function causes the microcontroller to pause program execution for a specified duration in milliseconds?',
        options: [
          'delay(ms)',
          'pause(ms)',
          'sleep(ms)',
          'wait(ms)'
        ],
        correctAnswers: ['delay(ms)'],
        explanation: 'delay(ms) pauses the program for the amount of time (in milliseconds) specified as parameter.'
      },
      {
        text: 'Which statement correctly prints data to the Arduino Serial Monitor followed by a carriage return and new line?',
        options: [
          'Serial.println(data);',
          'Serial.print(data);',
          'Console.log(data);',
          'printf(data);'
        ],
        correctAnswers: ['Serial.println(data);'],
        explanation: 'Serial.println() prints data to the serial port as human-readable ASCII text followed by a carriage return character (\r) and newline character (\n).'
      }
    ];

    for (const q of unit3Questions) {
      await Question.create({
        quizId: unit3Quiz._id,
        type: 'mcq',
        text: q.text,
        options: q.options,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
        marks: 1,
        negativeMarks: 0.25
      });
    }

    // --- UNIT 4 DATA ---
    const unit4Quiz = await Quiz.create({
      title: 'IoT Unit 4: Wireless Sensor Networks, Cloud & Edge Technologies',
      description: 'System Curriculum Quiz for Unit 4. Covers Wireless Sensor Networks (WSN, Base Station, Sink Node), Communication Standards (Zigbee, BLE, RFID), and Cloud/Edge/Fog Computing architectures.',
      category: category._id,
      subject: subject._id,
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

    const unit4Questions = [
      {
        text: 'What is a Wireless Sensor Network (WSN) in IoT enabling technologies?',
        options: [
          'A collection of low-cost, low-power sensor nodes deployed to monitor environmental conditions and transmit data wirelessly to a Base Station',
          'A single standalone desktop workstation connected via fiber optic cable',
          'A high-power television broadcast satellite dish',
          'A physical Ethernet cable network connecting office printers'
        ],
        correctAnswers: ['A collection of low-cost, low-power sensor nodes deployed to monitor environmental conditions and transmit data wirelessly to a Base Station'],
        explanation: 'WSNs consist of spatially distributed autonomous sensor nodes to monitor physical or environmental conditions.'
      },
      {
        text: 'In a Wireless Sensor Network, what is the primary role of the Base Station (Sink Node)?',
        options: [
          'Collects data from distributed sensor nodes and forwards it to cloud servers or central management units',
          'Powers sensor nodes wirelessly',
          'Manufactures microcontroller chips',
          'Acts as a solar collector'
        ],
        correctAnswers: ['Collects data from distributed sensor nodes and forwards it to cloud servers or central management units'],
        explanation: 'The Base Station serves as a gateway between sensor nodes and external network infrastructure/cloud.'
      },
      {
        text: 'Which low-power, short-range wireless networking standard based on IEEE 802.15.4 is widely used in WSNs for mesh automation?',
        options: [
          'Zigbee',
          '5G Cellular NR',
          'Fiber Optic Cable',
          'Geostationary Satellite Transponder'
        ],
        correctAnswers: ['Zigbee'],
        explanation: 'Zigbee is an IEEE 802.15.4-based specification for high-level communication protocols used to create personal area networks with small, low-power digital radios.'
      },
      {
        text: 'What is Edge Computing in an enterprise IoT system architecture?',
        options: [
          'Performing data processing, analytics, and filtering locally near the data source at the network edge to reduce cloud latency',
          'Storing files on legacy floppy disks',
          'Running servers underground',
          'Printing paper reports for manual filing'
        ],
        correctAnswers: ['Performing data processing, analytics, and filtering locally near the data source at the network edge to reduce cloud latency'],
        explanation: 'Edge computing brings computation and data storage closer to the devices where data is gathered, rather than relying on a central location.'
      },
      {
        text: 'What is the key operational advantage of Fog Computing positioned between IoT edge devices and Cloud data centers?',
        options: [
          'Reduces network latency, saves bandwidth, and provides real-time response for critical local decision-making',
          'Increases power consumption',
          'Replaces physical hardware sensors',
          'Requires manual paper delivery'
        ],
        correctAnswers: ['Reduces network latency, saves bandwidth, and provides real-time response for critical local decision-making'],
        explanation: 'Fog computing extends cloud computing to the edge of an enterprise network to process time-sensitive data locally.'
      },
      {
        text: 'Which technology uses radio-frequency electromagnetic fields to identify and track tags attached to physical objects automatically?',
        options: [
          'RFID (Radio-Frequency Identification)',
          'HDMI Video Output',
          'VGA Interface',
          'USB 3.0 Bus'
        ],
        correctAnswers: ['RFID (Radio-Frequency Identification)'],
        explanation: 'RFID uses electromagnetic fields to automatically identify and track tags attached to objects.'
      },
      {
        text: 'What is a key advantage of Bluetooth Low Energy (BLE) compared to classic Bluetooth in IoT applications?',
        options: [
          'Significantly reduced power consumption, allowing sensors to run for years on small coin-cell batteries',
          'Requires constant 220V AC power supply',
          'Transmits raw uncompressed 4K video streams',
          'Operates exclusively underwater'
        ],
        correctAnswers: ['Significantly reduced power consumption, allowing sensors to run for years on small coin-cell batteries'],
        explanation: 'BLE is optimized for low duty-cycle, low-power communications, extending battery life significantly.'
      },
      {
        text: 'What is a defining feature of self-organizing Wireless Sensor Networks (WSNs)?',
        options: [
          'Nodes automatically discover neighbors and form dynamic multi-hop routing paths without manual configuration',
          'Requires manual IP address configuration for every node',
          'Nodes cannot change their positions',
          'Requires physical Ethernet cabling between nodes'
        ],
        correctAnswers: ['Nodes automatically discover neighbors and form dynamic multi-hop routing paths without manual configuration'],
        explanation: 'Self-organizing WSNs can establish wireless links and adapt topology dynamically as nodes join or fail.'
      },
      {
        text: 'In Cloud IoT platforms, what is the main benefit of cloud analytics services?',
        options: [
          'Scalable long-term data storage, complex machine learning processing, and global dashboard visualizations',
          'Replaces physical microcontrollers',
          'Slows down network communications',
          'Deletes historical telemetry'
        ],
        correctAnswers: ['Scalable long-term data storage, complex machine learning processing, and global dashboard visualizations'],
        explanation: 'Cloud platforms provide massive storage capacity and compute power to run analytics algorithms across huge datasets.'
      },
      {
        text: 'Which of the following represents the combination of core IoT enabling technologies?',
        options: [
          'Wireless Sensor Networks, RFID, Cloud/Edge Computing, and Embedded Microcontrollers',
          'Manual typewriters and paper carbon sheets',
          'Analog landline telephones',
          'Pneumatic message tubes'
        ],
        correctAnswers: ['Wireless Sensor Networks, RFID, Cloud/Edge Computing, and Embedded Microcontrollers'],
        explanation: 'WSN, RFID, Cloud/Edge Computing, and Microcontrollers form the foundation of modern IoT systems.'
      }
    ];

    for (const q of unit4Questions) {
      await Question.create({
        quizId: unit4Quiz._id,
        type: 'mcq',
        text: q.text,
        options: q.options,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
        marks: 1,
        negativeMarks: 0.25
      });
    }

    console.log('🎉 ALL 4 IOT UNIT QUIZZES & 40 QUESTIONS SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding IoT quizzes:', err);
    process.exit(1);
  }
};

seedIotQuizzes();
