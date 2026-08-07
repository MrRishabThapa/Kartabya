"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface OnboardingData {
  userName: string;
  pandaNickname: string;
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({
    userName: "",
    pandaNickname: "",
    hobbies: [],
    targetCourse: { grade: "", subject: "" },
  });

  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const resetData = () => {
    setData({
      userName: "",
      pandaNickname: "",
      hobbies: [],
      targetCourse: { grade: "", subject: "" },
    });
  };

  return (
    <UserContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
