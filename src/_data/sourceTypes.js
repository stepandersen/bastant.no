// editorialPrinciples gjelder hele publikasjonen. Artikkeltyper registreres separat i types.
const sourceTypes = {
  afp: {
    roles: ["producer"],
    name: "AFP",
    site: "afp.com",
    description: "Agence France-Presse (AFP) er et internasjonalt nyhetsbyrå med base i Frankrike.",
    ownership: {
      "description": "AFP er en selvstendig juridisk enhet med særskilt status etter fransk lov. Styret har representanter fra franske medier, staten og de ansatte, samt uavhengige medlemmer. Byråets status skal beskytte det mot politisk, ideologisk og økonomisk kontroll.",
      "sources": [
        {
          "title": "AFP – juridisk status og styring",
          "url": "https://factuel.afp.com/propos"
        }
      ],
      "checked": "2026-09-12"
    },
    stateSupport: {
      "description": "AFP mottar kompensasjon fra den franske staten for sitt samfunnsoppdrag. I tillegg kjøper staten nyhetstjenester til departementer og utenriksstasjoner gjennom en kommersiell avtale. AFP deltar også i prosjekter med medfinansiering fra EU-kommisjonen og andre europeiske institusjoner. Disse finansieringsformene er beskrevet separat av AFP; ingen samlet støtteverdi er beregnet her.",
      "sources": [
        {
          "title": "AFP – fransk statsfinansiering og europeiske prosjekter",
          "url": "https://factuel.afp.com/propos"
        }
      ],
      "checked": "2026-09-12"
    },
    editorialPrinciples: {
      "description": "AFP oppgir at byrået skal levere presis, balansert og upartisk nyhetsdekning, uavhengig av politisk, kommersiell og ideologisk påvirkning.",
      "sources": [
        {
          "title": "AFP – redaksjonelle prinsipper",
          "url": "https://factuel.afp.com/propos"
        }
      ],
      "checked": "2026-09-12"
    },
    types: {},
  },
  reuters: {
    roles: ["producer"],
    name: "Reuters",
    site: "reuters.com",
    description: "Reuters er et internasjonalt nyhetsbyrå som leverer nyheter til medier, profesjonelle kunder og publikum.",
    ownership: {
      "description": "Reuters inngår i Thomson Reuters. Konsernets årsrapport for 2025 oppgir at Woodbridge og tilknyttede selskaper eide om lag 70 prosent av aksjene per 2. mars 2026.",
      "sources": [
        {
          "title": "Thomson Reuters – årsrapport 2025",
          "url": "https://investors.thomsonreuters.com/static-files/d4676c84-359c-42c3-9f84-8c62552d49a2"
        }
      ],
      "checked": "2026-09-12"
    },
    stateSupport: {
      "description": "Thomson Reuters har kontrakter med amerikanske myndigheter, blant annet for data- og teknologitjenester. Reuters omtaler nyhetsvirksomheten som separat fra konsernets øvrige virksomhet. Disse konsernkontraktene er ikke her regnet som direkte støtte til Reuters' journalistikk. En samlet sum for eventuell offentlig støtte til selve nyhetsbyrået er ikke bekreftet.",
      "sources": [
        {
          "title": "Reuters – konsernets myndighetskontrakter (10. juni 2026), gjengitt av Yahoo Finance",
          "url": "https://ca.finance.yahoo.com/news/thomson-reuters-faces-shareholder-vote-110232823.html/"
        }
      ],
      "checked": "2026-09-12"
    },
    editorialPrinciples: {
      "description": "Reuters' Trust Principles skal verne om uavhengighet, integritet og frihet fra partiskhet. Prinsippene krever pålitelige og upartiske nyheter til abonnentene.",
      "sources": [
        {
          "title": "Thomson Reuters – Trust Principles",
          "url": "https://www.thomsonreuters.com/en/about-us/trust-principles"
        }
      ],
      "checked": "2026-09-12"
    },
    types: {},
  },
  ap: {
    roles: ["producer"],
    name: "AP",
    site: "apnews.com",
    description: "Associated Press (AP) er et internasjonalt nyhetsbyrå som leverer journalistikk til medier og publiserer på AP News.",
    ownership: {
      "description": "AP er organisert som et ikke-kommersielt nyhetskooperativ med amerikanske aviser og kringkastere som medlemmer.",
      "sources": [
        {
          "title": "AP – organisasjon og medlemmer",
          "url": "https://www.ap.org/about/"
        }
      ],
      "checked": "2026-09-12"
    },
    stateSupport: {
      "description": "AP opplyste i februar 2025 at betalinger fra amerikanske myndigheter gjaldt abonnementer og lisensiering av innhold. Dette er tjenestekjøp. AP mottar også prosjektfinansiering fra stiftelser. En samlet oversikt over eventuelle offentlige tilskudd er ikke bekreftet her.",
      "sources": [
        {
          "title": "AP – offentlige abonnementer og innholdslisenser (7. februar 2025)",
          "url": "https://apnews.com/article/365a0899a84fba1567e85bb83da1e06b"
        },
        {
          "title": "AP – finansiering fra stiftelser",
          "url": "https://www.ap.org/the-definitive-source/behind-the-news/how-we-work-with-foundations/"
        }
      ],
      "checked": "2026-09-12"
    },
    editorialPrinciples: {
      "description": "AP beskriver sitt oppdrag som faktabasert og upartisk journalistikk. Ved eksternt finansierte samarbeid skal AP beholde redaksjonell kontroll og avvise tilskudd som krever forhåndsgodkjenning eller forsøker å påvirke dekningen.",
      "sources": [
        {
          "title": "AP – årsrapport 2025",
          "url": "https://www.ap.org/about/annual-report/2025-letter-from-the-chair-and-ceo/"
        },
        {
          "title": "AP – krav til eksterne samarbeid",
          "url": "https://www.ap.org/about/our-standards-with-outside-groups/"
        }
      ],
      "checked": "2026-09-12"
    },
    types: {},
  },
  ntb: {
    roles: ["producer"],
    ownership: {
      "description": "NTB eies av norske medievirksomheter. Konkurransetilsynets vedtak fra 2025 oppgir at Amedia Lokal AS eide 25,5 prosent, Amedia AS 14,6 prosent og NRK AS 11,1 prosent per 31. desember 2023. Dette er en datert eieroversikt, ikke bekreftede eierandeler for 2026.",
      "sources": [
        {
          "title": "Konkurransetilsynet – vedtak V2025-11, eieropplysninger i fotnote 68",
          "url": "https://konkurransetilsynet.no/wp-content/uploads/2025/07/V2025-11-Offentlig-versjon-Retriever-Aktiebolag-og-Infomedia-AS.pdf"
        }
      ],
      "checked": "2026-09-12"
    },
    stateSupport: {
      "description": "Brønnøysundregistrene oppgir en tildeling til NTB AS på 2 185,58 kroner fra Skatteetaten, datert 5. februar 2026. Tildelingen er registrert som regionalstøtte gjennom skatte- eller avgiftsfritak. Dette dokumenterer én konkret tildeling og er ikke en totalsum for NTBs offentlige støtte.",
      "sources": [
        {
          "title": "Støtteregisteret – NTB AS, tildeling 1000062783",
          "url": "https://stotte.brreg.no/nb/oppslag/stoettetildeling/1000062783"
        }
      ],
      "checked": "2026-09-12"
    },
    name: "NTB",
    site: "ntb.no",
    description: "NTB er et norsk nyhetsbyrå som produserer og leverer redaksjonelt innhold til andre medier.",
    types: {},
  },
  e24: {
    roles: ["publisher", "producer"],
    ownership: {
      description: "Inngår i Schibsted, som er heleid av Stiftelsen Tinius.",
      sources: [
        { title: "Schibsted – eierskap og mediehus", url: "https://www.vg.no/informasjon/om-schibsted" },
      ],
      checked: "2026-09-12",
    },
    stateSupport: {
      description: "Ikke oppført som mottaker av produksjonstilskudd i Medietilsynets tildelingsoversikt for 2025. Avismomsfritaket er en relevant indirekte støtteordning for betalt avisinnhold; verdien for dette mediet er ikke tallfestet her.",
      sources: [
        { title: "Medietilsynet – produksjonstilskudd 2025 (full mottakerliste)", url: "https://www.medietilsynet.no/globalassets/dokumenter/produksjonstilskudd/251029_produksjonstilskudd.pdf" },
        { title: "Skatteetaten – momsfritak for aviser", url: "https://www.skatteetaten.no/rettskilder/type/handboker/merverdiavgiftshandboken/gjeldende/M-6/M-6-1/M-6-1.2/" },
      ],
      checked: "2026-09-12",
    },
    name: "E24",
    site: "e24.no",
    description: "E24 er en norsk nettavis som dekker økonomi og næringsliv.",
    editorialPrinciples: {
      description: "E24 har som mål å formidle nyheter saklig og opplyser at Vær Varsom-plakaten skal styre redaksjonens arbeid. De egne etiske retningslinjene krever at faktapåstander fra kilder kontrolleres mot andre kilder, og at journalistene også søker opplysninger som taler mot hovedhypotesen. Anonyme kilder utløser skjerpede krav til kildekritikk og faktakontroll. Kommersielle interesser skal ikke overstyre redaksjonelle vurderinger, og medarbeiderne skal unngå bindinger som svekker uavhengigheten. Påviste feil skal rettes raskt, med synlige og sporbare rettelser.",
      sources: [
        { title: "E24s etiske retningslinjer – samfunnsrolle, integritet, faktakontroll og rettelser", url: "https://e24.no/etiske-retningslinjer" },
      ],
    },
    types: {},
  },
  dn: {
    roles: ["publisher", "producer"],
    ownership: {
      description: "Dagens Næringsliv inngår i DN Media Group, eid av NHST Holding. Ved utgangen av 2025 var Bonheur ASA største aksjonær i NHST Holding med 55,13 prosent, fulgt av Must Invest AS med 20,71 prosent.",
      sources: [
        { title: "NHST Holding – konsernstruktur", url: "https://www.dngroup.com/nhst/" },
        { title: "NHST Holding – årsrapport 2025, aksjonæroversikt side 29", url: "https://www.dngroup.com/nhst/wp-content/uploads/sites/2/2026/05/nhst-2025-annual-report.pdf" },
      ],
      checked: "2026-09-12",
    },
    stateSupport: {
      description: "Ikke oppført som mottaker av produksjonstilskudd i Medietilsynets tildelingsoversikt for 2025. Avismomsfritaket er en relevant indirekte støtteordning for betalt avisinnhold; verdien for dette mediet er ikke tallfestet her.",
      sources: [
        { title: "Medietilsynet – produksjonstilskudd 2025 (full mottakerliste)", url: "https://www.medietilsynet.no/globalassets/dokumenter/produksjonstilskudd/251029_produksjonstilskudd.pdf" },
        { title: "Skatteetaten – momsfritak for aviser", url: "https://www.skatteetaten.no/rettskilder/type/handboker/merverdiavgiftshandboken/gjeldende/M-6/M-6-1/M-6-1.2/" },
      ],
      checked: "2026-09-12",
    },
    name: "Dagens Næringsliv",
    site: "dn.no",
    description: "Dagens Næringsliv er en norsk avis og et nyhetsnettsted med vekt på økonomi, næringsliv og samfunn.",
    editorialPrinciples: {
      description: "Dagens Næringsliv opplyser at avisen arbeider etter Vær Varsom-plakatens regler for god presseskikk. Regelverket krever redaksjonell uavhengighet, kritisk kildevalg og kontroll av opplysninger, samt saklighet i innhold og presentasjon. Punkt 4.2 krever at det fremgår hva som er fakta og hva som er kommentarer, og punkt 4.4 krever at overskrifter og ingresser har dekning i stoffet. Dette er en oppsummering av det felles presseetiske regelverket DN uttrykkelig slutter seg til.",
      sources: [
        { title: "Dagens Næringsliv – erklæring om presseetikk nederst på nettsiden", url: "https://www.dn.no/" },
        { title: "Vær Varsom-plakaten – punkt 2.1–2.2, 3.2 og 4.1–4.4", url: "https://www.presse.no/vaer-varsom-plakaten" },
      ],
    },
    types: {},
  },
  aftenposten: {
    roles: ["publisher", "producer"],
    ownership: {
      description: "Inngår i Schibsted, som er heleid av Stiftelsen Tinius.",
      sources: [
        { title: "Schibsted – eierskap og mediehus", url: "https://www.vg.no/informasjon/om-schibsted" },
      ],
      checked: "2026-09-12",
    },
    stateSupport: {
      description: "Ikke oppført som mottaker av produksjonstilskudd i Medietilsynets tildelingsoversikt for 2025. Avismomsfritaket er en relevant indirekte støtteordning for betalt avisinnhold; verdien for dette mediet er ikke tallfestet her.",
      sources: [
        { title: "Medietilsynet – produksjonstilskudd 2025 (full mottakerliste)", url: "https://www.medietilsynet.no/globalassets/dokumenter/produksjonstilskudd/251029_produksjonstilskudd.pdf" },
        { title: "Skatteetaten – momsfritak for aviser", url: "https://www.skatteetaten.no/rettskilder/type/handboker/merverdiavgiftshandboken/gjeldende/M-6/M-6-1/M-6-1.2/" },
      ],
      checked: "2026-09-12",
    },
    name: "Aftenposten",
    site: "aftenposten.no",
    description: "Aftenposten er en norsk avis og et nyhetsnettsted.",
    editorialPrinciples: {
      description: "Aftenposten opplyser at avisen følger Vær Varsom-plakaten og egne presseetiske husregler. Avisen skal tilstrebe flere uavhengige kilder og kontrollere opplysninger gjennom kildekritikk og dokumentasjon. I sin metodebeskrivelse understreker Aftenposten at journalistene også må søke informasjon som kan avkrefte hypotesen deres. Når en publisert påstand ikke kan fastslås sikkert, skal usikkerheten komme tydelig frem. Husreglene skal også verne om redaksjonell uavhengighet og troverdighet.",
      sources: [
        { title: "Slik jobber vi i Aftenposten", url: "https://www.aftenposten.no/slik-jobber-vi-i-aftenposten" },
        { title: "Aftenpostens presseetiske regler", url: "https://www.aftenposten.no/slik-jobber-vi-i-aftenposten/i/XbXpOx/aftenpostens-presseetiske-regler" },
        { title: "Slik kontrollerer Aftenposten at opplysninger er riktige", url: "https://www.aftenposten.no/slik-jobber-vi-i-aftenposten/i/zEpXlv/slik-kontrollerer-aftenposten-at-opplysninger-er-riktige" },
      ],
    },
    types: {},
  },
  vg: {
    roles: ["publisher", "producer"],
    ownership: {
      description: "Inngår i Schibsted, som er heleid av Stiftelsen Tinius.",
      sources: [
        { title: "Schibsted – eierskap og mediehus", url: "https://www.vg.no/informasjon/om-schibsted" },
      ],
      checked: "2026-09-12",
    },
    stateSupport: {
      description: "Ikke oppført som mottaker av produksjonstilskudd i Medietilsynets tildelingsoversikt for 2025. Avismomsfritaket er en relevant indirekte støtteordning for betalt avisinnhold; verdien for dette mediet er ikke tallfestet her.",
      sources: [
        { title: "Medietilsynet – produksjonstilskudd 2025 (full mottakerliste)", url: "https://www.medietilsynet.no/globalassets/dokumenter/produksjonstilskudd/251029_produksjonstilskudd.pdf" },
        { title: "Skatteetaten – momsfritak for aviser", url: "https://www.skatteetaten.no/rettskilder/type/handboker/merverdiavgiftshandboken/gjeldende/M-6/M-6-1/M-6-1.2/" },
      ],
      checked: "2026-09-12",
    },
    name: "VG",
    site: "vg.no",
    description: "VG er en norsk avis og et nyhetsnettsted.",
    editorialPrinciples: {
      description: "VG opplyser at Vær Varsom-plakaten skal styre redaksjonens arbeid, og at avisens egne trafikkregler utfyller dette regelverket. Reglene skal verne om medarbeidernes uavhengighet og stiller krav til kvalitetskontroll også av innhold fra andre. Dokumentariske bilder skal ikke endres slik at de gir et falskt inntrykk. VG har som mål å forklare redaksjonelle valg og etiske vurderinger, og opplyser at feil skal rettes i artiklene og samles i en rettelogg.",
      sources: [
        { title: "VGs redaksjonelle trafikkregler", url: "https://www.vg.no/informasjon/trafikkregler" },
        { title: "Åpenhet – slik jobber vi i VG", url: "https://www.vg.no/informasjon" },
      ],
    },
    types: {},
  },
  nettavisen: {
    roles: ["publisher", "producer"],
    ownership: {
      description: "Nettavisen eies av Amedia. Amedia er eid av den selveiende Amediastiftelsen, som ikke har formelle bånd til Sparebankstiftelsen DNB.",
      sources: [
        { title: "Amediastiftelsen – årsberetning 2024, mediehusene i Amedia", url: "https://amediastiftelsen.no/images/undersider/Amediastiftelsen_styrets_beretning_2024.pdf" },
        { title: "Amedia – hvem som eier konsernet", url: "https://www.amedia.no/kundesenter/ofte-stilte-sporsmal" },
      ],
      checked: "2026-09-12",
    },
    stateSupport: {
      description: "Ikke oppført som mottaker av produksjonstilskudd i Medietilsynets tildelingsoversikt for 2025. Avismomsfritaket er en relevant indirekte støtteordning for betalt avisinnhold; verdien for dette mediet er ikke tallfestet her.",
      sources: [
        { title: "Medietilsynet – produksjonstilskudd 2025 (full mottakerliste)", url: "https://www.medietilsynet.no/globalassets/dokumenter/produksjonstilskudd/251029_produksjonstilskudd.pdf" },
        { title: "Skatteetaten – momsfritak for aviser", url: "https://www.skatteetaten.no/rettskilder/type/handboker/merverdiavgiftshandboken/gjeldende/M-6/M-6-1/M-6-1.2/" },
      ],
      checked: "2026-09-12",
    },
    name: "Nettavisen",
    site: "nettavisen.no",
    description: "Nettavisen er en norsk nettavis.",
    editorialPrinciples: {
      description: "I en presentasjon av Nettavisens publisistiske plattform beskriver ansvarlig redaktør Gunnar Stavrum målet som en modig, uavhengig og fri avis. Han beskriver verdigrunnlaget som liberalt, med støtte til verdiene i vestlige demokratier, og et mål om troverdig og folkelig journalistikk. Plattformen presenteres som verdier og mål avisen skal strekke seg etter. Denne presentasjonen spesifiserer ikke nærmere krav til faktakontroll eller merking av spekulasjon.",
      sources: [
        { title: "Gunnar Stavrum om Nettavisens publisistiske plattform (10. april 2025)", url: "https://www.nettavisen.no/norsk-debatt/nettavisen-vokser-opplagsvinner-med-flere-lesere-og-kraftig-annonsevekst/s/5-95-2379469" },
      ],
    },
    types: {},
  },
  tv2: {
    roles: ["publisher", "producer"],
    ownership: {
      description: "TV 2 inngår i det danske mediekonsernet Egmont. Egmont er en næringsdrivende stiftelse som både investerer i medievirksomheten og støtter barn og unge i vanskelige livssituasjoner.",
      sources: [
        { title: "Egmont – konsernet og TV 2", url: "https://www.egmont.dk/noegletal-rapporter" },
        { title: "Egmont – stiftelsens formål", url: "https://www.egmont.dk/" },
      ],
      checked: "2026-09-12",
    },
    stateSupport: {
      description: "For allmennkringkastingsoppdraget i 2025 fastsatte Medietilsynet en kompensasjon på 150 millioner kroner. Ordningen dekker nettokostnader ved oppdraget, med et årlig tak på 150 millioner kroner. Beløpet gjelder TV 2s allmennkringkastingsoppdrag samlet og er ikke en særskilt tildeling til tv2.no.",
      sources: [
        { title: "Medietilsynet – allmennkringkastingsrapporten for TV 2, 2025", url: "https://www.medietilsynet.no/fakta/rapporter/kringkasting/2026/allmennkringkastingsrapporten-tv-2/" },
        { title: "Medietilsynet – allmennkringkastingsstøtte til TV 2", url: "https://www.medietilsynet.no/mediestotte/stotte-til-tv-2/" },
      ],
      checked: "2026-09-12",
    },
    name: "TV 2",
    site: "tv2.no",
    description: "TV 2 er en norsk kommersiell allmennkringkaster med nyhetsnettstedet tv2.no.",
    editorialPrinciples: {
      description: "TV 2s etikkreglement krever at publiserte opplysninger er faktisk korrekte, at feil rettes, og at faktasjekk, kildekontroll og samtidig tilsvar gjennomføres før publisering. Det fremhever et skille mellom kommentatorvirksomhet og annen journalistikk og begrenser medarbeideres meningsytringer om saker de dekker. Reglementet skal verne om troverdighet og integritet. Kilden er TV 2s reglement fra oktober 2011, gjengitt av Norsk Redaktørforening; det er ikke bekreftet at dette er siste versjon.",
      sources: [
        { title: "TV 2s etikkreglement – punkt 2.5 og 7.2 (2011), hos Norsk Redaktørforening", url: "https://gammel.nored.no/Etikk/Interne-etiske-regler/0" },
      ],
    },
    types: {},
  },
  nrk: {
    roles: ["publisher", "producer"],
    ownership: {
      description: "NRK er et statlig aksjeselskap eid av den norske staten. Kultur- og likestillingsdepartementet forvalter eierskapet.",
      sources: [
        { title: "NRK – vedtekter og eierskap", url: "https://info.nrk.no/vedtekter/" },
      ],
      checked: "2026-09-12",
    },
    stateSupport: {
      description: "NRK finansieres hovedsakelig gjennom en direkte bevilgning over statsbudsjettet, utbetalt av Medietilsynet. Medietilsynets oversikt oppgir om lag 6,688 milliarder kroner i regnskapsført statstilskudd i 2025, basert på foreløpig årsregnskap per februar 2026. Beløpet gjelder NRK AS samlet, ikke bare nrk.no.",
      sources: [
        { title: "Medietilsynet – NRKs driftsgrunnlag, tabell 5 (2025-tall)", url: "https://prod.medietilsynet.no/fakta/rapporter/kringkasting/2026/nrks-bidrag-til-mediemangfoldet/" },
      ],
      checked: "2026-09-12",
    },
    name: "NRK",
    site: "nrk.no",
    description: "Norsk rikskringkasting er den norske offentlig finansierte allmennkringkasteren.",
    editorialPrinciples: {
      description: "NRK opplyser at den redaksjonelle virksomheten følger Vær Varsom-plakaten med NRKs egne presiseringer. Reglene krever redaksjonell uavhengighet, saklighet, kritisk kildevalg og kontroll av fakta. NRKs presisering til punkt 3.2 krever at vesentlige relevante fakta tas med, at flere kilder brukes, og at budskapet ikke spisses utover faktagrunnlaget. Punkt 4.2 krever et tydelig skille mellom faktiske opplysninger og kommentarer, mens punkt 4.4 krever dekning i stoffet for overskrifter og ingresser.",
      sources: [
        {
          title: "NRKs etikkhåndbok – innledning og punkt 2.1, 3.2, 3.2.A og 4.1–4.4",
          url: "https://info.nrk.no/etikkhandboka/",
        },
      ],
    },
    types: {
      replikk: {
        name: "Replikk",
        description: "NRKs kategoribetegnelse for tilsvar til et tidligere publisert meningsinnlegg.",
      },
      kronikk: {
        name: "Kronikk",
        description: "NRKs kategori for kronikker som gir uttrykk for avsenderens personlige meninger om et tema.",
      },
      korrespondentbrev: {
        name: "Korrespondentbrev",
        description: "NRKs kategoribetegnelse for brev og analyser fra kanalens korrespondenter.",
      },
      urix: {
        name: "Urix",
        description: "NRKs redaksjonelle kategori for utenriksnyheter og internasjonale saker.",
      },
    },
  },
};

const agencies = ["ntb", "reuters", "ap", "afp"];
const publications = Object.keys(sourceTypes)
  .filter((key) => key !== "nrk" && !agencies.includes(key))
  .sort((a, b) => sourceTypes[a].name.localeCompare(sourceTypes[b].name, "nb"));

export default Object.fromEntries(
  ["nrk", ...publications, ...agencies].map((key) => [key, sourceTypes[key]])
);
