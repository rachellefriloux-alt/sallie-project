# Sallie AI Assistant

## Overview

Sallie is an AI companion application designed to help users align their digital habits with their core values. Built with a "tough love meets soul care" philosophy, Sallie provides supportive but accountable guidance through intelligent conversation, memory-based context awareness, and values-driven interaction patterns. The application combines emotional intelligence, persistent memory systems, and personalized responses to create a meaningful digital companion experience.

## Features

- 🤖 Advanced AI conversation with emotional intelligence
- 🧠 Persistent memory system for context-aware interactions  
- 🎯 Values-driven guidance and accountability
- 📱 Cross-platform support (React Native + Web)
- 🏠 Android launcher integration
- 🎨 Customizable themes and visual elements
- 🔧 Modular architecture for extensibility

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Built with vanilla JavaScript using ES6 modules for a clean, dependency-free frontend
- **Component-based UI**: Modular interface components managed through `SallieInterface.js` for separation of concerns
- **Real-time Chat Interface**: Dynamic conversation management with typing indicators and status updates
- **Values Management Panel**: Interactive UI for users to define and manage their core values
- **Responsive Design**: CSS Grid and Flexbox-based layout with custom CSS variables for consistent theming

### Backend Architecture
- **Express.js Server**: Lightweight Node.js server for serving static files and providing health check endpoints
- **Modular Core Systems**: Organized into distinct modules for memory, values, persona, and AI integration

## Technology Stack

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express.js
- **AI Integration**: Anthropic Claude API
- **Database**: Firebase Firestore, SQLite
- **Build Tools**: Gradle, Expo CLI
- **Testing**: Jest, ESLint

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Android Studio (for Android development)
- Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/rachellefriloux-alt/sallie-project.git
cd sallie-project

# Install dependencies
npm install

# Start the development server
npm start
```

### Android Development

```bash
# Build and run on Android
npm run android

# Or use Gradle directly
./gradlew assembleDebug
```

## Project Structure

```
sallie-project/
├── android/              # Android-specific code
├── ai/                   # AI models and logic
├── components/           # React components
├── core/                 # Core system modules
├── screens/              # App screens
├── styles/               # Styling and themes
├── utils/                # Utility functions
├── package.json          # Node.js dependencies
├── app.json              # Expo configuration
└── README.md            # This file
```

## Development Tasks

The project includes several npm scripts for development:

```bash
npm run test              # Run test suite
npm run lint              # Code linting
npm run typecheck         # TypeScript checking
npm run test:coverage     # Test coverage report
```

## Contributing

This is a personal project, but contributions and feedback are welcome. Please feel free to open issues or submit pull requests.

## License

MIT License - see LICENSE file for details.

## Contact

For questions or feedback, please open an issue on GitHub.
