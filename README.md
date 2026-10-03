# CystaNiva - Maternal Health Risk Checker

A Next.js 14 web application that provides maternal health risk checking with AI-powered chat support. The app mimics a mobile experience in a browser with a clean, minimal interface.

## Features

- **Authentication**: Login and 3-step signup process
- **Health Dashboard**: Personalized dashboard with risk badges and quick actions
- **Symptom Checker**: Question-based risk assessment with real-time results
- **AI Chat**: Voice and text chat with CystaNiva AI for health guidance
- **Mobile-First Design**: 390px centered container that looks like a mobile app
- **Offline Support**: Local storage for user data and checkup history

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with localStorage persistence
- **API Client**: Axios
- **Voice Input**: Web Speech API
- **AI Integration**: Anthropic Claude API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: The base URL for API calls
- `ANTHROPIC_API_KEY`: Your Anthropic API key for the AI chat feature

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   ├── check/         # Symptom checker
│   ├── home/          # Dashboard
│   ├── talk/          # AI chat
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home redirect
├── components/
│   ├── ui/            # Reusable UI components
│   ├── auth/          # Authentication components
│   ├── check/         # Checkup components
│   └── talk/          # Chat components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── store/             # Zustand store
└── public/            # Static assets
```

## Key Features

### Authentication
- Phone number and password login
- 3-step signup process:
  1. Personal details
  2. Health status (pregnant/postpartum)
  3. Care team information

### Health Dashboard
- Personalized welcome message
- Last risk assessment badge
- Quick action cards (Start check, Reminders, Learn signs, My CHW)
- Recent checkup history

### Symptom Checker
- Dynamic questions based on user status
- Voice input support
- Real-time risk calculation
- Hospital recommendations for high-risk cases
- Emergency contact options

### AI Chat
- Voice and text input
- Streaming responses
- Context-aware conversations
- Multi-language support
- Health guidance and triage

## Risk Assessment Logic

The app uses evidence-based risk assessment:

### Pregnancy (Preeclampsia)
- **High Risk**: Severe headache + (swelling OR vision changes) OR 3+ yes answers
- **Medium Risk**: 2 yes answers
- **Low Risk**: 0-1 yes answers

### Postpartum (0-6 weeks)
- **High Risk**: Heavy bleeding OR heavy bleeding + dizziness OR fever + discharge
- **Medium Risk**: 2 yes answers
- **Low Risk**: 0-1 yes answers

## Design System

### Colors
- Primary: `#0d6e40` (dark green)
- Danger: `#b91c1c` (red)
- Warning: `#b45309` (amber)
- Background: `#ffffff`
- Surface: `#f5f5f4`
- Border: `#e5e7eb`

### Typography
- Font: Inter
- Sizes: Mobile-optimized with large tap targets (min 48px)

### Layout
- 390px centered container
- Minimum height: 100dvh
- Status bar: 52px
- Bottom navigation: 56px

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Health Check
- `POST /api/check` - Process symptom answers and return risk assessment

### AI Chat
- `POST /api/talk` - Send message to AI assistant (streaming)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- Custom hooks for reusable logic
- Zustand for state management
- Component-based architecture

## Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Deploy to your preferred platform (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.

---

**Note**: This is a demonstration application. For production use, ensure proper security measures, HIPAA compliance, and medical professional oversight.
