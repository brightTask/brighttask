'use strict';

const getRandomInstructor = () => Math.floor(Math.random() * 50) + 1;

module.exports = {
  async up(queryInterface, Sequelize) {
    const courses = [
      {
        name: 'Modern JavaScript Bootcamp',
        categoryId: 1,
        courseCode: 'WD101',
        image: 'https://plus.unsplash.com/premium_photo-1675793715030-0584c8ec4a13?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'Modern JavaScript Bootcamp',
        price: 49.99
      },
      {
        name: 'React & Next.js for Beginners',
        categoryId: 1,
        courseCode: 'WD102',
        image: 'https://images.unsplash.com/photo-1600290239653-029f10d8b38d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fE1vZGVybiUyMEphdmFTY3JpcHQlMjBCb290Y2FtcHxlbnwwfHwwfHx8MA%3D%3D',
        title: 'React & Next.js for Beginners',
        price: 59.99
      },
      {
        name: 'Node.js and Express API Development',
        categoryId: 1,
        courseCode: 'WD103',
        image: 'https://images.unsplash.com/photo-1600290239653-029f10d8b38d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fE1vZGVybiUyMEphdmFTY3JpcHQlMjBCb290Y2FtcHxlbnwwfHwwfHx8MA%3D%3D',
        title: 'Node.js and Express API Development',
        price: 54.99
      },
      {
        name: 'Python for Data Science',
        categoryId: 2,
        courseCode: 'DS201',
        image: 'https://images.unsplash.com/photo-1561886362-a2b38ce83470?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fE1vZGVybiUyMEphdmFTY3JpcHQlMjBCb290Y2FtcHxlbnwwfHwwfHx8MA%3D%3D',
        title: 'Python for Data Science',
        price: 69.99
      },
      {
        name: 'Machine Learning Essentials',
        categoryId: 2,
        courseCode: 'DS202',
        image: 'https://plus.unsplash.com/premium_photo-1675793715030-0584c8ec4a13?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'Machine Learning Essentials',
        price: 79.99
      },
      {
        name: 'Data Visualization with Tableau',
        categoryId: 2,
        courseCode: 'DS203',
        image: 'https://images.unsplash.com/photo-1561886362-a2b38ce83470?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fE1vZGVybiUyMEphdmFTY3JpcHQlMjBCb290Y2FtcHxlbnwwfHwwfHx8MA%3D%3D',
        title: 'Data Visualization with Tableau',
        price: 39.99
      },
      {
        name: 'Flutter App Development',
        categoryId: 3,
        courseCode: 'MD301',
        image: 'https://plus.unsplash.com/premium_photo-1663040543387-cb7c78c4f012?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'Flutter App Development',
        price: 44.99
      },
      {
        name: 'React Native Crash Course',
        categoryId: 3,
        courseCode: 'MD302',
        image: 'https://plus.unsplash.com/premium_photo-1663040543387-cb7c78c4f012?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'React Native Crash Course',
        price: 49.99
      },
      {
        name: 'Kotlin for Android Developers',
        categoryId: 3,
        courseCode: 'MD303',
        image: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'Kotlin for Android Developers',
        price: 59.99
      },
      {
        name: 'Ethical Hacking Basics',
        categoryId: 4,
        courseCode: 'CY401',
        image: 'https://plus.unsplash.com/premium_photo-1675793715030-0584c8ec4a13?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'Ethical Hacking Basics',
        price: 64.99
      },
      {
        name: 'Network Security Fundamentals',
        categoryId: 4,
        courseCode: 'CY402',
        image: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'Network Security Fundamentals',
        price: 59.99
      },
      {
        name: 'Cybersecurity Risk Management',
        categoryId: 4,
        courseCode: 'CY403',
        image: 'https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'Cybersecurity Risk Management',
        price: 69.99
      },
      {
        name: 'AWS Certified Cloud Practitioner',
        categoryId: 5,
        courseCode: 'CC501',
        image: 'https://plus.unsplash.com/premium_photo-1675793715030-0584c8ec4a13?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'AWS Certified Cloud Practitioner',
        price: 74.99
      },
      {
        name: 'DevOps with Docker and Kubernetes',
        categoryId: 5,
        courseCode: 'CC502',
        image: 'https://images.unsplash.com/photo-1649451844813-3130d6f42f8a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'DevOps with Docker and Kubernetes',
        price: 84.99
      },
      {
        name: 'Google Cloud Platform (GCP) Essentials',
        categoryId: 5,
        courseCode: 'CC503',
        image: 'https://plus.unsplash.com/premium_photo-1675793715030-0584c8ec4a13?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TW9kZXJuJTIwSmF2YVNjcmlwdCUyMEJvb3RjYW1wfGVufDB8fDB8fHww',
        title: 'Google Cloud Platform (GCP) Essentials',
        price: 64.99
      }
    ];

    const requirementsMap = {
      1: [
        { name: 'Laptop', description: 'A modern computer', mandatory: true },
        { name: 'Internet', description: 'Reliable internet connection', mandatory: true }
      ],
      2: [
        { name: 'JavaScript Knowledge', description: 'Basics of JS required', mandatory: true }
      ],
      3: [
        { name: 'Terminal', description: 'Basic terminal skills', mandatory: false }
      ],
      4: [
        { name: 'Python Installed', description: 'Python 3.8 or later', mandatory: true }
      ],
      5: [
        { name: 'Math Basics', description: 'Algebra and statistics', mandatory: true }
      ],
      6: [
        { name: 'Tableau Installed', description: 'Free or Pro version', mandatory: false }
      ],
      7: [
        { name: 'Flutter SDK', description: 'Install Flutter', mandatory: true }
      ],
      8: [
        { name: 'Node.js', description: 'Installed on your system', mandatory: true }
      ],
      9: [
        { name: 'Android Studio', description: 'Installed IDE', mandatory: true }
      ],
      10: [
        { name: 'Kali Linux', description: 'Recommended environment', mandatory: false }
      ],
      11: [
        { name: 'Networking Basics', description: 'IP, DNS, TCP/IP knowledge', mandatory: true }
      ],
      12: [
        { name: 'Security Frameworks', description: 'Familiarity with NIST or ISO', mandatory: false }
      ],
      13: [
        { name: 'AWS Account', description: 'Free-tier account', mandatory: true }
      ],
      14: [
        { name: 'Basic Linux', description: 'Shell and terminal commands', mandatory: true }
      ],
      15: [
        { name: 'GCP Free Tier', description: 'Google account required', mandatory: true }
      ]
    };

    const data = courses.map((course, index) => ({
      id: index + 1,
      ...course,
      instructorId: getRandomInstructor(),
      requirements: JSON.stringify(requirementsMap[index + 1]),
      approved: true,
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('Courses', data);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Courses', null, {});
  }
};
