namespace story {
    //% blockId=story_push_scene
    //% block="push scene"
    //% blockGap=8
    //% group="Scene"
    export function pushScene() {
        game.pushScene();
    }

    //% blockId=story_pop_scene
    //% block="pop scene"
    //% blockGap=8
    //% group="Scene"
    export function popScene() {
        game.popScene();
    }

    //% blockId=story_clear_scene
    //% block="clear scene"
    //% blockGap=8
    //% group="Scene"
    export function clearScene() {
        popScene();
        pushScene();
    }

    //% blockId="story_clear_all_text"
    //% block="clear all text"
    //% group="Scene"
    export function clearAllText() {
        for (const bubble of getAllBubbles()) {
            bubble.destroy();
        }
    }

    export function getAllBubbles() {
        const all: Bubble[] = [];

        for (const sprite of game.currentScene().allSprites) {
            if (sprite instanceof Bubble) {
                all.push(sprite);
            } 
        }

        return all;
    }
}