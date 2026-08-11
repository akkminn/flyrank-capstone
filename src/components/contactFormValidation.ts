export interface ContactFormValues {
  name: string
  email: string
  subject: string
  message: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const message = values.message.trim()

  if (!name) {
    errors.name = 'Please enter your name.'
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.'
  }

  if (!email) {
    errors.email = 'Please enter your email address.'
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!message) {
    errors.message = 'Please enter a message.'
  } else if (message.length < 10) {
    errors.message = 'Message must be at least 10 characters.'
  }

  return errors
}
