namespace story {
    //% blockId=story_sprite_move_to_tile
    //% block="$sprite move to $location with speed $speed"
    //% sprite.shadow=variables_get
    //% sprite.defl=sprite
    //% location.shadow=mapgettile
    //% speed.defl=100
    //% blockGap=8
    //% group="Movement"
    //% weight=100
    export function spriteMoveToTile(sprite: Sprite, location: tiles.Location, speed: number) {
        const start = tiles.getTileLocation(sprite.x >> game.currentScene().tileMap.scale, sprite.y >> game.currentScene().tileMap.scale)
        const key = moveTaskKey(sprite);
        _cancelTask(key);
        if (start) {
            let done = false;
            let task = {
                key: key,
                isDone: () => done,
                cancel: () => {
                    done = true;
                    scene._followPath(sprite, null);
                }
            };
            const path = scene.aStar(start, location);
            scene._followPath(sprite, path, speed, () => {
                done = true;
            });

            _trackTask(task);
            if (!_isInQueueStoryPart()) {
                _currentCutscene().currentTask = task;
                _pauseUntilTaskIsComplete(task);
            }
        }
        else if (location) {
            spriteMoveToLocation(sprite, location.x, location.y, speed);
        }
    }

    //% blockId=story_sprite_move_to_location
    //% block="$sprite move to x $x y $y with speed $speed"
    //% inlineInputMode=inline
    //% sprite.shadow=variables_get
    //% sprite.defl=sprite
    //% speed.defl=100
    //% blockGap=8
    //% group="Movement"
    //% weight=80
    export function spriteMoveToLocation(sprite: Sprite, x: number, y: number, speed: number) {
        const distance = calculateDistance(sprite, x, y);
        const time = (distance / speed) * 1000;
        const angle = Math.atan2(y - sprite.y, x - sprite.x);

        sprite.ax = 0;
        sprite.ay = 0;
        sprite.vx = Math.cos(angle) * speed;
        sprite.vy = Math.sin(angle) * speed;

        const key = moveTaskKey(sprite);
        _cancelTask(key);

        let done = false;
        let ref = setTimeout(function () {
            sprite.vx = 0;
            sprite.vy = 0;
            sprite.x = x;
            sprite.y = y;
            done = true;
        }, time);

        let task: Task = {
            key: key,
            isDone: () => done,
            cancel: () => {
                done = true;
                sprite.vx = 0;
                sprite.vy = 0;
                clearTimeout(ref);
            }
        };

        _trackTask(task);
        if (!_isInQueueStoryPart()) {
            _currentCutscene().currentTask = task;
            _pauseUntilTaskIsComplete(task);
        }
    }

    //% blockId=story_sprite_cancel_movement
    //% block="$sprite cancel movement"
    //% inlineInputMode=inline
    //% sprite.shadow=variables_get
    //% sprite.defl=sprite
    //% blockGap=8
    //% group="Movement"
    //% weight=70
    export function cancelSpriteMovement(sprite: Sprite) {
        const key = moveTaskKey(sprite);
        _cancelTask(key);
    }
    
    function calculateDistance(sprite: Sprite, x: number, y: number) {
        return Math.sqrt(Math.pow(sprite.x - x, 2) + Math.pow(sprite.y - y, 2));
    }

    function moveTaskKey(sprite: Sprite) {
        return "move_" + sprite.id;
    }
}