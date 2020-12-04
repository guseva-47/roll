interface IRand {
    sowing(seed?: string);
    getNums(min: number, max: number, count: number): number[];
}