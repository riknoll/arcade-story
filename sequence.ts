namespace story {
    let stateStack: StoryState[];
    export class StoryState {
        queue: (() => void)[];
        running: boolean;
        lock: boolean;
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

        cancelByKey(key: string) {
            for (const task of this.activeTasks) {
                if (task.key === key && task.cancel) task.cancel();
            }
        }
    }

    //% blockId=story_queue_story_part
    //% block="queue story part"
    //% group="Sequence"
    //% handlerStatement=1
    export function queueStoryPart(cb: () => void) {
        init();
        stateStack[stateStack.length - 1].queue.push(cb);
    }

    export function _trackTask(task: Task) {
        const state = stateStack && stateStack[stateStack.length - 1];
        if (state && state.queue.length) {
            state.trackTask(task);
        }
    }

    export function _cancelTask(key: string) {
        const state = stateStack && stateStack[stateStack.length - 1];
        if (state && state.queue.length) {
            state.cancelByKey(key);
        }
    }

    function init() {
        if (stateStack) return;

        stateStack = [new StoryState()];

        let lock = false;

        game.addScenePushHandler(function () {
            stateStack.push(new StoryState());
        });

        game.addScenePopHandler(function() {
            stateStack.pop();

            if (stateStack.length === 0) {
                stateStack.push(new StoryState());
            }
        });

        game.onUpdate(function() {
            const state = stateStack[stateStack.length - 1];
            if (state.lock) return;
            if (state.queue.length) {
                if (state.shouldAdvance() || !state.running) {
                    if (state.running) {
                        state.queue.shift();
                        state.reset();
                    }

                    if (state.queue.length) {
                        state.running = true;
                        control.runInParallel(function () {
                            state.lock = true;
                            state.queue[0]();
                            state.lock = false;
                        });
                    }
                }
            }
        });
    }
}