# Bastant artikkelradar

Radaren er en varig innboks med forslag til senere Bastant-gjennomgang. Den henter offentlige feedmetadata, normaliserer, forhåndsvurderer, grupperer svært like saker og kan gjøre avgrensede modellkall. Ingen fulltekst hentes fra artiklene. Innholdet i `content:encoded` brukes heller ikke når en feed tilbyr det.

**En høy score betyr at saken ser interessant og etterprøvbar ut. Den betyr ikke at artikkelen sannsynligvis er feil.** Radaren vurderer ikke sannhetsverdi, manglende kontekst, presseetikk eller journalistens motiv. Den utfører ingen ekstern research og bekrefter ikke at foreslåtte primærkilder finnes.

## Kjøring

Krever Node.js 24 (samme hovedversjon som prosjektets bygg) og `pnpm install` for avhengigheter. Kommandoene kan kjøres med npm eller pnpm; behold pnpm som pakkebehandler for installasjon og lockfil.

```sh
npm run article-radar -- --no-ai
npm run article-radar
npm run article-radar:collect
npm run article-radar:assess -- --max-ai-candidates=3
npm run article-radar -- --publisher=nrk --since-hours=48 --limit=20
npm run article-radar -- --help
```

Standard: innhent artikler publisert de siste 48 timene, vurder høyst 25 grupper og vis de 15 høyest rangerte åpne kandidatene i Markdown. Grensen gjelder nye gruppevurderinger; hver kan forsøkes én ekstra gang. `--limit` begrenser bare Markdown, ikke AI-kostnader eller JSON. `--max-ai-candidates` begrenser modellbruken.

`collect` og `--no-ai` gjør ingen modellkall og leser ingen nøkkelfil. `assess` bruker allerede lagrede artikler uten å hente feeds. Hovedkommandoen kjører begge trinn. Manglende nøkkel gir en tydelig melding og exitkode 1, men innhentede artikler og rapport lagres. `--publisher` avgrenser innhenting og modellkall; rapporten inneholder fortsatt hele innboksen.

## API-nøkkel utenfor repoet

Opprett selv en fil på denne plasseringen (tilpass brukernavn):

```text
C:\Users\step\.config\bastant\article-radar.env
```

På andre operativsystemer: `~/.config/bastant/article-radar.env`. Innhold:

```dotenv
OPENAI_API_KEY=DIN_NØKKEL
OPENAI_MODEL=gpt-4.1-mini
```

Sett `ARTICLE_RADAR_ENV_FILE` til en annen filplassering om ønskelig. Scriptet avviser nøkkelfiler inne i dette repoet, også via symlenker. Miljøvariablene `OPENAI_API_KEY` og `OPENAI_MODEL` overstyrer filen. Nøkkelen har ikke noe CLI-argument og skrives aldri til rapportene. Ikke legg den i chat, kildekode eller kommandolinjehistorikk. Repoet kan være offentlig; innboksdata og `.env`-filer er også git-ignorert.

Det brukes vanlige HTTP-kall til OpenAIs [Responses API med Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs). Standardmodellen er [gpt-4.1-mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), som kan endres med `OPENAI_MODEL`; velg en modell som støtter samme API og JSON-skjema. `store: false` sendes med hvert kall. Ingen agent i terminalen er nødvendig.

## Innboks og beslutninger

Standardmappe: `data/article-radar/`, utenfor Eleventys `src/`. Den kan flyttes med `ARTICLE_RADAR_DATA_DIR` eller `--data-dir=PATH`.

| Fil | Innhold |
| --- | --- |
| `inbox.json` | Autoritativ tilstand: metadata, vurderinger, forsøk og beslutninger |
| `seen.json` | Avledet oversikt over oppdagede URL-er og behandlingsstatus |
| `candidates.json` | `{version, run, candidates}` med alle åpne grupper, høyest AI-score først |
| `latest.md` | Lesbar rapport med eksisterende og nye kandidater |

Oppdaget betyr ikke ferdig behandlet. Status er `pending`, `assessed` eller `failed`. Saker under forhåndsterskelen og over AI-grensen beholdes; de kan vurderes senere. Feil kan forsøkes igjen ved neste vurderingskjøring. Endringer i forhåndsreglene brukes på nytt uten modellkall. Ferdige vurderinger og metadataene de ble laget fra beholdes. Endring av prompt eller modell utløser ikke automatisk nye betalte vurderinger.

