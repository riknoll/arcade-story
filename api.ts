//% block="Story" color="#b36634" icon="\uf02d"
//% groups='["Sequence","Text","Movement","Conversation","Script","Scene"]'
namespace story {
    export interface Task {
        isDone(): boolean;
        key?: string;
        cancel?: () => void;
    }
}