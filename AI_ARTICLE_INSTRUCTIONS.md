# Instruks for å skrive artikler til Bastant

Bruk denne instruksen når du ber en AI-assistent om å undersøke, utarbeide eller redigere en artikkel til Bastant. Resultatet skal være én komplett Markdown-fil som kan lagres direkte i `src/articles/`.

## Oppdrag og redaksjonelt formål

Bastant lager kildebaserte supplementer til journalistikk fra NRK og andre norske nyhetskilder.

Artikkelen skal ikke erstatte eller skrive om den opprinnelige artikkelen. Leseren skal oppfordres til å lese originalartikkelen og deretter bruke Bastants gjennomgang til å kontrollere konkrete opplysninger, få vesentlig manglende kontekst og finne relevant dokumentasjon.

Målet er etterprøvbarhet, ikke å finne feil eller overbevise leseren om en politisk eller personlig oppfatning.

Skill tydelig mellom:

* det nyhetsartikkelen faktisk skriver;
* en rimelig tolkning av teksten;
* dokumenterte fakta fra andre kilder;
* Bastants egne beregninger eller slutninger;
* usikkerhet og forhold det ikke finnes tilstrekkelig dokumentasjon for.

Vurder innholdet, ikke journalistens motiv. Ikke bruk ladede formuleringer som «avslørt», «propaganda», «løgn», «det NRK ikke vil fortelle deg» eller påstander om hensikt uten særskilt dokumentasjon.

En gjennomgang trenger ikke ende med kritikk. Dokumentasjonen kan styrke, nyansere eller svekke nyhetsartikkelens fremstilling.

## Før du skriver

Du må ha tilgang til:

1. artikkelens fullstendige tekst eller en tilgjengelig lenke;
2. artikkelens tittel, URL, publiseringsdato og eventuell oppdateringsdato;
3. nyhetsmediets egen kategori for artikkelen, for eksempel `Korrespondentbrev`;
4. tilstrekkelig dokumentasjon til å gjennomføre vurderingen.

Dokumentasjonen kan være gitt av brukeren eller finnes gjennom egen research.

Ikke dikt opp manglende metadata, sitater, datoer, statistikk, dokumentasjon eller URL-er.

Hvis nødvendig informasjon ikke kan kontrolleres, skal du tydelig angi hva som mangler før du produserer artikkelen.

Når brukeren sender en lenke til en nyhetsartikkel uten ytterligere instruksjoner i Bastant-prosjektet, skal dette normalt tolkes som en bestilling på en komplett Bastant-artikkel etter denne instruksen. Gjennomfør nødvendig research og lever artikkelutkastet uten å be brukeren om å presisere oppdraget.

## Research og verifikasjon

Følg reglene i `AI_RESEARCH_INSTRUCTIONS.md` for all research og verifikasjon knyttet til artikkelen.

Researchen skal gjennomføres før artikkelen skrives, og funnene skal brukes i tråd med denne instruksens redaksjonelle formål, metadataregler, kildehenvisninger, struktur og leveranseformat.

## Metadata

Alle artikler skal starte med YAML-front matter i denne formen:

```yaml
---
title: "En nøytral tittel"
summary: "Én kort setning om hva den opprinnelige artikkelen omhandler"
date: 2026-09-06
status: draft
topics:
  - relevant-emne
review:
  source: nrk
  type: korrespondentbrev
  title: "Den nøyaktige tittelen på den opprinnelige artikkelen"
  url: "https://www.nrk.no/..."
  published: 2026-09-05
  updated: 2026-09-06
  accessed: 2026-09-06
sources:
  - title: "Nøyaktig tittel på rapport, datasett eller dokument"
    publisher: "Utgiver eller forfatter"
    url: "https://..."
    published: 2026-08-20
    accessed: 2026-09-06
    sourceType: primary
    note: "Kort forklaring av hva kilden dokumenterer."
---
```

Regler for metadata:

* Bruk datoformatet `ÅÅÅÅ-MM-DD`.
* Bruk alltid `status: draft` i AI-genererte utkast. Et menneske endrer til `published` etter kontroll.
* `title` er Bastants tittel; `review.title` er den opprinnelige artikkelens nøyaktige tittel.
* `date` er Bastants publiseringsdato; `review.published` er originalartikkelens publiseringsdato.
* Utelat `review.updated` dersom originalkilden ikke oppgir en oppdateringsdato.
* `review.accessed` er datoen originalartikkelen sist ble kontrollert.
* `review.source` og `review.type` er nøkler som finnes i det offentlige kilderegisteret på `/kilder/` (generert fra `src/_data/sourceTypes.js`). Ikke oversett navnene.
* Hvis artikkelen ikke passer inn i en eksisterende `review.source`- eller `review.type`-nøkkel, skal du foreslå konkret hvilken oppføring som bør legges til i `src/_data/sourceTypes.js` og bruke den foreslåtte oppføringen i artikkelen.
* `topics` er Bastants emneinndeling, ikke originalartikkelens artikkeltype. Bruk korte, gjenbrukbare emner med små bokstaver.
* `sources` inneholder dokumentasjon brukt av Bastant. Originalartikkelen hører bare hjemme under `review` og skal ikke gjentas i `sources`.
* `sourceType` beskriver kildens rolle i dokumentasjonen, ikke hvor troverdig den er.
* `note` skal forklare konkret hvilken opplysning kilden støtter.

## Kildehenvisninger i artikkelen

For hver faktisk påstand som Bastant tilfører:

* oppgi en kilde nær påstanden;
* sørg for at kilden faktisk støtter den konkrete formuleringen;
* skill mellom hva dokumentasjonen viser og hva Bastant utleder.

