---
title: How I Created One of the Technically Most Impressive GitHub Profile READMEs
date: 2025-02-05
tags:
    - GitHub
    - CI/CD
    - Markdown
excerpt: This blog posts describes the process of setting up a kubernetes cluster with k3s and cilium. We use Helm as the package manager and Cloudflare as the certificate issuer. We used the tips and tricks from Vegard S. Hagen from [his article](https://blog.stonegarden.dev/articles/2024/02/bootstrapping-k3s-with-cilium/). Essentially, this blog explains, how all the trueberryless.org websites are deployed.
authors:
    - trueberryless
    - chatgpt
---

GitHub READMEs are usually simple: some text, maybe a few images, and a couple of badges. But I wanted **more** —a profile that wasn’t just a static document but a **living, dynamic, and fully automated masterpiece** .So, I set out to create what I believe to be one of the **most technically advanced GitHub profile READMEs** —at least in my humble opinion. I dove deep into **SVG internals, GitHub Actions automation, Base64 encoding tricks, and even full HTML-to-SVG conversions** .The result? A README that is:
✅ **Visually structured with a fully dynamic Bento Grid**
✅ **Updating itself every 15 minutes without me touching it**
✅ **Containing inlined and animated SVGs instead of boring PNGs**
✅ **Featuring real-time data (Spotify, GitHub Stats, etc.)**
✅ **Using low-level techniques to embed animations inside Markdown**
But trust me—it wasn’t easy. Let me take you through the journey.

---

**1. The Bento Grid: A Dynamic Layout Powered by SVGs** I wanted my profile to feel like a **personal dashboard** , not just a text wall. The best way to achieve that? A **Bento Grid layout** with sections for my latest activity, contributions, and live data.Instead of writing static Markdown, I designed an **SVG-based layout** that could be updated dynamically. This was my first realization:

> Markdown alone is too limiting. **SVGs unlock a whole new world of possibilities.**
> Here’s a simplified version of the SVG grid structure:

```xml
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="380" height="180" rx="10" ry="10" fill="#1e1e1e"/>
  <rect x="410" y="10" width="380" height="180" rx="10" ry="10" fill="#252525"/>
  <rect x="10" y="210" width="780" height="180" rx="10" ry="10" fill="#333"/>
</svg>
```

Looks simple? Well, that’s just the foundation. **Each block needed to update dynamically** , so I couldn’t hardcode any content.

---

**2. Inlining External SVGs Inside an SVG** A big challenge was embedding **dynamic, real-time data** inside my SVG profile. For example, I wanted to show my **currently playing Spotify song** .
Most people use an external image like this:

```md
![Spotify](https://spotify-github-profile.kittinanx.com/api)
```

But that’s **boring** , and it introduces extra network requests. Instead, I wanted to **inline the entire Spotify SVG** inside my main SVG.
To do that, I set up a GitHub Action that:

1. Fetches the external SVG content

2. Parses it to extract the raw `<svg>` markup

3. Injects it inside my main SVG at predefined placeholder markers

Here’s an example of how I structured it:

```xml
<!-- INLINE SPOTIFY START -->
<svg>...</svg>
<!-- INLINE SPOTIFY END -->
```

And here’s how I replace it dynamically using a GitHub Action:

```yaml
- name: Inline External SVGs
  run: |
    curl -s "https://spotify-github-profile.kittinanx.com/api" > spotify.svg
    sed -i -e "/<!-- INLINE SPOTIFY START -->/,/<!-- INLINE SPOTIFY END -->/c\$(cat spotify.svg)" profile.svg
```

The result? **A single, self-contained SVG with live data** , without relying on external images.

---

**3. The Real Challenge: Converting an Entire HTML Page into an SVG**
This part was pure madness.
I had this crazy idea: **What if I could convert a full web page—including animations—into a single SVG?** Not just extracting SVG elements, but visually replicating the entire page.Why?
✔️ **No blurry PNG exports**
✔️ **Perfect scaling at any resolution**
✔️ **Ability to embed complex designs directly into Markdown**
To do this, I:

1. Designed my layout in **Figma** and exported it as SVG

2. Analyzed how styles and animations were stored in the SVG

3. Hand-tweaked the SVG **at a low level** to optimize it

Here’s a small snippet of an exported Figma SVG that I had to clean up manually:

```xml
<svg width="500" height="300">
  <style>
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .fade { animation: fadeIn 1s ease-in-out infinite; }
  </style>
  <text x="50" y="150" font-size="24" class="fade">Hello, SVG World!</text>
</svg>
```

Figma's output was bloated, so I stripped unnecessary `g` tags, optimized paths, and made sure animations **didn’t break when embedded** .

---

**4. Embedding Animated SVGs in Markdown** Markdown doesn’t support animated SVGs well—especially **when they’re Base64-encoded** . But I needed a way to **embed the animations directly into the README without external dependencies** .Solution? **Base64-encoding the entire SVG while keeping animations intact.**
Here’s an example of how an SVG can be embedded as an image in Markdown:

```md
<img src="data:image/svg+xml;base64,PHN2ZyB3a..."/>
```

To generate this dynamically, I added another GitHub Action step:

```yaml
- name: Convert SVG to Base64
  run: |
    base64 -w 0 animated.svg > encoded.txt
    echo "<img src=\"data:image/svg+xml;base64,$(cat encoded.txt)\"/>" > final.md
```

The final result? **An animated, embedded SVG inside my README, without breaking Markdown compatibility.**

---

**5. Automating Everything with GitHub Actions** This whole setup would be **pointless** if I had to manually update it. So, I created a GitHub Action that runs **every 15 minutes** to:
✅ Fetch and inline external SVG content
✅ Regenerate my dynamic Bento Grid
✅ Convert complex HTML structures into SVG
✅ Base64-encode animations for seamless embedding
Here’s the full workflow:

```yaml
name: Update GitHub Profile
on:
  schedule:
    - cron: "*/15 * * * *"  # Runs every 15 minutes

jobs:
  update-readme:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Fetch and Inline SVGs
        run: ./scripts/inline_svgs.sh
      - name: Convert HTML to SVG
        run: ./scripts/html_to_svg.sh
      - name: Convert to Base64
        run: ./scripts/convert_to_base64.sh
      - name: Commit and Push
        run: |
          git config --global user.name "GitHub Actions"
          git config --global user.email "actions@github.com"
          git add .
          git commit -m "Auto-update README" || exit 0
          git push
```

With this setup, **my README updates itself, 24/7, without me doing anything.**

---

**The Final Result: A Technological Marvel (At Least, to Me)** I won’t claim this is objectively **the** most impressive GitHub README ever. But in my **humble** opinion, it’s one of the **most technically advanced** .✔️ **A fully dynamic Bento Grid**
✔️ **Live-updating inlined SVGs**
✔️ **An entire web page converted into an SVG**
✔️ **Animations embedded in Markdown via Base64**
✔️ **Fully automated with GitHub Actions** And the best part? **It all works seamlessly, updating itself every 15 minutes.** So yeah, this was an insane deep dive into **low-level SVG hacking, automation, and web-to-SVG conversion** —but I’m really happy with the result.Would I do it again? **Absolutely.**
