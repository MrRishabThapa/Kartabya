"use client";

import { api } from "@/lib/api";
import type { OnboardingData } from "@/types/onboarding";

const DRAFT_KEY = "arcademia-onboarding-draft";

export function saveOnboardingDraft(data: OnboardingData) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

export function hasOnboardingDraft() {
  return sessionStorage.getItem(DRAFT_KEY) !== null;
}

function getOnboardingDraft(): OnboardingData | null {
  const rawDraft = sessionStorage.getItem(DRAFT_KEY);

  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft) as OnboardingData;
  } catch {
    sessionStorage.removeItem(DRAFT_KEY);
    return null;
  }
}

/** Saves an onboarding journey after the account session has been created. */
export async function completeOnboardingDraft() {
  const draft = getOnboardingDraft();

  if (!draft) return false;

  await api.post("/api/v1/onboard", draft);
  sessionStorage.removeItem(DRAFT_KEY);
  return true;
}
