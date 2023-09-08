import { TokenStorage, TokenLock, TokenAndLock } from "./token_storage";

// Singleton wrapper around TokenStorage

export class TokenManager {
  private static instance: TokenManager | null = null;
  private tokenStorage: TokenStorage;
  private characterId: number;

  private constructor(characterId: number) {
    this.characterId = characterId;
    this.tokenStorage = new TokenStorage(characterId);
  }

  public static getInstance(characterId: number): TokenManager {
    if (TokenManager.instance === null) {
      TokenManager.instance = new TokenManager(characterId);
    } else if (TokenManager.instance.characterId !== characterId) {
      throw new Error(
        `characterId mismatch: ${TokenManager.instance.characterId} !== ${characterId}`
      );
    }
    return TokenManager.instance;
  }

  public async getTokenAndLock(browserLockTTL?: number): Promise<TokenAndLock> {
    return this.tokenStorage.getTokenAndLock(browserLockTTL);
  }

  public async setTokenAndUnlock(
    token: string,
    lock: TokenLock
  ): Promise<void> {
    return this.tokenStorage.setTokenAndUnlock(token, lock);
  }

  public async unlock(lock: TokenLock): Promise<void> {
    return this.tokenStorage.unlock(lock);
  }
}
