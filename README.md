# Havenlist

Real estate landing page for Havenlist — find your livings.

**Live:** [havenlist.vercel.app](https://havenlist.vercel.app)

## Local preview

```bash
python3 -m http.server 8791
```

Open `http://127.0.0.1:8791`

## Page comments (feedback)

Leave a comment on any spot of any page, Figma style. No setup, no server, no login.

1. On the site press the floating **Feedback** button (or the **C** key), click a spot, write the comment, save.
   A numbered pin stays on that spot (in your browser). Click a pin to mark it **Selesai** or delete it.
2. Press **Salin** (appears once there are comments): all open comments are copied as readable text plus data.
3. Paste it into the Claude chat and say "rekap feedback": Claude recaps per page and fixes in parallel
   (see `.claude/skills/feedback-triage/SKILL.md`).

`api/feedback.js` can instead file comments as GitHub issues (needs `GITHUB_TOKEN` in Vercel), but the widget
does not call it right now.
