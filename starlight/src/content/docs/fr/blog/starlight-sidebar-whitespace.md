---
title: Comment rendre les éléments de votre barre latérale Starlight plus attrayants
description: Dans cet article de blog, nous examinerons comment de petits
  changements peuvent faire une grande différence en ce qui concerne les espaces
  blancs, les tailles de police, les poids et les couleurs dans votre barre
  latérale Starlight.
date: 2025-04-27
tags:
  - Starlight
  - CSS
excerpt: Dans cet article de blog, nous examinerons comment de petits
  changements peuvent faire une grande différence en ce qui concerne les espaces
  blancs dans votre barre latérale Starlight.
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Starlight CSS"
  image: ../../../../../public/blog/starlight-sidebar-whitespace.png

---

Vous êtes-vous déjà demandé pourquoi la barre latérale de votre \[Starlight]\[starlight] n'est pas si attrayante ? Saviez-vous à quel point l'espace entre les éléments de votre barre latérale est inconsciemment important ? La taille de la police, le poids et les petites différences de couleur ? Dans ce guide, nous verrons comment personnaliser l'apparence de votre barre latérale Starlight en quelques étapes rapides et faciles.

## Prérequis

Tout d'abord, vous devez \[configurer votre site Starlight]\[starlight-getting-started]. Par la suite, Starlight offre un \[guide sur la personnalisation des styles appliqués à votre site Starlight]\[starlight-css], qui est la fonctionnalité que nous utiliserons dans cet article.

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

Une fois ces étapes de préparation terminées, vous êtes prêt à essayer quelques ajustements intéressants au design de la barre latérale de Starlight.

## Personnalisations

Les possibilités sont infinies lorsque vous jouez avec votre CSS personnalisé. Je vais vous donner quelques idées que j'ai trouvées très utiles en expérimentant le design de la barre latérale moi-même. Bien que certaines de ces idées puissent vous sembler absurdes, je vous promets que la combinaison de quelques-unes d'entre elles rendra votre barre latérale Starlight encore meilleure.

:::note
Cependant, il faut noter que dans cet article de blog, l'accent est mis sur l'ajustement du style des **éléments au niveau racine** (ceux sans enfants) dans la barre latérale.
:::

Mais avant cela, je vais vous montrer à quoi ressemble actuellement le style par défaut de la barre latérale de Starlight :

![Style par défaut de la barre latérale Starlight](../../../../assets/sidebar-css/no-css.png)

### Manipuler les espaces blancs entre les éléments de la barre latérale

Au niveau racine de votre barre latérale Starlight, il existe deux types d'éléments différents : **pages** et **groupes**. Bien que le style par défaut soit assez correct, j'ai trouvé que les espaces blancs - c'est-à-dire la marge entre les éléments qui elle-même ne contient aucun contenu - étaient un peu trop grands, en particulier entre les éléments au niveau racine. Avec cet exemple de CSS personnalisé ci-dessous, j'ai réduit la marge entre les éléments au niveau racine tout en conservant la même marge entre les groupes. Le style CSS important est mis en évidence dans le bloc de code.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li:not(:has(details)) {
  margin-top: 0rem;
}
sl-sidebar-state-persist ul.top-level > li:has(details) {
  margin-block: 0.5rem; /* default value */
}
```

![Barre latérale Starlight où la marge entre les éléments au niveau racine est réduite](../../../../assets/sidebar-css/whitespaces.png)

Peut-être que cela ne vous sera pas aussi utile parce que vous n'utilisez pas de pages au niveau racine dans votre barre latérale, alors cet effet ne sera pas perceptible pour vous. Mais si c'est le cas, essayez-le.

### Ajuster le poids des polices des éléments de la barre latérale

\[À mon humble avis]\[imho], ce qui me dérange le plus avec les éléments au niveau racine de la barre latérale de Starlight, c'est leur caractère gras. C'est probablement une opinion très subjective, mais si vous me demandez, une page unique ne peut pas être aussi importante qu'un groupe entier de pages dans votre documentation. Par conséquent, j'ai rendu le poids des polices des éléments au niveau racine plus léger comme vous pouvez le voir dans le bloc de code ci-dessous.

```css {6} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a[aria-current="page"] {
  font-weight: 600; /* default value */
}
sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
  font-weight: 400;
}
```

![Barre latérale Starlight avec un poids de police plus léger](../../../../assets/sidebar-css/font-weight.png)

### Ajuster la couleur des éléments de la barre latérale

Un changement petit mais subtil : j'ai rendu les éléments au niveau racine non sélectionnés plus pâles dans le bloc de code ci-dessous.

Si vous choisissez d'utiliser également cette conception, je vous recommande de n'appliquer que la deuxième manipulation CSS car la première est juste pour démontrer comment vous pourriez ajuster le style des éléments sélectionnés au niveau racine – cette règle s'applique aussi aux autres blocs de code dans ce blog s'ils sont marqués comme `default value`.

```css {6} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a[aria-current="page"] {
  color: var(--sl-color-text-invert); /* default value */
}
sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
  color: var(--sl-color-gray-2);
}
```

![Barre latérale Starlight avec des couleurs plus pâles](../../../../assets/sidebar-css/color.png)

### Ajuster la taille de la police des éléments de la barre latérale

Bien que je ne le recommande pas, vous pouvez également ajuster la taille de la police des éléments de la barre latérale. Avec cet exemple de CSS personnalisé ci-dessous, j'ai réduit la taille de la police des éléments au niveau racine.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a {
  font-size: var(--sl-text-sm);
}
```

![Barre latérale Starlight avec une taille de police plus petite](../../../../assets/sidebar-css/font-size.png)

## Recommandations

En résumé, je recommande d'appliquer une combinaison des options de personnalisation ci-dessus, que vous pouvez voir commodément dans un seul fichier `.css`.

Notez que j'utilise également \[les couches Cascade]\[starlight-css-cascade-layers], prises en charge depuis \[Starlight 0.34.0]\[starlight-0-34], et je recommande de les utiliser pour spécifier l'ordre dans lequel les styles CSS sont appliqués.

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
