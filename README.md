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

Se [AI_ARTICLE_INSTRUCTIONS.md](AI_ARTICLE_INSTRUCTIONS.md) for en komplett instruks som kan gis til en AI-assistent.

1. Kopier `templates/article.md` til `src/articles/et-stabilt-filnavn.md`.
2. Fyll ut metadata og skriv artikkelen i Markdown.
3. Behold `status: draft` mens du arbeider.
4. Endre til `status: published` når artikkelen skal publiseres.

Kilder legges i artikkelens `sources`-liste. Den delte kildekomponenten viser dem automatisk som en aside ved siden av artikkelen på brede skjermer og under teksten på små skjermer. Bruk `#kilde-1`, `#kilde-2` og så videre for å lenke til dem fra brødteksten.

Publikasjonen som gjennomgås og publikasjonens egen artikkeltype velges med `review.source` og `review.type`, for eksempel `nrk` og `korrespondentbrev`. Felles navn og beskrivelser vedlikeholdes én gang i `src/_data/sourceTypes.js`. Bygget stopper dersom en artikkel bruker en ukjent kilde eller type.

Registeret publiseres automatisk på `/kilder/`, slik at eksterne skribenter og AI-verktøy kan lese de gyldige nøklene uten tilgang til JavaScript-filen.

Filnavnet blir artikkelens URL. Bruk små ASCII-bokstaver og bindestrek, for eksempel `nrk-og-vaermeldingen.md`.

## Nettadresse

Sett miljøvariabelen `SITE_URL` til den offentlige adressen i GitHub Actions. Standardverdien `https://example.com` er bare for lokale bygg og må erstattes før lansering.

Ved publisering som en GitHub Pages-prosjektside sender arbeidsflyten automatisk riktig `--pathprefix` til Eleventy.
