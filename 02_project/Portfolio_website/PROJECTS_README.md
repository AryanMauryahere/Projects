# How to add projects to your portfolio

Your projects live in **one file: `projects.js`**. You never need to touch `index.html` to add, edit or remove a project. The "Project Arcade" section (Level 4) reads the list and builds the cards automatically.

## Files

| File | What it does |
|---|---|
| `index.html` | Your portfolio page (already contains the Projects section) |
| `projects.js` | The list of your projects. **This is the only file you edit.** |
| `PROJECTS_README.md` | This guide |

Keep `index.html` and `projects.js` in the **same folder**.

## Add a project in 3 steps

1. Open `projects.js`.
2. Copy this block and paste it inside the `[ ... ]` list, after the last project's `}` and a comma:

   ```js
   {
     title: "Project Name",
     description: "One or two sentences: what it does and why it matters.",
     tags: ["React", "Python", "Docker"],
     status: "completed",        // "live" | "in-progress" | "completed"
     github: "https://github.com/your-username/repo-name",
     demo: "https://your-live-link.com"
   },
   ```

3. Save, then refresh the page (Ctrl+F5 if you don't see the change).

## What each field does

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Shown in capitals on the card |
| `description` | Recommended | Keep it to 1 or 2 sentences |
| `tags` | Optional | Technologies, shown as small badges. Use `[]` for none |
| `status` | Optional | `"live"` (green), `"in-progress"` (yellow), `"completed"` (blue). Leave it out for no badge |
| `github` | Optional | Must start with `https://`. Use `""` to hide the button |
| `demo` | Optional | Must start with `https://`. Use `""` to hide the button |

Links that don't start with `http://` or `https://` are ignored on purpose, so a typo can't break the page.

## Order, editing and removing

- **Order:** projects appear in the same order as in the list. Put your best project first.
- **Edit:** change the text inside the quotes and save.
- **Remove:** delete the whole `{ ... },` block, or turn it into a comment by putting `//` at the start of each line, which is handy if you only want to hide it for now.

## Common mistakes (the section goes empty or the page stops updating)

| Mistake | Fix |
|---|---|
| Missing comma between projects | Every `}` needs a `,` after it, except the last one (a comma there is also fine) |
| Missing or extra quote | Text must be wrapped in matching `"double quotes"` |
| A quote inside your text | Write `\"` for a quote mark inside a description, or use single quotes `'` inside it |
| Project doesn't appear | Check the `[` at the top and the `];` at the bottom are still there |
| Page shows "NEW PROJECTS LOADING..." | The list is empty, or `projects.js` isn't in the same folder as `index.html` |

To find mistakes, open the page, press **F12**, and look at the **Console** tab. It shows the line number of any error in `projects.js`.

## Publishing your changes

If your portfolio is on GitHub and Vercel:

```bash
git add projects.js
git commit -m "Add new project"
git push
```

Vercel redeploys automatically after the push, usually in under a minute.

## Tips for good project cards

- Start the description with what the project **does**, not what it's built with.
- Use 3 to 6 tags. The tools you actually used are enough.
- Add the GitHub link for every project. Recruiters click it.
- Add `demo` only when the link really works.
- Mark old unfinished ideas as `"in-progress"` only if you are still working on them.
- You can't add a screenshot yet. If you want image cards, ask for that upgrade.

## Checklist before you push

- [ ] Every project has a title and a short description
- [ ] GitHub and demo links open correctly
- [ ] No commas or quotes missing (the page shows all your projects)
- [ ] Checked on mobile width (press F12, then the phone icon)
