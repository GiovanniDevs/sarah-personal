# Handover

Everything needed to take this site from where it is now to live, and to run it afterwards.

**Part 1 is for Giovanni** — finishing the project. **Part 2 is for Sarah** — deploying and running the site. Part 1 can be deleted before handover if you'd rather she only saw her half; nothing in Part 2 depends on it.

---

# Part 1 — Giovanni: finish the project

## Where things stand

All six pages are built, the accessibility pass is done, and the site is responsive. Remaining: the deployment pipeline, the go-live checks, and the handover itself.

### G0 — Get back to a clean `main`

Commit the outstanding file on `deploy`, merge, and switch back to `main` before starting anything below. The deploy pipeline should be built on top of a clean, merged tree.

While you're there, one recurring annoyance worth killing permanently — `src/fonts/OFL-SourceSans3.txt` keeps showing as modified when you haven't touched it. That's a CRLF/LF flip, not a real edit:

```bash
git checkout -- src/fonts/OFL-SourceSans3.txt
printf '* text=auto eol=lf\n' > .gitattributes
git add .gitattributes
```

Also note `.github/` is currently untracked — step 5.1 was started but never committed.

---

## G1 — Finish step 5.1: the build workflow

`.github/workflows/build.yml`. Build only, no deploy yet.

Non-negotiables:

- `npm ci`, not `npm install` — builds from the committed lockfile, so the Action installs exactly what you tested against
- Pin the Node version. Match your local `node -v`; Node 22 LTS is a safe floor for Eleventy 3.x
- The build must **fail loudly**. A broken post from Sarah has to turn the Action red, not publish something malformed

**Prove it:** push a post with deliberately broken front matter. The Action should go red. Then fix it. If it goes green, the workflow isn't doing its job and every later step is built on sand.

---

## G2 — Optional: prove the pipeline on Render first

**Worth doing, and it's about twenty minutes.** You have a Render account already, and the problem you have right now is that you cannot test the deploy half of the pipeline — Sarah's FTP credentials don't exist yet, and you shouldn't be firing test deploys at her live hosting when they do.

Render gives you a real, public deploy of this exact repo, for free, on a URL you control. What it actually proves:

- The build works on a clean machine, not just yours — catches anything accidentally depending on your local `node_modules` or file paths
- Every root-relative URL resolves correctly when served from a real web root (`/styles/base.css`, `/fees/`, the directory-index routing)
- The self-hosted fonts load over HTTPS with correct MIME types
- You have something to show Sarah before her hosting is sorted

Note the service type: **Static Site**, not Web Service. Web Service spins up a server process and would cost money; Static Site serves files from a CDN and is free.

### Steps

1. Render dashboard → **New** → **Static Site**
2. Connect the GitHub repo `GiovanniDevs/sarah-personal`
3. Branch: `main`
4. **Build command:** `npm ci && npx @11ty/eleventy`
5. **Publish directory:** `_site`
6. Deploy

That's the whole configuration. Render auto-deploys on every push to the chosen branch, and issues a free TLS certificate for its `.onrender.com` URL. Free static sites draw against your workspace's monthly bandwidth and pipeline-minute allowance — for a six-page brochure site this is negligible, but it isn't a separate free tier, so check your dashboard if you're near a limit from other projects.

**Keep this in your back pocket.** The briefing already names GitHub Pages as the contingency if smarthost.ie turns out not to allow FTP. Render is a better one: free custom domains with managed TLS, and no deploy job to write at all, because it builds from the repo itself. If smarthost.ie disappoints, this becomes the answer rather than a test rig.

**Tear it down or leave it?** Leave it. A staging URL is useful right through go-live, and it costs nothing. Just make sure Sarah doesn't end up thinking it's the live site — don't point her domain at it unless it *becomes* the live site.

---

## G3 — Step 5.2: the FTP deploy job

Add the deploy step to the existing workflow. Don't restructure what already works.

Sarah is supplying the credentials herself, so you're building this **with empty secrets** — the workflow is complete and correct, and the moment she adds three values it runs.

Use [`SamKirkland/FTP-Deploy-Action`](https://github.com/SamKirkland/FTP-Deploy-Action) — pin it to `@v4.4.0` rather than a floating tag, so a future release can't change behaviour under Sarah without anyone noticing.

Three secrets, named exactly as Part 2 tells her to name them:

| Secret | What it is |
| --- | --- |
| `FTP_SERVER` | Hostname, e.g. `ftp.hername.ie` |
| `FTP_USERNAME` | FTP account username |
| `FTP_PASSWORD` | FTP account password |

Two settings that matter more than they look:

**Use FTPS, not plain FTP.** Set `protocol: ftps`. Plain FTP sends the password in clear text on every deploy. If smarthost.ie doesn't support FTPS, that's worth knowing before handover, not after.

**Be careful what the deploy is allowed to delete.** The action syncs — files on the server that aren't in the build can be removed. Point `server-dir` precisely (on cPanel that's almost always `public_html/`) and confirm with Sarah that nothing else lives there. If she has anything else on that account, deleting it on first deploy is not a recoverable mistake.

