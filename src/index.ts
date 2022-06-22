import * as map from "./ExpireMap";

export const ExpireMap = map.ExpireMap;
export type ExpireMap<K, V> = map.ExpireMap<K, V>;

const m = new ExpireMap([["a", 1], ["b", 2]]);
for(let pair of m.entries()){
    console.log(pair);
}