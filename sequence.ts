namespace story {
    let state: StoryState;
    export class StoryState {
        queue: (() => void)[];
        running: boolean;
        protected activeTasks: Task[];

        constructor() {
            this.activeTasks = [];
            this.queue = [];
            this.running = false;
        }

        trackTask(task: Task) {
            if (this.queue.length)
                this.activeTasks.push(task);
        }

        reset() {
            this.activeTasks = [];
            this.running = false;
        }

        shouldAdvance() {
            return !this.activeTasks.some(task => !task.isDone());
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

    export function _trackTask(task: Task) {
        if (state && state.queue.length) {
            state.trackTask(task);
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