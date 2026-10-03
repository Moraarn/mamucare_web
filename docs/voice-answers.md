# Questionnaire voice answers

The checkup uses `useVoiceAnswer`, a single-session browser recognition adapter,
and `parseVoiceAnswer`. Recognized answers update the existing `selectedAnswer`
state. Recognition never saves an answer or advances a question. Ambiguous speech
leaves the current selection unchanged. Manual selection cancels recognition and
clears voice feedback.

The question language selector controls recognition: English uses `en-KE` and
Swahili uses `sw-KE`. Both languages' explicit answer words are parsed locally.
Symptom descriptions without an explicit answer are deliberately unknown.

The microphone button starts recognition from a user gesture; the browser handles
permission. Press it again to cancel. Sessions are aborted on language changes,
question changes, Next, manual selection, and unmount. Unsupported browsers retain
the manual questionnaire with inline fallback text.

No transcript is sent to an application AI service. Web Speech recognition may
use a browser vendor service and language availability depends on the browser;
this implementation does not promise offline recognition.

Run automated checks:

```powershell
node --test --test-isolation=none tests/voice-answer.test.mjs
npx.cmd tsc --noEmit
npm.cmd run lint -- --quiet
```

Tests cover parsing, recognition settings, permission errors, no speech,
unsupported environments, cancellation of stale results, and the questionnaire's
existing answer selection, manual override, and explicit Next action. Recognition
events are simulated; microphone hardware and browser language support require
a browser check on localhost or HTTPS:

1. Allow the microphone, say “Yes” then “No” in English on separate attempts.
2. Switch to Swahili and try “Ndiyo”, “Ndio”, and “Hapana”.
3. Confirm that the matching card is selected, the transcript is visible, and the
   question stays unchanged until Next is pressed.
4. Override a voice-selected answer manually, then press Next. Confirm the manual
   selection is used and feedback clears for the next question.
5. Try an unclear answer, remain silent, and deny microphone permission. Confirm
   inline feedback and that manual Yes/No remains available.
6. Cancel while listening or switch the language. Confirm no late result changes
   the selection. In a browser without recognition, confirm voice is disabled
   and the manual flow works.
