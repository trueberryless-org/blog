---
title: So machen Sie Ihre Starlight-Sidebar-Elemente ansprechender
description: In diesem Blogbeitrag werfen wir einen Blick darauf, wie kleine
  Änderungen bei Leerzeichen, Schriftgrößen, Gewichtungen und Farben einen
  großen Unterschied in Ihrer Starlight-Sidebar machen können.
date: 2025-04-27
tags:
  - Starlight
  - CSS
excerpt: In diesem Blogbeitrag werfen wir einen Blick darauf, wie kleine
  Änderungen bei Leerzeichen in Ihrer Starlight-Sidebar einen großen Unterschied
  machen können.
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Starlight CSS"
  image: ../../../../../public/blog/starlight-sidebar-whitespace.png

---

Haben Sie sich jemals gefragt, warum Ihre \[Starlight]\[starlight]-Sidebar nicht besonders ansprechend aussieht? Wussten Sie, wie wichtig der Abstand zwischen den Elementen in Ihrer Sidebar unbewusst ist? Die Schriftgröße, das Gewicht und kleine Farbunterschiede? In diesem Leitfaden werfen wir einen Blick darauf, wie Sie das Erscheinungsbild Ihrer Starlight-Sidebar mit einigen schnellen und einfachen Schritten anpassen können.

## Voraussetzungen

Zuerst müssen Sie Ihre \[Starlight-Seite einrichten]\[starlight-getting-started]. Anschließend bietet Starlight eine \[Anleitung zur Anpassung der auf Ihrer Starlight-Seite angewendeten Stile]\[starlight-css], die wir in diesem Beitrag verwenden werden.

Wie in \[dieser Anleitung]\[starlight-css-custom] beschrieben, müssen Sie eine `.css`-Datei irgendwo in Ihrem `src/`-Verzeichnis erstellen, in der Sie Ihre CSS-Stile definieren können. Vergessen Sie nicht, den Pfad zu dieser `.css`-Datei im `customCss`-Array von Starlight in `astro.config.mjs` hinzuzufügen:

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

Nachdem Sie diese Vorbereitungsschritte abgeschlossen haben, können Sie einige schöne Anpassungen am Design der Starlight-Sidebar ausprobieren.

## Anpassungen

Es gibt unendlich viele Möglichkeiten, mit denen Sie nur mit Ihrem eigenen CSS spielen können. Ich werde Ihnen einige Ideen geben, die ich selbst sehr hilfreich fand, während ich mit dem Design der Sidebar experimentiert habe. Während einige dieser Ideen für Sie vielleicht albern aussehen, verspreche ich, dass die Kombination einiger davon Ihre Starlight-Sidebar noch besser aussehen lässt.

:::note
Eine Sache, die es zu beachten gilt: In diesem Blogbeitrag liegt der Fokus auf der Anpassung des Stylings von **Elementen auf oberster Ebene** (denjenigen ohne Kinder) in der Sidebar.
:::

Doch bevor ich das tue, zeige ich Ihnen, wie das Standard-Styling der Starlight-Sidebar momentan aussieht:

![Standard-Styling der Starlight-Sidebar](../../../../assets/sidebar-css/no-css.png)

### Die Leerzeichen zwischen den Sidebar-Elementen anpassen

Auf der obersten Ebene Ihrer Starlight-Sidebar gibt es zwei verschiedene Arten von Elementen: **Seiten** und **Gruppen**. Während das Standard-Styling ziemlich anständig ist, fand ich die Leerzeichen – das ist der Abstand zwischen den Elementen, der selbst keinen Inhalt enthält – etwas zu groß, besonders zwischen Elementen auf oberster Ebene. Mit diesem Beispiel für ein benutzerdefiniertes CSS weiter unten habe ich den Abstand zwischen Elementen auf oberster Ebene verkleinert, während der Abstand zwischen Gruppen gleich bleibt. Das wichtige CSS-Styling ist im Codeblock hervorgehoben.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li:not(:has(details)) {
  margin-top: 0rem;
}
sl-sidebar-state-persist ul.top-level > li:has(details) {
  margin-block: 0.5rem; /* default value */
}
```

![Starlight-Sidebar, bei der der Abstand zwischen den Elementen auf oberster Ebene kleiner ist](../../../../assets/sidebar-css/whitespaces.png)

Vielleicht ist dies für Sie nicht so nützlich, weil Sie in Ihrer Sidebar keine Seiten auf oberster Ebene verwenden, sodass dieser Effekt für Sie nicht sichtbar ist. Aber wenn Sie es tun, probieren Sie es aus.

### Das Schriftgewicht der Sidebar-Elemente anpassen

\[Meiner Meinung nach]\[imho] ist das, was mich an den Elementen auf oberster Ebene in der Starlight-Sidebar am meisten stört, ihre Fettigkeit. Dies ist wahrscheinlich eine sehr subjektive Meinung, aber wenn Sie mich fragen, kann eine einzelne Seite unmöglich so wichtig sein wie eine ganze Gruppe von Seiten in Ihrer Dokumentation. Daher habe ich das Schriftgewicht der Elemente auf oberster Ebene dünner gemacht, wie Sie im folgenden Codeblock sehen können.

```css {6} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a[aria-current="page"] {
  font-weight: 600; /* default value */
}
sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
  font-weight: 400;
}
```

![Starlight-Sidebar mit leichterem Schriftgewicht](../../../../assets/sidebar-css/font-weight.png)

### Die Farbe der Sidebar-Elemente anpassen

Eine kleine, aber subtile Änderung: Ich habe nicht ausgewählte Elemente auf oberster Ebene in den folgenden Codeänderungen dunkler erscheinen lassen.

Wenn Sie sich entscheiden, dieses Design ebenfalls zu verwenden, empfehle ich, nur die zweite CSS-Manipulation anzuwenden, da die erste nur dafür gedacht ist, zu demonstrieren, wie Sie das Styling für ausgewählte Elemente auf oberster Ebene anpassen könnten – diese Regel gilt auch für die anderen Codeblöcke in diesem Blog, wenn sie mit `default value` markiert sind.

```css {6} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a[aria-current="page"] {
  color: var(--sl-color-text-invert); /* default value */
}
sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
  color: var(--sl-color-gray-2);
}
```

![Starlight-Sidebar mit dunkleren Farben](../../../../assets/sidebar-css/color.png)

### Die Schriftgröße der Sidebar-Elemente anpassen

Auch wenn ich es nicht empfehle, können Sie die Schriftgröße der Sidebar-Elemente anpassen. Mit diesem Beispiel für ein benutzerdefiniertes CSS weiter unten habe ich die Schriftgröße der Elemente auf oberster Ebene verkleinert.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a {
  font-size: var(--sl-text-sm);
}
```

![Starlight-Sidebar mit kleinerer Schriftgröße](../../../../assets/sidebar-css/font-size.png)

## Empfehlungen

Zusammenfassend empfehle ich, eine Mischung der oben genannten Anpassungsoptionen anzuwenden, die Sie bequem in einer einzigen `.css`-Datei sehen können.

Beachten Sie, dass ich auch \[Cascade Layers]\[starlight-css-cascade-layers] verwende, die seit \[Starlight 0.34.0]\[starlight-0-34] unterstützt werden, und empfehle, diese zu verwenden, um die Reihenfolge zu spezifizieren, in der CSS-Stile angewendet werden.

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
