// Simple TTL cache for in-memory item retrieval
class TTLCache {
  constructor(defaultTtlMs = 60_000, maxSize = 500) {
    this.defaultTtlMs = defaultTtlMs;
    this.maxSize = maxSize;
    this.map = new Map();
  }

  _evictIfNeeded() {
    if (this.map.size <= this.maxSize) return;
    // Evict oldest
    const firstKey = this.map.keys().next().value;
    this.map.delete(firstKey);
  }

  set(key, value, ttlMs) {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.map.set(key, { value, expiresAt });
    this._evictIfNeeded();
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    return entry.value;
  }

  delete(key) { this.map.delete(key); }
  clear() { this.map.clear(); }
}

export default TTLCache;
