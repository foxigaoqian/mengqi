const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY'
] as const;

export function getMissingEnvVars() {
  return requiredVars.filter((key) => !process.env[key]);
}

export function hasRequiredEnvVars() {
  return getMissingEnvVars().length === 0;
}
