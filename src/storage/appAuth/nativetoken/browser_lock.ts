// also helps with triple, quadruple, and even quintuple locks
const MAX_SLEEP_TO_AVOID_DOUBLE_LOCK = 10; // milliseconds
const MAX_TTL_DURATION = 1000 * 60 * 2; // 2 minutes

class LocalStorageLock {
  private key: string;

  constructor(key: string) {
    this.key = `${key}-lock`;
    // this.key = `${id}-token-lock`;
  }

  private isExpired(lockVal: string): boolean {
    let expired: boolean;

    try {
      // check if the lock is expired
      const expiresAt = Date.parse(lockVal);
      if (expiresAt < Date.now() || expiresAt > Date.now() + MAX_TTL_DURATION) {
        expired = true;
      } else {
        expired = false;
      }
    } catch (e) {
      // if there's an error parsing, just consider it expired
      console.warn(`failed to parse lock expires: ${e}`);
      expired = true;
    }

    if (expired) {
      // if it's expired, remove it (as a side effect)
      window!.localStorage.removeItem(this.key);
    }

    // return whether it's expired
    return expired;
  }

  private newStorageListener(
    resolve: (_: any) => void
  ): (e: StorageEvent) => void {
    return (e: StorageEvent) => {
      if (e.key === this.key && (e.newValue === null || e.newValue === "")) {
        resolve(null);
      }
    };
  }

  private setLock(ttl: number) {
    const expires = new Date(Date.now() + ttl).toISOString();
    window!.localStorage.setItem(this.key, expires);
  }

  async acquire(ttl: number): Promise<void> {
    // Check if it's unlocked. If so, lock it and return.
    const lockVal = window.localStorage.getItem(this.key);
    if (lockVal === null || this.isExpired(lockVal)) {
      this.setLock(ttl);
      return;
    }

    // Otherwise, wait for it to be unlocked.

    // we have to return the listener from this promise due to scoping rules
    const waitOnLock = new Promise<(e: StorageEvent) => void>((resolve) => {
      // add an event listener to be notified of changes to our lock
      const listener = this.newStorageListener(resolve);
      window!.addEventListener("storage", listener);

      // add a fallback that waits for the max wait duration
      setTimeout(() => resolve(listener), MAX_TTL_DURATION);

      // return the listener so we can remove it later
      return listener;
    });
    const listener = await waitOnLock;

    // remove the listener
    window!.removeEventListener("storage", listener);

    // sleep a random duration in case other tabs are also waiting
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * MAX_SLEEP_TO_AVOID_DOUBLE_LOCK)
    );

    // try again
    await this.acquire(ttl);
  }

  release(): void {
    window!.localStorage.removeItem(this.key);
  }
}

export { LocalStorageLock as BrowserLock };
