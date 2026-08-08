"use client";
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';

// Import Screens (Generated in step 5)
import Screen1 from '@/components/onboarding-screens/Screen1';
import Screen2 from '@/components/onboarding-screens/Screen2';
import Screen3 from '@/components/onboarding-screens/Screen3';
import Screen4 from '@/components/onboarding-screens/Screen4';
import Screen5 from '@/components/onboarding-screens/Screen5';
import Screen6 from '@/components/onboarding-screens/Screen6';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const { data , updateData } = useUser();

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const renderStep = () => {
    switch (step) {
  case 1:
    return (
      <Screen1
        onNext={nextStep}
        updateData={updateData}
        data={data}
      />
    );

  case 2:
    return (
      <Screen2
        onNext={nextStep}
        updateData={updateData}
        data={data}
      />
    );

  case 3:
    return (
      <Screen3
        onNext={nextStep}
        onBack={prevStep}
        updateData={updateData}
        data={data}
      />
    );

  case 4:
    return (
      <Screen4
        onNext={nextStep}
        onBack={prevStep}
        updateData={updateData}
        data={data}
      />
    );

  case 5:
    return (
      <Screen5
        onNext={nextStep}
        onBack={() => setStep(4)}
        updateData={updateData}
        data={data}
      />
    );

  case 6:
    return (
      <Screen6
        onNext={nextStep}
        onBack={prevStep}
        updateData={updateData}
        data={data}
      />
    );

  default:
    return (
      <Screen1
        onNext={nextStep}
        updateData={updateData}
        data={data}
      />
    );
}
  };

  const onboarding = (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-slate-100">
        <motion.div 
          className="h-full bg-[#7C3AED]"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  return onboarding;
}
