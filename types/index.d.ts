interface Suono {
    sound: HTMLAudioElement;
    name: string;
    src: string | string[];
    duration: number;
    autoplay: boolean;
    preload: string;
    loop: boolean;
    fallback: string;
    debug: boolean;
    loading: boolean;
    controls: boolean;
    playList: ListItem[];
    currentIndex: number;
    mode: string;
    playType: PlayType;
    autoSkip: boolean;
    volume: number;
    timestamp: number;
    crossorigin: string;
    suonoEvent: SuonoEvent;
}
interface ListItem {
    [property: string]: any;
    src: string | string[];
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
    preload?: string;
    controls?: boolean;
    autoplay?: boolean;
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
    updateAudio(src: string | string[]): void;
    appendChild(): void;
    removeChild(): void;
    destroy(): void;
    load(): void;
    play(): void;
    pause(): void;
    seek(target: number): void;
    skipTo(listItem: ListItem): void;
    prev(): void;
    next(): void;
    switch({ name, src }: ListItem): void;
    order(): void;
    singleLoop(): void;
    random(): void;
    listLoop(): void;
    setId(id?: string): void;
    getId(): number;
    getRandomIndex(): number;
    getName(): string;
    getSrc(): string;
    getCurrentSrc(): string;
    getCurrentTime(): number;
    getList(): ListItem[];
    updateLoop(status: boolean): void;
    updateName(name: string, src: string): void;
    updatePreload(type: string): void;
    updateControls(status: boolean): void;
    updateLoading(status: boolean): void;
    updateDuration(duration: number): void;
    updateMode(mode: string): void;
    updateList(list: ListItem[]): void;
    debugConsole(string: string): void;
    handleEvent(): void;
    handleLoadError({ code }: MediaError): void;
}
declare const SingleTonSuono: (rest_0: Options, rest_1: ListItem[]) => Suono;
export { Suono, SingleTonSuono };
