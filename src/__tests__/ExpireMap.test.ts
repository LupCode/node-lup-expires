import { ExpireMap } from '../index';

describe('Testing ExpireMap', () => {

  test('Empty constructor', () => {
    const map = new ExpireMap();
  });

  test('Set/Get default max age', () => {
    const map = new ExpireMap();
    expect(map.getDefaultMaxAge()).toBeNull();
    map.setDefaultMaxAge(1000);
    expect(map.getDefaultMaxAge()).toEqual(1000);
    map.setDefaultMaxAge(null);
    expect(map.getDefaultMaxAge()).toBeNull();
  });

  test('Object not found', async () => {
    const map = new ExpireMap();
    expect(map.get("x")).toBeUndefined();
    expect(map.has("x")).toEqual(false);
  });

  test('Set object and immediately get', async () => {
    const map = new ExpireMap();
    map.set("a", 1);
    expect(map.get("a")).toEqual(1);
  });

  test('Set object and immediately has', async () => {
    const map = new ExpireMap();
    map.set("a", 1);
    expect(map.has("a")).toEqual(true);
  });

  test('Set object and get after timeout', async () => {
    return new Promise<void>((resolve) => {
      const map = new ExpireMap();
      map.set("b", 2, 50);
      expect(map.get("b")).toEqual(2);
      setTimeout(() => {
        expect(map.get("b")).toBeUndefined();
        resolve();
      }, 50);
    });
  });

  test('Set object and has after timeout', async () => {
    return new Promise<void>((resolve) => {
      const map = new ExpireMap();
      map.set("b", 2, 50);
      expect(map.has("b")).toEqual(true);
      setTimeout(() => {
        expect(map.has("b")).toEqual(false);
        resolve();
      }, 50);
    });
  });

  test('Clear', async () => {
    const map = new ExpireMap();
    map.set("c", 3);
    map.clear();
    expect(map.size).toEqual(0);
    expect(map.getSize()).toEqual(0);
  });

  test('getSize with timeout', async () => {
    return new Promise<void>((resolve) => {
      const map = new ExpireMap();
      map.set("d", 4, 50);
      expect(map.size).toEqual(1);
      expect(map.getSize()).toEqual(1);
      setTimeout(() => {
        expect(map.size).toEqual(1);
        expect(map.getSize()).toEqual(0);
        expect(map.size).toEqual(0);
        resolve();
      }, 50);
    });
  });

  test('Constructor with values', async () => {
    return new Promise<void>((resolve) => {
      const map = new ExpireMap([["a", 1], ["b", 2]], 50);
      expect(map.getSize()).toEqual(2);
      expect(map.get("a")).toEqual(1);
      expect(map.get("b")).toEqual(2);
      setTimeout(() => {
        expect(map.get("a")).toBeUndefined();
        expect(map.get("b")).toBeUndefined();
        expect(map.getSize()).toEqual(0);
        resolve();
      }, 50);
    });
  });

  test('entries with timeout', async () => {
    return new Promise<void>((resolve) => {
      const map = new ExpireMap([["a", 1], ["b", 2]], 50);
      map.set("c", 3, 1000);
      let i=0;
      for(let pair of map.entries()){
        expect(pair).toBeInstanceOf(Array);
        expect(pair.length).toEqual(2);
        switch(i){
          case 0: expect(pair[0]).toEqual("a"); expect(pair[1]).toEqual(1); break;
          case 1: expect(pair[0]).toEqual("b"); expect(pair[1]).toEqual(2); break;
          case 2: expect(pair[0]).toEqual("c"); expect(pair[1]).toEqual(3); break;
          default: throw new Error("Unexpected key-value-pair "+pair);
        }
        i++;
      }
      expect(i).toEqual(3);

      setTimeout(() => {
        i = 0;
        for(let pair of map.entries()){
          expect(pair).toBeInstanceOf(Array);
          expect(pair.length).toEqual(2);
          switch(i){
            case 0: expect(pair[0]).toEqual("c"); expect(pair[1]).toEqual(3); break;
            default: throw new Error("Unexpected key-value-pair "+pair);
          }
          i++;
        }
        expect(i).toEqual(1);
        resolve();
      }, 50);
    });
  });

  test('keys with timeout', async () => {
    return new Promise<void>((resolve) => {
      const map = new ExpireMap([["a", 1], ["b", 2]], 50);
      map.set("c", 3, 1000);
      let i=0;
      for(let key of map.keys()){
        switch(i){
          case 0: expect(key).toEqual("a"); break;
          case 1: expect(key).toEqual("b"); break;
          case 2: expect(key).toEqual("c"); break;
          default: throw new Error("Unexpected key "+key);
        }
        i++;
      }
      expect(i).toEqual(3);

      setTimeout(() => {
        i = 0;
        for(let key of map.keys()){
          switch(i){
            case 0: expect(key).toEqual("c"); break;
            default: throw new Error("Unexpected key "+key);
          }
          i++;
        }
        expect(i).toEqual(1);
        resolve();
      }, 50);
    });
  });

  test('values with timeout', async () => {
    return new Promise<void>((resolve) => {
      const map = new ExpireMap([["a", 1], ["b", 2]], 50);
      map.set("c", 3, 1000);
      let i=0;
      for(let value of map.values()){
        switch(i){
          case 0: expect(value).toEqual(1); break;
          case 1: expect(value).toEqual(2); break;
          case 2: expect(value).toEqual(3); break;
          default: throw new Error("Unexpected value "+value);
        }
        i++;
      }
      expect(i).toEqual(3);

      setTimeout(() => {
        i = 0;
        for(let value of map.values()){
          switch(i){
            case 0: expect(value).toEqual(3); break;
            default: throw new Error("Unexpected value "+value);
          }
          i++;
        }
        expect(i).toEqual(1);
        resolve();
      }, 50);
    });
  });

  test('forEach with timeout', async () => {
    return new Promise<void>((resolve) => {
      const map = new ExpireMap([["a", 1], ["b", 2]], 50);
      map.set("c", 3, 1000);
      let i=0;
      map.forEach((v: number, k: string) => {
        switch(i){
          case 0: expect(k).toEqual("a"); expect(v).toEqual(1); break;
          case 1: expect(k).toEqual("b"); expect(v).toEqual(2); break;
          case 2: expect(k).toEqual("c"); expect(v).toEqual(3); break;
          default: throw new Error("Unexpected key-value-pair "+[k, v]);
        }
        i++;
      });
      expect(i).toEqual(3);

      setTimeout(() => {
        i = 0;
        map.forEach((v: number, k: string) => {
          switch(i){
            case 0: expect(k).toEqual("c"); expect(v).toEqual(3); break;
            default: throw new Error("Unexpected key-value-pair "+[k, v]);
          }
          i++;
        });
        expect(i).toEqual(1);
        resolve();
      }, 50);
    });
  })

});

