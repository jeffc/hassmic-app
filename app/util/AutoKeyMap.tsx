// Helper data structure
// Probably poorly named
//
// Accepts values of the templated type and stores them with a unique key, then
// allows for removing them based on that key.
//
// This type probably exists in typescript already, but I can't find it.

export type KeyType = number;

export class AutoKeyMap<Type> {
  private counter: KeyType = 1;

  private _storage: Map<KeyType, Type> = new Map<KeyType, Type>();

  get values(): Array<Type> {
    return Array.from(this._storage.values());
  }

  add = (elem: Type): KeyType => {
    const newK = this.counter;
    this.counter++;

    this._storage.set(newK, elem);
    return newK;
  };

  remove = (key: KeyType): void => {
    this._storage.delete(key);
  };
}
