import sourceTypes from "../src/_data/sourceTypes.js";

export function reviewDetails(review, inputPath = "Artikkel", registry = sourceTypes) {
  const lookup = (field) => {
    const key = review[field];
    if (typeof key !== "string" || !Object.hasOwn(registry, key)) {
      throw new Error(`${inputPath}: Ukjent review.${field} «${key}».`);
    }
    return registry[key];
  };
  const publisher = lookup("publisher");
  const source = lookup("source");
  if (!publisher.roles?.includes("publisher")) {
    throw new Error(`${inputPath}: review.publisher «${review.publisher}» er ikke registrert som publiseringssted.`);
  }
  if (!source.roles?.includes("producer")) {
    throw new Error(`${inputPath}: review.source «${review.source}» er ikke registrert som produsent.`);
  }
  if (typeof review.type !== "string" || !Object.hasOwn(publisher.types, review.type)) {
    throw new Error(`${inputPath}: Ukjent review.type «${review.type}» for publisher «${review.publisher}».`);
  }
  return { ...publisher, type: publisher.types[review.type], source, hasExternalSource: review.source !== review.publisher };
}

export function publisherName(review) {
  return review ? reviewDetails(review).site : "";
}
