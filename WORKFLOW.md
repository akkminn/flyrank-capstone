# AI Workflow Comparison

Two branches implement the same feature, a settings page, from two very
different prompts. `ai-vague` was given a single line: "Create a settings page
in React." `ai-structured` was given an explicit spec covering the file to
touch, the tech stack, validation rules, accessibility, and verification steps.
Diffing the branches shows how much the prompt shapes the result.

## Correctness

`ai-vague` did not build what was asked. Despite "in React," it produced a
single static `settings.html` file with inline CSS and a small script. There are
no controlled components, no TypeScript, and no validation. Save simply flashes a
toast, and the form fields carry hardcoded personal data. It looks like a
settings page but implements none of the real behavior.

`ai-structured` produced a genuine React and TypeScript component,
`SettingsForm.tsx`. Fields are controlled, values are typed, required fields and
email format are validated with a regex, and Save stays disabled until the form
is valid. The success message appears only after a valid submit. It does what the
spec describes.

## Accessibility

`ai-vague` is weak here. Inputs are visually labeled by neighboring `div`
elements rather than real `<label>` associations, the theme `select` has no
label, and the toggle switches hide their checkboxes with no accessible name.
A screen reader user would struggle.

`ai-structured` treats accessibility as a requirement. Every field uses
`<label htmlFor>`, errors use `role="alert"` with `aria-invalid` and
`aria-describedby`, the form is `aria-labelledby` its heading, and the success
message uses `role="status"`. The markup is semantic and keyboard friendly.

## Edge Cases

`ai-vague` handles none. There is nothing to validate, so empty or malformed
input passes silently.

`ai-structured` anticipates several. Errors only surface after a field is touched
or on submit, so the form does not scold the user prematurely. The success
message hides again once a field is edited, and a native form submit while
invalid reveals all errors at once.

## Review Effort

`ai-vague` is short and quick to read, but reviewing it means rejecting it: it
misses the stack, the validation, and the accessibility, so it needs a rewrite.

`ai-structured` is larger, yet easier to trust. Functions stay small, helper
components are extracted, and eleven unit tests document the intended behavior,
so review becomes verification rather than guesswork.

## Takeaway

A precise prompt moved the work from "looks right" to "is right." The structured
prompt cost more effort upfront and saved far more at review.
