---
title: So machen Sie Ihre Starlight-Sidebar-Elemente ansprechender
description: In diesem Blogbeitrag werfen wir einen Blick darauf, wie kleine
  Änderungen einen großen Unterschied machen können, wenn es um Leerzeichen,
  Schriftgrößen, Schriftgewichte und Farben in Ihrer Starlight-Sidebar geht.
date: 2025-04-27
tags:
  - Starlight
  - CSS
excerpt: In diesem Blogbeitrag werfen wir einen Blick darauf, wie kleine
  Änderungen einen großen Unterschied machen können, wenn es um Leerzeichen in
  Ihrer <a class="gh-badge" href="https://github.com/withastro/starlight"><img
  src="/starlight.png" alt="Starlight" width="16" height="16"
  style="border-radius:9999px;vertical-align:middle;margin-right:0.4em;"
  />Starlight</a>-Sidebar geht.
authors:
  - trueberryless
cover:
  alt: A beautiful cover image with the text "Starlight CSS"
  image: ../../../../../public/blog/starlight-sidebar-whitespace.png

---

Haben Sie sich jemals gefragt, warum Ihre \[Starlight]\[starlight]-Sidebar nicht so ansprechend aussieht? Wussten Sie, wie wichtig der Raum zwischen den Elementen in Ihrer Sidebar unbewusst ist? Die Schriftgröße, das Gewicht und kleine Farbunterschiede? In diesem Leitfaden zeigen wir Ihnen, wie Sie das Erscheinungsbild Ihrer Starlight-Sidebar mit einigen schnellen und einfachen Schritten anpassen können.

## Voraussetzungen

Zuerst müssen Sie Ihre \[Starlight-Website einrichten]\[starlight-getting-started]. Anschließend bietet Starlight eine \[Anleitung zur Anpassung der auf Ihre Starlight-Website angewandten Stile]\[starlight-css], die wir in diesem Beitrag nutzen werden.

Wie in \[dieser Anleitung]\[starlight-css-custom] beschrieben, müssen Sie eine `.css`-Datei irgendwo in Ihrem Verzeichnis `src/` erstellen, in der Sie Ihre CSS-Stile definieren können. Vergessen Sie nicht, den Pfad zu dieser `.css`-Datei zur `customCss`-Liste in der Datei `astro.config.mjs` von Starlight hinzuzufügen:

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

Es gibt unendlich viele Möglichkeiten, mit denen Sie allein mit Ihrem benutzerdefinierten CSS experimentieren können. Ich werde Ihnen einige Ideen geben, die ich sehr nützlich fand, als ich selbst mit dem Design der Sidebar experimentierte. Während einige dieser Ideen für Sie albern erscheinen mögen, verspreche ich, dass die Kombination einiger von ihnen Ihre Starlight-Sidebar noch besser aussehen lassen wird.

:::note
Eine Sache, die es zu beachten gilt, ist, dass sich in diesem Blogpost der Fokus auf die Anpassung der **Root-Elemente** (diejenigen ohne Kinder) in der Sidebar liegt.
:::

Aber bevor ich das tue, zeige ich Ihnen, wie das Standarddesign der Starlight-Sidebar derzeit aussieht:

![Standarddesign der Starlight-Sidebar](../../../../assets/sidebar-css/no-css.png)

### Leerzeichen zwischen Sidebar-Elementen manipulieren

Auf der Root-Ebene Ihrer Starlight-Sidebar gibt es zwei verschiedene Arten von Elementen: **Seiten** und **Gruppen**. Während das Standarddesign ziemlich ansprechend ist, fand ich die Leerzeichen - das ist der Abstand zwischen Elementen, der selbst keinen Inhalt enthält - etwas zu groß, besonders zwischen Root-Elementen. Mit diesem Beispiel für benutzerdefiniertes CSS unten habe ich den Abstand zwischen Root-Elementen kleiner gemacht, während der Abstand zwischen Gruppen gleich bleibt. Die wichtigen CSS-Stile sind im Codeblock hervorgehoben.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li:not(:has(details)) {
  margin-top: 0rem;
}
sl-sidebar-state-persist ul.top-level > li:has(details) {
  margin-block: 0.5rem; /* default value */
}
```

![Starlight-Sidebar, bei der der Abstand zwischen Root-Elementen kleiner ist](../../../../assets/sidebar-css/whitespaces.png)

Vielleicht wird dies für Sie nicht so nützlich sein, da Sie keine Root-Seiten in Ihrer Sidebar verwenden und dieser Effekt daher für Sie nicht erkennbar sein wird. Aber wenn Sie es tun, probieren Sie es aus.

### Schriftgewicht der Sidebar-Elemente anpassen

\[Meiner Meinung nach]\[imho] ist das Einzige, was mich am meisten an den Root-Elementen in der Sidebar von Starlight stört, deren Fettigkeit. Das ist wahrscheinlich eine sehr subjektive Meinung, aber wenn Sie mich fragen, kann eine einzelne Seite niemals so wichtig sein wie eine gesamte Gruppe von Seiten in Ihrer Dokumentation. Daher habe ich das Schriftgewicht der Root-Elemente dünner gemacht, wie Sie im folgenden Codeblock sehen können.

```css {6} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a[aria-current="page"] {
  font-weight: 600; /* default value */
}
sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
  font-weight: 400;
}
```

![Starlight-Sidebar mit dünnerem Schriftgewicht](../../../../assets/sidebar-css/font-weight.png)

### Farbe der Sidebar-Elemente anpassen

Eine kleine, aber subtile Änderung: Ich habe nicht ausgewählte Root-Elemente in der Sidebar durch den untenstehenden Codeblock gedimmter erscheinen lassen.

Falls Sie dieses Design ebenfalls verwenden möchten, empfehle ich Ihnen, nur die zweite CSS-Manipulation anzuwenden, da die erste lediglich demonstriert, wie Sie die Gestaltung der markierten Root-Elemente anpassen könnten – diese Regel gilt auch für die anderen Codeblöcke in diesem Blog, wenn sie als `Standardwert` gekennzeichnet sind.

```css {6} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a[aria-current="page"] {
  color: var(--sl-color-text-invert); /* default value */
}
sl-sidebar-state-persist ul.top-level > li > a:not([aria-current="page"]) {
  color: var(--sl-color-gray-2);
}
```

![Starlight-Sidebar mit gedimmten Farben](../../../../assets/sidebar-css/color.png)

### Schriftgröße der Sidebar-Elemente anpassen

Obwohl ich es nicht empfehle, können Sie auch die Schriftgröße der Sidebar-Elemente anpassen. Mit diesem Beispiel für benutzerdefiniertes CSS unten habe ich die Schriftgröße der Root-Elemente kleiner gemacht.

```css {3} showLineNumbers=false
// src/styles/custom.css
sl-sidebar-state-persist ul.top-level > li > a {
  font-size: var(--sl-text-sm);
}
```

![Starlight-Sidebar mit kleinerer Schriftgröße](../../../../assets/sidebar-css/font-size.png)

## Empfehlungen

Zusammenfassend empfehle ich, einige Mischungen der oben genannten Anpassungsoptionen anzuwenden, die Sie bequem in einer einzigen `.css`-Datei sehen können.

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
