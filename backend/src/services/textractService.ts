import "dotenv/config";
import {
  TextractClient,
  DetectDocumentTextCommand,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
} from "@aws-sdk/client-textract";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "sa-east-1";
const BUCKET = process.env.S3_BUCKET_INKLUE || "";

const textract = new TextractClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

function isPdf(contentType: string, key: string) {
  return (
    contentType === "application/pdf" || key.toLowerCase().endsWith(".pdf")
  );
}

export async function startTextractForS3Object(params: {
  key: string;
  contentType: string;
}) {
  if (!BUCKET) throw new Error("S3_BUCKET_INKLUE não configurado");

  if (isPdf(params.contentType, params.key)) {
    const cmd = new StartDocumentTextDetectionCommand({
      DocumentLocation: { S3Object: { Bucket: BUCKET, Name: params.key } },
    });
    const res = await textract.send(cmd);
    if (!res.JobId) throw new Error("Textract não retornou JobId");
    return { mode: "ASYNC_PDF" as const, jobId: res.JobId };
  }

  const obj = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: params.key }),
  );
  const bytes = await obj.Body?.transformToByteArray();
  if (!bytes) throw new Error("Não foi possível ler o arquivo do S3");

  const cmd = new DetectDocumentTextCommand({
    Document: { Bytes: bytes },
  });

  const res = await textract.send(cmd);
  const lines = (res.Blocks ?? [])
    .filter((b) => b.BlockType === "LINE" && b.Text)
    .map((b) => b.Text as string);

  return { mode: "SYNC_IMAGE" as const, text: lines.join("\n") };
}

export async function pollTextractJob(jobId: string) {
  const cmd = new GetDocumentTextDetectionCommand({ JobId: jobId });
  const res = await textract.send(cmd);

  const status = res.JobStatus;
  if (status === "IN_PROGRESS") return { status: "PROCESSING" as const };

  if (status === "FAILED") {
    return { status: "FAILED" as const, error: "Textract falhou" };
  }

  const lines = (res.Blocks ?? [])
    .filter((b) => b.BlockType === "LINE" && b.Text)
    .map((b) => b.Text as string);

  return { status: "DONE" as const, text: lines.join("\n") };
}
