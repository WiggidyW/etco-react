class Mutex {
  private _locked: boolean = false;
  private _resolve: (_: any) => void = () => {};

  constructor() {}

  async acquire(): Promise<void> {
    while (this._locked) {
      await new Promise((resolve) => {
        this._resolve = resolve;
      });
    }
    this._locked = true;
  }

  release(): void {
    this._locked = false;
    this._resolve(null);
  }
}

export { Mutex as TabLock };