Alle åpne kandidater rangeres samlet. AI-vurderte saker står først, mens uvurderte sorteres etter lokale signaler. Listen er en innboks, ikke bare differansen fra forrige kjøring. En senere, svært lik artikkel kan gjenbruke en vurdering; `inputArticleId` viser hvilken original som faktisk ble vurdert.

ID finnes i rapporten. En enkel manuell beslutning flytter kandidaten ut av den åpne innboksen:

```sh
npm run article-radar -- --decision=selected --id=KANDIDAT_ID
npm run article-radar -- --decision=rejected --id=KANDIDAT_ID --reason=too-trivial
npm run article-radar -- --decision=open --id=KANDIDAT_ID
```

Dette gjør ingen nettverkskall. Beslutningen gjelder alle nåværende medlemmer i gruppen; gjenåpning med samme ID gjenåpner disse. Senere oppdagede, andre URL-er kan fortsatt dukke opp som nye forslag.

Ved innhenting/vurdering ryddes artikler opp 90 dager etter første oppdagelse, slik at tilstanden er avgrenset. Dette gjelder også uvurderte og avviste saker. Utvalgte (`selected`) saker beholdes. Ta vare på innboksen hvis du ønsker lengre historikk. En udatert sak kan bli oppdaget på nytt etter opprydding; publiseringsdato diktes aldri opp.

Filer skrives via midlertidig fil og atomisk rename. Innhentingen lagres før AI starter, og hver ferdig gruppe lagres straks. `inbox.json` er sannhetskilden; øvrige filer kan gjenskapes. Ved ugyldig innboks avbrytes kjøringen uten å overskrive den. `.lock` hindrer samtidige skrivere. Etter et hardt prosessavbrudd: kontroller at prosessen angitt i `.lock` ikke lenger kjører, og slett deretter bare `.lock` før nytt forsøk.

## Kilder

`src/_data/sourceTypes.js` er autoritativt register for publisistroller og navn. Den separate `scripts/article-radar/sourceDiscovery.js` har feedadresser, av/på-brytere, dekning og lenke til hvor feeden ble funnet. `enabled: false` deaktiverer innhenting fra mediet; `enabled: false` på én feed deaktiverer bare den. `aiEnabled: false` hindrer modellkall for kilden, også ved separat vurdering.

Alle følgende adresser ble hentet med HTTP 200 og innholdet parsede ved kontroll 14. september 2026:

| Publisist | Kilde | Dekning / begrensning |
| --- | --- | --- |
| NRK | https://www.nrk.no/toppsaker.rss | Toppsaker; ikke alle publiseringer |
| VG | https://www.vg.no/rss/feed/?format=rss | Alle kategorier; feeden gav 10 artikler i testen |
| TV 2 | https://www.tv2.no/rss/nyheter | Nyheter; RSS-oversikten `/rss/` er HTML, ikke selve feeden |
| DN | https://services.dn.no/api/feed/rss/ | Siste saker |
| Nettavisen | https://www.nettavisen.no/service/rich-rss | Siste saker; fulltekstfelt ignoreres |
| Aftenposten | https://www.aftenposten.no/sitemaps/files/articles-48hrs.xml | News sitemap fra robots.txt; tittel og dato uten ingress |
| E24 | https://e24.no/rss2/ | Innhenting fungerer, AI-vurdering deaktivert |

E24s feed oppgir at bruk av metadata som input til språkmodeller krever skriftlig tillatelse. Derfor brukes bare lokale regler for E24. VG-artikler med eksplisitt E24-kreditering i seksjonsfeltet er også unntatt modellkall. Dette er et konkret kildeforbehold, ikke en generell vurdering av rettigheter hos alle medier.

Ingen registrerte publisister måtte deaktiveres helt i testen. NRK, VG, TV 2, DN og Nettavisen bruker RSS; Aftenposten bruker en strukturert sitemap. Det er ingen forsidecrawler. En vanlig sitemap uten nyhetstittel blir ikke supplert med sideskraping; slike rader hoppes over. Sitemapindekser støttes ikke: konfigurer den konkrete news sitemap-filen. Atom støttes av parseren og er testet med en lokal fixture.

Legg til et medium ved å registrere rollen `publisher` i kilderegisteret, finne en offisiell feed og legge samme nøkkel i discovery-konfigurasjonen. Kontroller faktisk XML og dekning med `--publisher=... --no-ai`; et HTTP 200-svar alene er ikke tilstrekkelig. Flere feeder kan legges til samme publisist. URL-er fra andre domener enn mediets registrerte domene og underdomener hoppes over.

