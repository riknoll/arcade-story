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
        return charCode <= 32 ||
            (charCode >= 58 && charCode <= 64) ||
            (charCode >= 91 && charCode <= 96) ||
            (charCode >= 123 && charCode <= 126);
    }

    function formatText(text: string, textSpeed: TextSpeed, lineLength = 20, linesPerPage = 5,): Script {
        const result = new Script();

        let lastBreakLocation = 0;
        let lastBreak = 0;
        let line = 0;

        function nextLine() {
            line++;
        }

        for (let index = 0; index < text.length; index++) {
            if (text.charAt(index) === "\n") {
                result.addLineToCurrentPage(formatLine(text.substr(lastBreak, index - lastBreak)), textSpeed);
                index++;
                lastBreak = index;
                nextLine();
            }
            // Handle \\n in addition to \n because that's how it gets converted from blocks
            else if (text.charAt(index) === "\\" && text.charAt(index + 1) === "n") {
                result.addLineToCurrentPage(formatLine(text.substr(lastBreak, index - lastBreak)), textSpeed);
                index += 2;
                lastBreak = index
                nextLine();
            }
            else if (isBreakCharacter(text.charCodeAt(index))) {
                lastBreakLocation = index;
            }

            if (index - lastBreak === lineLength) {
                if (lastBreakLocation === index || lastBreakLocation < lastBreak) {
                    result.addLineToCurrentPage(formatLine(text.substr(lastBreak, lineLength)), textSpeed);
                    lastBreak = index;
                    nextLine();
                }
                else {
                    result.addLineToCurrentPage(formatLine(text.substr(lastBreak, lastBreakLocation - lastBreak)), textSpeed);
                    lastBreak = lastBreakLocation;
                    nextLine();
                }
            }

            if (line >= linesPerPage) {
                line = 0;
                result.newPage();
            }
        }

        const lastLine = formatLine(text.substr(lastBreak, text.length - lastBreak));

        if (lastLine) {
            result.addLineToCurrentPage(lastLine, textSpeed);
        }

        return result;
    }

    function formatLine(text: string) {
        let i = 0;
        while (text.charAt(i) === " ") i++;
        return text.substr(i, text.length);
    }
}