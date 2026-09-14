// Technical configuration only. Publisher roles/names come from sourceTypes.js.
// URLs discovered from official pages and fetched successfully on 2026-09-14.
export default {
  nrk: {
    enabled: true, aiEnabled: true,
    evidence: "https://www.nrk.no/",
    feeds: [{ type: "rss", url: "https://www.nrk.no/toppsaker.rss", label: "Toppsaker; redaksjonelt utvalg, ikke komplett arkiv" }],
  },
  vg: {
    enabled: true, aiEnabled: true,
    evidence: "https://www.vg.no/",
    feeds: [{ type: "rss", url: "https://www.vg.no/rss/feed/?format=rss", label: "Alle saker, inkludert sport og underholdning" }],
  },
  tv2: {
    enabled: true, aiEnabled: true,
    evidence: "https://www.tv2.no/rss/",
    feeds: [{ type: "rss", url: "https://www.tv2.no/rss/nyheter", label: "Nyheter" }],
  },
  dn: {
    enabled: true, aiEnabled: true,
    evidence: "https://services.dn.no/tools/rss",
    feeds: [{ type: "rss", url: "https://services.dn.no/api/feed/rss/", label: "Siste saker fra DN" }],
  },
  nettavisen: {
    enabled: true, aiEnabled: true,
    evidence: "https://www.nettavisen.no/nyheter/rss-feeder-i-nettavisen/s/12-95-1949093",
    feeds: [{ type: "rss", url: "https://www.nettavisen.no/service/rich-rss", label: "Alle saker" }],
  },
  aftenposten: {
    enabled: true, aiEnabled: true,
    evidence: "https://www.aftenposten.no/robots.txt",
    feeds: [{ type: "sitemap", url: "https://www.aftenposten.no/sitemaps/files/articles-48hrs.xml", label: "News sitemap, siste 48 timer; tittel uten ingress" }],
  },
  e24: {
    enabled: true, aiEnabled: false,
    aiDisabledReason: "RSS-vilkårene krever skriftlig tillatelse før metadata brukes som input til språkmodeller.",
    evidence: "https://e24.no/boers-og-finans/i/b5jw2k/rss-feed",
    feeds: [{ type: "rss", url: "https://e24.no/rss2/", label: "Alle nyheter; kun lokal forhåndsvurdering" }],
  },
};
