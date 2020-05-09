namespace story {

    //% blockId=story_sprite_move_to_tile
    //% block="$sprite move to $location with speed $speed"
    //% sprite.shadow=variables_get
    //% sprite.defl=sprite
    //% location.shadow=mapgettile
    //% speed.defl=100
    //% blockGap=8
    //% group="Movement"
    export function spriteMoveToTile(sprite: Sprite, location: tiles.Location, speed: number) {
        const start = tiles.getTileLocation(sprite.x >> game.currentScene().tileMap.scale, sprite.y >> game.currentScene().tileMap.scale)
        
        if (start) {
            let done = false;
            let task = {
                isDone: () => done
            };
            const path = scene.aStar(start, location);
            scene._followPath(sprite, path, speed, () => {
                done = true;
            });
            _trackTask(task);
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
    export function spriteMoveToLocation(sprite: Sprite, x: number, y: number, speed: number) {
        const distance = calculateDistance(sprite, x, y);
        const time = (distance / speed) * 1000;
        const angle = Math.atan2(y - sprite.y, x - sprite.x);

        sprite.ax = 0;
        sprite.ay = 0;
        sprite.vx = Math.cos(angle) * speed;
        sprite.vy = Math.sin(angle) * speed;

        let done = false;
        let task: Task = {
            isDone: () => done
        };

        _trackTask(task);

        setTimeout(function () {
            sprite.vx = 0;
            sprite.vy = 0;
            sprite.x = x;
            sprite.y = y;
            done = true;
        }, time);
    }

    function calculateDistance(sprite: Sprite, x: number, y: number) {
        return Math.sqrt(Math.pow(sprite.x - x, 2) + Math.pow(sprite.y - y, 2));
    }
}