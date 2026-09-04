export interface AvailabilitySlotState {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface WizardProfileState {
  fullName: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  hasPhoto: boolean;
  highestQualification: string | null;
  institution: string | null;
  graduationYear: number | null;
  majorSubject: string | null;
  subjects: string[];
  grades: string[];
  teachingExperienceSummary: string | null;
  expectedMonthlyFee: number | null;
  preferredLocationId: string | null;
  preferredLocationLabel: string | null;
  preferredLocality: string | null;
  availability: AvailabilitySlotState[];
  hasCv: boolean;
}

export const EMPTY_WIZARD_PROFILE: WizardProfileState = {
  fullName: null,
  phone: null,
  gender: null,
  dateOfBirth: null,
  address: null,
  hasPhoto: false,
  highestQualification: null,
  institution: null,
  graduationYear: null,
  majorSubject: null,
  subjects: [],
  grades: [],
  teachingExperienceSummary: null,
  expectedMonthlyFee: null,
  preferredLocationId: null,
  preferredLocationLabel: null,
  preferredLocality: null,
  availability: [],
  hasCv: false,
};

export interface CascadeResumeState {
  provinceId?: string;
  districtId?: string;
  localGovernmentId?: string;
  wardNumber?: number;
  districts?: { id: string; name: string; nameEnglish: string | null; wardCount: number | null }[];
  localGovernments?: { id: string; name: string; nameEnglish: string | null; wardCount: number | null }[];
}
