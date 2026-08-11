import { useState } from 'react'
import type { FormEvent } from 'react'
import './ContactForm.css'

interface FormValues {
  name: string
  email: string
  message: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = { name: '', email: '', message: '' }

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.'
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!values.message.trim()) {
    errors.message = 'Please enter a message.'
  } else if (values.message.trim().length < 10) {
    errors.message = 'Message should be at least 10 characters.'
  }

  return errors
}

function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle')

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validate(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      setStatus('submitted')
      setValues(initialValues)
    }
  }

  return (
    <section className="contact-form" aria-labelledby="contact-form-heading">
      <h2 id="contact-form-heading">Get in touch</h2>

      {status === 'submitted' && (
        <p className="contact-form__success" role="status">
          Thanks for reaching out! I'll get back to you soon.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="contact-form__field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p className="contact-form__error" id="name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="contact-form__field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p className="contact-form__error" id="email-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="contact-form__field">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={values.message}
            onChange={handleChange}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <p className="contact-form__error" id="message-error">
              {errors.message}
            </p>
          )}
        </div>

        <button type="submit">Send message</button>
      </form>
    </section>
  )
}

export default ContactForm
