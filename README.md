# Havenlist

Real estate landing page for Havenlist — find your livings.

**Live:** [havenlist.vercel.app](https://havenlist.vercel.app)

## Local preview

```bash
python3 -m http.server 8791
```

Open `http://127.0.0.1:8791`

## Feedback widget

Leave feedback pinned to any part of any page; each comment becomes a GitHub issue.

1. In Vercel → Settings → Environment Variables add `FEEDBACK_CODE` (any long random string) and `GITHUB_TOKEN`
   (fine-grained token for this repo only, permission *Issues: Read and write*), then redeploy.
2. Open any page once with `?feedback=YOUR_CODE`. A "Feedback" button appears bottom-left in that browser
   (`?feedback=off` turns it off). Choose *Tambah feedback…*, click the part of the page, write the comment, send.
3. Ask Claude to "rekap feedback": it reads the issues, recaps them per page and fixes them in parallel
   (see `.claude/skills/feedback-triage/SKILL.md`).
