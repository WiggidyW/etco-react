import {
  JWK,
  jwtVerify,
  importJWK,
  KeyLike,
  JWTVerifyResult,
  JWTVerifyOptions,
} from "jose";
import { ICharacter } from "@/storage/character";
import { jsonOrStatusError } from "@/utils/fetchUtil";

interface IAuthFromCodeRep {
  access_token: string;
  refresh_token: string;
}

class AuthFromCodeRep implements IAuthFromCodeRep {
  constructor(readonly access_token: string, readonly refresh_token: string) {}

  public get accessToken() { return this.access_token; } // prettier-ignore
  public get refreshToken() { return this.refresh_token; } // prettier-ignore

  static fromObject = ({
    access_token: accessToken,
    refresh_token: refreshToken,
  }: any | IAuthFromCodeRep): AuthFromCodeRep => {
    const invalid = (): never => { throw new Error("invalid token"); }; //prettier-ignore
    if (typeof accessToken !== "string") return invalid();
    if (typeof refreshToken !== "string") return invalid();
    return new AuthFromCodeRep(accessToken, refreshToken);
  };
}

const fetchAuthFromCode = async (
  code: string,
  clientId: string,
  codeVerifier: string
): Promise<AuthFromCodeRep> => {
  const authUrl = "https://login.eveonline.com/v2/oauth/token";
  const authInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Host: "login.eveonline.com",
    },
    body:
      "grant_type=authorization_code" +
      `&code=${encodeURI(code)}` +
      `&client_id=${encodeURI(clientId)}` +
      `&code_verifier=${encodeURI(codeVerifier)}`,
  };

  const res = await fetch(authUrl, authInit);
  const data = await jsonOrStatusError(res, "esi authentication");
  return AuthFromCodeRep.fromObject(data);
};

interface IJWKSRep {
  keys: JWK[];
}

class JWKSRep implements IJWKSRep {
  constructor(readonly keys: JWK[]) {}

  static fromObject = ({ keys }: any | IJWKSRep): JWKSRep => {
    const invalid = (): never => { throw new Error("invalid jwks"); }; //prettier-ignore
    if (!Array.isArray(keys)) return invalid();
    return new JWKSRep(keys);
  };
}

const fetchJwks = async (): Promise<JWKSRep> => {
  const jwksUrl = "https://login.eveonline.com/oauth/jwks";

  const res = await fetch(jwksUrl);
  const data = await jsonOrStatusError(res, "jwks");
  return JWKSRep.fromObject(data);
};

const findCorrectJwk = async (jwks: JWKSRep): Promise<KeyLike | Uint8Array> => {
  const jwtKid = "JWT-Signature-Key";

  const jwk = jwks.keys.find((k) => k.kid === jwtKid);
  if (!jwk) throw new Error(`failed to find key with kid ${jwtKid}`);
  return await importJWK(jwk);
};

interface IJWTDecoded {
  name: string;
  sub: string;
}

class JWTDecoded implements IJWTDecoded {
  private _subId?: number;

  constructor(readonly sub: string, readonly name: string) {}

  static fromObject = ({ sub, name }: any | IJWTDecoded): JWTDecoded => {
    const invalid = (): never => { throw new Error("invalid jwt"); }; //prettier-ignore
    if (typeof sub !== "string") return invalid();
    if (typeof name !== "string") return invalid();
    return new JWTDecoded(sub, name);
  };

  subId = (): number => {
    if (this._subId !== undefined) return this._subId;
    const parts = this.sub.split(":");
    if (parts.length !== 3) throw new Error(`invalid sub: ${this.sub}`);
    const id = parseInt(parts[2], 10);
    if (isNaN(id)) throw new Error(`invalid sub: ${this.sub}`);
    this._subId = id;
    return id;
  };
}

const decodeJwt = async (
  accessToken: string,
  jwk: KeyLike | Uint8Array
): Promise<JWTDecoded> => {
  const jwtVerifyOpts: JWTVerifyOptions = {
    issuer: "login.eveonline.com",
    audience: "EVE Online",
    requiredClaims: ["name", "sub", "iss", "aud"],
  };

  const decoded: JWTVerifyResult = await jwtVerify(
    accessToken,
    jwk,
    jwtVerifyOpts
  );
  return JWTDecoded.fromObject(decoded.payload);
};

interface ICharacterInfo {
  alliance_id?: number;
  corporation_id: number;
}

class CharacterInfo implements ICharacterInfo {
  constructor(readonly corporation_id: number, readonly alliance_id?: number) {}

  public get corporationId() { return this.corporation_id; } // prettier-ignore
  public get allianceId() { return this.alliance_id; } // prettier-ignore

  static fromObject = ({
    corporation_id,
    alliance_id,
  }: any | ICharacterInfo): CharacterInfo => {
    const invalid = (): never => {
      throw new Error("invalid character info");
    };
    if (typeof corporation_id !== "number") return invalid();
    if (alliance_id !== undefined && typeof alliance_id !== "number")
      return invalid();
    return new CharacterInfo(corporation_id, alliance_id);
  };
}

const fetchCharacterInfo = async (
  characterId: number
): Promise<CharacterInfo> => {
  const characterInfoUrl = `https://esi.evetech.net/latest/characters/${characterId}/?datasource=tranquility`;
  const res = await fetch(characterInfoUrl);
  const data = await jsonOrStatusError(res, "esi character info");
  return CharacterInfo.fromObject(data);
};

export interface ICharacterAndToken extends ICharacter {
  token: string;
}

const fetchCharacter = async (
  jwk: KeyLike | Uint8Array,
  refreshToken: string,
  accessToken: string,
  admin: boolean
): Promise<ICharacterAndToken> => {
  const decoded = await decodeJwt(accessToken, jwk);
  const id = decoded.subId();
  const { corporationId, allianceId } = await fetchCharacterInfo(id);
  return {
    token: refreshToken,
    name: decoded.name,
    id,
    admin,
    corporationId,
    allianceId,
  };
};

export const fetchCharacterAndCode = async (
  code: string,
  clientId: string,
  codeVerifier: string,
  admin: boolean
): Promise<ICharacterAndToken> => {
  try {
    const jwkPromise = fetchJwks().then(findCorrectJwk);
    const authRep = await fetchAuthFromCode(code, clientId, codeVerifier);
    const jwk = await jwkPromise;
    return await fetchCharacter(
      jwk,
      authRep.refreshToken,
      authRep.accessToken,
      admin
    );
  } catch (e) {
    throw new Error(`failed to fetch character: ${e}`);
  }
};

export const fetchCharacterFromToken = async (
  refreshToken: string,
  accessToken: string,
  admin: boolean
): Promise<ICharacterAndToken> => {
  try {
    const jwk = await fetchJwks().then(findCorrectJwk);
    return await fetchCharacter(jwk, refreshToken, accessToken, admin);
  } catch (e) {
    throw new Error(`failed to fetch character: ${e}`);
  }
};
