---
title: Rendez vos éléments de barre latérale Starlight plus attrayants
description: Dans cet article de blog, nous examinons comment de petits
  changements peuvent faire une grande différence en ce qui concerne les
  espaces, les tailles de police, les épaisseurs de police et les couleurs de
  votre barre latérale Starlight.
date: 2025-04-27
tags:
  - Starlight
  - CSS
excerpt: >-
  Dans cet article de blog, nous examinons comment de petits changements peuvent
  faire une grande différence en ce qui concerne les espaces dans votre <a
  class="gh-badge" href="https://github.com/withastro/starlight"><img
    src="/starlight.png" alt="Starlight" width="16" height="16"
    style="border-radius:9999px;vertical-align:middle;margin-right:0.4em;"
    />Starlight</a>-barre latérale.
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Starlight CSS"
  image: ../../../../../../public/blog/starlight-sidebar-whitespace.png

---

Vous êtes-vous déjà demandé pourquoi votre barre latérale \\\[Starlight]\\\[starlight] n'est pas aussi attrayante ? Saviez-vous à quel point l'espacement entre les éléments de votre barre latérale est inconsciemment important ? La taille de la police, l'épaisseur et les petites différences de couleurs ? Dans ce guide, nous vous montrons comment personnaliser l'apparence de votre barre latérale Starlight grâce à quelques étapes rapides et simples.

## Pré-requis

Tout d'abord, vous devez configurer votre \\\[site Starlight]\\\[starlight-getting-started]. Ensuite, Starlight propose un \\\[guide sur la personnalisation des styles appliqués à votre site Starlight]\\\[starlight-css], que nous utiliserons dans cet article.

Comme décrit dans \[ce guide]\[starlight-css-custom], vous devez créer un fichier `.css` quelque part dans votre répertoire `src/`, où vous pouvez définir vos styles CSS. N'oubliez pas d'ajouter le chemin vers ce fichier `.css` à la liste `customCss` dans le fichier `astro.config.mjs` de Starlight :

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

Une fois que vous avez terminé ces étapes préparatoires, vous pouvez essayer quelques ajustements intéressants pour le design de la barre latérale Starlight.

## Personnalisations

Il existe une infinité de façons avec lesquelles vous pouvez expérimenter à l'aide de votre CSS personnalisé. Je vais vous donner quelques idées que j'ai trouvées très utiles lorsque j'ai moi-même expérimenté avec le design de la barre latérale. Bien que certaines de ces idées puissent vous sembler futiles, je vous promets que la combinaison de quelques-unes d'entre elles rendra votre barre latérale Starlight encore plus jolie.

:::note
Un point à noter est que cet article de blog se concentre sur la personnalisation des **éléments racine** (ceux sans enfants) dans la barre latérale.
:::

Mais avant de continuer, laissez-moi vous montrer à quoi ressemble actuellement le design par défaut de la barre latérale Starlight :

![Standarddesign der Starlight-Sidebar](../../../../../assets/sidebar-css/no-css.png)

### Modifier l'espacement entre les éléments de la barre latérale

Au niveau racine de votre barre latérale Starlight, il existe deux types d'éléments différents : **pages** et **groupes**. Bien que le design par défaut soit assez attrayant, j'ai trouvé que les espaces - c'est-à-dire les intervalles entre les éléments qui ne contiennent aucun contenu - étaient un peu trop grands, surtout entre les éléments racines. Avec cet exemple de CSS personnalisé ci-dessous, j'ai rendu l'espacement entre les éléments racines plus petit, tandis que l'espacement entre les groupes reste le même. Les styles CSS importants sont mis en évidence dans le bloc de code.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li:not(:has(details)) {
  margin-top: 0rem;
}
sl-sidebar-state-persist ul.top-level > li:has(details) {
  margin-block: 0.5rem; /* default value */
}
```

![Starlight-Sidebar, bei der der Abstand zwischen Root-Elementen kleiner ist](../../../../../assets/sidebar-css/whitespaces.png)

Cela pourrait ne pas être tellement utile pour vous si vous n'utilisez pas de pages racines dans votre barre latérale, car cet effet ne sera alors pas perceptible pour vous. Mais si vous le faites, essayez-le.

### Ajuster l'épaisseur de police des éléments de la barre latérale

\\\[À mon avis]\\\[imho], ce qui me dérange le plus avec les éléments racines dans la barre latérale de Starlight, c'est leur épaisseur. C'est probablement une opinion très subjective, mais si vous me demandez, une seule page ne peut jamais être aussi importante qu'un groupe entier de pages dans votre documentation. Par conséquent, j'ai rendu l'épaisseur de police des éléments racines plus fine, comme vous pouvez le voir dans le bloc de code suivant.

```css {6} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a[aria-current="page"] {
  font-weight: 600; /* default value */
}
sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
  font-weight: 400;
}
```

![Starlight-Sidebar mit dünnerem Schriftgewicht](../../../../../assets/sidebar-css/font-weight.png)

### Personnaliser la couleur des éléments de la barre latérale

Un changement petit mais subtil : j'ai rendu les éléments racines non sélectionnés de la barre latérale plus ternes grâce au bloc de code ci-dessous.

Si vous souhaitez également adopter ce design, je vous recommande d'appliquer uniquement la deuxième manipulation CSS, car la première montre seulement comment vous pourriez ajuster le style des éléments racines sélectionnés – cette règle s'applique également aux autres blocs de code de cet article de blog lorsqu'ils sont marqués comme `valeur par défaut`.

```css {6} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a[aria-current="page"] {
  color: var(--sl-color-text-invert); /* default value */
}
sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
  color: var(--sl-color-gray-2);
}
```

![Starlight-Sidebar mit gedimmten Farben](../../../../../assets/sidebar-css/color.png)

### Ajuster la taille de police des éléments de la barre latérale

Bien que je ne le recommande pas, vous pouvez également ajuster la taille de police des éléments de la barre latérale. Avec cet exemple de CSS personnalisé ci-dessous, j'ai rendu la taille de police des éléments racines plus petite.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a {
  font-size: var(--sl-text-sm);
}
```

![Starlight-Sidebar mit kleinerer Schriftgröße](../../../../../assets/sidebar-css/font-size.png)

## Recommandations

En résumé, je recommande d'appliquer certaines combinaisons des options de personnalisation mentionnées ci-dessus, que vous pouvez réunir dans un seul fichier `.css`.

Notez également que j'utilise les \\\[Cascade Layers]\\\[starlight-css-cascade-layers], qui sont prises en charge depuis \\\[Starlight 0.34.0]\\\[starlight-0-34], et je vous encourage à les utiliser pour spécifier l'ordre d'application des styles CSS.

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
