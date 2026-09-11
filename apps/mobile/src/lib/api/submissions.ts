import { apiFetch } from "@/lib/api/client";
import type { SubmissionCreateRequest, SubmissionCreateResponse } from "@/types/lesson";

export async function createSubmission(payload: SubmissionCreateRequest): Promise<SubmissionCreateResponse> {
  return apiFetch<SubmissionCreateResponse>("/submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
