export type SplitName = {
  givenNames: string;
  surname: string;
};

export function splitName(fullName: string): SplitName {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { givenNames: "", surname: "" };
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { givenNames: parts[0] ?? "", surname: "" };
  }
  const surname = parts.pop() ?? "";
  return { givenNames: parts.join(" ") || "", surname };
}

export type NameParts = {
  fullName: string;
  givenNames: string | null;
  surname: string | null;
};

export function splitFullName(fullName: string): NameParts {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { fullName: "", givenNames: null, surname: null };
  }
  const parts = splitName(trimmed);
  return {
    fullName: trimmed,
    givenNames: parts.givenNames || null,
    surname: parts.surname || null,
  };
}

type BuildVsaArgs = {
  fullName: string;
  marriedSurname?: string | null;
  extraAliases?: string[] | null;
};

export function buildVsa532NameAndAliases({ fullName, marriedSurname, extraAliases }: BuildVsaArgs) {
  const base = splitName(fullName);
  const givenTokens = base.givenNames
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const first = givenTokens.shift() ?? "";
  const middleFull = givenTokens.join(" ");
  const middleInitial = givenTokens[0]?.charAt(0) ?? "";
  const surname = base.surname || "";

  const canonicalFullName = surname && first ? `${surname}, ${first}` : fullName.trim();

  const aliasCandidates: string[] = [];
  if (middleFull) {
    aliasCandidates.push(`${surname}, ${first} ${middleFull}`.trim());
  }
  if (middleInitial) {
    aliasCandidates.push(`${surname}, ${first} ${middleInitial}`.trim());
  }
  if (marriedSurname && first) {
    aliasCandidates.push(`${marriedSurname}, ${first}`.trim());
    if (middleFull) {
      aliasCandidates.push(`${marriedSurname}, ${first} ${middleFull}`.trim());
    }
  }
  if (extraAliases) {
    aliasCandidates.push(...extraAliases.map((alias) => alias.trim()).filter(Boolean));
  }

  const seen = new Set<string>([canonicalFullName.toLowerCase()]);
  const aliases: string[] = [];
  for (const alias of aliasCandidates) {
    const normalized = alias.toLowerCase();
    if (!alias || seen.has(normalized)) continue;
    seen.add(normalized);
    aliases.push(alias);
  }

  return {
    fullName: canonicalFullName,
    aliases,
  };
}
