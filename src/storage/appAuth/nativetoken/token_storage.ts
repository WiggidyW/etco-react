// "use client";

import { EveAppKind, getEveApp } from "@/eveapps";
import { BrowserLock } from "./browser_lock";
import { TabLock } from "./tab_lock";
import { loadToken, setToken, tokenKey } from "../../token";

const DEFAULT_BROWSER_LOCK_TTL = 20 * 1000; // 20 seconds

export type TokenAndLock = { token: string; lock: TokenLock };

export class TokenLock {
  private _isValid: boolean;

  private constructor() {
    this._isValid = true;
  }

  RELEASE_DO_NOT_USE(): void {
    this._isValid = false;
  }

  static NEW_LOCK_DO_NOT_USE(): TokenLock {
    return new TokenLock();
  }

  public get isValid(): boolean {
    return this._isValid;
  }
}

export class TokenStorage {
  private key: string;
  private tabLock: TabLock;
  private browserLock: BrowserLock;

  constructor(characterId: number) {
    this.key = tokenKey(EveAppKind.Auth, characterId);
    this.tabLock = new TabLock();
    this.browserLock = new BrowserLock(this.key);
  }

  private async acquireLocks(browserLockTTL: number): Promise<TokenLock> {
    await this.tabLock.acquire();
    await this.browserLock.acquire(browserLockTTL);
    return TokenLock.NEW_LOCK_DO_NOT_USE();
  }

  releaseLocks(lock: TokenLock): void {
    lock.RELEASE_DO_NOT_USE();
    this.browserLock.release();
    this.tabLock.release();
  }

  private unsafeGetToken(): string | null {
    const token = loadToken(this.key);
    if (token === null) throw new Error(`storage token '${this.key}' is null`);
    return token;
  }

  private unsafeSetToken(token: string): void {
    setToken(this.key, token);
  }

  async getTokenAndLock(
    browserLockTTL: number = DEFAULT_BROWSER_LOCK_TTL
  ): Promise<TokenAndLock> {
    const lock = await this.acquireLocks(browserLockTTL);
    const token = this.unsafeGetToken();
    if (token === null) {
      this.releaseLocks(lock);
      throw new Error(`storage token '${this.key}' is null`);
    }
    return { token, lock };
  }

  async setTokenAndUnlock(token: string, lock: TokenLock): Promise<void> {
    if (!lock.isValid) {
      throw new Error("lock is not valid");
    }
    this.unsafeSetToken(token);
    this.releaseLocks(lock);
  }

  async unlock(lock: TokenLock): Promise<void> {
    if (!lock.isValid) {
      throw new Error("lock is not valid");
    }
    this.releaseLocks(lock);
  }
}
