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
}