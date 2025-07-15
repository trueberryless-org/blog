---
title: Une courte histoire des plugins Starlight Sidebar Topics
description: |-
  Dans cet article de blog, je vous présente le développement des plugins
  Starlight à travers une étude de cas sur le plugin Starlight Sidebar Topics.
date: 2025-05-05
tags:
  - Starlight
  - Plugins
excerpt: >-
  Dans cet article, je vous présente le développement des <a
    class="gh-badge" href="https://github.com/withastro/starlight"><img
    src="/starlight.png" alt="Starlight" width="16" height="16"
    style="border-radius:9999px;vertical-align:middle;margin-right:0.4em;"
    />plugins Starlight</a> à travers une étude de cas sur le plugin [Starlight
    Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics). Préparez-vous
    à découvrir des faits impressionnants sur les personnes et le code autour de Starlight.
authors:
  - trueberryless
  - ai
cover:
  alt: A beautiful cover image with the text "History Time"
  image: ../../../../../../../public/blog/starlight-topics-history-story.png

---

Vous avez peut-être déjà entendu parler de ce framework de documentation génial. J'en parle assez souvent et je l'utilise régulièrement. Pas seulement parce que je suis un contributeur actif, mais aussi parce que [Starlight](https://starlight.astro.build) m'est tout simplement cher. Ses caractéristiques : simplicité et minimalisme, mais tout ce dont on a besoin. Ses performances : [Plus rapide que 98 % des autres sites Web sur le marché](https://www.websitecarbon.com/website/starlight-astro-build-getting-started/). Son accessibilité : sans aucun doute !

## La Genèse

Cependant, selon moi, il manque objectivement un moyen détaillé de séparer les grands thèmes au sein de votre documentation. Et avec cette opinion subjective généralement acceptée, je ne suis pas seul. [HiDeoo](https://github.com/HiDeoo) est non seulement l'un des mainteneurs les plus actifs du projet, mais aussi l'auteur de la plupart et, selon moi, des meilleurs plugins que vous pouvez trouver pour Starlight. Et même lui a remarqué ce manque de fonctionnalité spécifique en ce qui concerne les thèmes. C'est pourquoi il a décidé de créer très tôt, en octobre 2024, le plugin [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics), qui vous permet de créer une barre latérale avec des thèmes. Lisez-en davantage sur les fonctionnalités du plugin dans [sa documentation](https://starlight-sidebar-topics.netlify.app/).

La seule chose qui me dérangeait personnellement dans les premiers jours du plugin était la manière dont les thèmes étaient affichés dans la barre latérale. En effet, il n'utilisait pas – comme je m'étais imaginé une solution – une sorte de menu déroulant pour changer de thème, mais affichait à la place toujours tous les thèmes. Cette décision de conception était, comme [HiDeoo le souligne clairement](https://github.com/HiDeoo/starlight-sidebar-topics/issues/2#issuecomment-2410196392), très réfléchie et pas dénuée de fondement : tous les thèmes devaient être visibles simultanément. Prouvé par la documentation d'[Astro](https://github.com/withastro) elle-même ([Chris Swithinbank](https://github.com/delucis) a mis en œuvre la ["Tabbed Sidebar"](https://github.com/withastro/docs/pull/9890) pour les documents Astro v5 plus tard dans le même mois), cette approche présente définitivement de nombreux avantages par rapport à un menu déroulant. Néanmoins, j'étais toujours insatisfait de ce design et ai donc créé ma propre version.

Le copier-coller était mon point fort lors de la création d'un nouveau plugin Starlight pour la communauté. Et c'est exactement ce que j'ai fait. J'ai pris le plugin Starlight Sidebar Topics comme point de départ et ai simplement dû adapter le composant `Topics.astro`, qui contient le HTML pour afficher les thèmes dans la barre latérale. Après avoir passé un certain temps à me débattre pour implémenter un menu déroulant satisfaisant, uniquement en HTML + CSS et avec un aspect propre (désolé pour l'autosatisfaction, mais je suis fier de moi), j'ai finalement trouvé une solution qui me convenait parfaitement et ai publié ce nouveau plugin sous le nom de [Starlight Sidebar Topics Dropdown](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown) – quelle originalité.

## L'Adaptation

Vous pourriez penser que cette histoire est maintenant terminée, car chacun pourrait simplement utiliser la variante qu'il souhaite et tout le monde serait heureux. Mais Starlight a continué à évoluer et à s'améliorer continuellement et, environ trois mois plus tard, le 15 février, la très attendue addition des données de route à Starlight est arrivée avec la sortie de [v0.32](https://github.com/withastro/starlight/releases/tag/@astrojs/starlight@0.32.0), presque comme un [cadeau d'anniversaire](https://trueberryless.org/work/20th-birthday/) pour moi. Cet ajout apparemment mineur a ouvert tant de possibilités que je n'avais jamais envisagées. HiDeoo a de nouveau été la principale source d'inspiration pour les auteurs de plugins, repoussant les limites de cette nouvelle fonctionnalité. Il a fallu seulement deux jours pour qu'ils [adaptent plus de 11 plugins à la dernière version de Starlight](https://bsky.app/profile/hideoo.dev/post/3liffpudc5c2b), puis ils ont amélioré et remanié une grande partie du code pour tirer encore plus parti de cette puissante fonctionnalité.

C'est ainsi qu'est arrivé le jour où HiDeoo m'a contacté pour me dire que le plugin Starlight Sidebar Topics utilisait à présent la nouvelle fonctionnalité de données de route de Starlight. Au début, je ne comprenais pas tout à fait les avantages de ces changements d'implémentation, mais HiDeoo a pris le temps de m'expliquer que je pouvais désormais transformer le plugin Starlight Sidebar Topics Dropdown en un simple composant utilisant les données de route de son plugin. Intuitivement, j'étais contre cette idée astucieuse, car j'avais l'impression que mon seul plugin, qui avait gagné une certaine popularité, deviendrait un composant inutile. Je n'aurais pas pu être plus éloigné de la vérité.

## L'Union

Finalement, j'ai décidé de transformer mon plugin en un composant – cette restructuration a occasionnellement éliminé exactement [1210 lignes de code et ajouté 68 lignes de journal des modifications](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/pull/40) – et j'ai remarqué combien de code était désormais nécessaire pour convertir la liste `Topics.astro` du point de vue de l'utilisateur en un menu déroulant. J'étais convaincu que c'était vraiment la bonne direction pour le ~~plugin~~ composant. Par conséquent, j'ai mis à jour toute la documentation – ou plutôt : j'ai supprimé plus de 200 lignes de texte (cela fait du bien) – et publié la nouvelle [version 0.5](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/releases/tag/starlight-sidebar-topics-dropdown%400.5.0).

Maintenant, vous pourriez vous demander comment de tels plugins, déjà bien développés, pourraient encore s'améliorer avec le temps. Pour être honnête, j'ai moi-même été très surpris quand HiDeoo a lâché une bombe de manière très décontractée dans mes messages Discord. Son idée était et reste géniale. Autrement, je ne penserais même plus à ce *sujet*. Mais me voici, en train d'écrire pas moins de 800 mots, simplement pour vous préparer à ce qui vient. Roulement de tambour, s'il vous plaît ! Attachez vos ceintures ! Cette déclaration de HiDeoo va vous époustoufler :

> « On pourrait avoir quelque chose comme la liste intégrée standard en vue bureau et utiliser votre composant sur les appareils mobiles ou quelque chose dans ce genre 🧠 » — HiDeoo, 21.03.2025 09:54

Profond. Intemporel. Inestimable.

Et cette simple, mais magnifique étincelle d'une idée ? C'est exactement ce que je vais vous détailler dans l'article [« Starlight Topics Dropdown et liste ensemble »](../../blog/starlight-dropdown-and-list-together/).
