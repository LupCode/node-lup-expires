

type ExpireMapOptions = {

    /** 
     * Milliseconds after which an entry expires by default (if null, zero, or negative then never expires by default). 
     * By default the default max age is null (never expires by default).
     */
    defaultMaxAge?: number | null;

    /** 
     * If the lifespan of an entry should be reset to its original value with each access to it.
     * By default the lifespan of an entry must be manually reset by setting the value again using the set() method.
     */
    resetLifespanOnAccess?: boolean;
};


type ActualValue<V> = {

    /** Actual value. */
    data: V,

    /** Timestamp in milliseconds after which entry as expired. */
    expires: number | undefined,

    /** Milliseconds to which lifespan should be reset to on access (initial maxAge value provided when setting value). */
    maxAge: number | undefined
};


/**
 * ExpireMap is a Map that automatically removes expired entries.
 * If the lifespan of an entry should be reset with every access can be configured as option.
 */
export class ExpireMap<K, V> extends Map<K, V> { // actually: <K, ActualValue<V>>
    private defaultMaxAge: number | null = null;
    private resetLifespanOnAccess: boolean = false;
    
    /**
     * Creates a new instance of an ExpireMap. 
     * Entries will get automatically deleted after a specified time. 
     * If the lifespan of an entry should be reset on access can be configured as option.
     * 
     * @param options Optional options to configure the behavior of the map.
     * @param iterable Optional iterable of key-value pairs to initialize the map with.
     */
    constructor(options?: ExpireMapOptions, iterable?: Iterable<readonly [K, V]> | null | undefined){
        super();
        this.setDefaultMaxAge(options?.defaultMaxAge ?? null);
        this.setResetLifespanOnAccess(options?.resetLifespanOnAccess ?? false);
        if(iterable)
            for(const pair of iterable)
                if(pair && pair.length > 0) this.set(pair[0], pair[1]);
    }

    /**
     * Returns the milliseconds after which an item gets removed by default.
     * 
     * @returns Milliseconds after which an item gets removed by default or null if no default expire time is set.
     */
    getDefaultMaxAge(): number | null {
        return this.defaultMaxAge;
    }

    /**
     * Sets the milliseconds after which an item gets removed by default.
     * 
     * @warning This value will only apply to new entries. Existing entries will not be affected.
     * 
     * @param defaultMaxAge Milliseconds or null to disabled default expire time. If zero or negative, the default expire time is set to null.
     */
    setDefaultMaxAge(defaultMaxAge: number | null){
        this.defaultMaxAge = (!defaultMaxAge && defaultMaxAge !== 0) ? null : Math.max(0, defaultMaxAge);
    }

    /**
     * Returns if the lifespan of an entry gets reset when it is accessed.
     * If false, the lifespan of an entry must be manually reset by setting it again using the set() method.
     * 
     * @returns True if the lifespan of an entry gets reset when it is accessed, false otherwise.
     */
    isResettingLifespanOnAccess(): boolean {
        return this.resetLifespanOnAccess;
    }

    /**
     * Sets if the lifespan of an entry should be reset when it is accessed.
     * If false, the lifespan of an entry must be manually reset by setting it again using the set() method.
     * 
     * @param resetLifespanOnAccess True if the lifespan of an entry should be reset when it is accessed, false otherwise.
     */
    setResetLifespanOnAccess(resetLifespanOnAccess: boolean){
        this.resetLifespanOnAccess = resetLifespanOnAccess;
    }

    /**
     * Removes all expired elements from the Map.
     * This method is called automatically when using any of the retrieve methods (get, keys, values, entries, forEach).
     * 
     * @warning This method will not reset the lifespan of any entry, even if resetLifespanOnAccess is set to true!
     * 
     * @returns Amount of removed elements.
     */
    clearExpired(): number {
        const now = Date.now();
        let count = 0;
        super.forEach((entry, key) => {
            const e = entry as ActualValue<V>;
            if(e && e.expires && now > e.expires) {
                super.delete(key);
                count++;
            }
        });
        return count;
    }

