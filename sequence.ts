namespace story {
    let state: StoryState;
    export class StoryState {
        queue: (() => void)[];
        running: boolean;
        protected activeBubbles: Bubble[];

        constructor() {
            this.activeBubbles = [];
            this.queue = [];
            this.running = false;
        }

        addBubble(bubble: Bubble) {
            if (this.queue.length)
                this.activeBubbles.push(bubble);
        }

        reset() {
            this.activeBubbles = [];
            this.running = false;
        }

        shouldAdvance() {
            return !this.activeBubbles.some(bubble => !bubble.isDone());
        }
    }

    //% blockId=story_queue_story_part
    //% block="queue story part"
    //% group="Sequence"
    //% handlerStatement=1
    export function queueStoryPart(cb: () => void) {
        init();
        state.queue.push(cb);
    }

    export function _trackBubble(bubble: Bubble) {
        if (state && state.queue.length) {
            state.addBubble(bubble);
        }
    }

    function init() {
        if (state) return;

        state = new StoryState();
        let lock = false;

        game.onUpdate(function () {
            if (lock) return;
            if (state.queue.length) {
                if (state.shouldAdvance() || !state.running) {
                    if (state.running) {
                        state.queue.shift();
                        state.reset();
                    }

                    if (state.queue.length) {
                        state.running = true;
                        control.runInParallel(function () {
                            lock = true;
                            state.queue[0]();
                            lock = false;
                        });
                    }
                }
            }
        })
    }
}