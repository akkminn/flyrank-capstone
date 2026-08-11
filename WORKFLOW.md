# AI Workflow Comparison

Two branches implement the same feature, a portfolio contact form, from two very
different prompts. `ai-vague` was given one line: "Create a contact form for my
portfolio." `ai-structured` was given a detailed spec that asked the model to
inspect the project first, plan, follow the conventions in CLAUDE.md, cover
specific validation and accessibility rules, and write and run tests. Diffing the
branches shows where a loose prompt still lands well and where it falls short.

## Functionality

`ai-vague` works. It creates name, email, and message fields with the correct
input types, validates required values, checks the email with a regex, and
enforces a minimum message length. Invalid input such as a numeric-only email is
rejected with a clear message, and a success message appears on submit. For a
one-line prompt this is a solid result.

`ai-structured` does all of that and more. It adds a subject field, extracts the
rules into a reusable `contactFormValidation.ts` module, focuses the first
invalid field on submit, and adds a submitting state and a distinct error state
alongside the success state. It also exposes an `onSubmit` prop so the form is
reusable rather than hardcoded.

## Accessibility

Both branches are strong here, and the vague form needs no fixes. Every input has
an associated `<label>`, errors use `aria-invalid` and `aria-describedby`, and the
success message is announced with `role="status"`.

`ai-structured` goes further: errors carry `role="alert"`, the form sets
`aria-busy` while submitting, required fields are marked, and errors stay hidden
until a field is touched or submit is attempted, so the user is not scolded early.

## UX

This is where `ai-vague` slips. The form is centered but its width is driven by
content, so its footprint shifts noticeably after submission when the fields give
way to the success message. It is also cramped and visually plain.

`ai-structured` is centered with a stable, deliberately styled layout that does
not jump between states, and the submitting label gives clear feedback.

## Review Effort

`ai-vague` is one self-contained file and quick to read, but it ships no tests, so
trusting it means checking every path by hand.

`ai-structured` is larger, yet easier to trust: validation is isolated and unit
tested with ten cases covering validation and submission, and the plan-first
approach kept changes scoped to relevant files.

## Takeaway

A vague prompt can still produce correct, accessible output. The structured
prompt is what turned a working form into a reusable, tested, and polished one.
