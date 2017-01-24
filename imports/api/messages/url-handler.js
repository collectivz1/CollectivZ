const urlRegex = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

export function replaceUrls(string) {
  const newString = string.replace(urlRegex, (match) => {
    if (match[0] !== 'h') {
      match = `http://${match}`;
    }
    return `<a href=${match} target="_blank">${match}</a>`;
  });

  return newString;
}
