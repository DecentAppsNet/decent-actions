import { info } from "./githubUtil";

const secretVars = ['key', 'token', 'password', 'secret'];

// Show first and last character of secret value.
function _hideSecret(value: string): string {
  if (!value) return value;
  const firstChar = value.charAt(0);
  const lastChar = value.charAt(value.length - 1);
  return `${firstChar}...${lastChar}`;
}

export function logEnvVars(): void {
  const envVars = Object.entries(process.env)
    .map(([key, value]) => {
      const lower = key.toLowerCase();
      if (secretVars.some(secret => lower.includes(secret))) value = _hideSecret(value);
      return `${key}=${value}`;
    })
    .join('\n');

  info(`Environment Variables:\n${envVars}`);
}