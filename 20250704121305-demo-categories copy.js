'use strict';

const categoryId = 4;
let services = [
  {
    name: "Android App Development",
    description: "Design and build custom Android apps using Java, Kotlin, or cross-platform frameworks. Includes UI/UX, backend integration, and deployment to Google Play Store.",
    price: 15000,
    priceUnit: "KES",
    order: 1,
    categoryId,
    icon: "https://plus.unsplash.com/premium_photo-1661326290415-2bfb306b35d5?w=294&dpr=1&h=294&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXRodW1ibmFpbHx8b2daNE5DT09WTlV8fGVufDB8fHx8fA%3D%3D",
    available: true,
    requirements: [
      {
        name: "Android Development Skills",
        description: "Proficiency in Java/Kotlin or Flutter/React Native.",
        mandatory: true
      },
      {
        name: "UI/UX Design Knowledge",
        description: "Ability to design mobile-friendly interfaces.",
        mandatory: true
      },
      {
        name: "Google Play Console Account",
        description: "Must be able to publish apps to the Play Store.",
        mandatory: false
      },
      {
        name: "Testing & Debugging Tools",
        description: "Knowledge of emulators, logcat, and crash reports.",
        mandatory: true
      }
    ]
  },
  {
    name: "iOS App Development",
    description: "Create powerful and elegant iOS apps using Swift or cross-platform tools. Service includes UI design, iOS optimization, and App Store submission.",
    price: 18000,
    priceUnit: "KES",
    order: 2,
    categoryId,
    icon: "https://images.unsplash.com/photo-1709534771076-6c2298f57f2f?w=294&dpr=1&h=294&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXRodW1ibmFpbHx8VVNrdG5Jc0lTem98fGVufDB8fHx8fA%3D%3D",
    available: true,
    requirements: [
      {
        name: "iOS Development Skills",
        description: "Experience with Swift or SwiftUI or Flutter for iOS.",
        mandatory: true
      },
      {
        name: "Apple Developer Account",
        description: "Required for app testing and publishing.",
        mandatory: true
      },
      {
        name: "Device & Simulator Testing",
        description: "Able to test apps on real iPhones/iPads and Xcode simulators.",
        mandatory: true
      },
      {
        name: "Mac Environment",
        description: "Access to macOS and Xcode is mandatory.",
        mandatory: true
      }
    ]
  },
  {
    name: "Cross-Platform App Development",
    description: "Build one app for both iOS and Android using Flutter or React Native. Saves cost and time while maintaining performance and native-like experience.",
    price: 20000,
    priceUnit: "KES",
    order: 3,
    categoryId,
    icon: "https://images.unsplash.com/photo-1709534771076-6c2298f57f2f?w=294&dpr=1&h=294&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXRodW1ibmFpbHx8VVNrdG5Jc0lTem98fGVufDB8fHx8fA%3D%3D",
    available: true,
    requirements: [
      {
        name: "Cross-Platform Framework",
        description: "Mastery in Flutter or React Native.",
        mandatory: true
      },
      {
        name: "Backend Integration Skills",
        description: "Ability to connect apps to REST APIs or Firebase.",
        mandatory: true
      },
      {
        name: "Knowledge of App Lifecycle",
        description: "Understand navigation, state management, and updates.",
        mandatory: true
      },
      {
        name: "Responsive Design Skills",
        description: "Must create UI compatible with all screen sizes.",
        mandatory: true
      }
    ]
  },
  {
    name: "Mobile App UI/UX Design",
    description: "Design wireframes and high-fidelity mobile app interfaces using tools like Figma, Adobe XD or Sketch, optimized for Android and iOS platforms.",
    price: 7000,
    priceUnit: "KES",
    order: 4,
    categoryId,
    icon: "https://images.unsplash.com/photo-1606161290889-77950cfb67d3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8M3wyMEJRem9LZThMa3x8ZW58MHx8fHx8",
    available: true,
    requirements: [
      {
        name: "UI/UX Design Tools",
        description: "Experience with Figma, Adobe XD, or similar.",
        mandatory: true
      },
      {
        name: "Mobile Design Principles",
        description: "Knowledge of mobile-friendly layout and navigation design.",
        mandatory: true
      },
      {
        name: "Prototyping Skills",
        description: "Can create interactive prototypes for client preview.",
        mandatory: false
      }
    ]
  },
  {
    name: "App Testing and Optimization",
    description: "Conduct thorough testing on various devices and optimize app performance, memory usage, and responsiveness.",
    price: 5000,
    priceUnit: "KES",
    order: 5,
    categoryId,
    icon: "https://images.unsplash.com/photo-1604536264507-020ce894daf1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8QXBwJTIwVGVzdGluZyUyMGFuZCUyME9wdGltaXphdGlvbnxlbnwwfHwwfHx8MA%3D%3D",
    available: true,
    requirements: [
      {
        name: "Device Access",
        description: "Ability to test across different mobile devices and OS versions.",
        mandatory: true
      },
      {
        name: "Bug Tracking Tools",
        description: "Familiarity with tools like Crashlytics, Firebase, or Sentry.",
        mandatory: false
      },
      {
        name: "Performance Profiling",
        description: "Able to use Android Profiler or Instruments on iOS.",
        mandatory: true
      }
    ]
  },
  {
    name: "App Deployment and Store Setup",
    description: "Prepare mobile apps for production and publish to Google Play or Apple App Store. Includes store listing setup and screenshots.",
    price: 3000,
    priceUnit: "KES",
    order: 6,
    categoryId,
    icon: "https://media.istockphoto.com/id/471155768/photo/app-store-concept.webp?a=1&b=1&s=612x612&w=0&k=20&c=YVPA6x-1ljO6h95xVdvzin0sJOrDRDdNHbXMyaF8k-0=",
    available: true,
    requirements: [
      {
        name: "App Store Knowledge",
        description: "Understand Play Store and App Store publishing guidelines.",
        mandatory: true
      },
      {
        name: "Store Assets Preparation",
        description: "Ability to create app icons, screenshots, and descriptions.",
        mandatory: true
      },
      {
        name: "Version Control",
        description: "Must manage app versions and changelogs.",
        mandatory: false
      }
    ]
  }
];


services = services.map(s => {
  s.requirements = JSON.stringify(s.requirements);
  s.createdAt = new Date(),
    s.updatedAt = new Date()
  return s;
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Services', services);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Services', { categoryId });
  }
};
