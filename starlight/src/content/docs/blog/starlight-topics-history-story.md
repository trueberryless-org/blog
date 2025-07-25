---
title: A short history of Starlight Sidebar Topics plugins
description: In this blog post, I'll show you the evolution of Starlight plugins with a case study of the Starlight Sidebar Topics plugin.
date: 2025-05-05
tags:
    - Starlight
    - Plugins
excerpt: In this post, I'll show you the evolution of <a class="gh-badge" href="https://github.com/withastro/starlight"><img src="/starlight.png" alt="Starlight" />Starlight</a> plugins with a case study of the [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics) plugin. Be prepared to find out some impressive facts about people and code around Starlight.
authors:
    - trueberryless
    - ai
cover:
  alt: A beautiful cover image with the text "History Time"
  image: ../../../../public/blog/starlight-topics-history-story.png
---

Maybe you have heard about this cool documentation framework before. I talk about it quite often and use it regularly. Not only because I'm an active contributor, but also because [Starlight](https://starlight.astro.build) just grew to my heart. Its features: Simplicity and minimalism, but everything you need. Its performance: [Faster than 98% of other websites out there](https://www.websitecarbon.com/website/starlight-astro-build-getting-started/). Its accessibility: Not even a question!

## The Creation

However, one thing that's objectively missing in my opinion is a granular way of separating broad topics inside your documentation. And I'm not alone with this subjectively general accepted opinion. [HiDeoo](https://github.com/HiDeoo) is not only one of the most active maintainers of the project, but also the author of the most and imho best plugins you can find for Starlight. And they have also noticed this missing niche functionality about topics. That's why they decided to create the [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics) plugin early on, back in October 2024, which allows you to make a sidebar with topics. Read more about the plugin's functionalities in [its documentation](https://starlight-sidebar-topics.netlify.app/).

The one thing that bothered me personally in the early days of the plugin was the way topics were displayed in the sidebar. Because it doesn't - like I imagined a solution could look like - use some kind of dropdown menu for switching between topics, but instead always shows all topics. This design choice was, as [HiDeoo clearly points out](https://github.com/HiDeoo/starlight-sidebar-topics/issues/2#issuecomment-2410196392), very intentional and not without any reason: All topics should be visible at once. Proven by the [Astro](https://github.com/withastro) docs themselves ([Chris Swithinbank](https://github.com/delucis) implemented the ["tabbed sidebar"](https://github.com/withastro/docs/pull/9890) for the Astro v5 docs later in the same month), this approach definitely has many benefits over a dropdown menu. Nonetheless, I was still unsatisfied by this design, and so I created my own version.

Copying and pasting was my strength when it came to building a new Starlight plugin for the community. And so, I did just that. I took the Starlight Sidebar Topics plugin as a starting point and just had to adapt the `Topics.astro` component, which includes the HTML for rendering the topics in the sidebar. After struggling for some time with the implementation of a satisfying enough dropdown menu, which was pure HTML + CSS but also clean to look at (sorry for the self-praise, I'm just proud of myself), I finally found a solution that I'm very satisfied with and released this new plugin under the name [Starlight Sidebar Topics Dropdown](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown) - how original.

## The Adaptation

You might think that this story is now over because everyone could just use the variant they want, everyone is happy. But Starlight kept and keeps improving and around three months later, on the 15th of February, coming almost as a [birthday present](https://trueberryless.org/work/20th-birthday/) for me, was the long-awaited addition of route data in Starlight with the release of [v0.32](https://github.com/withastro/starlight/releases/tag/@astrojs/starlight@0.32.0). This seemingly small addition opened up so many possibilities, which I myself never saw coming. HiDeoo once again was the leading inspiration for plugin authors and pushed this new functionality to its limits. It took them just two days to [adapt over 11 plugins to the latest Starlight version back then](https://bsky.app/profile/hideoo.dev/post/3liffpudc5c2b) and they later improved and refactored much of the code to make even more use of this powerful feature.

And so comes the day when HiDeoo contacts me to tell me that the Starlight Sidebar Topics plugin now uses Starlight's new route data feature. At first, I didn't quite understand what benefits these implementation changes would have, but then HiDeoo took the time to explain to me that I could now turn the Starlight Sidebar Topics Dropdown plugin into a simple component which uses the route data from his plugin. Intuitively, I was opposed to this smart idea because it felt like my only plugin that made some popularity was turned into some useless component. I couldn't have been further from the truth.

## The Union

Eventually, I decided to refactor my plugin into a component - this refactoring casually eliminated exactly [1210 lines of code and added 68 lines of changelog](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/pull/40) - and I noticed, how little code it now took to turn the `Topics.astro` list into a dropdown from a user's perspective. I was confident that this really was the right direction for the ~~plugin~~ component. And so I updated the whole documentation - more like: deleted more than 200 lines of text (feels good) - and released the new [version 0.5](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/releases/tag/starlight-sidebar-topics-dropdown%400.5.0).

Now you might wonder how such mature plugins could still improve over time. To be honest, I myself was very surprised when HiDeoo casually dropped a bomb in my Discord DMs. His idea was and still is ingenious. Otherwise, I wouldn't even think about this _topic_ anymore. But here I am, writing a whopping 800 words just to prepare you for what's to come. Drum roll please! Fasten your seatbelt! This statement from HiDeoo is going to blow your mind:

> "One could have something like the default built-in list on a desktop view, and on mobile use your component, or something like that 🧠" — HiDeoo, 21/03/2025 09:54

Profound. Timeless. Golden.

And that single, beautiful spark of an idea? It’s precisely what I’ll guide you through in [the post "Starlight Topics Dropdown and List together"](/blog/starlight-dropdown-and-list-together/).
