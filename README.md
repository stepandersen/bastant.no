# Bastant

Et statisk, norskspråklig nettsted bygget med [Eleventy](https://www.11ty.dev/).

## Lokal utvikling

Krever Node.js 20 eller nyere.

```sh
pnpm install
pnpm start
```

Produksjonsbygget lages med `pnpm run build` og skrives til `_site/`.

## Skrive en artikkel

Tidligere artikler er flyttet til `archived/articles/`. Mappen ligger utenfor Eleventys innholdsmappe (`src/`), og artiklene publiseres derfor ikke som sider eller i lister, emner, RSS og sitemap. Innhold og metadata er bevart som historikk. Nye artikler opprettes i `src/articles/` etter instruksene nedenfor.

Se [AI_ARTICLE_INSTRUCTIONS.md](AI_ARTICLE_INSTRUCTIONS.md) for en komplett instruks som kan gis til en AI-assistent.

1. Kopier `templates/article.md` til `src/articles/et-stabilt-filnavn.md`.
2. Fyll ut metadata og skriv artikkelen i Markdown.
3. Behold `status: draft` mens du arbeider.
4. Endre til `status: published` når artikkelen skal publiseres.

Kilder legges i artikkelens `sources`-liste. Den delte kildekomponenten viser dem automatisk som en aside ved siden av artikkelen på brede skjermer og under teksten på små skjermer. Bruk `#kilde-1`, `#kilde-2` og så videre for å lenke til dem fra brødteksten.

Publiseringsstedet velges med `review.publisher`, og innholdsprodusenten med `review.source`. Begge er obligatoriske nøkler fra `src/_data/sourceTypes.js`. For egenprodusert innhold settes begge til samme verdi, for eksempel `nrk`. For en NTB-artikkel publisert hos VG brukes `publisher: vg` og `source: ntb`. `review.type` velges blant publiseringsstedets artikkeltyper, uavhengig av produsenten. Bygget stopper ved ukjent eller manglende publisher, source eller type.

Artikkelvisning og lister bruker publisher som hovedavsender. Når source er forskjellig fra publisher, viser artikkelens informasjonsboks også «Source: NTB» (med produsentens registrerte navn). `review.url` er lenken til artikkelen hos publisher. Kildelisten `sources` er separat dokumentasjon og beholder sitt eget `publisher`-felt.

Registeret publiseres automatisk på `/medier/`, slik at eksterne skribenter og AI-verktøy kan lese de gyldige nøklene uten tilgang til JavaScript-filen.

`roles` angir hvilke roller en oppføring kan brukes i: `publisher` tillater `review.publisher`, og `producer` tillater `review.source`. De eksisterende publikasjonene har begge roller. NTB, AP, Reuters og AFP er foreløpig registrert som produsenter. Dette beskriver bruken i Bastants register, ikke alle tjenestene byråene tilbyr; AP og Reuters har også egne publikumsnettsteder. Ved gjennomgang av en artikkel publisert direkte der må `publisher`-rollen og relevante artikkeltyper først registreres. Bygget avviser bruk i en rolle som ikke er registrert.

Nyhetsstedets uttalte redaksjonelle prinsipper legges i det valgfrie feltet `editorialPrinciples` på publikasjonen, på samme nivå som `name`, `description` og `types`. Bruk `description` til en kildebelagt oppsummering av egne mål og krav, og `sources` til en liste med `{ title, url }` for dokumentasjonen. Beskriv kravene slik nyhetsstedet uttrykker dem; dette er ikke en vurdering av etterlevelsen. Prinsippene vises bare i medieoversikten og gjelder hele publikasjonen, ikke en bestemt artikkeltype.

Et nyhetssted kan registreres med `types: {}` inntil aktuelle artikkeltyper er dokumentert. Det vises da i medieoversikten uten en tom artikkeltypeseksjon. Før stedet brukes i en artikkel, må den aktuelle typen legges til.

Eierskap og statlig støtte registreres på publikasjonen i `ownership` og `stateSupport`, begge med `description`, `sources: [{ title, url }]` og `checked` (kontrolldato som `YYYY-MM-DD`). Feltene vises bare i medieoversikten. Oppgi år og hvilken virksomhet støttebeløp gjelder. Skill mellom produksjonstilskudd, allmennkringkastingsfinansiering og indirekte støtte som momsfritak. Fravær fra en mottakerliste dokumenterer bare den aktuelle ordningen og perioden, ikke fravær av all offentlig støtte.

Filnavnet blir artikkelens URL. Bruk små ASCII-bokstaver og bindestrek, for eksempel `nrk-og-vaermeldingen.md`.

## Koble sammen innlegg og tilsvar

Sett `respondsTo` i front matter på gjennomgangen av tilsvaret. Verdien er filnavnet til gjennomgangen av det opprinnelige innlegget, uten `.md`:

```yaml
respondsTo: skogbranner-klimarisiko-og-pastanden-om-klimafornektelse
```

Nettstedet viser automatisk lenker nederst i begge artiklene med en forklaring av hvilken vei tilsvaret går. Registrer koblingen bare på tilsvaret. Flere tilsvar kan peke til samme artikkel. Titler og nettadresser hentes automatisk. Bare publiserte gjennomganger vises; lenker til utkast skjules. Bygget avviser ukjente filnavn og koblinger til artikkelen selv for publiserte artikler.

## Nettadresse

Sett miljøvariabelen `SITE_URL` til den offentlige adressen i GitHub Actions. Standardverdien `https://example.com` er bare for lokale bygg og må erstattes før lansering.

Ved publisering som en GitHub Pages-prosjektside sender arbeidsflyten automatisk riktig `--pathprefix` til Eleventy.
