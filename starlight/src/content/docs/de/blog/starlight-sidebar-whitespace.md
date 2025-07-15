---
title: Wie Sie Ihre Starlight-Sidebar-Elemente optisch verbessern
description: In diesem Blogbeitrag werfen wir einen Blick darauf, wie kleine
  Änderungen bei Leerzeichen, Schriftgrößen, -gewichten und -farben in Ihrer
  Starlight-Sidebar einen großen Unterschied machen können.
date: 2025-04-27
tags:
  - Starlight
  - CSS
excerpt: In diesem Blogbeitrag werfen wir einen Blick darauf, wie kleine
  Änderungen bei Leerzeichen in Ihrer <a class="gh-badge"
  href="https://github.com/withastro/starlight"><img src="/starlight.png"
  alt="Starlight" />Starlight</a>-Sidebar einen großen Unterschied machen
  können.
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Starlight CSS"
  image: ../../../../../public/blog/starlight-sidebar-whitespace.png

---

Haben Sie sich jemals gefragt, warum Ihre \[Starlight]\[starlight]-Sidebar nicht so ansprechend aussieht? Wussten Sie, wie wichtig der Abstand zwischen den Elementen in Ihrer Sidebar unbewusst ist? Die Schriftgröße, das Gewicht und kleine Farbunterschiede? In diesem Leitfaden zeigen wir Ihnen, wie Sie das Erscheinungsbild Ihrer Starlight-Sidebar mit einigen schnellen und einfachen Schritten anpassen können.

## Voraussetzungen

Zuerst müssen Sie Ihre \[Starlight-Website einrichten]\[starlight-getting-started]. Danach bietet Starlight eine \[Anleitung zur Anpassung von Stilen, die auf Ihre Starlight-Website angewendet werden]\[starlight-css], welche wir in diesem Beitrag verwenden werden.

Wie in \[dieser Anleitung]\[starlight-css-custom] beschrieben, müssen Sie eine `.css`-Datei irgendwo in Ihrem `src/`-Verzeichnis erstellen, in der Sie Ihre CSS-Stile definieren können. Vergessen Sie nicht, den Pfad zu dieser `.css`-Datei im `customCss`-Array von Starlight’s `astro.config.mjs` hinzuzufügen:

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

Nach Abschluss dieser Vorbereitungsschritte sind Sie bereit, einige schöne Anpassungen am Design der Starlight-Sidebar auszuprobieren.

## Anpassungen

Es gibt endlose verschiedene Möglichkeiten, die Sie allein mit Ihrem benutzerdefinierten CSS ausprobieren können. Ich gebe Ihnen einige Ideen, die ich selbst beim Experimentieren mit dem Sidebar-Design als sehr hilfreich empfand. Während einige dieser Ideen für Sie vielleicht albern wirken, verspreche ich Ihnen, dass die Kombination einiger von ihnen Ihre Starlight-Sidebar noch besser aussehen lassen wird.

:::note
Ein Hinweis: In diesem Blogbeitrag liegt der Fokus auf der Anpassung des Stils von **Elementen auf der obersten Ebene** (denjenigen ohne Kinder) in der Sidebar.
:::

Bevor ich das jedoch mache, zeige ich Ihnen, wie das Standarddesign der Starlight-Sidebar derzeit aussieht:

![Default styling of the Starlight sidebar](../../../../assets/sidebar-css/no-css.png)

### Leerraum zwischen Sidebar-Elementen anpassen

In der obersten Ebene Ihrer Starlight-Sidebar gibt es zwei verschiedene Arten von Elementen: **Seiten** und **Gruppen**. Während das Standarddesign ziemlich anständig ist, empfand ich die Leerzeichen – das ist der Rand zwischen Elementen, der selbst keinen Inhalt enthält – als etwas zu groß, besonders zwischen Elementen auf oberster Ebene. Mit diesem Beispiel für benutzerdefiniertes CSS unten habe ich den Rand zwischen Elementen auf oberster Ebene verkleinert, während der Rand zwischen Gruppen gleich blieb. Das wichtige CSS-Design ist im Codeblock hervorgehoben.

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

Vielleicht wird dies für Sie nicht so nützlich sein, weil Sie keine Seiten auf oberster Ebene in Ihrer Sidebar verwenden, sodass dieser Effekt für Sie nicht sichtbar ist. Aber falls doch, probieren Sie es aus.

### Schriftgewicht der Sidebar-Elemente anpassen

\[Meiner Meinung nach]\[imho] ist das, was mich am meisten an den Starlight-Elementen auf oberster Ebene in der Sidebar stört, ihre Fettigkeit. Das ist wahrscheinlich eine sehr subjektive Meinung, aber wenn Sie mich fragen, kann eine einzige Seite nicht so wichtig sein wie eine ganze Gruppe von Seiten in Ihrer Dokumentation. Daher habe ich das Schriftgewicht der Elemente auf oberster Ebene dünner gemacht, wie Sie im folgenden Codeblock sehen können.

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

### Farbe der Sidebar-Elemente anpassen

Eine kleine, aber subtile Änderung: Ich habe die nicht ausgewählten Elemente auf oberster Ebene weniger auffällig dargestellt, wie Sie im folgenden Codeblock sehen können.

Wenn Sie sich auch für dieses Design entscheiden, empfehle ich, dass Sie nur die zweite CSS-Anpassung anwenden, da die erste lediglich zeigt, wie Sie das Styling von ausgewählten Elementen auf oberster Ebene anpassen könnten – diese Regel gilt auch für die anderen Codeblöcke in diesem Blog, wenn sie als `default value` markiert sind.

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

### Schriftgröße der Sidebar-Elemente anpassen

Obwohl ich es nicht empfehle, können Sie auch die Schriftgröße der Sidebar-Elemente anpassen. In diesem Beispiel für benutzerdefiniertes CSS unten habe ich die Schriftgröße der Elemente auf oberster Ebene verkleinert.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a {
  font-size: var(--sl-text-sm);
}
```

![Starlight sidebar with smaller font size](../../../../assets/sidebar-css/font-size.png)

## Empfehlungen

Zusammenfassend empfehle ich, eine Mischung aus den oben genannten Anpassungsoptionen anzuwenden, die Sie bequem in einer einzigen `.css`-Datei sehen können.

Beachten Sie, dass ich auch \[Cascading Layers]\[starlight-css-cascade-layers] verwende, die seit \[Starlight 0.34.0]\[starlight-0-34] unterstützt werden, und empfehle, sie zu verwenden, um die Reihenfolge festzulegen, in der CSS-Stile angewendet werden.

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