The action keeps a `.ftp-deploy-sync-state.json` on the server to track what it has uploaded. Don't delete it — without it, every deploy re-uploads everything.

**Do not commit or push this yourself if the repo is already shared.** Show the diff, then push deliberately.

---

## G4 — Step 5.3: go-live checks

Write the checklist as a document. It's the last thing you'll want and the first thing you'll forget.

Beyond the obvious DNS/SSL items, two checks specific to this site:

- **No placeholder survives.** `grep -ri "TODO-SARAH" _site/` must return nothing. So must a search for `€—`
- **The `mailto:` works** from a phone and from a desktop mail client. It is the site's only conversion route — if it fails, the site does nothing

---

## G5 — Step 6.2: final sweep

Report only, change nothing. The full list is in the roadmap. The one that bites at handover: any remaining reference to Calendly in the repo. The design folder and the briefing's decision note mention it deliberately; nothing in `src/` should.

---

## G6 — The handover itself: transfer ownership, keep an archive copy

**The decision: transfer the repository to Sarah's account, after pushing an independent copy to your own.**

Why ownership has to move at all: GitHub bills Actions minutes to **the repository owner, not whoever triggered the run**. So as long as the repo sits in your account, every post Sarah publishes spends your minutes. Collaborator access does not change that — it's ownership or nothing.

### Why transfer rather than "she creates a repo and you push to it"

Both end in the same place. Transfer wins on the thing that actually matters here — **Sarah's time**, which is the constraint that started this conversation.

| | Transfer | She creates, you push |
| --- | --- | --- |
| What Sarah has to do | Accept one emailed invitation | Create a repo, add you as collaborator, later remove you |
| Commit history | Preserved | Preserved |
| Issues, PRs, history of the four merges | Preserved | Lost |
| Old URL | Redirects automatically | Dead |
| Risk of a half-finished state | None — it's atomic | She might create it and not get round to the rest |

The one thing transfer doesn't do is leave you with a copy — which is why the archive push comes first.

### Steps, in this order

**1. Push an archive copy to your own account.** Do this *before* transferring, so your copy is a genuinely independent repository rather than a fork that shows "forked from" and inherits her settings.

```bash
# create an empty repo in your account first, e.g. sarah-site-archive
git remote add archive https://github.com/GiovanniDevs/sarah-site-archive.git
git push archive --all
git push archive --tags
```

**2. Confirm Sarah has a GitHub account.** This is the blocker — nothing below works without it, and it's the thing she said she was short on time for. It takes about three minutes: github.com, sign up, verify the email. She does not need to know anything about git.

**3. Transfer.** Repo → **Settings** → scroll to **Danger Zone** → **Transfer ownership** → her GitHub username. She gets an email and has to accept it.

**4. Have her add you back as a collaborator** for an agreed support window — a month is reasonable — so you can help if the first deploy misbehaves. Then she removes you and the handover is genuinely complete.

**5. Set the secrets after the transfer, not before.** Secrets do not survive a transfer. If you add them first, they vanish and everyone spends an afternoon confused.

### Public or private?

Recommend **public**, and it's worth explaining to her rather than just doing it.

Public repositories get **unlimited free Actions minutes**. Private ones on the GitHub Free plan get 2,000 minutes a month — which this site would never come close to exhausting, since a build takes seconds — but public removes the question permanently and means she can never be surprised by a bill.

There is nothing secret in the repository. Credentials live in GitHub Secrets, which stay encrypted and private **even on a public repo**. Everything else is the source of a website that is, by definition, going to be public anyway.

The honest counterpoint: a public repo means her draft posts are visible before she publishes them, and anyone can read the commit history. For a career coaching brochure site that's a non-issue, but it's her call to make, not yours to assume.

---

## G7 — Still owed by Sarah

None of this is yours to chase past handover, but the site cannot go live without the first item and looks unfinished without the rest.

