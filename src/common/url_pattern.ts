export function patternToRegExp(pattern: string): RegExp {
  if (pattern === '<all_urls>') return /^(?:http|https|file|ftp):\/\/.*/;

  let split = /^(\*|http|https|file|ftp):\/\/(.*)$/.exec(pattern);
  if (!split) throw new Error(`Invalid schema in ${pattern}`);
  const schema = split[1];
  const fullpath = split[2];

  split = /^([^/]*)\/(.*)$/.exec(fullpath);
  if (!split) throw new Error(`No path specified in ${pattern}`);
  const host = split[1];
  const path = split[2];

  // File
  if (schema === 'file' && host !== '')
    throw new Error(`Non-empty host for file schema in ${pattern}`);

  if (schema !== 'file' && host === '') throw new Error(`No host specified in ${pattern}`);

  if (!/^(\*|\*\.[^*]+|[^*]*)$/.exec(host))
    throw new Error(`Illegal wildcard in host in ${pattern}`);

  let reString = '^';
  reString += schema === '*' ? 'https*' : schema;
  reString += ':\\/\\/';
  // Not overly concerned with intricacies
  //   of domain name restrictions and IDN
  //   as we're not testing domain validity
  reString += host.replace(/\*\.?/, '[^\\/]*');
  reString += '(:\\d+)?';
  reString += '\\/';
  reString += path.replace('*', '.*');
  reString += '$';

  return new RegExp(reString);
}
