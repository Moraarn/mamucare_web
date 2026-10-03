# Authentication design

Sign in and registration share the centered card in `components/auth/AuthClient.tsx`.
The form occupies 48% and the visual occupies 52% at the existing `md` breakpoint.
Below `md`, the visual is hidden and the form uses the available width. The auth page stays within 100dvh. The card is capped at 820px and its form area can scroll internally on short screens or when the keyboard is open, keeping every field reachable without scrolling the page.
Existing registration steps, API payloads and theme tokens are retained.
Password recovery is visibly unavailable because no recovery endpoint or support contact exists.

## Image asset

- Asset: `public/images/maternal-support.png`
- Generated using the built-in image_gen tool; original fictional subjects, not the supplied CRM photo.
- The overlay and all text are rendered in CSS/HTML, independently of the image.
- Final generation prompt:

> Use case: photorealistic-natural. Asset: portrait photograph for the right half of a maternal-health authentication card. Create an original warm, natural editorial photograph of an adult Kenyan pregnant woman in a soft off-white dress seated comfortably, sharing a relaxed smile with an adult Kenyan female community health worker wearing a plain deep green blouse. Calm modern clinic with soft daylight, warm off-white walls and subtle greenery. Respectful, reassuring, candid, realistic skin and hands, no medical procedure. Portrait composition, subjects in upper and middle two thirds, lower third quiet for a website text overlay added separately. MamuCare deep green and cream palette. No text, logos, watermark, UI, borders or graphics. Save the generated asset for use in the project.

## Validation

- `npx tsc --noEmit`: passed.
- Targeted ESLint on AuthClient, LoginForm, SignupStepper, PhoneInput and ProgressDots: passed.
- Tailwind compilation of `app/globals.css`: passed.
- Browser verification and production rebuild were not repeated after earlier process-permission requests were declined.
