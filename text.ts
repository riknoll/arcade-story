namespace story {
    export const TEXT_Z = scene.HUD_Z - 1;
    
    //% blockId=story_show_text
    //% block="print $text at x $x y $y||with text color $foreground back color $background $speed"
    //% text.defl=":)"
    //% foreground.shadow=colorindexpicker
    //% foreground.defl=15
    //% background.shadow=colorindexpicker
    //% background.defl=1
    //% inlineInputMode=inline
    //% weight=99
    //% group="Text"
    export function printText(text: string, x: number, y: number, foreground = 15, background = 1, speed?: TextSpeed) {
        const script = formatText(text, speed === undefined ? TextSpeed.Normal : speed);
        script.setColors(foreground, background);
        printScript(script, x, y, TEXT_Z);
    }

    //% blockId=story_sprite_say_text
    //% block="$sprite say $text ||with text color $foreground back color $background $speed"
    //% text.defl=":)"
    //% sprite.shadow=variables_get
    //% sprite.defl=sprite
    //% foreground.shadow=colorindexpicker
    //% foreground.defl=15
    //% background.shadow=colorindexpicker
    //% background.defl=1
    //% inlineInputMode=inline
    //% weight=99
    //% group="Text"
    export function spriteSayText(sprite: Sprite, text: string, foreground = 15, background = 1, speed?: TextSpeed) {
        const script = formatText(text, speed === undefined ? TextSpeed.Normal : speed);
        script.setColors(foreground, background);
        spriteSayScript(sprite, script);
    }

    function isBreakCharacter(charCode: number) {
        return charCode <= 47 ||
            (charCode >= 58 && charCode <= 64) ||
            (charCode >= 91 && charCode <= 96) ||
            (charCode >= 123 && charCode <= 126);
    }


    function formatText(text: string, speed: TextSpeed, maxLineLength = 20, maxLinesPerPage = 5): Script {
        const script = new Script();

        let lastBreakLocation = 0;
        let lastBreak = 0;
        let line = 0;

        for (let index = 0; index < text.length; index++) {
            if (isBreakCharacter(text.charCodeAt(index))) {
                lastBreakLocation = index;
            }

            if (index - lastBreak === maxLineLength) {
                if (lastBreakLocation === index || lastBreakLocation < lastBreak) {
                    script.addLineToCurrentPage(
                        text.substr(lastBreak, maxLineLength),
                        speed
                    );
                    lastBreak = index + 1;
                    line++;
                }
                else {
                    script.addLineToCurrentPage(
                        text.substr(lastBreak, lastBreakLocation - lastBreak),
                        speed
                    );
                    lastBreak = lastBreakLocation + 1;
                    line++;
                }
            }

            if (line >= maxLinesPerPage) {
                line = 0;
                script.newPage();
            }
        }

        script.addLineToCurrentPage(
            text.substr(lastBreak, text.length - lastBreak),
            speed
        );

        return script;
    }
}