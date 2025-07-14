---
title: Une brève histoire des plugins Starlight Sidebar Topics
description: Dans cet article de blog, je vais vous montrer l'évolution des
  plugins Starlight avec une étude de cas sur le plugin Starlight Sidebar
  Topics.
date: 2025-05-05
tags:
  - Starlight
  - Plugins
excerpt: Dans cet article, je vais vous montrer l'évolution des plugins <a
  class="gh-badge" href="https://github.com/withastro/starlight"><img
  src="/starlight.png" alt="Starlight" />Starlight</a> avec une étude de cas sur
  le plugin [Starlight Sidebar
  Topics](https://github.com/hideoo/starlight-sidebar-topics). Préparez-vous à
  découvrir des faits impressionnants sur les personnes et le code autour de
  Starlight.
authors:
  - trueberryless
  - ai
cover:
  alt: A beautiful cover image with the text "History Time"
  image: ../../../../../../public/blog/starlight-topics-history-story.png

---

Peut-être avez-vous déjà entendu parler de ce framework de documentation génial. J'en parle assez souvent et je l'utilise régulièrement. Non seulement parce que je suis un contributeur actif, mais aussi parce que [Starlight](https://starlight.astro.build) a tout simplement su gagner mon cœur. Ses fonctionnalités : simplicité et minimalisme, mais tout ce dont vous avez besoin. Ses performances : [plus rapide que 98 % des autres sites web](https://www.websitecarbon.com/website/starlight-astro-build-getting-started/). Son accessibilité : cela va de soi !

## La Création

Cependant, une chose qui manque objectivement à mon avis est un moyen granulaire de séparer les thèmes larges au sein de votre documentation. Et je ne suis pas seul avec cette opinion généralement acceptée de manière subjective. [HiDeoo](https://github.com/HiDeoo) n'est pas seulement l'un des mainteneurs les plus actifs du projet, mais aussi l'auteur des plugins les plus nombreux et, à mon humble avis, les meilleurs que vous puissiez trouver pour Starlight. Et lui aussi a remarqué cette fonctionnalité de niche manquante concernant les sujets. C'est pourquoi il a décidé de créer le plugin [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics) dès le début, en octobre 2024, qui vous permet de créer une barre latérale avec des sujets. Lisez-en davantage sur les fonctionnalités du plugin dans [sa documentation](https://starlight-sidebar-topics.netlify.app/).

La seule chose qui me dérangeait personnellement au début du plugin était la manière dont les sujets étaient affichés dans la barre latérale. Car il n'utilise pas - comme je l'imaginais - un menu déroulant pour passer d'un sujet à l'autre, mais affiche plutôt tous les sujets en permanence. Ce choix de design était, comme [HiDeoo l'a clairement souligné](https://github.com/HiDeoo/starlight-sidebar-topics/issues/2#issuecomment-2410196392), très intentionnel et pas sans aucune raison : tous les sujets doivent être visibles à la fois. Prouvé par la documentation [Astro](https://github.com/withastro) elle-même ([Chris Swithinbank](https://github.com/delucis) a implémenté la ["barre latérale à onglets"](https://github.com/withastro/docs/pull/9890) pour la documentation d'Astro v5 plus tard dans le même mois), cette approche présente définitivement de nombreux avantages par rapport à un menu déroulant. Néanmoins, je n'étais toujours pas satisfait de ce design, alors j'ai créé ma propre version.

Copier et coller était ma force lorsqu'il s'agissait de créer un nouveau plugin Starlight pour la communauté. Et donc, j'ai fait exactement cela. J'ai pris le plugin Starlight Sidebar Topics comme point de départ et j'ai seulement dû adapter le composant `Topics.astro`, qui inclut le HTML pour afficher les sujets dans la barre latérale. Après avoir lutté quelque temps avec la mise en œuvre d'un menu déroulant suffisamment satisfaisant, qui était pur HTML + CSS mais aussi agréable à regarder (désolé pour l'auto-congratulation, je suis juste fier de moi), j'ai finalement trouvé une solution qui me satisfait beaucoup et j'ai publié ce nouveau plugin sous le nom [Starlight Sidebar Topics Dropdown](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown) - quelle originalité.

## L'Adaptation

Vous pourriez penser que cette histoire est maintenant terminée parce que chacun pourrait simplement utiliser la variante qu'il préfère, tout le monde est content. Mais Starlight a continué et continue de s'améliorer et environ trois mois plus tard, le 15 février, arrivé presque comme un [cadeau d'anniversaire](https://trueberryless.org/work/20th-birthday/) pour moi, l'ajout tant attendu des données de route dans Starlight a eu lieu avec la sortie de [v0.32](https://github.com/withastro/starlight/releases/tag/@astrojs/starlight@0.32.0). Cet ajout apparemment mineur a ouvert tant de possibilités, que je n'aurais jamais pu prévoir. HiDeoo fut une fois de plus l'inspiration principale pour les auteurs de plugins et a poussé cette nouvelle fonctionnalité à ses limites. Il lui a fallu seulement deux jours pour [adapter plus de 11 plugins à la dernière version de Starlight à l'époque](https://bsky.app/profile/hideoo.dev/post/3liffpudc5c2b) et il a ensuite amélioré et refondu une grande partie du code pour tirer encore plus parti de cette puissante fonctionnalité.

Et c'est ainsi qu'arrive le jour où HiDeoo me contacte pour me dire que le plugin Starlight Sidebar Topics utilise désormais la fonctionnalité des données de route de Starlight. Au début, je ne comprenais pas bien quels avantages ces changements d'implémentation apporteraient, mais HiDeoo a ensuite pris le temps de m'expliquer que je pouvais maintenant transformer le plugin Starlight Sidebar Topics Dropdown en un simple composant utilisant les données de route de son plugin. Intuitivement, j'étais opposé à cette idée intelligente parce qu'il me semblait que mon seul plugin qui avait obtenu une certaine popularité était devenu un composant inutile. Je n'aurais pas pu être plus éloigné de la vérité.

## L'Union

Finalement, j'ai décidé de refondre mon plugin en un composant - cette refonte a éliminé exactement [1210 lignes de code et ajouté 68 lignes de changelog](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/pull/40) - et j'ai remarqué combien il fallait désormais peu de code pour transformer la liste `Topics.astro` en un menu déroulant du point de vue de l'utilisateur. J'étais convaincu que c'était vraiment la bonne direction pour le ~~plugin~~ composant. J'ai donc mis à jour toute la documentation - plutôt : supprimé plus de 200 lignes de texte (c'est satisfaisant) - et publié la nouvelle [version 0.5](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/releases/tag/starlight-sidebar-topics-dropdown%400.5.0).

Maintenant, vous vous demandez peut-être comment des plugins aussi matures pourraient encore s'améliorer avec le temps. Pour être honnête, j'étais moi-même très surpris lorsque HiDeoo a tranquillement lancé une bombe dans mes messages Discord. Son idée était et reste ingénieuse. Sinon, je n'y penserais même plus. Mais me voici, en train d'écrire pas moins de 800 mots juste pour vous préparer à ce qui va suivre. Roulement de tambour, s'il vous plaît ! Attachez votre ceinture ! Cette déclaration de HiDeoo va vous épater :

> "On pourrait avoir quelque chose comme la liste intégrée par défaut pour une vue sur desktop, et sur mobile utiliser ton composant, ou quelque chose comme ça 🧠" — HiDeoo, 21/03/2025 09:54

Profonde. Intemporelle. Dorée.

Et cette seule, belle étincelle d'une idée ? C'est précisément ce que je vais vous guider à travers dans [le post "Starlight Topics Dropdown and List together"](../../blog/starlight-dropdown-and-list-together/).