| Item | Consequence if missing |
| --- | --- |
| **Email address** | The site cannot convert a visitor at all. Every "Book a consultation" resolves to it |
| Fees | Every price shows `€—` |
| Testimonials | Three placeholder quotes that say they're placeholders |
| Hero photo | A dashed empty box on the homepage |
| About copy | Placeholder paragraph that announces itself |
| Final site name | "Career CV" in the footer, "Sarah Philip" in the header — currently inconsistent |
| FTP credentials + confirmation FTPS is supported | No deployment |
| Domain registered and pointed | No live site |

---
---

# Part 2 — Sarah: running your website

## What you have

Your website is a set of plain files — no database, no admin login, nothing to keep updated or patched. That's deliberate: it makes the site fast, free to run beyond hosting, and impossible to break into through a login screen.

The parts:

- **A GitHub repository** — every file the site is made of, plus the full history of every change
- **An automatic build** — when you change something, GitHub rebuilds the site and uploads it to your hosting on its own
- **Your hosting at smarthost.ie** — where the finished files live and where visitors reach them

You don't need to install anything. Everything below happens in a web browser.

---

## 0. Taking ownership of the repository

Before anything else: **the repository is transferred into your GitHub account, and you own it outright.** Giovanni keeps an archive copy of the code for his own records, but it is a separate, disconnected repository — nothing you do affects it, and nothing he does affects your live site.

You need a GitHub account for this. If you don't have one, it takes about three minutes at [github.com](https://github.com) — sign up, verify your email address. You never need to install anything or learn git; everything in this guide happens in the browser.

**What to do:** Giovanni starts the transfer, you get an email from GitHub, you click to accept. That's the whole thing.

**Why it's set up this way rather than left in his account:** GitHub charges the *owner* of a repository for the automated builds, whoever triggered them. If the repository lived in his account, every blog post you published would be spending his allowance — and you'd be depending on him keeping the repository alive. This way the site is entirely yours.

