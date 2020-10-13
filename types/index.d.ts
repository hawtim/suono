interface Suono {
    sound: HTMLAudioElement;
    name: string;
    duration: number;
    status: boolean;
    loading: boolean;
    controls: boolean;
    playList: ListItem[];
    currentIndex: number;
    mode: string;
    playType: PlayType;
    autoSkip: boolean;
    volume: number;
    suonoEvent: SuonoEvent;
}
interface ListItem {
    [property: string]: any;
    src: string;
    name: string;
}
interface PlayType {
    [playType: string]: () => void;
    order: () => void;
    singleLoop: () => void;
    random: () => void;
    listLoop: () => void;
}
interface Options {
    [property: string]: any;
    autoSkip?: boolean;
    mode?: string;
    volume?: number;
}
interface SuonoEvent {
    clientList: Record<string, any>;
}
declare class SuonoEvent {
    constructor();
    listen(key: string, callback: () => void): void;
    trigger(key: string, ...rest: any): boolean;
    remove(key: string, callback: () => void): boolean;
}
declare class Suono {
    constructor(options?: Options, playList?: ListItem[]);
    init({ src, name }: ListItem): void;
    load(): void;
    play(): void;
    pause(): void;
    seek(target: number): void;
    skipTo(listItem: ListItem): void;
    canplay(): void;
    prev(): void;
    next(): void;
    switch({ name, src }: ListItem): void;
    order(): void;
    singleLoop(): void;
    random(): void;
    listLoop(): void;
    getName(): string;
    getSrc(): string;
    getCurrentTime(): number;
    getList(): ListItem[];
    updateName(name: string, src: string): void;
    updateLoading(status: boolean): void;
    updateDuration(duration: number): void;
    updateStatus(status: boolean): void;
    updateMode(mode: string): void;
    updateList(list: ListItem[]): void;
    handleEvent(): void;
    handleLoadError({ code }: MediaError): void;
}
declare const SingleTonSuono: (rest_0: Options, rest_1: ListItem[]) => Suono;
export { Suono, SingleTonSuono };
