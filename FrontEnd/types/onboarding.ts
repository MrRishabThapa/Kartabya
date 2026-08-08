export interface OnboardingData {
  userName: string;
  pandaNickname: string;
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
