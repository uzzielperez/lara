/** Mock data for staff Pathway UI (wireframe v1 — no backend yet). */

export type ClientStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED" | "WITHDRAWN";
export type PathwayStage =
  | "SCHOOL_ADMISSION"
  | "VISA_APPLICATION"
  | "LANDING_SUPPORT"
  | "COMPLETED";
export type PaymentStatus = "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";

export type StaffStudentRow = {
  id: string;
  name: string;
  email: string;
  country: string;
  targetIntake: string;
  stage: PathwayStage;
  progress: number;
  missing: string;
  paymentLabel: string;
  paymentStatus: PaymentStatus;
  nextAction: string;
  daysInProcess: number;
  assignedStaff: string;
  clientStatus: ClientStatus;
  /** Freemium snapshot for Pipeline tab */
  freemiumStage: string;
  chatUses: number;
  appsSaved: number;
};

export const STAGE_LABEL: Record<PathwayStage, string> = {
  SCHOOL_ADMISSION: "School Admission",
  VISA_APPLICATION: "Visa Application",
  LANDING_SUPPORT: "Landing Support",
  COMPLETED: "Completed",
};

export const MOCK_STUDENTS: StaffStudentRow[] = [
  {
    id: "1",
    name: "Maria Santos",
    email: "maria.santos@example.com",
    country: "PH",
    targetIntake: "Sept 2026",
    stage: "SCHOOL_ADMISSION",
    progress: 45,
    missing: "Transcript",
    paymentLabel: "€480 paid",
    paymentStatus: "PAID",
    nextAction: "Submit application",
    daysInProcess: 12,
    assignedStaff: "Isabella",
    clientStatus: "ACTIVE",
    freemiumStage: "Tracking apps",
    chatUses: 5,
    appsSaved: 2,
  },
  {
    id: "2",
    name: "Ana Cruz",
    email: "ana.cruz@example.com",
    country: "PH",
    targetIntake: "Jan 2027",
    stage: "VISA_APPLICATION",
    progress: 60,
    missing: "Insurance",
    paymentLabel: "€300 pending",
    paymentStatus: "OVERDUE",
    nextAction: "Visa appointment",
    daysInProcess: 28,
    assignedStaff: "Lauren",
    clientStatus: "ACTIVE",
    freemiumStage: "Premium",
    chatUses: 12,
    appsSaved: 3,
  },
  {
    id: "3",
    name: "Carla Reyes",
    email: "carla.reyes@example.com",
    country: "AE",
    targetIntake: "Sept 2026",
    stage: "LANDING_SUPPORT",
    progress: 25,
    missing: "TIE",
    paymentLabel: "Paid",
    paymentStatus: "PAID",
    nextAction: "Book appointment",
    daysInProcess: 41,
    assignedStaff: "Isabella",
    clientStatus: "ACTIVE",
    freemiumStage: "Landing",
    chatUses: 8,
    appsSaved: 1,
  },
  {
    id: "4",
    name: "Juan Dela Cruz",
    email: "juan.dc@example.com",
    country: "PH",
    targetIntake: "Jan 2027",
    stage: "SCHOOL_ADMISSION",
    progress: 15,
    missing: "CV, Motivation letter",
    paymentLabel: "€480 pending",
    paymentStatus: "PENDING",
    nextAction: "Collect documents",
    daysInProcess: 5,
    assignedStaff: "Lauren",
    clientStatus: "ACTIVE",
    freemiumStage: "Hit paywall",
    chatUses: 5,
    appsSaved: 0,
  },
  {
    id: "5",
    name: "Sofia Mendoza",
    email: "sofia.m@example.com",
    country: "PH",
    targetIntake: "April 2027",
    stage: "SCHOOL_ADMISSION",
    progress: 0,
    missing: "—",
    paymentLabel: "Not purchased",
    paymentStatus: "PENDING",
    nextAction: "Finish intake",
    daysInProcess: 9,
    assignedStaff: "Unassigned",
    clientStatus: "ON_HOLD",
    freemiumStage: "Intake stuck",
    chatUses: 0,
    appsSaved: 0,
  },
  {
    id: "6",
    name: "Miguel Torres",
    email: "miguel.t@example.com",
    country: "PH",
    targetIntake: "Sept 2026",
    stage: "VISA_APPLICATION",
    progress: 80,
    missing: "Financial docs",
    paymentLabel: "€960 paid",
    paymentStatus: "PARTIAL",
    nextAction: "Review finances",
    daysInProcess: 35,
    assignedStaff: "Isabella",
    clientStatus: "ACTIVE",
    freemiumStage: "Tracking apps",
    chatUses: 5,
    appsSaved: 4,
  },
];

export const MOCK_KPIS = {
  activeStudents: 47,
  needActionToday: 8,
  overduePayments: 5,
  atRiskIntake: 3,
  waitingOnDocs: 12,
};
