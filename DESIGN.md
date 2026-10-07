---
name: Tally Private 2
description: A quiet, paper-like personal list for the things that need doing today, behind a sign-in
colors:
  paper: "#FBF8F2"
  card: "#FFFFFF"
  ink: "#1F2421"
  ink-soft: "#5C645F"
  line: "#E4DED2"
  accent: "#2F5D50"
  accent-hover: "#264C42"
  accent-ink: "#FBF8F2"
  danger: "#A2402E"
  danger-tint: "#F7E6E1"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "10px"
spacing:
  container: "36rem"
  gutter: "1.25rem"
  page-top: "4rem"
  page-top-mobile: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.25rem"
  sign-in-card:
    backgroundColor: "{colors.card}"
    borderColor: "{colors.line}"
    rounded: "{rounded.md}"
    padding: "1.5rem"
  list:
    backgroundColor: "{colors.card}"
    borderColor: "{colors.line}"
    rounded: "{rounded.md}"
  notice-error:
    backgroundColor: "{colors.danger-tint}"
    textColor: "{colors.danger}"
    rounded: "{rounded.sm}"
---

## Overview

Tally Private 2 is one short list per person, so the page should feel like a sheet of good paper on a
desk rather than a productivity dashboard. Warm off-white paper, dark ink, one deep green accent and
a serif wordmark. Everything sits in a single narrow column; the list is the product. The sign-in
page is the same sheet of paper with a small form on it, not a marketing page.

## Colors

- **Paper** is the page background. **Card** is the white sheet the list and the sign-in form sit on.
- **Ink** is for the wordmark, item titles and counts. **Ink-soft** is for supporting text, finished
  items, the signed-in email and the Remove button.
- **Accent** (green) is the Add and Sign in buttons, checkboxes and focus rings. Nothing else.
- **Danger** and its tint are only for error notices and the Remove hover.
- **Line** draws the list border, the dividers between items and the dashed empty state.

## Typography

- **Fraunces** (serif, 600) for the wordmark and the empty-state title only.
- **Inter** for everything else: inputs, labels, buttons, items, notices.
- The wordmark scales with `clamp(2.25rem, 6vw, 3rem)`. Body is 1rem at line-height 1.5.

## Layout

- One centered column, `max-width: 36rem`, `1.25rem` side gutter, `4rem` from the top (`2.5rem` under 480px).
- Signed in: account line (email and "Sign out", right-aligned, small) → wordmark with the
  "n of m left" count → add form → notice (if any) → list or state.
- Signed out: wordmark → one line saying what to do → notice (if any) → sign-in card → fine print.
- The add form stays one row at every width; the input shrinks, the button doesn't.

## Elevation & Depth

- Flat. No shadows. The white list against the warm paper and hairline borders give the depth.

## Shapes

- Inputs, buttons and notices use `6px`. The list, the sign-in card and the empty state use `10px`.
- No icons or illustrations; the favicon is a check in a green rounded square.

## Components

- **Add form:** text input plus the one primary button. The button is dimmed until there is text.
- **Sign-in card:** email and password fields stacked, each with a visible label above it, then the
  one primary "Sign in" button, left-aligned and dimmed until both fields are filled. No sign-up
  link and no "forgot password".
- **Account line:** the signed-in email in ink-soft and a quiet underlined "Sign out".
- **Item row:** native checkbox in the accent, title, and a quiet text "Remove" on the right. Done
  items go ink-soft with a line through.
- **States:** loading and empty sit in a dashed box in ink-soft; errors are a tinted notice with a
  "Try again" link when reloading can help.

## Do's and Don'ts

**Do**
- Keep it to one list and one primary action per screen.
- Say what happened and what to do next in one short line.

**Don't**
- Add a second accent hue, gradients or drop shadows.
- Add icon libraries, a UI kit or extra pages beyond sign-in and the list.
