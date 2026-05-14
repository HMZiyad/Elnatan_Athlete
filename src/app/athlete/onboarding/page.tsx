"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingTemplate } from '@/components/templates/athlete-view/OnboardingTemplate';
import { IdentityStep } from '@/components/organisms/athlete-onboarding/IdentityStep';
import { SportStep } from '@/components/organisms/athlete-onboarding/SportStep';
import { StoryStep } from '@/components/organisms/athlete-onboarding/StoryStep';
import { AgreementStep } from '@/components/organisms/athlete-onboarding/AgreementStep';
import { VerificationStep } from '@/components/organisms/athlete-onboarding/VerificationStep';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/athlete/overview');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepData = () => {
    switch (currentStep) {
      case 1:
        return { 
          title: 'Identity', 
          component: <IdentityStep onContinue={handleNext} /> 
        };
      case 2:
        return { 
          title: 'Sport', 
          component: <SportStep onBack={handleBack} onContinue={handleNext} /> 
        };
      case 3:
        return { 
          title: 'Story', 
          component: <StoryStep onBack={handleBack} onGoLive={handleNext} /> 
        };
      case 4:
        return { 
          title: 'Terms', 
          component: <AgreementStep onBack={handleBack} onAgree={handleNext} /> 
        };
      case 5:
        return { 
          title: 'Verification', 
          component: <VerificationStep onBack={handleBack} onContinue={handleNext} /> 
        };
      default:
        return { title: 'Identity', component: null };
    }
  };

  const { title, component } = getStepData();

  return (
    <OnboardingTemplate 
      step={`0${currentStep}`} 
      totalSteps="05" 
      title={title}
    >
      {component}
    </OnboardingTemplate>
  );
}
