const labels = {
  documented: "Godt dokumentert", context: "Trenger kontekst",
  misleading: "Misvisende", unsupported: "Ikke dokumentert",
  incorrect: "Faktafeil", unresolved: "Uavklart",
};

const escape = (value) => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

export function renderClaim(content, status, title, conclusion, significance = "") {
  if (!Object.hasOwn(labels, status) || !title?.trim() || !conclusion?.trim()) {
    throw new Error("claim krever en gyldig vurdering, tittel og minikonklusjon.");
  }
  return `<details class="claim">
<summary class="claim__summary">
<span class="claim__title">${escape(title)}</span>
<span class="claim__labels"><span class="observation__label">${labels[status]}</span>${significance ? '<span class="claim__central">Sentralt for hovedbudskapet</span>' : ""}</span>
<span class="claim__conclusion">${escape(conclusion)}</span>
<span class="claim__toggle"><span class="claim__closed">Se dokumentasjon og vurdering</span><span class="claim__opened">Skjul utdyping</span></span>
</summary>
<div class="claim__content">

${significance ? `<p class="claim__significance"><strong>Hvorfor sentralt:</strong> ${escape(significance)}</p>\n\n` : ""}${content}

</div>
</details>`;
}
