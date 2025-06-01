'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Questionnaire structure
interface Question {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
  }[];
}

const questionnaireByArchetype: Record<string, Question[]> = {
  eager_learner: [
    {
      id: 'explanationDepth',
      text: 'How detailed would you like explanations to be?',
      options: [
        { value: 'basic', label: 'Basic - Just the essentials' },
        { value: 'detailed', label: 'Detailed - Include reasoning' },
        { value: 'comprehensive', label: 'Comprehensive - Teach me everything' },
      ],
    },
    {
      id: 'timeCommitment',
      text: 'How much time do you want to spend on fantasy football each week?',
      options: [
        { value: 'minimal', label: 'Minimal - Just the essentials' },
        { value: 'moderate', label: 'Moderate - A few hours per week' },
        { value: 'dedicated', label: 'Dedicated - As much as needed' },
      ],
    },
  ],
  calculated_strategist: [
    {
      id: 'riskTolerance',
      text: 'What\'s your approach to risk in fantasy decisions?',
      options: [
        { value: 'conservative', label: 'Conservative - Prefer safer, reliable options' },
        { value: 'balanced', label: 'Balanced - Mix of safe and high-upside picks' },
        { value: 'aggressive', label: 'Aggressive - Willing to take big risks for big rewards' },
      ],
    },
    {
      id: 'explanationDepth',
      text: 'How much data do you want to see with recommendations?',
      options: [
        { value: 'basic', label: 'Basic - Just the key stats' },
        { value: 'detailed', label: 'Detailed - Include relevant metrics' },
        { value: 'comprehensive', label: 'Comprehensive - Full statistical breakdown' },
      ],
    },
  ],
  bold_playmaker: [
    {
      id: 'riskTolerance',
      text: 'How aggressive should your AI Copilot be with recommendations?',
      options: [
        { value: 'balanced', label: 'Balanced - Some risks, but not too wild' },
        { value: 'aggressive', label: 'Aggressive - High upside focus' },
        { value: 'very_aggressive', label: 'Very Aggressive - Maximum upside, regardless of floor' },
      ],
    },
    {
      id: 'explanationDepth',
      text: 'What kind of analysis do you prefer?',
      options: [
        { value: 'basic', label: 'Basic - Just the recommendation' },
        { value: 'detailed', label: 'Detailed - Include reasoning' },
        { value: 'comprehensive', label: 'Comprehensive - Full breakdown' },
      ],
    },
  ],
  busy_optimizer: [
    {
      id: 'timeCommitment',
      text: 'How much time do you have for fantasy football each week?',
      options: [
        { value: 'minimal', label: 'Minimal - 15 minutes or less' },
        { value: 'moderate', label: 'Moderate - Up to an hour' },
        { value: 'dedicated', label: 'Dedicated - Several hours' },
      ],
    },
    {
      id: 'explanationDepth',
      text: 'How concise should AI Copilot explanations be?',
      options: [
        { value: 'basic', label: 'Basic - Just the essentials' },
        { value: 'detailed', label: 'Detailed - Some context, but keep it brief' },
        { value: 'comprehensive', label: 'Comprehensive - Full details when I have time' },
      ],
    },
  ],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Questions based on selected archetype
  const questions = selectedArchetype ? questionnaireByArchetype[selectedArchetype] : [];
  
  // Handle questionnaire answer
  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  // Submit onboarding data
  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Call API to /api/users/me with { selectedArchetype, onboardingAnswers: answers }
      // For the PoC, we'll simulate a successful update after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding submission failed:', error);
      // Handle error
      setIsLoading(false);
    }
  };
  
  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    if (step === 1) return selectedArchetype !== null;
    if (step > 1 && step - 2 < questions.length) {
      const currentQuestion = questions[step - 2];
      return !!answers[currentQuestion.id];
    }
    return true;
  };
  
  // Navigate to next question or complete
  const handleNext = () => {
    if (step < questions.length + 1) {
      setStep(step + 1);
    } else {
      handleCompleteOnboarding();
    }
  };
  
  // Progress percentage
  const calculateProgress = () => {
    const totalSteps = questions.length + 1;
    return (step / totalSteps) * 100;
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="w-full bg-base-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${calculateProgress()}%` }}
        ></div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Please select your fantasy manager style in the AI Copilot chat</h1>
        <p className="text-base-content/70 mt-2">
          The AI Copilot will guide you through the onboarding process
        </p>
      </div>
    </div>
  );
}