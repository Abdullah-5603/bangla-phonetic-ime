class LRUCache {
  constructor(name, limit = 500) {
    this.name = name;
    this.limit = limit;
    this.map = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    if (!this.map.has(key)) {
      this.misses += 1;
      return undefined;
    }

    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    this.hits += 1;
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }

    this.map.set(key, value);

    while (this.map.size > this.limit) {
      this.map.delete(this.map.keys().next().value);
    }
  }

  stats() {
    const total = this.hits + this.misses;

    return {
      name: this.name,
      size: this.map.size,
      limit: this.limit,
      hits: this.hits,
      misses: this.misses,
      hitRate: total === 0 ? 0 : this.hits / total
    };
  }

  clear() {
    this.map.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

const caches = new Map();

export function createLRUCache(name, limit) {
  if (!caches.has(name)) {
    caches.set(name, new LRUCache(name, limit));
  }

  return caches.get(name);
}

export function getCacheStats() {
  return [...caches.values()].map((cache) => cache.stats());
}

export function clearCaches() {
  for (const cache of caches.values()) {
    cache.clear();
  }
}
