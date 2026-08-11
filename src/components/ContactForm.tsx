import { useId, useRef, useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent, RefObject } from 'react'
import { validateContactForm } from './contactFormValidation'
import type { ContactFormValues } from './contactFormValidation'
import './ContactForm.css'

export interface ContactFormProps {
  /** Called with the form values on a valid submit. Defaults to a simulated send. */
  onSubmit?: (values: ContactFormValues) => Promise<void>
}

type FieldName = keyof ContactFormValues
type Status = 'idle' | 'submitting' | 'success' | 'error'

const REQUIRED_FIELDS: FieldName[] = ['name', 'email', 'subject', 'message']

const initialValues: ContactFormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

async function defaultSubmit(values: ContactFormValues): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600))
  console.info('Contact form submitted', values)
}

function ContactForm({ onSubmit = defaultSubmit }: ContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>(initialValues)
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  const headingId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  const fieldRefs: Record<FieldName, RefObject<HTMLInputElement | HTMLTextAreaElement | null>> = {
    name: nameRef,
    email: emailRef,
    subject: subjectRef,
    message: messageRef,
  }

  const errors = validateContactForm(values)
  const isSubmitting = status === 'submitting'

  const showError = (field: FieldName) =>
    (touched[field] || submitAttempted) && Boolean(errors[field])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (status === 'success' || status === 'error') {
      setStatus('idle')
    }
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = event.target.name as FieldName
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitAttempted(true)
    setTouched({ name: true, email: true, subject: true, message: true })

    const validationErrors = validateContactForm(values)

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalid = REQUIRED_FIELDS.find((field) => validationErrors[field])
      if (firstInvalid) {
        fieldRefs[firstInvalid].current?.focus()
      }
      return
    }

    setStatus('submitting')

    try {
      await onSubmit(values)
      setStatus('success')
      setValues(initialValues)
      setTouched({})
      setSubmitAttempted(false)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="contact-form" aria-labelledby={headingId}>
      <h2 id={headingId}>Get in touch</h2>
      <p className="contact-form__intro">
        Have a project in mind or just want to say hello? Fill out the form
        below and I&apos;ll get back to you soon.
      </p>

      {status === 'success' && (
        <p className="contact-form__status contact-form__status--success" role="status">
          Thanks for reaching out! Your message has been sent.
        </p>
      )}
      {status === 'error' && (
        <p className="contact-form__status contact-form__status--error" role="alert">
          Something went wrong sending your message. Please try again.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
        <div className="contact-form__field">
          <label htmlFor="contact-name">
            Name{' '}
            <span className="contact-form__required" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            ref={nameRef}
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            required
            aria-invalid={showError('name')}
            aria-describedby={showError('name') ? 'contact-name-error' : undefined}
          />
          {showError('name') && (
            <p className="contact-form__error" id="contact-name-error" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div className="contact-form__field">
          <label htmlFor="contact-email">
            Email{' '}
            <span className="contact-form__required" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            ref={emailRef}
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            required
            aria-invalid={showError('email')}
            aria-describedby={showError('email') ? 'contact-email-error' : undefined}
          />
          {showError('email') && (
            <p className="contact-form__error" id="contact-email-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="contact-form__field">
          <label htmlFor="contact-subject">Subject</label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            ref={subjectRef}
            value={values.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
          />
        </div>

        <div className="contact-form__field">
          <label htmlFor="contact-message">
            Message{' '}
            <span className="contact-form__required" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            ref={messageRef}
            value={values.message}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            required
            aria-invalid={showError('message')}
            aria-describedby={showError('message') ? 'contact-message-error' : undefined}
          />
          {showError('message') && (
            <p className="contact-form__error" id="contact-message-error" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        <button type="submit" className="contact-form__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </section>
  )
}

export default ContactForm
