const sourceTypes = {
  nrk: {
    name: "NRK",
    site: "nrk.no",
    description: "Norsk rikskringkasting er den norske offentlig finansierte allmennkringkasteren.",
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

export default sourceTypes;