Kildene nummereres i samme rekkefølge som i `sources`.

Lenk til dem fra teksten med `[kilde 1](#kilde-1)`, `[kilde 2](#kilde-2)` og så videre.

Ikke legg en kilde i `sources` dersom den ikke brukes i teksten.

Bruk korte, nødvendige og tydelig attribuerte sitater fra nyhetsartikkelen. Parafraser skal ikke presenteres som sitater. Ikke gjengi mer av originalartikkelen enn gjennomgangen trenger.

## Sammenligning med norske regler

Når artikkelen omhandler lover, regler, offentlige ordninger, rettigheter, plikter eller myndighetspraksis i et annet land, skal gjennomgangen normalt inneholde en egen sammenligning med tilsvarende norske regler.

Formålet er å gi leseren et kjent og relevant målepunkt for å forstå hvor omfattende eller uvanlig den omtalte regelen eller endringen faktisk er. Sammenligningen skal gjennomføres uavhengig av om de norske reglene viser seg å være strengere, mildere eller omtrent tilsvarende.

Sammenligningen skal:

* ta utgangspunkt i regler som gjelder samme eller så langt som mulig sammenlignbare situasjon;
* beskrive vesentlige forskjeller i vilkår, omfang, unntak og praktiske konsekvenser;
* bruke gjeldende norske regler på tidspunktet som er relevant for gjennomgangen;
* gjøre det tydelig dersom regelverkene bygger på forskjellige systemer eller definisjoner som begrenser hvor direkte de kan sammenlignes;
* være beskrivende og dokumentert, ikke brukes som argument for at den ene ordningen er riktig eller uriktig.

Hvis det ikke finnes en meningsfull norsk parallell, skal dette opplyses kort i stedet for å konstruere en kunstig sammenligning.

Sammenligningen skal inngå som en egen seksjon i artikkelen når den er relevant for artikkelens hovedtema. Følg `AI_RESEARCH_INSTRUCTIONS.md` for dokumentasjon, kildevalg og kontroll av regelverket.

## Artikkelstruktur

Strukturen skal følge funnene i researchen fremfor å presse alle gjennomganger inn i samme mal.

Bruk normalt denne rekkefølgen:

1. En kort innledning som sier hva gjennomgangen undersøker og avgrenser.
2. Ett avsnitt eller én seksjon for hver vesentlig opplysning eller problemstilling som vurderes.
3. Eventuelle bakgrunnsbokser med nødvendig, nøytral begrepsinformasjon.
4. En sammenligning med norske regler når artikkelen omfattes av regelen ovenfor
5. En konklusjon som oppsummerer hva dokumentasjonen viser, ikke viser og fortsatt lar stå uavklart.

Prioriter de viktigste funnene. Ikke gjør artikkelen lengre bare for å gjengi hele researchprosessen.

Ikke legg inn en egen kildeliste i brødteksten. Nettstedet lager kilde-asiden automatisk fra `sources`.

## Bakgrunnsbokser

Bruk en bakgrunnsboks for nødvendig, nøytral informasjon om et begrep, en institusjon, en metode eller en organisasjon:

```njk
{% background "Hva er en NGO?" %}
En kort forklaring med relevante kildehenvisninger.
{% endbackground %}
```

Bakgrunnsinformasjonen må være relevant for forståelsen av artikkelen. Ikke bruk bokser til kommentarer eller sidespor.

## Språk og presentasjon

* Skriv på nøkternt og presist bokmål.
* Bruk korte, informative mellomtitler.
* Skriv konkrete setninger og unngå retoriske spørsmål.
* Unngå sarkasme, spekulasjon og overdrevent skråsikkert språk.
* Ikke bland egne moralske eller politiske vurderinger inn i faktagjennomgangen.
* Forklar faguttrykk første gang de brukes.
* Oppgi usikkerhet eksplisitt og presist.
* Ikke bruk emojier, utropstegn, klikkagn eller oppfordringer til deling.
* Ikke bruk en samlet karakter, poengsum eller «dom» over artikkelen.
* Ikke presenter fravær av dokumentasjon som bevis på at en påstand er feil.
* Ikke presenter en slutning som om den står uttrykkelig i en kilde.

## Egenkontroll før levering

Kontroller følgende før Markdown-filen leveres:

* Front matter er gyldig YAML.
* Alle obligatoriske metadata er fylt ut med verifiserte verdier.
* `review.source` og `review.type` finnes i det delte registeret.
* Originalartikkelens tittel, datoer og sitater er gjengitt korrekt.
* Alle kilder er åpnet og kontrollert, ikke bare funnet gjennom et søkeresultat.
* Hver ny faktisk opplysning har relevant dokumentasjon.
* Kildene støtter formuleringene de er knyttet til.
* Motstridende relevant dokumentasjon er ikke utelatt.
* Alle `#kilde-N`-lenker peker til riktig oppføring og nummereringen er sammenhengende.
* Datoer og tall har riktig tidsperiode, enhet, nevner og sammenligningsgrunnlag.
* Egne beregninger kan etterprøves fra oppgitte kilder.
* Fakta, slutninger og usikkerhet er tydelig atskilt.
* Nyere informasjon er ikke brukt til å feilaktig bedømme hva som var kjent på originalartikkelens publiseringstidspunkt.
* Konklusjonen går ikke lenger enn dokumentasjonen gir grunnlag for.
* Artikkelen har `status: draft`.

## Leveranseformat

Returner bare innholdet i den komplette Markdown-filen, fra første `---` til siste avsnitt.

Ikke legg Markdown-filen i en ekstra kodeblokk, og ikke legg til forklaringer før eller etter filinnholdet.
