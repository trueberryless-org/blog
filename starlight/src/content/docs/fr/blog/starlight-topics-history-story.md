---
title: Une courte histoire des plugins Starlight Sidebar Topics
description: Dans cet article de blog, je vais vous montrer l'évolution des
  plugins Starlight avec une étude de cas du plugin Starlight Sidebar Topics.
date: 2025-05-05
tags:
  - Starlight
  - Plugins
excerpt: Dans cet article, je vais vous montrer l'évolution des <a
  class="gh-badge" href="https://github.com/withastro/starlight"><img
  src="/starlight.png" alt="Starlight" /> Starlight</a> plugins avec une étude
  de cas du plugin [Starlight Sidebar
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

Peut-être avez-vous déjà entendu parler de ce framework de documentation génial. J'en parle assez souvent et je l'utilise régulièrement. Non seulement parce que je suis un contributeur actif, mais aussi parce que [Starlight](https://starlight.astro.build) m’est vraiment cher. Ses caractéristiques : simplicité et minimalisme, mais tout ce dont vous avez besoin. Sa performance : [plus rapide que 98 % des autres sites Web](https://www.websitecarbon.com/website/starlight-astro-build-getting-started/). Son accessibilité : même pas une question !

## La Création

Cependant, une chose qui manque objectivement à mon avis est une manière granulaire de séparer les sujets larges dans votre documentation. Et je ne suis pas seul avec cette opinion subjectivement acceptée de manière générale. [HiDeoo](https://github.com/HiDeoo) n'est pas seulement l'un des mainteneurs les plus actifs du projet, mais aussi l'auteur des plus nombreux, et selon moi, des meilleurs plugins que vous pouvez trouver pour Starlight. Et ils ont également remarqué cette fonctionnalité de niche manquante concernant les sujets. C’est pourquoi ils ont décidé de créer le plugin [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics) dès le début, en octobre 2024, qui vous permet de créer une barre latérale avec des sujets. Lisez-en davantage sur les fonctionnalités du plugin dans [sa documentation](https://starlight-sidebar-topics.trueberryless.org/).

La chose qui me gênait personnellement dans les premiers jours du plugin était la manière dont les sujets étaient affichés dans la barre latérale. Parce qu'il n’utilise pas - comme je l’imaginais - un menu déroulant pour passer d'un sujet à l'autre, mais montre au contraire toujours tous les sujets. Ce choix de conception était, comme [HiDeoo le souligne clairement](https://github.com/HiDeoo/starlight-sidebar-topics/issues/2#issuecomment-2410196392), très intentionnel et non sans raisons : tous les sujets devraient être visibles en même temps. Prouvé par les documents [Astro](https://github.com/withastro) eux-mêmes ([Chris Swithinbank](https://github.com/delucis) a implémenté la ["barre latérale à onglets"](https://github.com/withastro/docs/pull/9890) pour la documentation Astro v5 plus tard dans le même mois), cette approche présente de nombreux avantages par rapport à un menu déroulant. Néanmoins, j'étais toujours insatisfait de ce design, alors j’ai créé ma propre version.

Copier et coller était ma force quand il s’agissait de créer un nouveau plugin Starlight pour la communauté. Et c’est ce que j’ai fait. J’ai pris le plugin Starlight Sidebar Topics comme point de départ et j’ai simplement adapté le composant `Topics.astro`, qui inclut le HTML pour afficher les sujets dans la barre latérale. Après avoir lutté un certain temps pour implémenter un menu déroulant qui soit satisfaisant et propre visuellement (désolé pour l'autosatisfaction, mais je suis fier de moi), j’ai finalement trouvé une solution dont je suis très satisfait et j’ai publié ce nouveau plugin sous le nom [Starlight Sidebar Topics Dropdown](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown) - quelle originalité.

## L'Adaptation

Vous pourriez penser que cette histoire est maintenant terminée car tout le monde pourrait simplement utiliser la variante qu’il souhaite, tout le monde est heureux. Mais Starlight a continué et continue de s'améliorer, et environ trois mois plus tard, le 15 février, il y a eu l'ajout tant attendu de « route data » dans Starlight avec la sortie de [v0.32](https://github.com/withastro/starlight/releases/tag/@astrojs/starlight@0.32.0). Cet ajout apparemment simple a ouvert tant de possibilités, auxquelles je n’aurais jamais pensé. HiDeoo a de nouveau été la principale source d'inspiration pour les auteurs de plugins et a poussé cette nouvelle fonctionnalité à ses limites. Il leur a fallu seulement deux jours pour [adapter plus de 11 plugins à la dernière version de Starlight à l’époque](https://bsky.app/profile/hideoo.dev/post/3liffpudc5c2b), et ils ont ensuite amélioré et remanié une grande partie du code pour tirer encore plus parti de cette fonctionnalité puissante.

Et ainsi vint le jour où HiDeoo me contacte pour me dire que le plugin Starlight Sidebar Topics utilise maintenant la nouvelle fonctionnalité de données de route de Starlight. Au début, je ne comprenais pas vraiment quels avantages ces changements d’implémentation auraient, mais HiDeoo a pris le temps de m’expliquer que je pouvais maintenant transformer le plugin Starlight Sidebar Topics Dropdown en un simple composant utilisant les données de route de son plugin. Intuitivement, j’étais opposé à cette idée intelligente car cela donnait l’impression que mon seul plugin ayant une certaine popularité devenait un composant inutile. Je ne pouvais pas être plus loin de la vérité.

## L'Union

Finalement, j’ai décidé de refondre mon plugin en un composant - cette refonte a éliminé exactement [1210 lignes de code et ajouté 68 lignes de changelog](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/pull/40) - et j’ai remarqué à quel point il fallait maintenant peu de code pour transformer la liste `Topics.astro` en un menu déroulant du point de vue d’un utilisateur. J’étais convaincu que c’était vraiment la bonne direction pour le ~~plugin~~ composant. Et donc, j’ai mis à jour toute la documentation - plus exactement : supprimé plus de 200 lignes de texte (ça fait du bien) - et j’ai publié la nouvelle [version 0.5](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/releases/tag/starlight-sidebar-topics-dropdown%400.5.0).

Vous vous demandez peut-être comment des plugins aussi matures pourraient encore s’améliorer avec le temps. Pour être honnête, moi-même j’ai été très surpris lorsque HiDeoo a lâché une idée brillante dans mes messages privés sur Discord. Son idée était et reste ingénieuse. Sinon, je n’y penserais même plus à ce *sujet*. Mais me voilà, en train d’écrire un texte de 800 mots juste pour vous préparer à ce qui va suivre. Roulement de tambour ! Attachez votre ceinture ! Cette déclaration de HiDeoo va vous épater :

> "On pourrait avoir quelque chose comme la liste intégrée par défaut sur une vue bureau, et utiliser votre composant pour la version mobile, ou quelque chose comme ça 🧠" — HiDeoo, 21/03/2025 09:54

Profond. Intemporel. En or.

Et cette seule et belle étincelle d’idée ? C’est précisément ce que je vais vous expliquer dans [l’article "Starlight Topics Dropdown and List together"](../../blog/starlight-dropdown-and-list-together/).