## Prompt, rangering og videre justering

- `scripts/article-radar/assessment-prompt.md`: redigerbare AI-instrukser, norske begrunnelser, 2–5 spørsmål og kildeforslag.
- `scripts/article-radar/prefilter.js`: samlede lokale signaler, terskel i `config.js`.
- `scripts/article-radar/config.js`: standardgrenser og vekter.
- `scripts/article-radar/assessCandidate.js`: isolert API-integrasjon, JSON-skjema og lokal validering.
- `scripts/article-radar/pipeline.js`: kandidatvalg og vurdering; senere research kan kobles inn før rangering.

Vekting: 25 % etterprøvbarhet, 20 % samfunnsbetydning, 20 % antatt kildetilgang, 15 % mulighet for nyttig kontekst, 10 % faktatetthet og 10 % lokalt forhåndssignal. Alle dimensjoner er 0–10; koden beregner og avrunder sluttscoren til 0–100. `confidence` gjelder tryggheten i kandidatseleksjonen. Hver vurdering lagrer modell, tidspunkt, hash av prompten og inputmetadata.

Prompten skiller kildeinnhold fra instrukser og forbyr dommer om artikkelen. En lokal kontroll avviser flere åpenbare brudd i modellsvaret; den er ikke en full semantisk garanti. Se gjennom faktiske resultater og juster instruksen etter hvert. For sammenligning av promptvarianter uten å endre hovedinnboksen kan du bruke en separat `--data-dir` og en liten AI-grense.

Gruppering krever høy likhet i både tittel og ingress, kort tidsavstand og eventuelt eksplisitt felles byråkreditering. Alle medlemmer må ligne hverandre; kjeder av delvis like saker slås ikke automatisk sammen. Korte titler, avvikende tall og saker uten publiseringstid holdes normalt separate. Ved tvil beholdes begge. Originale lenker og publisister bevares.

## Feil og begrensninger

Nettverk, ugyldig feed, XML-parser, AI-feil og ugyldig AI-JSON skilles. Én feedfeil stopper ikke andre kilder; feil vises i kjøringsmetadata og rapport. Hvis ingen kilder kan hentes, blir exitkoden 1. Delvis feedfeil gir fortsatt en brukbar rapport. AI-feil gir exitkode 1, men bevarer innboksen. Ugyldige modellresultater får høyst ett nytt forsøk. HTTP 400/401/403/404/429 stopper flere modellkall i denne kjøringen, slik at en konfigurasjons- eller kvotefeil ikke gjentas for hele listen. Fullstendige API-svar logges ikke.

Feedene er korte øyeblikksbilder og gir ikke garantert dekning av hele 48-timersvinduet. Udaterte saker tas med med `published: null` og oppdagelsestid separat; oppdateringstid brukes ikke som publiseringstid. URL-normalisering fjerner kjente trackingparametere, men endrer ikke ukjente parametere eller gjetter kanoniske URL-er. Artikler hentes ikke for å slå opp canonical-tag. Redigerte artikler blir ikke automatisk AI-vurdert på nytt. Prefilteret kan favorisere eksplisitte tall og gode ingresser, og trenger praktisk kalibrering.

Scheduler, database, ekstern research og offentlig/admin-side er ikke implementert. En senere GitHub Action trenger både en secret for API-nøkkelen og en eksplisitt løsning for varig innboks mellom kjøringer; en fersk checkout alene er ikke nok.

## Verifikasjon og eksempel

```sh
npm test
npm run build
npm run article-radar -- --no-ai
```

Prosjektets innebygde Node-testoppsett brukes uten nytt testframework. Det finnes ingen separat lintkommando. Ny parseravhengighet: `fast-xml-parser`; HTTP, miljøfiler og tester bruker Node.

Første innhenting 14. september 2026:

```text
NRK................. 50
VG.................. 10
TV 2................ 20
Dagens Næringsliv... 18
Nettavisen.......... 15
Aftenposten......... 128
E24................. 29

270 hentet · 269 nye · 129 over forhåndsterskel
0 AI-vurdert · 268 åpne kandidater
```

Tall og rangering vil endres med nye publiseringer og justerte regler. Live AI-vurdering krever en lokalt konfigurert nøkkel. Tester av API-kontrakten, retry, feil, budsjettgrense og gjenbruk bruker simulerte svar og forbruker ingen API-kreditter.
