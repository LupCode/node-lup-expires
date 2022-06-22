export class ExpireMap<K, V> extends Map<K, any> {
    private defaultMaxAge: number | null = null;
    
    // Data stored as:  <key, { data: any, expires: UTC }>
  
  
    /**
     * Creates a new instance of an ExpireMap
     * @param {Number} defaultMaxAge Default milliseconds util an entry expires (if null then never expires)
     */
    constructor(iterable?: Iterable<readonly [K, V]> | null | undefined, defaultMaxAge?: number | null | undefined){
        super();
        if(defaultMaxAge !== undefined) this.setDefaultMaxAge(defaultMaxAge);
        if(iterable)
            for(const pair of iterable)
                if(pair && pair.length > 0) this.set(pair[0], pair[1]);
    }

    /**
     * @returns {Number | null} Milliseconds after which an item gets removed by default or null if no default expire time is set
     */
    getDefaultMaxAge(): number | null {
        return this.defaultMaxAge;
    }

    /**
     * Sets the milliseconds after which an item gets removed by default
     * @param defaultMaxAge {Number | null} Milliseconds or null to disabled default expire time
     */
    setDefaultMaxAge(defaultMaxAge: number | null){
        this.defaultMaxAge = (!defaultMaxAge && defaultMaxAge !== 0) ? null : Math.max(0, defaultMaxAge);
    }
  
    /**
     * @returns Amount of not expired elements in the Map
     */
    getSize(): number {
        this.forEach(() => null); // removes all expired entries
        return this.size;
    }

    [Symbol.iterator](){ return this.entries(); };

    entries(): IterableIterator<[K, V]> {
        const _this = this;
        const itr = super.entries();

        return {
            [Symbol.iterator](){ return this; },
            next(): IteratorResult<[K, V]> {
                const now = new Date().getTime();
                do {
                    const next = itr.next();
                    const pair = next.value;
                    const entry = pair ? pair[1] : null;
                    const notExpired = entry && (!entry.expires || now < entry.expires);
                    if(next.done || notExpired)
                        return {
                            value: (pair ? [pair[0], (entry ? entry.data : undefined)] : undefined) as [K, V],
                            done: next.done
                        };
                    else if(pair && !notExpired) _this.delete(pair[0]);
                } while(true);
            }
        };
    }

    keys(): IterableIterator<K> {
        const _this = this;
        const itr = super.entries();

        return {
            [Symbol.iterator]() { return this; },
            next(): IteratorResult<K> {
                const now = new Date().getTime();
                do {
                    const next = itr.next();
                    const pair = next.value;
                    const entry = pair ? pair[1] : null;
                    const notExpired = entry && (!entry.expires || now < entry.expires);
    
                    if(next.done || notExpired)
                        return {
                            value: (pair ? pair[0] : undefined) as K,
                            done: next.done
                        };
                    else if(pair && !notExpired) _this.delete(pair[0]);
                } while(true);
            }
        };
    }
  
    values(): IterableIterator<V> {
        const _this = this;
        const itr = super.entries();

        return {
            [Symbol.iterator]() { return this; },
            next(): IteratorResult<V> {
                const now = new Date().getTime();
                do {
                    const next = itr.next();
                    const pair = next.value;
                    const entry = pair ? pair[1] : null;
                    const notExpired = entry && (!entry.expires || now < entry.expires);
    
                    if(next.done || notExpired)
                        return {
                            value: (entry ? entry.data : undefined) as V,
                            done: next.done
                        };
                    else if(pair && !notExpired) _this.delete(pair[0]);
                } while(true);
            }
        };
    }
  
    forEach(callbackfn: (v: V, k: K, thisArg?: any) => void, thisArg?: any){
        const _this = this;
        super.forEach((entry, key) => {
            if(!entry) return;
            if(!entry.expires || (new Date()).getTime() < entry.expires)
                callbackfn(entry.data, key, thisArg || _this);
            else _this.delete(key);
        }, thisArg);
    }
  
    get(key: K): V | undefined {
        const entry: any = super.get(key);
        if(!entry) return undefined;
        if(!entry.expires || (new Date()).getTime() < entry.expires) return entry.data;
        super.delete(key);
        return undefined;
    }
  
    has(key: K){
        return this.get(key) !== undefined;
    }
  
  
    /**
     * Adds a key-value pair to the map (overwrites existing value)
     * @param {any} key Key under which the value should be stored
     * @param {any} value Value that should be stored
     * @param {Number} maxAge Optional milliseconds after which the entry gets deleted (if null never expires, if undefined default max age will be used)
     */
    set(key: K, value: V, maxAge?: number | null | undefined){
        super.set(key, {
            data: value, 
            expires: maxAge === undefined ? (
                (!this.defaultMaxAge && this.defaultMaxAge !== 0) ? undefined : (new Date()).getTime()+this.defaultMaxAge
            ) : (
                (!maxAge && maxAge !== 0) ? undefined : (new Date()).getTime()+Math.max(0, maxAge)
            )
        });
        return this;
    }
}