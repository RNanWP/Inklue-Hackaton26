export type PlanStatus = "DRAFT" | "GENERATED";

export type AttachmentStatus = "UPLOADED" | "PROCESSING" | "DONE" | "FAILED";

export type Attachment = {
  key: string;
  originalName: string;
  contentType: string;
  status: AttachmentStatus;

  textractJobId?: string;
  extractedText?: string;
  error?: string;
};

export type PlanItem = {
  PK: string;
  SK: string;

  planId: string;
  teacherId: string;

  title: string;
  ageRange: string;
  classSize: number;
  topic: string;
  inclusionProfiles: string[];
  constraints: string[];

  status: PlanStatus;

  attachments?: Attachment[];
  extractedMaterialsText?: string;

  lessonPlan?: string;
  activities?: string;
  rubric?: string;
  accessibility?: string;

  createdAt: string;
  updatedAt: string;
};

export type CreatePlanInput = {
  teacherId: string;
  title: string;
  ageRange: string;
  classSize: number;
  topic: string;
  inclusionProfiles: string[];
  constraints?: string[];
};
