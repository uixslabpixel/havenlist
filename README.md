# Havenlist

Real estate landing page for Havenlist — find your livings.

**Live:** [havenlist.vercel.app](https://havenlist.vercel.app)

## Local preview

```bash
python3 -m http.server 8791
```

Open `http://127.0.0.1:8791`

## Page comments (feedback)

Leave a comment on any spot of any page, Figma style; each comment becomes a GitHub issue.

1. In Vercel → Settings → Environment Variables add `GITHUB_TOKEN` (fine-grained token for this repo only,
   permission *Issues: Read and write*), then redeploy.
2. On the site press the floating **Feedback** button (or the **C** key), click a spot, write the comment, send.
   Pins are visible to everyone on that page; click a pin to read the thread and reply. Closing the issue on GitHub
   removes the pin. There is no login, so anyone can comment.
3. Ask Claude to "rekap feedback": it reads the issues, recaps them per page and fixes them in parallel
   (see `.claude/skills/feedback-triage/SKILL.md`).
