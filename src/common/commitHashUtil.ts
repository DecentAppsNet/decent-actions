function _isValidShortCommitHash(commitHash:string):boolean {
  // 7-character hexadecimal commit hash, case insensitive.
  return /^[0-9a-f]{7}$/i.test(commitHash);
}

function _isValidLongCommitHash(commitHash:string):boolean {
  // 40-character hexadecimal commit hash, case insensitive.
  return /^[0-9a-f]{40}$/i.test(commitHash);
}

export function isValidCommitHash(commitHash:string):boolean {
  return _isValidShortCommitHash(commitHash) || _isValidLongCommitHash(commitHash);
}

export function shortCommitHash(commitHash:string):string {
  return commitHash.length > 7 ? commitHash.slice(0, 7) : commitHash;
}


