// src/utils/organizeLines.js
export function organizeLinesByLocation(lines) {
  const hierarchy = {};

  for (const line of lines) {
    const { country, state, city } = line;

    if (!hierarchy[country]) hierarchy[country] = {};
    if (!hierarchy[country][state]) hierarchy[country][state] = {};
    if (!hierarchy[country][state][city]) hierarchy[country][state][city] = [];

    hierarchy[country][state][city].push(line);
  }

  // Sort alphabetically
  const sortedHierarchy = {};
  Object.keys(hierarchy)
    .sort()
    .forEach((country) => {
      sortedHierarchy[country] = {};
      Object.keys(hierarchy[country])
        .sort()
        .forEach((state) => {
          sortedHierarchy[country][state] = {};
          Object.keys(hierarchy[country][state])
            .sort()
            .forEach((city) => {
              sortedHierarchy[country][state][city] =
                hierarchy[country][state][city];
            });
        });
    });

  return sortedHierarchy;
}
