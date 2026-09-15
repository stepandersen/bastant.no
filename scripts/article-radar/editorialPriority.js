// Editorial fit for Bastant, not truthfulness or general public importance.
// Require an explicit systemic premise before lifting these low-priority categories.
export function editorialPriority(article) {
  const title = article.title ?? "";
  const text = `${title} ${article.description ?? ""}`;
  const systemic = /statistikk|forskning|studie|lovendring|nye regler|refusjonsordning|legemiddelpriser|beslutningsforum|trafikksikkerhet|ulykkesstatistikk|klimaendring|beredskap|varslingssystem/iu.test(text);
  if (systemic) return null;
  if (/trafikkulykke|kollisjon|kjedekollisjon|utforkjøring/iu.test(title)) {
    return { category: "routine-traffic", penalty: 6, scoreCap: 20, reason: "Ordinær trafikkhendelse uten et synlig overordnet premiss for Bastant-gjennomgang." };
  }
  if (/værvarsel|uværet nærmer|varsler.*(?:vindkast|regn|snø|bølger)|farevarsel/iu.test(title)) {
    return { category: "routine-weather", penalty: 6, scoreCap: 20, reason: "Løpende værvarsel uten et synlig overordnet premiss for Bastant-gjennomgang." };
  }
  if (/(?:medisin|behandling|sykdom|pasient)/iu.test(text) && /må betale|føler seg|\(\d{1,3}\)|min sykdom|sin sykdom|sykdommen sin/iu.test(text)) {
    return { category: "personal-patient-story", penalty: 6, scoreCap: 25, reason: "Personlig pasienthistorie. Pasientens opplevelse, sykdom og private utgifter skal ikke være mål for etterprøving." };
  }
  return null;
}

export function applyEditorialPriority(assessment, article) {
  if (!assessment) return null;
  const priority = editorialPriority(article);
  const baseScore = assessment.baseScore ?? assessment.score;
  return { ...assessment, baseScore, score: priority ? Math.min(baseScore, priority.scoreCap) : baseScore, editorialPriority: priority };
}
