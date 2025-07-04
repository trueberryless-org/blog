---
title: Une brève histoire des plugins Starlight Sidebar Topics
description: Dans cet article de blog, je vais vous montrer l'évolution des
  plugins Starlight à travers une étude de cas du plugin Starlight Sidebar
  Topics.
date: 2025-05-05
tags:
  - Starlight
  - Plugins
excerpt: Dans cet article, je vais vous montrer l'évolution des plugins
  Starlight à travers une étude de cas du plugin [Starlight Sidebar
  Topics](https://github.com/hideoo/starlight-sidebar-topics). Préparez-vous à
  découvrir des faits impressionnants sur les personnes et le code autour de
  Starlight.
authors:
  - trueberryless
  - ai
cover:
  alt: A beautiful cover image with the text "History Time"
  image: ../../../../../public/blog/starlight-topics-history-story.png

---

Peut-être avez-vous déjà entendu parler de ce génial framework de documentation. J'en parle assez souvent et je l'utilise régulièrement. Pas seulement parce que je suis un contributeur actif, mais aussi parce que [Starlight](https://starlight.astro.build) est simplement devenu très cher à mon cœur. Ses caractéristiques : simplicité et minimalisme, mais tout ce dont vous avez besoin. Ses performances : [plus rapide que 98 % des autres sites web](https://www.websitecarbon.com/website/starlight-astro-build-getting-started/). Son accessibilité : cela ne fait même pas débat !

## La Création

Cependant, une chose qui manque objectivement à mon avis est une manière granulaire de séparer les grands sujets au sein de votre documentation. Et je ne suis pas seul avec cette opinion subjective généralement acceptée. [HiDeoo](https://hideoo.dev) n'est pas seulement l'un des mainteneurs les plus actifs du projet, mais aussi l'auteur des plugins les plus nombreux et, selon moi, les meilleurs que vous pouvez trouver pour Starlight. Et il a également remarqué ce manque de fonctionnalité pour les sujets. C'est pourquoi il a décidé de créer le plugin [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics) dès octobre 2024, permettant ainsi de créer une barre latérale avec des sujets. Vous pouvez lire davantage sur les fonctionnalités de ce plugin dans [sa documentation](https://starlight-sidebar-topics.netlify.app/).

La seule chose qui me dérangeait personnellement au début du plugin était la manière dont les sujets étaient affichés dans la barre latérale. Parce qu'il ne - comme j'imaginais qu'une solution pourrait ressembler - utilise pas de menu déroulant pour basculer entre les sujets, mais au lieu de cela affiche toujours tous les sujets. Ce choix de conception était, comme [HiDeoo le souligne clairement](https://github.com/HiDeoo/starlight-sidebar-topics/issues/2#issuecomment-2410196392), très intentionnel et non sans raison : tous les sujets doivent être visibles à la fois. Prouvé par la documentation d'Astro elle-même ([Chris Swithinbank](https://github.com/delucis) a implémenté la ["barre latérale à onglets"](https://github.com/withastro/docs/pull/9890) pour la documentation v5 d'Astro plus tard dans le même mois), cette approche possède de nombreux avantages par rapport à un menu déroulant. Néanmoins, je n'étais toujours pas satisfait de cette conception, alors j'ai créé ma propre version.

Copier-coller était ma force lorsqu'il s'agissait de créer un nouveau plugin Starlight pour la communauté. Et c'est justement ce que j'ai fait. J'ai pris le plugin Starlight Sidebar Topics comme point de départ et il m'a juste fallu adapter le composant `Topics.astro`, qui contient le HTML pour afficher les sujets dans la barre latérale. Après avoir galéré quelque temps avec la mise en œuvre d'un menu déroulant suffisamment satisfaisant, qui était en HTML + CSS pur, mais aussi agréable à regarder (désolé pour cet auto-éloge, je suis juste fier de moi), j'ai finalement trouvé une solution dont je suis très satisfait et j'ai publié ce nouveau plugin sous le nom [Starlight Sidebar Topics Dropdown](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown) - quelle originalité.

## L'Adaptation

Vous pourriez penser que cette histoire est maintenant terminée parce que chacun pourrait simplement utiliser la variante qu'il veut, tout le monde est content. Mais Starlight a continué et continue de s'améliorer, et environ trois mois plus tard, le 15 février, arrivait presque comme un [cadeau d'anniversaire](https://trueberryless.org/work/20th-birthday/) pour moi, l'ajout tant attendu des données de route dans Starlight avec la sortie de la [v0.32](https://github.com/withastro/starlight/releases/tag/@astrojs/starlight@0.32.0). Cet ajout apparemment mineur a ouvert tant de possibilités que je n'avais jamais envisagées. HiDeoo a une fois de plus été l'inspiration principale pour les auteurs de plugins et a repoussé cette nouvelle fonctionnalité à ses limites. Il lui a fallu seulement deux jours pour [adapter plus de 11 plugins à la dernière version de Starlight à l'époque](https://bsky.app/profile/hideoo.dev/post/3liffpudc5c2b), puis il a amélioré et remanié une grande partie du code pour tirer encore plus parti de cette fonctionnalité puissante.

Et voilà qu'arrive le jour où HiDeoo me contacte pour me dire que le plugin Starlight Sidebar Topics utilise désormais la fonctionnalité des données de route de Starlight. Au début, je ne comprenais pas bien quels avantages ces changements d'implémentation allaient apporter, mais HiDeoo a pris le temps de m'expliquer que je pouvais maintenant transformer le plugin Starlight Sidebar Topics Dropdown en un simple composant utilisant les données de route de son plugin. Intuitivement, j'étais opposé à cette idée intelligente parce que cela donnait l'impression que mon seul plugin, qui avait acquis une certaine popularité, devenait un composant inutile. Je ne pouvais pas être plus éloigné de la vérité.

## L'Union

Finalement, j'ai décidé de remanier mon plugin en un composant - ce remaniement a permis de supprimer exactement [1210 lignes de code et d'ajouter 68 lignes de journal des modifications](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/pull/40) - et j'ai remarqué à quel point il fallait peu de code pour transformer la liste `Topics.astro` en un menu déroulant du point de vue d'un utilisateur. J'étais convaincu que c'était vraiment la bonne direction pour le ~~plugin~~ composant. Et ainsi, j'ai mis à jour toute la documentation - plus précisément : supprimé plus de 200 lignes de texte (ça fait du bien) - et publié la nouvelle [version 0.5](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/releases/tag/starlight-sidebar-topics-dropdown%400.5.0).

Vous vous demandez peut-être comment des plugins aussi matures pourraient encore s'améliorer avec le temps. Pour être honnête, j'étais moi-même très surpris lorsque HiDeoo a lâché nonchalamment une bombe dans mes messages privés sur Discord. Son idée était et reste ingénieuse. Autrement, je n'y penserais même plus à ce *sujet*. Mais me voilà, écrivant pas moins de 800 mots juste pour vous préparer à ce qui va arriver. Roulement de tambour, s'il vous plaît ! Attachez votre ceinture ! Cette déclaration de HiDeoo va vous épater :

> "On pourrait avoir quelque chose comme la liste intégrée par défaut pour une vue sur ordinateur, et sur mobile utiliser votre composant, ou quelque chose comme ça 🧠" — HiDeoo, 21/03/2025 09:54

Profond. Intemporel. Doré.

Et cette seule, magnifique étincelle d'idée ? C'est précisément ce dont je vais vous parler dans [l'article "Starlight Topics Dropdown and List together"](../../blog/starlight-dropdown-and-list-together/).
