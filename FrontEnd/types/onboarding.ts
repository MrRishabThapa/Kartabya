export interface OnboardingData {
  userName: string;
  foxNickname: string;
  hobbies: string[];
  targetCourse: {
    grade: string;
    subject: string;
  };
}

export interface OnboardingScreenProps {
  onNext: () => void;
  onBack?: () => void;
  updateData: (fields: Partial<OnboardingData>) => void;
  data: OnboardingData;
}
