"use server";

import {
  JWK,
  jwtVerify,
  importJWK,
  KeyLike,
  JWTVerifyResult,
  JWTVerifyOptions,
} from "jose";
import { ICharacter } from "@/browser/character";
import { unknownToParsedJSONError } from "@/error/error";
import { ThrowKind, throwErr } from "./throw";

// export const fetchCharacterFromId = async (
//   id: number,
//   admin: boolean = false,
//   throwKind?: ThrowKind
// ): Promise<ICharacter> => {
//   try {
//     const { name, corporationId, allianceId } = await CharacterInfo.fetchNew(
//       id
//     );
//     return {
//       refreshToken: "",
//       name,
//       id,
//       admin,
//       corporationId,
//       allianceId,
//     };
//   } catch (e) {
//     const error = unknownToParsedJSONError(e);
//     error.message.kind = ["FetchCharacterFromId", ...error.message.kind];
//     return throwErr(error, throwKind);
//   }
// };

export const fetchCharacter = async (
  code: string,
  clientId: string,
  clientSecret: string,
  admin: boolean = false,
  throwKind?: ThrowKind
): Promise<ICharacter> => {
  try {
    const jwkPromise = JWKSRep.fetchNew().then((jwks) => jwks.getJWK());
    const { accessToken, refreshToken } = await AuthFromCodeRep.fetchNew(
      code,
      clientId,
      clientSecret
    );
    const jwk = await jwkPromise;
    const { name, subId: id } = await JWTDecoded.decodeNew(accessToken, jwk);
    const { corporationId, allianceId } = await CharacterInfo.fetchNew(id);
    return {
      refreshToken,
      name,
      id,
      admin,
      corporationId,
      allianceId,
    };
  } catch (e) {
    const error = unknownToParsedJSONError(e);
    error.message.kind = ["FetchCharacter", ...error.message.kind];
    return throwErr(error, throwKind);
  }
};

interface IAuthFromCodeRep {
  access_token: string;
  refresh_token: string;
}

class AuthFromCodeRep implements IAuthFromCodeRep {
  constructor(readonly access_token: string, readonly refresh_token: string) {}

  public get accessToken() {
    return this.access_token;
  }
  public get refreshToken() {
    return this.refresh_token;
  }

  static fromObject = ({
    access_token: accessToken,
    refresh_token: refreshToken,
  }: any | IAuthFromCodeRep): AuthFromCodeRep => {
    const invalid = (): never => {
      throw new Error("invalid token");
    };
    if (typeof accessToken !== "string") return invalid();
    if (typeof refreshToken !== "string") return invalid();
    return new AuthFromCodeRep(accessToken, refreshToken);
  };

  static async fetchNew(
    code: string,
    clientId: string,
    clientSecret: string
  ): Promise<AuthFromCodeRep> {
    const authUrl = "https://login.eveonline.com/v2/oauth/token";
    const authInit = {
      method: "POST",
      headers: {
        "X-User-Agent": "etco-authentication",
        "Content-Type": "application/x-www-form-urlencoded",
        Host: "login.eveonline.com",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: `grant_type=authorization_code&code=${encodeURI(code)}`,
    };

    const res = await fetch(authUrl, authInit);
    const data = await jsonOrStatusError(res, "esi authentication");
    return AuthFromCodeRep.fromObject(data);
  }
}

interface IJWKSRep {
  keys: JWK[];
}

class JWKSRep implements IJWKSRep {
  constructor(readonly keys: JWK[]) {}

  async getJWK(): Promise<KeyLike | Uint8Array> {
    const jwtKid = "JWT-Signature-Key";

    const jwk = this.keys.find((k) => k.kid === jwtKid);
    if (!jwk) throw new Error(`failed to find key with kid ${jwtKid}`);

    return await importJWK(jwk);
  }

  static fromObject = ({ keys }: any | IJWKSRep): JWKSRep => {
    if (!Array.isArray(keys)) {
      throw new Error("invalid jwks");
    } else {
      return new JWKSRep(keys);
    }
  };

  static async fetchNew(): Promise<JWKSRep> {
    const jwksUrl = "https://login.eveonline.com/oauth/jwks";

    const res = await fetch(jwksUrl);
    const data = await jsonOrStatusError(res, "jwks");

    return JWKSRep.fromObject(data);
  }
}

interface IJWTDecoded {
  name: string;
  sub: string;
}

class JWTDecoded implements IJWTDecoded {
  private _subId?: number;

  constructor(readonly sub: string, readonly name: string) {}

  public get subId(): number {
    if (this._subId !== undefined) {
      return this._subId;
    }

    const parts = this.sub.split(":");
    if (parts.length !== 3) {
      throw new Error(`invalid sub: ${this.sub}`);
    }

    const id = parseInt(parts[2], 10);
    if (isNaN(id)) {
      throw new Error(`invalid sub: ${this.sub}`);
    }

    this._subId = id;
    return id;
  }

  static fromObject({ sub, name }: any | IJWTDecoded): JWTDecoded {
    const invalid = (): never => { throw new Error("invalid jwt"); }; //prettier-ignore
    if (typeof sub !== "string") return invalid();
    if (typeof name !== "string") return invalid();
    return new JWTDecoded(sub, name);
  }

  static async decodeNew(
    accessToken: string,
    jwk: KeyLike | Uint8Array
  ): Promise<JWTDecoded> {
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
  }
}

interface ICharacterInfo {
  alliance_id?: number;
  corporation_id: number;
  name: string;
}

class CharacterInfo implements ICharacterInfo {
  constructor(
    readonly name: string,
    readonly corporation_id: number,
    readonly alliance_id?: number
  ) {}

  public get corporationId() { return this.corporation_id; } // prettier-ignore
  public get allianceId() { return this.alliance_id; } // prettier-ignore

  static fromObject = ({
    corporation_id,
    alliance_id,
    name,
  }: any | ICharacterInfo): CharacterInfo => {
    const invalid = (): never => {
      throw new Error("invalid character info");
    };

    if (typeof corporation_id !== "number") return invalid();
    if (alliance_id !== undefined && typeof alliance_id !== "number")
      return invalid();
    if (typeof name !== "string") return invalid();

    return new CharacterInfo(name, corporation_id, alliance_id);
  };

  static async fetchNew(characterId: number): Promise<CharacterInfo> {
    const characterInfoUrl = `https://esi.evetech.net/latest/characters/${characterId}/?datasource=tranquility`;
    const res = await fetch(characterInfoUrl);
    const data = await jsonOrStatusError(res, "esi character info");
    return CharacterInfo.fromObject(data);
  }
}

const jsonOrStatusError = async (
  res: Response,
  fetching: string
): Promise<any> => {
  if (res.ok) {
    return res.json();
  } else {
    const text = await res.text();
    throw new Error(`fetching ${fetching}: ${res.statusText} ${text}`);
  }
};
