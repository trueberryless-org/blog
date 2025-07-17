---
title: Une brève histoire des plugins Starlight Sidebar Topics
description: Dans cet article de blog, je vais vous montrer l'évolution des
  plugins Starlight à travers une étude de cas du plugin Starlight Sidebar
  Topics.
date: 2025-05-05
tags:
  - Starlight
  - Plugins
excerpt: Dans cet article, je vais vous montrer l'évolution des plugins <a
  class="gh-badge" href="https://github.com/withastro/starlight"><img
  src="/starlight.png" alt="Starlight" />Starlight</a> à travers une étude de
  cas du plugin [Starlight Sidebar
  Topics](https://github.com/hideoo/starlight-sidebar-topics). Préparez-vous à
  découvrir des faits impressionnants sur les personnes et le code derrière
  Starlight.
authors:
  - trueberryless
  - ai
cover:
  alt: A beautiful cover image with the text "History Time"
  image: ../../../../../public/blog/starlight-topics-history-story.png

---

Peut-être avez-vous déjà entendu parler de ce cadre de documentation génial. J'en parle assez souvent et je l'utilise régulièrement. Non seulement parce que je suis un contributeur actif, mais aussi parce que [Starlight](https://starlight.astro.build) m'est tout simplement cher. Ses caractéristiques : simplicité et minimalisme, tout en ayant tout ce qu'il faut. Sa performance : [plus rapide que 98 % des autres sites web](https://www.websitecarbon.com/website/starlight-astro-build-getting-started/). Son accessibilité : même pas une question !

## La Création

Cependant, une chose qui manque objectivement à mon avis est une manière granulaire de séparer les sujets larges dans votre documentation. Et je ne suis pas le seul à avoir cette opinion généralement acceptée de manière subjective. [HiDeoo](https://github.com/HiDeoo) n'est pas seulement l'un des mainteneurs les plus actifs du projet, mais aussi l'auteur des plugins les plus nombreux et, selon moi, les meilleurs que vous pouvez trouver pour Starlight. Et ils ont également remarqué ce manque de fonctionnalité de niche concernant les sujets. C'est pourquoi ils ont décidé de créer le plugin [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics) dès le début, en octobre 2024, qui vous permet de créer une barre latérale avec des sujets. Lisez-en plus sur les fonctionnalités du plugin dans [sa documentation](https://starlight-sidebar-topics.netlify.app/).

Ce qui me dérangeait personnellement dans les premiers jours du plugin, c'était la manière dont les sujets étaient affichés dans la barre latérale. Parce qu'il n'utilise pas - comme je l'imaginais - une sorte de menu déroulant pour passer d'un sujet à l'autre, mais affiche plutôt tous les sujets en même temps. Ce choix de conception était, comme [HiDeoo le souligne clairement](https://github.com/HiDeoo/starlight-sidebar-topics/issues/2#issuecomment-2410196392), très intentionnel et non sans raison : tous les sujets doivent être visibles en même temps. Prouvé par la documentation d'[Astro](https://github.com/withastro) elle-même ([Chris Swithinbank](https://github.com/delucis) a implémenté la ["barre latérale à onglets"](https://github.com/withastro/docs/pull/9890) pour la documentation Astro v5 plus tard dans le même mois), cette approche présente effectivement de nombreux avantages par rapport à un menu déroulant. Néanmoins, j'étais toujours insatisfait de cette conception, et j'ai donc créé ma propre version.

Copier et coller était ma force lorsqu'il s'agissait de créer un nouveau plugin Starlight pour la communauté. Et c'est exactement ce que j'ai fait. J'ai pris le plugin Starlight Sidebar Topics comme point de départ et je n'ai eu qu'à adapter le composant `Topics.astro`, qui inclut le HTML pour rendre les sujets dans la barre latérale. Après avoir lutté un certain temps pour mettre en œuvre un menu déroulant suffisamment satisfaisant, qui était du HTML + CSS pur mais aussi propre visuellement (désolé pour l'auto-congratulation, je suis juste fier de moi), j'ai finalement trouvé une solution qui me satisfait énormément et j'ai publié ce nouveau plugin sous le nom de [Starlight Sidebar Topics Dropdown](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown) - quelle originalité.

## L'Adaptation

Vous pourriez penser que cette histoire est maintenant terminée parce que chacun pourrait simplement utiliser la variante qu'il préfère, tout le monde est content. Mais Starlight a continué et continue de s'améliorer et environ trois mois plus tard, le 15 février, presque comme un [cadeau d'anniversaire](https://trueberryless.org/work/20th-birthday/) pour moi, est venue l'addition tant attendue des données de route dans Starlight avec la sortie de la version [v0.32](https://github.com/withastro/starlight/releases/tag/@astrojs/starlight@0.32.0). Cette petite addition en apparence a ouvert tant de possibilités, auxquelles je n'avais moi-même jamais pensé. Une fois de plus, HiDeoo a été l'inspiration majeure pour les auteurs de plugins, poussant cette nouvelle fonctionnalité à ses limites. Il ne leur a fallu que deux jours pour [adapter plus de 11 plugins à la dernière version de Starlight à l'époque](https://bsky.app/profile/hideoo.dev/post/3liffpudc5c2b) et ils ont ensuite amélioré et remanié une grande partie du code pour tirer encore plus parti de cette puissante fonctionnalité.

Et vient le jour où HiDeoo me contacte pour me dire que le plugin Starlight Sidebar Topics utilise désormais la nouvelle fonctionnalité de données de route de Starlight. Au début, je n'ai pas tout à fait compris quels avantages ces changements d'implémentation apporteraient, mais ensuite HiDeoo a pris le temps de m'expliquer que je pouvais maintenant transformer le plugin Starlight Sidebar Topics Dropdown en un simple composant qui utilise les données de route de son plugin. Intuitivement, j'étais opposé à cette idée brillante parce que cela me donnait l'impression que mon unique plugin ayant gagné une certaine popularité était réduit à un composant inutile. Je ne pouvais pas être plus loin de la vérité.

## L'Union

Finalement, j'ai décidé de remanier mon plugin en un composant - ce remaniement a éliminé exactement [1210 lignes de code et ajouté 68 lignes dans le changelog](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/pull/40) - et j'ai constaté combien il fallait maintenant peu de code pour transformer la liste `Topics.astro` en un menu déroulant du point de vue de l'utilisateur. J'étais convaincu que c'était vraiment la bonne direction pour le ~~plugin~~ composant. Et ainsi, j'ai mis à jour toute la documentation - plus précisément : j'ai supprimé plus de 200 lignes de texte (ça fait du bien) - et j'ai publié la nouvelle [version 0.5](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/releases/tag/starlight-sidebar-topics-dropdown%400.5.0).

Vous vous demandez peut-être comment des plugins aussi matures pourraient encore s'améliorer avec le temps. Pour être honnête, j'ai moi-même été très surpris lorsque HiDeoo a lâché une idée brillante dans mes DMs Discord. Son idée était et reste ingénieuse. Autrement, je ne penserais même plus à ce *sujet*. Mais là, je me retrouve à écrire environ 800 mots juste pour vous préparer à ce qui va venir. Roulement de tambour, s'il vous plaît ! Attachez votre ceinture ! Cette déclaration de HiDeoo va vous époustoufler :

> "On pourrait avoir quelque chose comme la liste par défaut intégrée pour une vue bureau, et sur mobile utiliser votre composant, ou quelque chose comme ça 🧠" — HiDeoo, 21/03/2025 09:54

Profond. Intemporel. Doré.

Et cette unique et magnifique étincelle d'idée ? C'est précisément ce que je vais vous guider à travers dans [l'article "Starlight Dropdown et Liste ensemble"](../../blog/starlight-dropdown-and-list-together/).
