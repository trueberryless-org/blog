---
title: Eine kurze Geschichte der Starlight Sidebar Topics Plugins
description: In diesem Blogbeitrag zeige ich Ihnen die Entwicklung von
  Starlight-Plugins anhand einer Fallstudie des Starlight Sidebar Topics
  Plugins.
date: 2025-05-05
tags:
  - Starlight
  - Plugins
excerpt: In diesem Beitrag zeige ich Ihnen die Entwicklung von Starlight-Plugins
  anhand einer Fallstudie des [Starlight Sidebar
  Topics](https://github.com/hideoo/starlight-sidebar-topics)-Plugins. Seien Sie
  gespannt auf beeindruckende Fakten über die Menschen und den Code rund um
  Starlight.
authors:
  - trueberryless
  - ai
cover:
  alt: A beautiful cover image with the text "History Time"
  image: ../../../../../public/blog/starlight-topics-history-story.png

---

Vielleicht haben Sie schon einmal von diesem coolen Dokumentationsframework gehört. Ich spreche ziemlich oft davon und nutze es regelmäßig. Nicht nur, weil ich ein aktiver Mitwirkender bin, sondern auch, weil [Starlight](https://starlight.astro.build) mir einfach ans Herz gewachsen ist. Seine Features: Einfachheit und Minimalismus, aber alles, was man braucht. Seine Performance: [Schneller als 98 % der anderen Websites da draußen](https://www.websitecarbon.com/website/starlight-astro-build-getting-started/). Seine Barrierefreiheit: Keine Frage!

## Die Entstehung

Meiner Meinung nach fehlt jedoch objektiv gesehen eine detaillierte Möglichkeit, breite Themen innerhalb Ihrer Dokumentation zu trennen. Und mit dieser subjektiv allgemein akzeptierten Meinung bin ich nicht allein. [HiDeoo](https://github.com/HiDeoo) ist nicht nur einer der aktivsten Maintainer des Projekts, sondern auch der Autor der meisten und meiner Meinung nach besten Plugins, die Sie für Starlight finden können. Und auch ihm ist diese fehlende Nischenfunktionalität in Bezug auf Themen aufgefallen. Deshalb hat er beschlossen, das [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics)-Plugin frühzeitig, im Oktober 2024, zu erstellen, das es Ihnen erlaubt, eine Seitenleiste mit Themen zu erstellen. Lesen Sie mehr über die Funktionen des Plugins in [seiner Dokumentation](https://starlight-sidebar-topics.netlify.app/).

Das einzige, was mich persönlich in den frühen Tagen des Plugins störte, war die Art und Weise, wie Themen in der Seitenleiste angezeigt wurden. Denn es verwendet nicht – wie ich mir eine Lösung vorgestellt hatte – eine Art Dropdown-Menü zum Wechseln zwischen Themen, sondern zeigt stattdessen immer alle Themen an. Diese Designentscheidung war, wie [HiDeoo klar betont](https://github.com/HiDeoo/starlight-sidebar-topics/issues/2#issuecomment-2410196392), sehr bewusst und nicht unbegründet: Alle Themen sollten gleichzeitig sichtbar sein. Bewiesen durch die [Astro](https://github.com/withastro)-Dokumentation selbst ([Chris Swithinbank](https://github.com/delucis) implementierte die ["Tabbed Sidebar"](https://github.com/withastro/docs/pull/9890) für die Astro v5-Dokumente später im selben Monat), hat dieser Ansatz definitiv viele Vorteile gegenüber einem Dropdown-Menü. Dennoch war ich mit diesem Design immer noch unzufrieden und erstellte daher meine eigene Version.

Kopieren und Einfügen war meine Stärke, wenn es darum ging, ein neues Starlight-Plugin für die Community zu erstellen. Und genau das habe ich getan. Ich nahm das Starlight Sidebar Topics Plugin als Ausgangspunkt und musste lediglich die Komponente `Topics.astro` anpassen, die das HTML zum Rendern der Themen in der Seitenleiste enthält. Nachdem ich einige Zeit damit gekämpft hatte, ein zufriedenstellendes Dropdown-Menü zu implementieren, das nur aus HTML + CSS besteht und dennoch sauber aussieht (Entschuldigung für das Eigenlob, ich bin einfach stolz auf mich), fand ich schließlich eine Lösung, mit der ich sehr zufrieden bin, und veröffentlichte dieses neue Plugin unter dem Namen [Starlight Sidebar Topics Dropdown](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown) – wie originell.

## Die Anpassung

Sie könnten denken, dass diese Geschichte jetzt zu Ende ist, weil jeder einfach die Variante verwenden könnte, die er möchte, und alle glücklich wären. Aber Starlight hat sich weiterentwickelt und verbessert sich stetig, und etwa drei Monate später, am 15. Februar, kam fast wie ein [Geburtstagsgeschenk](https://trueberryless.org/work/20th-birthday/) für mich die lang ersehnte Ergänzung der Routen-Daten in Starlight mit der Veröffentlichung von [v0.32](https://github.com/withastro/starlight/releases/tag/@astrojs/starlight@0.32.0). Diese scheinbar kleine Ergänzung eröffnete so viele Möglichkeiten, die ich selbst nie habe kommen sehen. HiDeoo war erneut die führende Inspiration für Plugin-Autoren und brachte diese neue Funktionalität an ihre Grenzen. Es dauerte nur zwei Tage, bis sie [über 11 Plugins an die neueste Starlight-Version angepasst haben](https://bsky.app/profile/hideoo.dev/post/3liffpudc5c2b), und später verbesserten und überarbeiteten sie einen Großteil des Codes, um noch mehr Nutzen aus dieser leistungsstarken Funktion zu ziehen.

Und so kommt der Tag, an dem HiDeoo mich kontaktiert, um mir mitzuteilen, dass das Starlight Sidebar Topics Plugin jetzt die neue Routen-Daten-Funktion von Starlight verwendet. Zunächst verstand ich nicht ganz, welche Vorteile diese Implementierungsänderungen haben würden, aber dann nahm sich HiDeoo die Zeit, mir zu erklären, dass ich jetzt das Starlight Sidebar Topics Dropdown Plugin in eine einfache Komponente umwandeln könnte, die die Routen-Daten seines Plugins nutzt. Intuitiv war ich gegen diese clevere Idee, weil es sich so anfühlte, als würde mein einziges Plugin, das eine gewisse Popularität erlangt hatte, in eine nutzlose Komponente verwandelt. Ich hätte nicht weiter von der Wahrheit entfernt sein können.

## Die Vereinigung

Schließlich entschied ich mich dazu, mein Plugin in eine Komponente umzuwandeln – diese Umstrukturierung eliminierte beiläufig genau [1210 Zeilen Code und fügte 68 Zeilen Änderungsprotokoll hinzu](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/pull/40) – und ich bemerkte, wie wenig Code es jetzt benötigte, um die `Topics.astro`-Liste aus der Sicht des Benutzers in ein Dropdown zu verwandeln. Ich war zuversichtlich, dass dies wirklich die richtige Richtung für die ~~Plugin~~ Komponente war. Daher aktualisierte ich die gesamte Dokumentation – eher: Ich löschte über 200 Zeilen Text (fühlt sich gut an) – und veröffentlichte die neue [Version 0.5](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/releases/tag/starlight-sidebar-topics-dropdown%400.5.0).

Jetzt könnten Sie sich fragen, wie sich solch ausgereifte Plugins im Laufe der Zeit noch weiter verbessern könnten. Um ehrlich zu sein, war ich selbst sehr überrascht, als HiDeoo mir ganz beiläufig eine Bombe in meine Discord-DMs warf. Seine Idee war und ist genial. Andernfalls würde ich gar nicht mehr über dieses *Thema* nachdenken. Aber hier bin ich, schreibe satte 800 Wörter, nur um Sie auf das vorzubereiten, was kommt. Trommelwirbel bitte! Anschnallen! Diese Aussage von HiDeoo wird Sie umhauen:

> „Man könnte so etwas wie die standardmäßige integrierte Liste in einer Desktop-Ansicht haben und auf Mobilgeräten Ihre Komponente verwenden oder so etwas 🧠“ — HiDeoo, 21.03.2025 09:54

Tiefgründig. Zeitlos. Goldwert.

Und dieser einzelne, wunderschöne Funke einer Idee? Genau das werde ich Ihnen im Beitrag [„Starlight Topics Dropdown und Liste zusammen“](../../blog/starlight-dropdown-and-list-together/) näherbringen.
