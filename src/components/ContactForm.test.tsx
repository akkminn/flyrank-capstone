import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm'
import { validateContactForm } from './contactFormValidation'
import type { ContactFormValues } from './contactFormValidation'

const validValues: ContactFormValues = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Collaboration',
  message: 'I would love to work together on something.',
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/name/i), validValues.name)
  await user.type(screen.getByLabelText(/email/i), validValues.email)
  await user.type(screen.getByLabelText(/subject/i), validValues.subject)
  await user.type(screen.getByLabelText(/message/i), validValues.message)
}

describe('validateContactForm', () => {
  it('requires name, email, and message', () => {
    const errors = validateContactForm({ name: '', email: '', subject: '', message: '' })
    expect(errors.name).toMatch(/enter your name/i)
    expect(errors.email).toMatch(/enter your email/i)
    expect(errors.message).toMatch(/enter a message/i)
    expect(errors.subject).toBeUndefined()
  })

  it('rejects a name shorter than 2 characters', () => {
    const errors = validateContactForm({ ...validValues, name: 'A' })
    expect(errors.name).toMatch(/at least 2 characters/i)
  })

  it('rejects a malformed email address', () => {
    const errors = validateContactForm({ ...validValues, email: 'not-an-email' })
    expect(errors.email).toMatch(/valid email/i)
  })

  it('rejects a message shorter than 10 characters', () => {
    const errors = validateContactForm({ ...validValues, message: 'too short' })
    expect(errors.message).toMatch(/at least 10 characters/i)
  })

  it('accepts fully valid values', () => {
    expect(validateContactForm(validValues)).toEqual({})
  })
})

describe('ContactForm', () => {
  it('associates every field with a semantic label', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('blocks submission and surfaces accessible errors when required fields are empty', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<ContactForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/please enter your name\./i)).toHaveAttribute('role', 'alert')
    expect(screen.getByText(/please enter your email address\./i)).toHaveAttribute(
      'role',
      'alert',
    )
    expect(screen.getByText(/please enter a message\./i)).toHaveAttribute('role', 'alert')
    expect(onSubmit).not.toHaveBeenCalled()

    const nameInput = screen.getByLabelText(/name/i)
    expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    expect(nameInput).toHaveAttribute('aria-describedby', 'contact-name-error')
    expect(nameInput).toHaveFocus()
  })

  it('shows a field error only after it has been touched', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    const nameInput = screen.getByLabelText(/name/i)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.click(nameInput)
    await user.tab()

    expect(await screen.findByText(/please enter your name\./i)).toHaveAttribute('role', 'alert')
  })

  it('shows a submitting state, then a success state, and resets the form', async () => {
    let resolveSubmit: () => void = () => {}
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve
        }),
    )
    const user = userEvent.setup()
    render(<ContactForm onSubmit={onSubmit} />)

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(onSubmit).toHaveBeenCalledWith(validValues)
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()

    resolveSubmit()

    expect(await screen.findByRole('status')).toHaveTextContent(/thanks for reaching out/i)
    expect(screen.getByLabelText(/name/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled()
  })

  it('shows an error state when submission fails and allows retry', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('network down'))
    const user = userEvent.setup()
    render(<ContactForm onSubmit={onSubmit} />)

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/went wrong sending your message/i)).toHaveAttribute(
      'role',
      'alert',
    )
    expect(screen.getByLabelText(/name/i)).toHaveValue(validValues.name)
    expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled()
  })
})
