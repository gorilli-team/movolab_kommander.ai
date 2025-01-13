const tokenStorage = new Map<string, string>();

const tokenStore = {
  set(key: string, value: string) {
    tokenStorage.set(key, value);
  },
  get(key: string): string | undefined {
    return tokenStorage.get(key);
  },
  clear(key: string) {
    tokenStorage.delete(key);
  },
};

export default tokenStore;
