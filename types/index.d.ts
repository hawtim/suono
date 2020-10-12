interface Suono {
    sound: HTMLAudioElement;
    name: string;
    duration: number;
    status: boolean;
    loading: boolean;
    controls: boolean;
    playList: Array<ListItem>;
    currentIndex: number;
    mode: string;
    playType: PlayType;
    autoSkip: boolean;
    volume: number;
    suonoEvent: SuonoEvent;
}
interface ListItem {
    src: string;
    name: string;
    [property: string]: any;
}
interface PlayType {
    order: Function;
    singleLoop: Function;
    random: Function;
    listLoop: Function;
}
interface Options {
    autoSkip: boolean;
    mode: string;
    volume: number;
}
interface SuonoEvent {
    clientList: object;
}
declare class SuonoEvent {
    constructor();
    listen(key: string, callback: Function): void;
    trigger(key: string, ...rest: any): boolean;
    remove(key: string, callback: Function): boolean;
}
declare class Suono {
    constructor(options?: Options, playList?: ListItem[]);
    init({ src, name }: ListItem): void;
    load(): void;
    play(): void;
    pause(): void;
    seek(target: number): void;
    skipTo(index: number): void;
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
    handleLoadError({ code, message }: MediaError): void;
}
declare let SingleTonSuono: () => Suono;
export { Suono, SingleTonSuono };
