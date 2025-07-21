---
title: Eine kurze Geschichte der Starlight Sidebar Topics Plugins
description: In diesem Blogbeitrag zeige ich Ihnen die Entwicklung der
  Starlight-Plugins anhand einer Fallstudie des Starlight Sidebar Topics
  Plugins.
date: 2025-05-05
tags:
  - Starlight
  - Plugins
excerpt: In diesem Beitrag zeige ich Ihnen die Entwicklung von <a
  class="gh-badge" href="https://github.com/withastro/starlight"><img
  src="/starlight.png" alt="Starlight" />Starlight</a>-Plugins anhand einer
  Fallstudie des [Starlight Sidebar
  Topics](https://github.com/hideoo/starlight-sidebar-topics) Plugins. Bereiten
  Sie sich darauf vor, beeindruckende Fakten über Menschen und Code rund um
  Starlight zu entdecken.
authors:
  - trueberryless
  - ai
cover:
  alt: A beautiful cover image with the text "History Time"
  image: ../../../../../public/blog/starlight-topics-history-story.png

---

Vielleicht haben Sie schon von diesem coolen Dokumentations-Framework gehört. Ich spreche oft darüber und nutze es regelmäßig. Nicht nur, weil ich ein aktiver Mitwirkender bin, sondern auch, weil [Starlight](https://starlight.astro.build) mir einfach ans Herz gewachsen ist. Seine Merkmale: Einfachheit und Minimalismus, aber alles, was man braucht. Seine Leistung: [Schneller als 98 % aller anderen Websites](https://www.websitecarbon.com/website/starlight-astro-build-getting-started/). Seine Barrierefreiheit: Keine Frage!

## Die Entstehung

Eine Sache, die meiner Meinung nach objektiv fehlt, ist eine granularere Möglichkeit, breite Themen innerhalb Ihrer Dokumentation zu trennen. Und ich bin nicht allein mit dieser subjektiv allgemein akzeptierten Meinung. [HiDeoo](https://github.com/HiDeoo) ist nicht nur einer der aktivsten Maintainer des Projekts, sondern auch der Autor der meisten und meiner Meinung nach besten Plugins, die man für Starlight finden kann. Und auch sie haben diese fehlende Nischenfunktionalität in Bezug auf Themen bemerkt. Aus diesem Grund haben sie sich entschieden, das [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics) Plugin bereits im Oktober 2024 zu erstellen, mit dem man eine Seitenleiste mit Themen erstellen kann. Lesen Sie mehr über die Funktionen des Plugins in [seiner Dokumentation](https://starlight-sidebar-topics.netlify.app/).

Die eine Sache, die mich in den frühen Tagen des Plugins persönlich störte, war die Art und Weise, wie Themen in der Seitenleiste angezeigt wurden. Denn es verwendet nicht - wie ich mir eine Lösung vorgestellt habe - eine Art Dropdown-Menü zum Wechseln zwischen Themen, sondern zeigt stattdessen immer alle Themen an. Diese Designentscheidung war, wie [HiDeoo es klar betont](https://github.com/HiDeoo/starlight-sidebar-topics/issues/2#issuecomment-2410196392), sehr bewusst und nicht ohne Grund: Alle Themen sollten auf einmal sichtbar sein. Bewiesen durch die [Astro](https://github.com/withastro)-Dokumentation selbst ([Chris Swithinbank](https://github.com/delucis) implementierte die ["Tabbed Sidebar"](https://github.com/withastro/docs/pull/9890) für die Astro v5-Dokumentation später im selben Monat), hat dieser Ansatz definitiv viele Vorteile gegenüber einem Dropdown-Menü. Trotzdem war ich immer noch unzufrieden mit diesem Design und erstellte deshalb meine eigene Version.

Kopieren und Einfügen war meine Stärke, wenn es darum ging, ein neues Starlight-Plugin für die Community zu erstellen. Und so tat ich genau das. Ich nahm das Starlight Sidebar Topics Plugin als Ausgangspunkt und musste nur die Komponente `Topics.astro` anpassen, die das HTML für die Darstellung der Themen in der Seitenleiste umfasst. Nach einiger Zeit des Kampfes mit der Implementierung eines zufriedenstellenden Dropdown-Menüs, das reines HTML + CSS war, aber auch sauber aussah (entschuldigen Sie die Eigenlob, ich bin einfach stolz auf mich), fand ich schließlich eine Lösung, mit der ich sehr zufrieden bin, und veröffentlichte dieses neue Plugin unter dem Namen [Starlight Sidebar Topics Dropdown](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown) - wie originell.

## Die Anpassung

Man könnte denken, dass diese Geschichte hier endet, weil jeder einfach die Variante verwenden könnte, die er möchte, und alle glücklich wären. Aber Starlight hat sich weiterentwickelt und verbessert sich ständig. Etwa drei Monate später, am 15. Februar, fast wie ein verspätetes [Geburtstagsgeschenk](https://trueberryless.org/work/20th-birthday/) für mich, kam die sehnlich erwartete Ergänzung von Routen-Daten in Starlight mit der Veröffentlichung von [v0.32](https://github.com/withastro/starlight/releases/tag/@astrojs/starlight@0.32.0). Diese scheinbar kleine Ergänzung eröffnete so viele Möglichkeiten, die ich selbst nie erwartet hätte. HiDeoo war einmal mehr die führende Inspiration für Plugin-Autoren und nutzte diese neue Funktionalität bis an ihre Grenzen aus. Es dauerte nur zwei Tage, bis sie [über 11 Plugins an die neueste Starlight-Version anpassten](https://bsky.app/profile/hideoo.dev/post/3liffpudc5c2b), und später verbesserten und überarbeiteten sie viel vom Code, um noch mehr aus diesem mächtigen Feature herauszuholen.

Und so kommt der Tag, an dem HiDeoo mich kontaktiert, um mir zu sagen, dass das Starlight Sidebar Topics Plugin nun Starlights neue Route-Datenfunktion nutzt. Zuerst verstand ich nicht ganz, welche Vorteile diese Implementierungsänderungen mit sich bringen würden, aber dann nahm sich HiDeoo die Zeit, mir zu erklären, dass ich nun das Starlight Sidebar Topics Dropdown Plugin in eine einfache Komponente umwandeln könnte, die die Route-Daten seines Plugins nutzt. Intuitiv war ich gegen diese clevere Idee, weil es sich anfühlte, als würde mein einziges Plugin, das ein wenig Popularität erlangt hatte, in eine nutzlose Komponente verwandelt. Ich hätte nicht falscher liegen können.

## Die Vereinigung

Schließlich entschied ich mich, mein Plugin in eine Komponente umzuwandeln - diese Umstrukturierung eliminierte beiläufig genau [1210 Codezeilen und fügte 68 Zeilen Changelog hinzu](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/pull/40) - und ich bemerkte, wie wenig Code es jetzt benötigte, um aus der `Topics.astro`-Liste ein Dropdown zu machen, aus der Sicht eines Benutzers. Ich war überzeugt, dass dies wirklich die richtige Richtung für die ~~Plugin~~-Komponente war. Und so aktualisierte ich die gesamte Dokumentation - mehr wie: löschte über 200 Textzeilen (fühlt sich gut an) - und veröffentlichte die neue [Version 0.5](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/releases/tag/starlight-sidebar-topics-dropdown%400.5.0).

Nun fragen Sie sich vielleicht, wie solche ausgereiften Plugins sich noch weiter verbessern könnten. Um ehrlich zu sein, war ich selbst sehr überrascht, als HiDeoo ganz nebenbei eine Bombe in meine Discord-DMs fallen ließ. Seine Idee war und ist genial. Andernfalls würde ich mich gar nicht mehr mit diesem *Thema* beschäftigen. Aber hier bin ich, schreibe satte 800 Worte, nur um Sie auf das vorzubereiten, was kommt. Trommelwirbel, bitte! Schnallen Sie sich an! Diese Aussage von HiDeoo wird Sie umhauen:

> "Man könnte so etwas wie die standardmäßige eingebaute Liste auf einer Desktop-Ansicht haben und auf Mobilgeräten Ihre Komponente verwenden, oder so etwas in der Art 🧠" — HiDeoo, 21/03/2025 09:54

Tiefgründig. Zeitlos. Gold wert.

Und dieser einzige, wunderschöne Funke einer Idee? Genau darum wird es im Beitrag [„Starlight Topics Dropdown und Liste zusammen“](../../blog/starlight-dropdown-and-list-together/) gehen.