    /**
     * Manually resets the lifespan of all entries that have not expired yet.
     * 
     * @param newMaxAge Optional milliseconds after which the entry should expire.
     *                  If not provided (undefined), the lifespan of all entries will be reset to their original maxAge value given when they were created.
     *                  If zero or negative, all entries will be set to never expire.
     *                  If null, the default max age will be used.
     */
    resetLifespanOfAll(newMaxAge?: number | null){
        const now = Date.now();
        super.forEach((entry, key) => {
            const e = entry as ActualValue<V>;
            if(!e.expires) return;
            if(now < e.expires) {
                const maxAge = (newMaxAge === null) ? this.defaultMaxAge : (newMaxAge === undefined ? e.maxAge : (newMaxAge > 0 ? newMaxAge : null));
                if(maxAge && maxAge > 0){
                    e.expires = now + maxAge;
                    e.maxAge = maxAge;
                } else {
                    e.expires = undefined;
                    e.maxAge = undefined;
                }
            } else {
                super.delete(key);
            }
        });
    }

    /**
     * Manually resets the lifespan of a given entry if it has not expired yet.
     * 
     * @param key Key of the entry to reset the lifespan.
     * @param newMaxAge Optional milliseconds after which the entry should expire.
     *                  If not provided (undefined), the lifespan of the entry will be reset to its original maxAge value given when it was created.
     *                  If zero or negative, the entry will be set to never expire.
     *                  If null, the default max age will be used.
     * @return True if the lifespan of the entry was reset, false if the entry was not found or has already expired.
     */
    resetLifespan(key: K, newMaxAge?: number | null): boolean {
        const entry = super.get(key) as ActualValue<V> | undefined;
        if(!entry) return false;
        const now = Date.now();
        if(!entry.expires) return true;
        if(now < entry.expires) {
            const maxAge = (newMaxAge === null) ? this.defaultMaxAge : (newMaxAge === undefined ? entry.maxAge : (newMaxAge > 0 ? newMaxAge : null));
            if(maxAge && maxAge > 0){
                entry.expires = now + maxAge;
                entry.maxAge = maxAge;
            } else {
                entry.expires = undefined;
                entry.maxAge = undefined;
            }
            return true;
        }
        super.delete(key);
        return false;
    }


    /**
     * Returns the date until which the entry is valid.
     * 
     * @warning This method will not reset the lifespan of the entry, even if resetLifespanOnAccess is set to true!
     * 
     * @param key Key of the entry to check.
     * @return  Date until which the entry is valid or 
     *          null if the entry never expires or 
     *          undefined if the entry does not exist or has already expired.
     */
    getExpireDate(key: K): Date | null | undefined {
        const entry = super.get(key) as ActualValue<V> | undefined;
        if(!entry) return undefined;
        if(!entry.expires) return null;
        if(Date.now() > entry.expires){
            super.delete(key);
            return undefined;
        }
        return new Date(entry.expires);
    }

    /**
     * Returns the amount of time in milliseconds until the entry expires.
     * 
     * @warning This method will not reset the lifespan of the entry, even if resetLifespanOnAccess is set to true!
     * 
     * @param key Key of the entry to check.
     * @return  Amount of time in milliseconds until the entry expires (always positive) or
     *          null if the entry never expires or
     *          undefined if the entry does not exist or has already expired.
     */
    getRemainingLifespan(key: K): number | null | undefined {
        const entry = super.get(key) as ActualValue<V> | undefined;
        if(!entry) return undefined;
        if(!entry.expires) return null;
        const remaining = entry.expires - Date.now();
        if(remaining <= 0){
            super.delete(key);
            return undefined;
        }
        return remaining;
    }
    
  
    /**
     * Returns the amount of not expired elements in the Map.
     * 
     * @returns Amount of not expired elements in the Map.
     */
    getSize(): number {
        this.clearExpired(); // removes all expired entries
        return this.size;
    }

    /**
     * Returns the amount of not expired elements in the Map.
     * 
     * @returns Amount of not expired elements in the Map.
     */
    get size(): number {
        this.clearExpired(); // removes all expired entries
        return super.size;
    }

    override [Symbol.iterator](){
        return this.entries();
    }

