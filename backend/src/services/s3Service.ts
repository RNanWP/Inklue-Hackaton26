import "dotenv/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const REGION = process.env.AWS_REGION || "sa-east-1";
const BUCKET = process.env.S3_BUCKET_INKLUE || "";

const s3 = new S3Client({ region: REGION });

export async function createPresignedUpload(params: {
  teacherId: string;
  contentType: string;
  originalName: string;
}) {
  if (!BUCKET) throw new Error("S3_BUCKET_INKLUE não configurado");

  const ext = params.originalName.split(".").pop()?.toLowerCase() || "bin";
  const key = `teachers/${params.teacherId}/uploads/${randomUUID()}.${ext}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });
  const objectUrl = `s3://${BUCKET}/${key}`;

  return { uploadUrl, key, objectUrl };
}
