---
title: Comment améliorer l'apparence des éléments de la barre latérale Starlight
description: Dans cet article de blog, nous verrons comment de petits
  changements peuvent faire une grande différence en termes d'espaces, de
  tailles de police, d'épaisseurs et de couleurs dans votre barre latérale
  Starlight.
date: 2025-04-27
tags:
  - Starlight
  - CSS
excerpt: Dans cet article de blog, nous verrons comment de petits changements
  peuvent faire une grande différence en termes d'espaces dans votre <a
  class="gh-badge" href="https://github.com/withastro/starlight"><img
  src="/starlight.png" alt="Starlight" />Starlight</a> barre latérale.
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Starlight CSS"
  image: ../../../../../public/blog/starlight-sidebar-whitespace.png

---

Vous êtes-vous déjà demandé pourquoi votre barre latérale \[Starlight]\[starlight] n'est pas si attrayante ? Saviez-vous à quel point l'espace entre les éléments de votre barre latérale est inconsciemment important ? La taille de la police, l'épaisseur et les petites différences de couleur ? Dans ce guide, nous verrons comment vous pouvez personnaliser l'apparence de votre barre latérale Starlight en quelques étapes rapides et faciles.

## Prérequis

Tout d'abord, vous devez \[configurer votre site Starlight]\[starlight-getting-started]. Ensuite, Starlight propose un \[guide sur la personnalisation des styles appliqués à votre site Starlight]\[starlight-css], qui est la fonctionnalité que nous utiliserons dans l'article d'aujourd'hui.

Comme décrit dans \[ce guide]\[starlight-css-custom], vous devez créer un fichier `.css` quelque part dans votre répertoire `src/`, où vous pouvez définir vos styles CSS. N'oubliez pas d'ajouter le chemin de ce fichier `.css` au tableau `customCss` de Starlight dans `astro.config.mjs` :

```diff lang="js"
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Docs With Custom CSS',
      customCss: [
+        // Relative path to your custom CSS file
+        './src/styles/custom.css',
      ],
    }),
  ],
});
```

Une fois ces étapes préliminaires terminées, vous êtes prêt à essayer quelques beaux ajustements au design de la barre latérale de Starlight.

## Personnalisations

Il existe d'innombrables possibilités différentes avec lesquelles vous pouvez jouer simplement avec votre CSS personnalisé. Je vais vous donner quelques idées que j'ai trouvées très utiles en jouant moi-même avec le design de la barre latérale. Bien que certaines de ces idées puissent vous sembler ridicules, je vous promets que la combinaison de quelques-unes d'entre elles rendra votre barre latérale Starlight encore plus belle.

:::note
Une chose à noter cependant est que dans cet article de blog, l'accent est mis sur le réglage du style des **éléments de niveau racine** (ceux sans enfants) dans la barre latérale.
:::

Mais avant cela, je vais vous montrer à quoi ressemble actuellement le style par défaut de la barre latérale Starlight :

![Default styling of the Starlight sidebar](../../../../assets/sidebar-css/no-css.png)

### Modifier les espaces entre les éléments de la barre latérale

Au niveau racine de votre barre latérale Starlight, il existe deux types différents d'éléments : **pages** et **groupes**. Bien que le style par défaut soit assez correct, j'ai trouvé que les espaces - c'est la marge entre les éléments qui ne contient pas de contenu - étaient un peu trop grands, surtout entre les éléments de niveau racine. Avec cet exemple de CSS personnalisé ci-dessous, j'ai réduit la marge entre les éléments de niveau racine tout en gardant la marge entre les groupes identique. Le style CSS important est mis en évidence dans le bloc de code.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li:not(:has(details)) {
  margin-top: 0rem;
}
sl-sidebar-state-persist ul.top-level > li:has(details) {
  margin-block: 0.5rem; /* default value */
}
```

![Starlight sidebar where the margin between root-level items is smaller](../../../../assets/sidebar-css/whitespaces.png)

Cela ne vous sera peut-être pas aussi utile si vous n'utilisez pas de pages de niveau racine dans votre barre latérale, car cet effet ne sera pas visible pour vous. Mais si c'est le cas, essayez cela.

### Ajuster l'épaisseur de la police des éléments de la barre latérale

\[À mon humble avis]\[imho], la chose qui me dérange le plus au sujet des éléments de niveau racine de la barre latérale de Starlight, c'est leur épaisseur. C'est probablement une prise de position très subjective, mais si vous me demandez, une seule page ne peut pas être aussi importante qu'un groupe entier de pages dans votre documentation. Par conséquent, j'ai rendu l'épaisseur de la police des éléments de niveau racine plus fine, comme vous pouvez le voir dans le bloc de code ci-dessous.

```css {6} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a[aria-current="page"] {
  font-weight: 600; /* default value */
}
sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
  font-weight: 400;
}
```

![Starlight sidebar with lighter font weight](../../../../assets/sidebar-css/font-weight.png)

### Ajuster la couleur des éléments de la barre latérale

Un petit changement subtil : j'ai rendu les éléments de niveau racine non sélectionnés plus pâles dans le bloc de code ci-dessous.

Si vous choisissez également d'utiliser ce design, je vous recommande d'appliquer uniquement la seconde modification CSS puisque la première est uniquement destinée à démontrer comment vous pourriez ajuster le style des éléments de niveau racine sélectionnés – cette règle s'applique également aux autres blocs de code dans ce blog s'ils sont marqués comme `valeur par défaut`.

```css {6} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a[aria-current="page"] {
  color: var(--sl-color-text-invert); /* default value */
}
sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
  color: var(--sl-color-gray-2);
}
```

![Starlight sidebar with dimmer colors](../../../../assets/sidebar-css/color.png)

### Ajuster la taille de la police des éléments de la barre latérale

Bien que je ne le recommande pas, vous pouvez également ajuster la taille de la police des éléments de la barre latérale. Avec cet exemple de CSS personnalisé ci-dessous, j'ai rendu la taille de la police des éléments de niveau racine plus petite.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a {
  font-size: var(--sl-text-sm);
}
```

![Starlight sidebar with smaller font size](../../../../assets/sidebar-css/font-size.png)

## Recommandations

En résumé, je vous recommande d'appliquer un mélange des options de personnalisation ci-dessus, que vous pouvez voir commodément dans un seul fichier `.css`.

Notez que j'utilise également les \[Niveaux de Cascade]\[starlight-css-cascade-layers], pris en charge depuis \[Starlight 0.34.0]\[starlight-0-34], et je recommande de les utiliser pour spécifier l'ordre dans lequel les styles CSS sont appliqués.

```css showLineNumbers=false
// src/styles/custom.css
@layer starlight, my-starlight-sidebar;

@layer my-starlight-sidebar {
  sl-sidebar-state-persist ul.top-level > li:not(:has(details)) {
    margin-block: 0rem;
  }
  sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
    font-weight: 400;
    color: var(--sl-color-gray-2);
  }
}
```

[starlight]: https://starlight.astro.build

[starlight-getting-started]: https://starlight.astro.build/getting-started/

[starlight-css]: https://starlight.astro.build/guides/css-and-tailwind/

[starlight-css-custom]: https://starlight.astro.build/guides/css-and-tailwind/#custom-css-styles

[starlight-css-cascade-layers]: https://starlight.astro.build/guides/css-and-tailwind/#cascade-layers

[starlight-0-34]: https://github.com/withastro/starlight/releases/tag/%40astrojs%2Fstarlight%400.34.0

[imho]: https://en.wiktionary.org/wiki/IMHO
