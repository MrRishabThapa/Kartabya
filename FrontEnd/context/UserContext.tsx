"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import type { ApiOnboarding, ApiUser } from "@/lib/api";

interface OnboardingData {
  userName: string;
  foxNickname: string;
  hobbies: string[];
  targetCourse: {
    grade: string;
    subject: string;
  };
}

interface UserContextType {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  resetData: () => void;
  authUser: ApiUser | null;
  setAuthUser: (user: ApiUser | null) => void;
  onboarding: ApiOnboarding | null;
  setOnboarding: (onboarding: ApiOnboarding | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<ApiUser | null>(null);
  const [onboarding, setOnboarding] = useState<ApiOnboarding | null>(null);
  const [data, setData] = useState<OnboardingData>({
    userName: "",
    foxNickname: "",
    hobbies: [],
    targetCourse: { grade: "", subject: "" },
  });

  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const resetData = () => {
    setData({
      userName: "",
      foxNickname: "",
      hobbies: [],
      targetCourse: { grade: "", subject: "" },
    });
  };

  return (
    <UserContext.Provider value={{ data, updateData, resetData, authUser, setAuthUser, onboarding, setOnboarding }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
