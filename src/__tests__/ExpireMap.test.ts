import { ExpireMap } from '../index';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  test('Set object and immediately get', () => {
    const map = new ExpireMap();
    map.set("a", 1);
    expect(map.get("a")).toEqual(1);
  });

  test('Set object and immediately has', () => {
    const map = new ExpireMap();
    map.set("a", 1);
    expect(map.has("a")).toEqual(true);
  });

  test('Set object and get after timeout', async () => {
    const map = new ExpireMap();
      map.set("b", 2, 50);
      expect(map.get("b")).toEqual(2);

      await sleep(50);

      expect(map.get("b")).toBeUndefined();
  });

  test('Set object and has after timeout', async () => {
    const map = new ExpireMap();
    map.set("b", 2, 50);
    expect(map.has("b")).toEqual(true);

    await sleep(50);

    expect(map.has("b")).toEqual(false);
  });

  test('Clear', async () => {
    const map = new ExpireMap();
    map.set("c", 3);
    map.clear();
    expect(map.size).toEqual(0);
    expect(map.getSize()).toEqual(0);
  });

  test('getSize with timeout', async () => {
    const map = new ExpireMap();
    map.set("d", 4, 50);
    expect(map.size).toEqual(1);
    expect(map.getSize()).toEqual(1);

    await sleep(50);

    expect(map.getSize()).toEqual(0);
    expect(map.size).toEqual(0);
  });

  test('Constructor with values', async () => {
    const map = new ExpireMap({ defaultMaxAge: 50 }, [["a", 1], ["b", 2]]);
    expect(map.getSize()).toEqual(2);
    expect(map.get("a")).toEqual(1);
    expect(map.get("b")).toEqual(2);

    await sleep(50);

    expect(map.get("a")).toBeUndefined();
    expect(map.get("b")).toBeUndefined();
    expect(map.getSize()).toEqual(0);
  });

  test('entries with timeout', async () => {
    const map = new ExpireMap({ defaultMaxAge: 50 }, [["a", 1], ["b", 2]]);
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

    await sleep(50);

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
  });

  test('keys with timeout', async () => {
    const map = new ExpireMap({ defaultMaxAge: 50 }, [["a", 1], ["b", 2]]);
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

    await sleep(50);

    i = 0;
    for(let key of map.keys()){
      switch(i){
        case 0: expect(key).toEqual("c"); break;
        default: throw new Error("Unexpected key "+key);
      }
      i++;
    }
    expect(i).toEqual(1);
  });

  test('values with timeout', async () => {
    const map = new ExpireMap({ defaultMaxAge: 50 }, [["a", 1], ["b", 2]]);
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

    await sleep(50);

    i = 0;
    for(let value of map.values()){
      switch(i){
        case 0: expect(value).toEqual(3); break;
        default: throw new Error("Unexpected value "+value);
      }
      i++;
    }
    expect(i).toEqual(1);
  });

  test('forEach with timeout', async () => {
    const map = new ExpireMap({ defaultMaxAge: 50 }, [["a", 1], ["b", 2]]);
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

    await sleep(50);

    i = 0;
    map.forEach((v: number, k: string) => {
      switch(i){
        case 0: expect(k).toEqual("c"); expect(v).toEqual(3); break;
        default: throw new Error("Unexpected key-value-pair "+[k, v]);
      }
      i++;
    });
    expect(i).toEqual(1);
  });




  test('getRemainingLifespan', async () => {
    const map = new ExpireMap({ defaultMaxAge: 50 }, [["a", 1], ["b", 2]]);
    map.set("c", 3, 1000);
    expect(map.getRemainingLifespan("a")).toBeLessThanOrEqual(50);
    expect(map.getRemainingLifespan("a")).toBeGreaterThan(25);
    expect(map.getRemainingLifespan("b")).toBeLessThanOrEqual(50);
    expect(map.getRemainingLifespan("b")).toBeGreaterThan(25);
    expect(map.getRemainingLifespan("c")).toBeLessThanOrEqual(1000);
    expect(map.getRemainingLifespan("c")).toBeGreaterThan(975);

    await sleep(50);

    expect(map.getRemainingLifespan("a")).toBeUndefined();
    expect(map.has("a")).toEqual(false);
    expect(map.getRemainingLifespan("b")).toBeUndefined();
    expect(map.has("b")).toEqual(false);
    expect(map.getRemainingLifespan("c")).toBeLessThanOrEqual(950);
    expect(map.getRemainingLifespan("c")).toBeGreaterThan(925);
  });

  test('resetLifespanOnAccess: manual', async () => {
    const map = new ExpireMap({ defaultMaxAge: 50, resetLifespanOnAccess: true }, [["a", 1], ["b", 2]]);
    map.set("c", 3, 1000);

    await sleep(25);

    map.resetLifespan("a");
    map.resetLifespan("c", 100);
    expect(map.getRemainingLifespan("a")).toBeLessThanOrEqual(50);
    expect(map.getRemainingLifespan("a")).toBeGreaterThan(25);
    expect(map.getRemainingLifespan("b")).toBeLessThanOrEqual(25);
    expect(map.getRemainingLifespan("b")).toBeGreaterThan(0);
    expect(map.getRemainingLifespan("c")).toBeLessThanOrEqual(100);
    expect(map.getRemainingLifespan("c")).toBeGreaterThan(75);

    await sleep(25);

    map.resetLifespan("a", 0); // remove timeout (set to null)
    map.resetLifespan("c", null); // set to default max age
    expect(map.getRemainingLifespan("a")).toBeNull();
    expect(map.has("a")).toEqual(true);
    expect(map.getRemainingLifespan("b")).toBeUndefined();
    expect(map.has("b")).toEqual(false);
    expect(map.getRemainingLifespan("c")).toBeLessThanOrEqual(50);
    expect(map.getRemainingLifespan("c")).toBeGreaterThan(25);

    await sleep(25);

    map.resetLifespanOfAll();
    expect(map.getRemainingLifespan("a")).toBeNull();
    expect(map.has("a")).toEqual(true);
    expect(map.getRemainingLifespan("b")).toBeUndefined();
    expect(map.has("b")).toEqual(false);
    expect(map.getRemainingLifespan("c")).toBeLessThanOrEqual(50);
    expect(map.getRemainingLifespan("c")).toBeGreaterThan(25);
  });

  test('resetLifespanOnAccess: get()', async () => {
    const map = new ExpireMap({ defaultMaxAge: 50, resetLifespanOnAccess: true }, [["a", 1], ["b", 2]]);
    map.set("c", 3, 1000);

    await sleep(25);

    map.get("a"); // should reset lifespan of elements
    map.get("c"); // should reset lifespan of elements
    expect(map.getRemainingLifespan("a")).toBeLessThanOrEqual(50);
    expect(map.getRemainingLifespan("a")).toBeGreaterThan(25);
    expect(map.getRemainingLifespan("b")).toBeLessThanOrEqual(25);
    expect(map.getRemainingLifespan("b")).toBeGreaterThan(0);
    expect(map.getRemainingLifespan("c")).toBeLessThanOrEqual(1000);
    expect(map.getRemainingLifespan("c")).toBeGreaterThan(975);
  });

  test('resetLifespanOnAccess: entries()', async () => {
    const map = new ExpireMap({ defaultMaxAge: 50, resetLifespanOnAccess: true }, [["a", 1], ["b", 2]]);
    map.set("c", 3, 1000);

    await sleep(25);

    const itr = map.entries(); // should reset lifespan of all elements
    while(itr.next().done === false); // iterate over all elements
    expect(map.getRemainingLifespan("a")).toBeLessThanOrEqual(50);
    expect(map.getRemainingLifespan("a")).toBeGreaterThan(25);
    expect(map.getRemainingLifespan("b")).toBeLessThanOrEqual(50);
    expect(map.getRemainingLifespan("b")).toBeGreaterThan(25);
    expect(map.getRemainingLifespan("c")).toBeLessThanOrEqual(1000);
    expect(map.getRemainingLifespan("c")).toBeGreaterThan(975);
  });

  test('resetLifespanOnAccess: forEach()', async () => {
    const map = new ExpireMap({ defaultMaxAge: 50, resetLifespanOnAccess: true }, [["a", 1], ["b", 2]]);
    map.set("c", 3, 1000);

    await sleep(25);

    map.forEach(() => {}); // should reset lifespan of all elements
    expect(map.getRemainingLifespan("a")).toBeLessThanOrEqual(50);
    expect(map.getRemainingLifespan("a")).toBeGreaterThan(25);
    expect(map.getRemainingLifespan("b")).toBeLessThanOrEqual(50);
    expect(map.getRemainingLifespan("b")).toBeGreaterThan(25);
    expect(map.getRemainingLifespan("c")).toBeLessThanOrEqual(1000);
    expect(map.getRemainingLifespan("c")).toBeGreaterThan(975);
  });

});

