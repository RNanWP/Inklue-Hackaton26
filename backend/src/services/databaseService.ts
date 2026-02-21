import "dotenv/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import type { PlanItem, CreatePlanInput, Attachment } from "../types/plan";

const REGION = process.env.AWS_REGION || "sa-east-1";
const TABLE = process.env.DDB_TABLE_NAME || "InklueData";

const client = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(client);

function pk(teacherId: string) {
  return `TEACHER#${teacherId}`;
}
function sk(planId: string) {
  return `PLAN#${planId}`;
}
function nowIso() {
  return new Date().toISOString();
}

export async function createPlan(input: CreatePlanInput) {
  const planId = randomUUID();
  const now = nowIso();

  const item: PlanItem = {
    PK: pk(input.teacherId),
    SK: sk(planId),
    planId,
    teacherId: input.teacherId,
    title: input.title,
    ageRange: input.ageRange,
    classSize: input.classSize,
    topic: input.topic,
    inclusionProfiles: input.inclusionProfiles,
    constraints: input.constraints ?? [],
    status: "DRAFT",
    createdAt: now,
    updatedAt: now,
    attachments: [],
    extractedMaterialsText: "",
  };

  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

export async function getPlan(teacherId: string, planId: string) {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: pk(teacherId), SK: sk(planId) },
    }),
  );
  return res.Item as PlanItem | undefined;
}

export async function listPlans(teacherId: string) {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": pk(teacherId), ":sk": "PLAN#" },
      ScanIndexForward: false,
    }),
  );
  return (res.Items ?? []) as PlanItem[];
}

export async function saveGeneratedContent(
  teacherId: string,
  planId: string,
  generated: {
    lessonPlan: string;
    activities: string;
    rubric: string;
    accessibility: string;
  },
) {
  const existing = await getPlan(teacherId, planId);
  if (!existing) throw new Error("Plano não encontrado");

  const updated: PlanItem = {
    ...existing,
    status: "GENERATED",
    lessonPlan: generated.lessonPlan,
    activities: generated.activities,
    rubric: generated.rubric,
    accessibility: generated.accessibility,
    updatedAt: nowIso(),
  };

  await ddb.send(new PutCommand({ TableName: TABLE, Item: updated }));
  return updated;
}

export async function deletePlan(teacherId: string, planId: string) {
  await ddb.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: { PK: pk(teacherId), SK: sk(planId) },
    }),
  );
  return { ok: true };
}

export async function addAttachment(
  teacherId: string,
  planId: string,
  att: Attachment,
) {
  const existing = await getPlan(teacherId, planId);
  if (!existing) throw new Error("Plano não encontrado");

  const attachments = existing.attachments ?? [];
  const updated: PlanItem = {
    ...existing,
    attachments: [att, ...attachments],
    updatedAt: nowIso(),
  };

  await ddb.send(new PutCommand({ TableName: TABLE, Item: updated }));
  return updated;
}

export async function updateAttachment(
  teacherId: string,
  planId: string,
  key: string,
  patch: Partial<Attachment>,
) {
  const existing = await getPlan(teacherId, planId);
  if (!existing) throw new Error("Plano não encontrado");

  const attachments = (existing.attachments ?? []).map((a) => {
    if (a.key !== key) return a;
    return { ...a, ...patch };
  });

  const updated: PlanItem = {
    ...existing,
    attachments,
    updatedAt: nowIso(),
  };

  await ddb.send(new PutCommand({ TableName: TABLE, Item: updated }));
  return updated;
}

export async function refreshExtractedMaterialsText(
  teacherId: string,
  planId: string,
) {
  const existing = await getPlan(teacherId, planId);
  if (!existing) throw new Error("Plano não encontrado");

  const texts = (existing.attachments ?? [])
    .map((a) => a.extractedText?.trim())
    .filter(Boolean) as string[];

  const consolidated = texts.join("\n\n---\n\n").slice(0, 12000);

  const updated: PlanItem = {
    ...existing,
    extractedMaterialsText: consolidated,
    updatedAt: nowIso(),
  };

  await ddb.send(new PutCommand({ TableName: TABLE, Item: updated }));
  return updated;
}
