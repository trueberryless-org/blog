---
title: Eine kurze Geschichte der Starlight Sidebar Topics Plugins
description: In diesem Blogbeitrag zeige ich dir die Entwicklung der
  Starlight-Plugins anhand einer Fallstudie des Starlight Sidebar Topics
  Plugins.
date: 2025-05-05
tags:
  - Starlight
  - Plugins
excerpt: In diesem Beitrag zeige ich dir die Entwicklung der Starlight-Plugins
  anhand einer Fallstudie des [Starlight Sidebar
  Topics](https://github.com/hideoo/starlight-sidebar-topics) Plugins. Bereite
  dich darauf vor, beeindruckende Fakten über Menschen und Code rund um
  Starlight zu entdecken.
authors:
  - trueberryless
  - ai
cover:
  alt: A beautiful cover image with the text "History Time"
  image: ../../../../../public/blog/starlight-topics-history-story.png

---

Vielleicht hast du schon einmal von diesem coolen Dokumentationsframework gehört. Ich spreche oft darüber und nutze es regelmäßig. Nicht nur, weil ich ein aktiver Beitragender bin, sondern auch, weil [Starlight](https://starlight.astro.build) mir einfach ans Herz gewachsen ist. Seine Merkmale: Einfachheit und Minimalismus, aber alles, was man braucht. Seine Leistung: [Schneller als 98 % der anderen Websites da draußen](https://www.websitecarbon.com/website/starlight-astro-build-getting-started/). Seine Barrierefreiheit: Keine Frage!

## Die Entstehung

Eine Sache, die meiner Meinung nach objektiv fehlt, ist eine detaillierte Möglichkeit, breite Themen in deiner Dokumentation zu trennen. Und ich bin nicht allein mit dieser subjektiv allgemein akzeptierten Meinung. [HiDeoo](https://hideoo.dev) ist nicht nur einer der aktivsten Maintainer des Projekts, sondern auch der Autor der meisten und meiner Meinung nach besten Plugins, die du für Starlight finden kannst. Auch er bemerkte diese fehlende Nischenfunktionalität in Bezug auf Themen. Aus diesem Grund entschied er sich bereits im Oktober 2024 dazu, das [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics) Plugin zu erstellen, das es dir ermöglicht, eine Sidebar mit Themen zu erstellen. Lies mehr über die Funktionen des Plugins in [seiner Dokumentation](https://starlight-sidebar-topics.netlify.app/).

Eine Sache, die mich persönlich in den frühen Tagen des Plugins störte, war die Art und Weise, wie Themen in der Sidebar angezeigt wurden. Es verwendet nämlich - anders als ich mir eine Lösung vorgestellt hätte - kein Dropdown-Menü zum Wechseln zwischen den Themen, sondern zeigt stattdessen immer alle Themen gleichzeitig an. Diese Designentscheidung war, wie [HiDeoo eindeutig hervorhebt](https://github.com/HiDeoo/starlight-sidebar-topics/issues/2#issuecomment-2410196392), sehr bewusst und nicht ohne Grund: Alle Themen sollten auf einmal sichtbar sein. Bewiesen durch die Astro-Dokumentation selbst ([Chris Swithinbank](https://github.com/delucis) implementierte die ["Tabbed Sidebar"](https://github.com/withastro/docs/pull/9890) für die Astro v5-Dokumentation später im selben Monat), hat dieser Ansatz definitiv viele Vorteile gegenüber einem Dropdown-Menü. Dennoch war ich immer noch unzufrieden mit diesem Design und entschied mich, meine eigene Version zu erstellen.

Kopieren und Einfügen war meine Stärke, wenn es darum ging, ein neues Starlight-Plugin für die Community zu erstellen. Und so tat ich genau das. Ich nahm das Starlight Sidebar Topics Plugin als Ausgangspunkt und musste lediglich die `Topics.astro` Komponente anpassen, die das HTML für die Darstellung der Themen in der Sidebar enthält. Nach einigem Ringen mit der Implementierung eines zufriedenstellenden Dropdown-Menüs, das komplett aus HTML + CSS bestand, aber auch sauber aussah (Entschuldigung für das Eigenlob, ich bin einfach stolz auf mich), fand ich schließlich eine Lösung, mit der ich sehr zufrieden bin, und veröffentlichte dieses neue Plugin unter dem Namen [Starlight Sidebar Topics Dropdown](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown) – wie originell.

## Die Anpassung

Du könntest denken, dass diese Geschichte nun zu Ende ist, weil jeder einfach die Variante nutzen könnte, die ihm gefällt, und alle glücklich wären. Aber Starlight hat sich weiterentwickelt und verbessert, und etwa drei Monate später, am 15. Februar, kam fast wie ein [Geburtstagsgeschenk](https://trueberryless.org/work/20th-birthday/) für mich die lang ersehnte Hinzufügung von Routen-Daten in Starlight mit der Veröffentlichung von [v0.32](https://github.com/withastro/starlight/releases/tag/@astrojs/starlight@0.32.0). Diese scheinbar kleine Ergänzung eröffnete so viele Möglichkeiten, die ich selbst nie kommen sah. HiDeoo war erneut die führende Inspiration für Plugin-Autoren und nutzte diese neue Funktionalität bis an ihre Grenzen. Es dauerte nur zwei Tage, bis er [über 11 Plugins an die neueste Starlight-Version angepasst hatte](https://bsky.app/profile/hideoo.dev/post/3liffpudc5c2b), und später verbesserte und überarbeitete er vieles des Codes, um diese mächtige Funktion noch besser zu nutzen.

Und so kommt der Tag, an dem mich HiDeoo kontaktiert, um mir mitzuteilen, dass das Starlight Sidebar Topics Plugin jetzt die neue Routen-Datenfunktion von Starlight verwendet. Anfangs verstand ich nicht ganz, welche Vorteile diese Implementierungsänderungen haben könnten, aber dann nahm sich HiDeoo die Zeit, mir zu erklären, dass ich jetzt das Starlight Sidebar Topics Dropdown Plugin in eine einfache Komponente umwandeln könnte, die die Routen-Daten seines Plugins nutzt. Intuitiv widersprach ich dieser intelligenten Idee, weil es sich anfühlte, als würde mein einziges Plugin, das etwas Popularität erreicht hatte, in eine nutzlose Komponente verwandelt werden. Ich hätte nicht falscher liegen können.

## Die Vereinigung

Schließlich entschied ich mich, mein Plugin in eine Komponente umzuwandeln – diese Umstrukturierung eliminierte beiläufig genau [1210 Zeilen Code und fügte 68 Zeilen Changelog hinzu](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/pull/40) – und ich bemerkte, wie wenig Code es nun benötigte, um die `Topics.astro` Liste aus der Perspektive eines Nutzers in ein Dropdown zu verwandeln. Ich war zuversichtlich, dass dies wirklich der richtige Weg für die ~~Plugin~~ Komponente war. Und so aktualisierte ich die gesamte Dokumentation – eher: löschte über 200 Zeilen Text (fühlt sich gut an) – und veröffentlichte die neue [Version 0.5](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/releases/tag/starlight-sidebar-topics-dropdown%400.5.0).

Nun fragst du dich vielleicht, wie so ausgereifte Plugins trotzdem noch verbessert werden können. Um ehrlich zu sein, war ich selbst sehr überrascht, als HiDeoo mir in meinen Discord-DMs beiläufig eine Bombe platzte. Seine Idee war und ist genial. Andernfalls würde ich nicht einmal mehr über dieses *Thema* nachdenken. Aber hier bin ich und schreibe sage und schreibe 800 Wörter, nur um dich auf das vorzubereiten, was kommen wird. Trommelwirbel bitte! Schnall dich an! Diese Aussage von HiDeoo wird dich umhauen:

> „Man könnte so etwas wie die Standard-eingebaute Liste in einer Desktop-Ansicht haben und auf dem Handy deine Komponente verwenden oder so etwas in der Art 🧠“ — HiDeoo, 21.03.2025 09:54

Tiefgründig. Zeitlos. Goldwert.

Und diese einzelne, wunderschöne Idee? Genau das werde ich dir im Beitrag ["Starlight Topics Dropdown und Liste zusammen"](../../blog/starlight-dropdown-and-list-together/) nahebringen.
