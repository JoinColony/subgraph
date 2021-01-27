export function replaceFirst(value: String, searcher: String, replacer: String): String {
  let indexOfSearch = value.indexOf(searcher);
  if (indexOfSearch === -1) {
    return value;
  }
  let before = value.substr(0, indexOfSearch);
  let after = value.substr(indexOfSearch + searcher.length);
  return before.concat(replacer).concat(after);
}
