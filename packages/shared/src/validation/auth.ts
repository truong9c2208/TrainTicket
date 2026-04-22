export const AUTH_VALIDATION = {
  fullNameMinLength: 2,
  passwordMinLength: 8,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export function validateEmail(email: string): true | string {
  return AUTH_VALIDATION.emailRegex.test(email)
    ? true
    : 'Please enter a valid email address';
}

export function validatePassword(password: string): true | string {
  return password.length >= AUTH_VALIDATION.passwordMinLength
    ? true
    : `Password must be at least ${AUTH_VALIDATION.passwordMinLength} characters`;
}

export function validateFullName(fullName: string): true | string {
  return fullName.trim().length >= AUTH_VALIDATION.fullNameMinLength
    ? true
    : 'Full name is too short';
}