**One choice to make:** whether the repository is public or private. Public is recommended — it means the automated builds are unlimited and free forever, where a private repository has a monthly allowance (generous, and you'd never reach it, but it exists). Your login details are **not** stored in the repository either way; they live in a separate encrypted area that stays private even on a public repository. The only real difference is that on a public repository, anyone can read the site's source and see your draft posts before you publish them. For a brochure site that's usually fine, but it's your decision.

**After the transfer:** it's worth keeping Giovanni as a collaborator for a month or so, in case the first deploy needs help. Repository → **Settings** → **Collaborators** → **Add people**. You can remove him at any time.

---

## 1. Getting the site deployed

This is a one-time setup. After it, you never do it again — changes publish themselves.

### What's already done

The repository contains an automated workflow: when anything changes, GitHub builds the site and uploads it to your hosting over FTP. It's written, tested, and waiting for one thing — your hosting credentials. It can't have them in advance, because storing them anywhere in the files would expose them publicly.

Do this **after** the repository transfer in section 0 — secrets don't survive a transfer, so anything added beforehand would have to be added again.

### Step 1 — Get your FTP details from smarthost.ie

Log in to your smarthost.ie control panel (cPanel) and find the FTP Accounts section. You need three things:

- **FTP server** — a hostname, something like `ftp.yourdomain.ie`
- **FTP username**
- **FTP password**

Two things to check while you're in there:

- **Does the account support FTPS?** (FTP over SSL — sometimes listed as "Explicit TLS".) The workflow uses it so your password isn't sent in plain text. If smarthost.ie doesn't offer it, tell Giovanni before going live
- **Which folder do website files go in?** On almost every host it's `public_html`. If anything else already lives in that folder, say so — the deploy is set up to keep the folder matching the site, which means it can remove files it doesn't recognise

### Step 2 — Add them to GitHub

In the repository on GitHub:

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add three, named exactly like this — the names are case-sensitive and the workflow looks for them precisely:

| Name | Value |
| --- | --- |
| `FTP_SERVER` | Your FTP hostname |
| `FTP_USERNAME` | Your FTP username |
| `FTP_PASSWORD` | Your FTP password |

Secrets are encrypted. Nobody — including you — can read them back afterwards; you can only replace them. That's normal.

### Step 3 — Run the first deploy

Go to the **Actions** tab. Find the most recent workflow run and click **Re-run all jobs**.

Watch it. A green tick means the site built and uploaded. A red cross means something went wrong — click into the run and read the last few lines of the log, which usually names the problem directly (wrong password, wrong hostname, folder not found).

Then visit your site. If you see it, deployment is done permanently. Every future change publishes itself within a minute or two.

---

## 2. Your domain, SSL and making the address work properly

Four things, in this order. Your host's control panel handles all of them.

### Point the domain at the hosting

If you registered the domain through smarthost.ie, this is likely done already. If you registered elsewhere, log in to that registrar and change the **nameservers** to the ones smarthost.ie gives you.

DNS changes take anywhere from a few minutes to a day to spread across the internet. If the site doesn't appear immediately, that's usually why — wait before assuming something is broken.

### Turn on SSL

SSL is what puts the padlock in the address bar and makes your address start `https://` instead of `http://`. Without it, browsers show visitors a "Not secure" warning, which for a coaching practice is worth avoiding.

In cPanel, look for **SSL/TLS Status** or **Let's Encrypt**. Free certificates are standard — your plan should include one. Issue it for your domain, and for the `www` version too.

### Force https

Once the certificate works, make `http://` redirect to `https://` so visitors always land on the secure version. cPanel usually has a **Force HTTPS Redirect** toggle in the Domains section. Switch it on.

### Pick www or no-www

`yoursite.ie` and `www.yoursite.ie` should not both work independently — search engines treat them as two different sites and split your ranking between them. Choose one, and set the other to redirect to it. Either choice is fine; it just has to be a choice.

---

## 3. Publishing a blog post

Everything here happens in your browser, in GitHub.

### The short version

Copy the sample post, change the words, commit. The site updates itself about a minute later.

### Step by step

**1. Open the posts folder.** In the repository, go to `src/posts/`. You'll see `five-cv-mistakes.md` — the sample post. **Don't delete it.** It's your working template, and it's the thing to copy each time.

**2. Copy it.** Open it, click the pencil icon to edit, select everything, and copy. Then go back to the `src/posts/` folder, click **Add file** → **Create new file**, and paste.

**3. Name the file.** The filename becomes part of the web address, so keep it lowercase with hyphens instead of spaces:

```
how-to-prepare-for-an-interview.md
```

becomes `yoursite.ie/blog/how-to-prepare-for-an-interview/`. Always end the name with `.md`.

**4. Fill in the three lines at the top.** Every post starts with a block between two rows of dashes. It must look exactly like this — three lines, no extras:

```
---
title: How to prepare for an interview
date: 2026-09-14
description: A short summary that appears on the blog index and in Google results.
---
```

The date format matters: **four-digit year, two-digit month, two-digit day, joined by hyphens.** `2026-09-14`, not `14/09/2026` and not `Sept 14`. Getting this wrong is the single most common way a post fails to publish.

**5. Write the post** underneath the closing dashes. Plain typing works fine. For formatting:

| To get | Type |
| --- | --- |
| **Bold** | `**bold**` |
| *Italic* | `*italic*` |
| A heading | `## Your heading` |
| A link | `[the words](https://the-address.ie)` |
| A bullet list | `- one item` per line |
| A numbered list | `1. first item` per line |

Leave a blank line between paragraphs.

**6. Commit.** Scroll to the bottom, type a short note in the "Commit new file" box — "add interview prep post" is plenty — and click **Commit new file**.

**7. Wait about a minute**, then check the site. Your post appears on the blog page and has its own address. The blog index updates itself; there's no second place to add it.

### Editing or deleting a post

Same process. Open the file, click the pencil, change it, commit. To delete, open the file and use the bin icon.

Nothing is ever truly lost — GitHub keeps every version of every file forever. If you break something, it can always be recovered.

---

## 4. When something goes wrong

**The post didn't appear after a few minutes.**

Go to the **Actions** tab in the repository. Each entry is one attempt to publish.

- **Green tick** — it published. Try a hard refresh in your browser (Ctrl+F5, or Cmd+Shift+R on a Mac); you're probably seeing a cached copy
- **Orange dot** — still running. Wait
- **Red cross** — the build failed and nothing was published

**A red cross is not a broken website.** This is the safety net working as intended: if a post has a problem, the build stops rather than publishing something malformed. Your live site is untouched and visitors see the previous version.

Nine times out of ten the cause is the date format or a missing line in the block at the top of the post. Click the red run and read the last few lines of the log — it usually names the file.

**To undo anything**, find your commit in the repository's history and use **Revert**. That creates a new change putting things back as they were, and the site rebuilds. It's always safe.

---

## 5. What this costs to run

- **Hosting and domain** — your annual smarthost.ie bill
- **Everything else** — nothing. No CMS licence, no plugin subscriptions, no database, no booking-tool fee

There's no software to update and no security patching, because there's no login area or database to attack. The site is just files.

---

## Sources

- [Render Static Sites documentation](https://render.com/docs/static-sites)
- [SamKirkland/FTP-Deploy-Action releases](https://github.com/SamKirkland/FTP-Deploy-Action/releases)
- [GitHub Actions billing](https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions) — minutes are charged to the repository owner; free for public repositories
