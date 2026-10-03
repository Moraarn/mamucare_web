'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Palette, Languages } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import AppShell from '@/components/ui/AppShell'
import QuestionProgress from './QuestionProgress'
import QuestionCard from './QuestionCard'
import AnswerButtons from './AnswerButtons'
import VoiceInput from './VoiceInput'
import { useVoiceAnswer } from '@/hooks/useVoiceAnswer'
import ResultScreen from './ResultScreen'
import Button from '@/components/ui/Button'
import { fetchCurrentUser } from '@/lib/auth'
import type { User } from '@/store/useStore'

type Question = {
  id: string
  text: string
  swahiliText?: string
  category?: string
  tag?: string
  hint?: string
}

type CheckResult = {
  id: string
  userId: string
  answers: boolean[]
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
  recommendations: string[]
  date: string
  questions: Question[]
  riskResults?: any[]
}

async function createCheckSession(userId: string) {
  const res = await fetch('/api/check/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message ?? 'Failed to create session');
  }

  return data;
}

async function updateSessionAnswer(sessionId: string, answerIndex: number, answer: boolean) {
  const res = await fetch(`/api/check/session/${encodeURIComponent(sessionId)}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answerIndex,
      answer,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error('[check] answer save failed:', data);
    throw new Error(data?.message ?? 'Failed to save answer');
  }

  return data;
}

async function completeCheckSession(sessionId: string, userId: string, userStatus: string) {
  const res = await fetch(`/api/check/session/${encodeURIComponent(sessionId)}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userStatus }),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error('[check] complete session failed:', data);
    throw new Error(data?.message ?? 'Failed to complete session');
  }

  const result =
    data?.result ??
    data?.data ??
    data?.checkResult ??
    data;

  return result;
}

function normalizeBackendUserStatus(user: any): string | null {
  const rawStatus =
    user?.status ??
    user?.healthStatus ??
    user?.userStatus ??
    user?.pregnancyStatus ??
    null;

  if (!rawStatus) return null;

  const status = String(rawStatus).toLowerCase();

  if (status === 'pregnant') return 'pregnant';
  if (status === 'just_gave_birth') return 'just_gave_birth';
  if (status === 'postpartum') return 'postpartum';
  if (status === 'postpartum_early') return 'just_gave_birth';
  if (status === 'postpartum_late') return 'postpartum';

  return status;
}

function normalizeBackendTrimester(user: any): string | undefined {
  const rawTrimester =
    user?.trimester ??
    user?.pregnancyStage ??
    user?.stage ??
    undefined;

  if (!rawTrimester) return undefined;

  const trimester = String(rawTrimester).toLowerCase();

  const map: Record<string, string> = {
    first: '1',
    second: '2',
    third: '3',
    term: '3',
    '1st': '1',
    '2nd': '2',
    '3rd': '3',
    trimester_1: '1',
    trimester_2: '2',
    trimester_3: '3',
  };

  return map[trimester] ?? trimester;
}

function calculateLocalRisk(questions: Question[], answers: boolean[]) {
  const yesAnswers = questions.filter((question, index) => answers[index] === true);

  const highRiskTags = [
    'hemorrhage',
    'bleeding',
    'eclampsia',
    'seizure',
    'ectopic',
    'miscarriage',
    'infection',
    'fever',
    'breathing',
    'chest',
    'severe pain',
    'danger',
  ];

  const mediumRiskTags = [
    'vomiting',
    'urinary',
    'headache',
    'swelling',
    'dizziness',
    'reduced movement',
    'mental health',
  ];

  const hasHighRisk = yesAnswers.some((question) => {
    const text = `${question.tag ?? ''} ${question.text ?? ''} ${question.hint ?? ''}`.toLowerCase();
    return highRiskTags.some((tag) => text.includes(tag));
  });

  const hasMediumRisk = yesAnswers.some((question) => {
    const text = `${question.tag ?? ''} ${question.text ?? ''} ${question.hint ?? ''}`.toLowerCase();
    return mediumRiskTags.some((tag) => text.includes(tag));
  });

  if (hasHighRisk) {
    return {
      riskLevel: 'high' as const,
      riskFactors: yesAnswers.map((question) => question.tag || question.text),
      recommendations: [
        'Seek urgent medical care now.',
        'Contact your health worker or nearest hospital immediately.',
      ],
    };
  }

  if (hasMediumRisk || yesAnswers.length >= 2) {
    return {
      riskLevel: 'medium' as const,
      riskFactors: yesAnswers.map((question) => question.tag || question.text),
      recommendations: [
        'Contact your health worker for advice.',
        'Monitor symptoms closely and seek care if they worsen.',
      ],
    };
  }

  return {
    riskLevel: 'low' as const,
    riskFactors: [],
    recommendations: [
      'No danger signs detected. Continue routine care.',
    ],
  };
}

