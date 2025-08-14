---
title: Eine kurze Geschichte der Starlight Sidebar Topics Plugins
description: In diesem Blogbeitrag zeige ich Ihnen die Entwicklung der
  Starlight-Plugins anhand einer Fallstudie zum Starlight Sidebar Topics Plugin.
date: 2025-05-05
tags:
  - Starlight
  - Plugins
excerpt: In diesem Beitrag zeige ich Ihnen die Entwicklung der <a
  class="gh-badge" href="https://github.com/withastro/starlight"><img
  src="/starlight.png" alt="Starlight" />Starlight</a>-Plugins anhand einer
  Fallstudie des [Starlight Sidebar
  Topics](https://github.com/hideoo/starlight-sidebar-topics) Plugins. Seien Sie
  darauf gefasst, beeindruckende Fakten über Menschen und Code rund um Starlight
  zu entdecken.
authors:
  - trueberryless
  - ai
cover:
  alt: A beautiful cover image with the text "History Time"
  image: ../../../../../public/blog/starlight-topics-history-story.png

---

Vielleicht haben Sie schon einmal von diesem coolen Dokumentationsframework gehört. Ich spreche oft darüber und benutze es regelmäßig. Nicht nur, weil ich ein aktiver Mitwirkender bin, sondern auch, weil [Starlight](https://starlight.astro.build) mir einfach ans Herz gewachsen ist. Seine Funktionen: Einfachheit und Minimalismus, aber alles, was man braucht. Seine Leistung: [Schneller als 98 % der anderen Websites](https://www.websitecarbon.com/website/starlight-astro-build-getting-started/). Seine Barrierefreiheit: Keine Frage!

## Die Entstehung

Eine Sache, die aus meiner Sicht objektiv fehlt, ist eine granulare Möglichkeit, breite Themen in Ihrer Dokumentation zu trennen. Und ich bin nicht allein mit dieser subjektiv allgemein akzeptierten Meinung. [HiDeoo](https://github.com/HiDeoo) ist nicht nur einer der aktivsten Maintainer des Projekts, sondern auch der Autor der meisten und meiner Meinung nach besten Plugins, die man für Starlight finden kann. Und auch ihnen fiel diese fehlende Nischenfunktionalität bei Themen auf. Deshalb haben sie im Oktober 2024, also relativ früh, das [Starlight Sidebar Topics](https://github.com/hideoo/starlight-sidebar-topics) Plugin erstellt, mit dem man eine Seitenleiste mit Themen erstellen kann. Lesen Sie mehr über die Funktionen des Plugins in [der Dokumentation](https://starlight-sidebar-topics.trueberryless.org/).

Das Einzige, was mich in den frühen Tagen des Plugins persönlich gestört hat, war die Art und Weise, wie die Themen in der Seitenleiste angezeigt wurden. Es verwendet - im Gegensatz zu der von mir vorgestellten Lösung - keine Art Dropdown-Menü zum Wechseln zwischen Themen, sondern zeigt stattdessen immer alle Themen an. Diese Designentscheidung war, wie [HiDeoo klar hervorhebt](https://github.com/HiDeoo/starlight-sidebar-topics/issues/2#issuecomment-2410196392), sehr bewusst und nicht ohne Grund: Alle Themen sollen auf einmal sichtbar sein. Bewiesen durch die [Astro](https://github.com/withastro) Dokumentation selbst ([Chris Swithinbank](https://github.com/delucis) implementierte die ["Tab-Leiste"](https://github.com/withastro/docs/pull/9890) für die Astro v5 Dokumentation später im selben Monat), hat dieser Ansatz definitiv viele Vorteile gegenüber einem Dropdown-Menü. Dennoch war ich weiterhin mit diesem Design unzufrieden, und so habe ich meine eigene Version erstellt.

Kopieren und Einfügen war meine Stärke, wenn es darum ging, ein neues Starlight-Plugin für die Community zu erstellen. Und so habe ich es einfach getan. Ich nahm das Starlight Sidebar Topics Plugin als Ausgangspunkt und musste nur das `Topics.astro`-Komponente anpassen, das das HTML für die Darstellung der Themen in der Seitenleiste enthält. Nachdem ich einige Zeit damit gekämpft hatte, ein zufriedenstellendes Dropdown-Menü zu implementieren, das nur aus HTML und CSS bestand, aber auch optisch ansprechend war (Entschuldigung für das Eigenlob, ich bin einfach stolz auf mich), habe ich endlich eine Lösung gefunden, mit der ich sehr zufrieden bin, und habe dieses neue Plugin unter dem Namen [Starlight Sidebar Topics Dropdown](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown) veröffentlicht - wie originell.

## Die Anpassung

Man könnte denken, dass diese Geschichte jetzt zu Ende ist, weil jeder einfach die Variante verwenden könnte, die er möchte, und jeder glücklich ist. Aber Starlight hat sich kontinuierlich verbessert, und etwa drei Monate später, am 15. Februar, wie ein [Geburtstagsgeschenk](https://trueberryless.org/work/20th-birthday/) für mich, kam die langersehnte Hinzufügung von Routen-Daten in Starlight mit der Veröffentlichung von [v0.32](https://github.com/withastro/starlight/releases/tag/@astrojs/starlight@0.32.0). Diese scheinbar kleine Ergänzung eröffnete so viele Möglichkeiten, die ich selbst nie vorausgesehen habe. HiDeoo war erneut die treibende Inspirationsquelle für Plugin-Autoren und nutzte diese neue Funktionalität voll aus. Es dauerte nur zwei Tage, um [über 11 Plugins an die neueste Starlight-Version anzupassen](https://bsky.app/profile/hideoo.dev/post/3liffpudc5c2b), und später verbesserten und überarbeiteten sie viel vom Code, um diese leistungsstarke Funktion noch besser zu nutzen.

Und so kam der Tag, an dem HiDeoo mich kontaktierte, um mir mitzuteilen, dass das Starlight Sidebar Topics Plugin nun die neue Routen-Daten-Funktion von Starlight nutzt. Zuerst verstand ich nicht ganz, welchen Nutzen diese Implementierungsänderungen haben würden, aber dann nahm sich HiDeoo die Zeit, mir zu erklären, dass ich das Starlight Sidebar Topics Dropdown Plugin jetzt in eine einfache Komponente umwandeln könnte, die die Routen-Daten aus seinem Plugin verwendet. Intuitiv war ich gegen diese clevere Idee, weil es sich anfühlte, als würde mein einziges Plugin, das etwas Popularität erlangt hatte, in eine nutzlose Komponente verwandelt. Ich hätte nicht weiter von der Wahrheit entfernt sein können.

## Die Vereinigung

Schließlich beschloss ich, mein Plugin in eine Komponente umzuwandeln - diese Umstrukturierung eliminierte beiläufig genau [1210 Zeilen Code und fügte 68 Änderungsprotokollzeilen hinzu](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/pull/40) - und ich bemerkte, wie wenig Code es jetzt erforderte, um die `Topics.astro` Liste aus der Perspektive eines Nutzers in ein Dropdown zu verwandeln. Ich war zuversichtlich, dass dies wirklich die richtige Richtung für die ~~Plugin~~ Komponente war. Also aktualisierte ich die gesamte Dokumentation - eher: löschte über 200 Zeilen Text (fühlt sich gut an) - und veröffentlichte die neue [Version 0.5](https://github.com/trueberryless-org/starlight-sidebar-topics-dropdown/releases/tag/starlight-sidebar-topics-dropdown%400.5.0).

Jetzt fragen Sie sich vielleicht, wie solch ausgereifte Plugins sich noch weiter verbessern können. Um ehrlich zu sein, ich selbst war sehr überrascht, als HiDeoo mir beiläufig eine Bombe in meine Discord-DMs fallen ließ. Seine Idee war und ist immer noch genial. Andernfalls würde ich nicht einmal mehr an dieses *Thema* denken. Aber hier bin ich und schreibe satte 800 Worte, nur um Sie auf das kommende vorzubereiten. Trommelwirbel bitte! Anschnallen! Diese Aussage von HiDeoo wird Sie umhauen:

> „Man könnte auf einer Desktop-Ansicht etwas wie die standardmäßig eingebaute Liste und auf mobilen Geräten Ihre Komponente oder so etwas verwenden 🧠“ — HiDeoo, 21/03/2025 09:54

Tiefgründig. Zeitlos. Golden.

Und diese einzige, wunderschöne Idee? Genau darüber werde ich Ihnen im Beitrag [„Starlight Topics Dropdown und List zusammen“](../../blog/starlight-dropdown-and-list-together/) berichten.