    override entries(): IterableIterator<[K, V]> {
        const _this = this;
        const itr = super.entries();

        return {
            [Symbol.iterator](){ return this; },
            next(): IteratorResult<[K, V]> {
                const now = Date.now();
                do {
                    const next = itr.next();
                    const pair = next.value;
                    const entry = (pair ? pair[1] : null) as ActualValue<V> | null;
                    const expired = entry && entry.expires && entry.expires < now;

                    if(_this.resetLifespanOnAccess && entry && entry.expires && !expired)
                        entry.expires = now + (entry.maxAge ?? _this.defaultMaxAge ?? 0);

                    if(next.done || !expired)
                        return {
                            value: (pair ? [pair[0], (entry ? entry.data : undefined)] : undefined) as [K, V],
                            done: next.done
                        };
                    else if(pair && expired) _this.delete(pair[0]);
                } while(true);
            }
        };
    }

    override keys(): IterableIterator<K> {
        const _this = this;
        const itr = super.entries();

        return {
            [Symbol.iterator]() { return this; },
            next(): IteratorResult<K> {
                const now = Date.now();
                do {
                    const next = itr.next();
                    const pair = next.value;
                    const entry = (pair ? pair[1] : null) as ActualValue<V> | null;
                    const expired = entry && entry.expires && entry.expires < now;

                    if(_this.resetLifespanOnAccess && entry && entry.expires && !expired)
                        entry.expires = now + (entry.maxAge ?? _this.defaultMaxAge ?? 0);

                    if(next.done || !expired)
                        return {
                            value: (pair ? pair[0] : undefined) as K,
                            done: next.done
                        };
                    else if(pair && expired) _this.delete(pair[0]);
                } while(true);
            }
        };
    }
  
    override values(): IterableIterator<V> {
        const _this = this;
        const itr = super.entries();

        return {
            [Symbol.iterator]() { return this; },
            next(): IteratorResult<V> {
                const now = Date.now();
                do {
                    const next = itr.next();
                    const pair = next.value;
                    const entry = (pair ? pair[1] : null) as ActualValue<V> | null;
                    const expired = entry && entry.expires && entry.expires < now;

                    if(_this.resetLifespanOnAccess && entry && entry.expires && !expired)
                        entry.expires = now + (entry.maxAge ?? _this.defaultMaxAge ?? 0);
    
                    if(next.done || !expired)
                        return {
                            value: (entry ? entry.data : undefined) as V,
                            done: next.done
                        };
                    else if(pair && expired) _this.delete(pair[0]);
                } while(true);
            }
        };
    }
  
    override forEach(callbackfn: (v: V, k: K, thisArg?: any) => void, thisArg?: any){
        const _this = this;
        const now = Date.now();
        super.forEach((entry, key) => {
            const e = entry as ActualValue<V>;
            if(!e) return;
            const expired = e.expires && e.expires < now;

            if(_this.resetLifespanOnAccess && e.expires && !expired)
                e.expires = now + (e.maxAge ?? _this.defaultMaxAge ?? 0);

            if(!expired)
                callbackfn(e.data, key, thisArg || _this);
            else _this.delete(key);
        }, thisArg);
    }
  
    override get(key: K): V | undefined {
        const entry = super.get(key) as ActualValue<V> | undefined;
        if(!entry) return undefined;
        const now = Date.now();
        const expired = entry && entry.expires && entry.expires < now;

        if(this.resetLifespanOnAccess && entry && entry.expires && !expired)
            entry.expires = now + (entry.maxAge ?? this.defaultMaxAge ?? 0);

        if(!expired) return entry.data;
        super.delete(key);
        return undefined;
    }
  
    override has(key: K){
        return this.get(key) !== undefined;
    }
  
  
    /**
     * Adds a key-value pair to the map (overwrites existing value).
     * 
     * @param key Key under which the value should be stored.
     * @param value Value that should be stored.
     * @param maxAge Optional milliseconds after which the entry gets deleted (if null, zero, or negative never expires, if undefined default max age will be used).
     */
    override set(key: K, value: V, maxAge?: number | null | undefined){
        maxAge = (maxAge === undefined) ? this.defaultMaxAge : (maxAge === null ? null : Math.max(0, maxAge));
        maxAge = (!maxAge || maxAge <= 0) ? null : maxAge;
        const entry: ActualValue<V> = {
            data: value, 
            expires: maxAge ? Date.now() + maxAge : undefined,
            maxAge: maxAge || undefined
        };
        super.set(key, entry as V);
        return this;
    }
}