import * as crypto from "crypto";

export const newPBObfuscateCharacterID = (characterID: number): string => {
  const hasher = crypto.createHash("sha256");
  hasher.update(characterID.toString(16)); // Convert to hexadecimal
  return hasher.digest("hex"); // Get hexadecimal representation of the hash
};

export const NULL_OBFUSCATED = newPBObfuscateCharacterID(0);
