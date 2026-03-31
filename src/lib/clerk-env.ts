// Validate Clerk environment variables at runtime
export function validateClerkEnv() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secretKey = process.env.CLERK_SECRET_KEY

  const errors = []

  if (!publishableKey) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing')
  } else if (!publishableKey.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is invalid (should start with pk_)')
  }

  if (!secretKey) {
    errors.push('CLERK_SECRET_KEY is missing')
  } else if (!secretKey.startsWith('sk_')) {
    errors.push('CLERK_SECRET_KEY is invalid (should start with sk_)')
  }

  if (errors.length > 0) {
    console.error('[Clerk] Environment validation failed:', errors)
    return { valid: false, errors }
  }

  return { valid: true, errors: [] }
}

export const clerkEnv = validateClerkEnv()