async function loadQuestions(userStatus: string, trimester?: string): Promise<Question[]> {
  if (!userStatus) return [];

  const trimesterMap: Record<string, string> = {
    first: '1',
    second: '2',
    third: '3',
    term: '3',
  };

  const mappedTrimester = trimester ? trimesterMap[trimester] || trimester : undefined;

  const url = mappedTrimester
    ? `/api/check/questions/${encodeURIComponent(userStatus)}?trimester=${encodeURIComponent(mappedTrimester)}`
    : `/api/check/questions/${encodeURIComponent(userStatus)}`;

  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);

  const questions = Array.isArray(data)
    ? data
    : Array.isArray(data?.questions)
      ? data.questions
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.body)
          ? data.body
          : [];

  if (!res.ok) {
    console.error('Failed to load questions:', data);
    return [];
  }

  if (!questions.length) {
    console.error('[check] No questions found from proxy:', {
      userStatus,
      trimester,
      response: data,
    });
  }

  return questions;
}

export default function CheckPageClient() {
  const router = useRouter()
  const { toggleTheme } = useTheme()

  const [user, setUser] = useState<User | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [language, setLanguage] = useState<'en' | 'sw'>('en')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [riskResult, setRiskResult] = useState<CheckResult | null>(null)
  const voice = useVoiceAnswer(language, currentQuestionIndex, setSelectedAnswer)

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true)

        // Always fetch from backend since middleware ensures authentication via cookie
        const currentUser = await fetchCurrentUser()

        if (!currentUser?.id) {
          console.error('No user found from backend')
          router.replace('/auth')
          return
        }

        setUser(currentUser)

        const backendUserStatus = normalizeBackendUserStatus(currentUser);
        const backendTrimester = normalizeBackendTrimester(currentUser);

        console.log('[check] resolved user for questions:', {
          currentUser,
          backendUserStatus,
          backendTrimester,
        });

        if (!backendUserStatus || backendUserStatus === 'unknown') {
          console.error('[check] Cannot load questions because user status is missing/unknown:', currentUser);
          return;
        }

        const finalTrimester =
          backendUserStatus === 'pregnant'
            ? backendTrimester ?? '3'
            : backendTrimester;

        const loadedQuestions = await loadQuestions(
          backendUserStatus,
          finalTrimester,
        )

        if (!Array.isArray(loadedQuestions) || loadedQuestions.length === 0) {
          console.error('No questions found')
          return
        }

        setQuestions(loadedQuestions)

        const sessionResponse = await createCheckSession(currentUser.id)
        console.log('[check] created session response:', sessionResponse)

        const createdSessionId =
          sessionResponse?.sessionId ??
          sessionResponse?.session?.id ??
          sessionResponse?.session?._id ??
          sessionResponse?.id ??
          sessionResponse?._id ??
          null;

        if (!createdSessionId) {
          console.warn('[check] No session id returned. Continuing check locally.', sessionResponse)
        } else {
          setSessionId(createdSessionId)
        }
      } catch (error) {
        console.error('Home init error:', error)
        router.replace('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [router])

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerSelect = (answer: boolean) => {
    voice.reset()
    setSelectedAnswer(answer)
  }

  const handleNext = async () => {
    if (selectedAnswer === null || !user) return
    voice.reset()

    const answerToSave = selectedAnswer

    if (sessionId) {
      try {
        await updateSessionAnswer(sessionId, currentQuestionIndex, answerToSave)
      } catch (error) {
        console.error('[check] Failed to save answer, continuing locally:', error)
      }
    } else {
      console.warn('[check] Missing sessionId. Continuing locally without saving answer.')
    }

    const newAnswers = [...answers, answerToSave]
    setAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      return
    }

    if (!sessionId) {
      const localRisk = calculateLocalRisk(questions, newAnswers);

      const localResult: CheckResult = {
        id: 'local',
        userId: user.id,
        answers: newAnswers,
        riskLevel: localRisk.riskLevel,
        riskFactors: localRisk.riskFactors,
        recommendations: localRisk.recommendations,
        date: new Date().toISOString(),
        questions,
        riskResults: [],
      }

      setRiskResult(localResult)
      setShowResult(true)
      return
    }

    try {
      const result = await completeCheckSession(
        sessionId,
        user.id,
        user.status
      )
      setRiskResult(result)
      setShowResult(true)
    } catch (error) {
      console.error('[check] Failed to complete backend session:', error)
    }
  }

  if (isLoading) {
    return (
      <AppShell contentWidth="reading" statusBar={{ title: 'Symptom check' }}>
        <div className="content-panel py-12 text-center" role="status">Loading your questions...</div>
      </AppShell>
    )
  }

  if (!user || questions.length === 0) {
    return (
      <AppShell contentWidth="reading" statusBar={{ title: 'Symptom check' }}>
        <div className="content-panel py-12 text-center" role="alert">Failed to load questions. Please refresh to try again.</div>
      </AppShell>
    )
  }

  return (
    <AppShell
      contentWidth={showResult ? 'wide' : 'reading'}
      statusBar={{
        title: 'Symptom check',
        showBack: true,
        rightContent: showResult
          ? ''
          : `Q${currentQuestionIndex + 1} of ${questions.length}`,
        color: 'primary',
      }}
    >
      <div className="flex flex-col h-full">
        <div className="check-toolbar">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {showResult ? 'Your checkup summary' : 'Check in on your health'}
          </p>
          <div className="flex shrink-0 gap-2">
          <button
            onClick={() => { voice.reset(); setLanguage(language === 'en' ? 'sw' : 'en') }}
            className="check-tool"
            style={{ backgroundColor: 'var(--color-surface)' }}
            title="Switch language"
            aria-label="Switch question language"
          >
            <Languages size={20} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <button
            onClick={toggleTheme}
            className="check-tool"
            style={{ backgroundColor: 'var(--color-surface)' }}
            title="Toggle theme"
            aria-label="Toggle color theme"
          >
            <Palette size={20} style={{ color: 'var(--color-text-primary)' }} />
          </button>
        </div>

        </div>

        <QuestionProgress
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          showResult={showResult}
        />

        <div className="flex-1 py-5">
          {!showResult ? (
            <div className="content-panel check-card space-y-5 sm:space-y-6">
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                language={language}
              />

              <AnswerButtons
                selectedAnswer={selectedAnswer}
                onAnswerSelect={handleAnswerSelect}
                language={language}
              />

              <VoiceInput
                state={voice.state}
                supported={voice.supported}
                onVoiceInput={voice.start}
                onCancel={voice.reset}
                language={language}
              />

              <Button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                fullWidth
              >
                {currentQuestionIndex < questions.length - 1
                  ? 'Next question →'
                  : 'See my result →'}
              </Button>
            </div>
          ) : (
            <ResultScreen
              riskResult={riskResult}
              user={user}
              onBackToHome={() => router.replace('/home')}
              onCallCHW={() => {}}
              onCallEmergency={() => {
                window.location.href = 'tel:999'
              }}
            />
          )}
        </div>
      </div>
    </AppShell>
  )
}
