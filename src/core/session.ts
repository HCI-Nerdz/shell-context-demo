import type { ContextToken } from "./types";

export const DEMO_TOKENS: ContextToken[] = [
  { id: "gcloud-config", label: "gcloud", value: "ftn", zone: "app", kind: "enum" },
  { id: "py-venv", label: "py", value: ".venv", zone: "app", kind: "path" },
  { id: "user", label: "user", value: "rjamd", zone: "host" },
  { id: "host", label: "host", value: "desk", zone: "host" },
  { id: "path", label: "path", value: "~/code", zone: "host", kind: "path" },
];

/** Prefix -> context token ids declared via requiresContext (prohelp-style). */
export const COMMAND_CONTEXT: Record<string, string[]> = {
  gcloud: ["gcloud-config"],
  py: ["py-venv"],
  python: ["py-venv"],
};

export const PASTE_SAMPLE = [
  "gcloud config set project my-prod",
  "gcloud compute instances list",
  "kubectl get pods",
  "# review",
  "terraform plan",
  "echo done",
  "git status",
];
