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
    //% blockGap=8
    //% weight=99
    //% group="Text"
    export function printText(text: string, x: number, y: number, foreground = 15, background = 1, speed?: TextSpeed) {
        const script = _formatText(text, speed === undefined ? TextSpeed.Normal : speed);
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
    //% blockGap=8
    //% weight=98
    //% group="Text"
    export function spriteSayText(sprite: Sprite, text: string, foreground = 15, background = 1, speed?: TextSpeed) {
        const script = _formatText(text, speed === undefined ? TextSpeed.Normal : speed);
        script.setColors(foreground, background);
        spriteSayScript(sprite, script);
    }

    function isBreakCharacter(charCode: number) {
        return charCode <= 32 ||
            (charCode >= 58 && charCode <= 64) ||
            (charCode >= 91 && charCode <= 96) ||
            (charCode >= 123 && charCode <= 126);
    }

    export function _formatText(text: string, speed: TextSpeed, maxLineLength = 20, maxLinesPerPage = 5): Script {
        const result = new Script();

        let lastBreakLocation = 0;
        let lastBreak = 0;
        let line = 0;

        for (let index = 0; index < text.length; index++) {
            if (text.charAt(index) === "\n") {
                result.addLineToCurrentPage(formatLine(text.substr(lastBreak, index - lastBreak)), speed);
                index++;
                lastBreak = index;
                line++;
            }
            // Handle \\n in addition to \n because that's how it gets converted from blocks
            else if (text.charAt(index) === "\\" && text.charAt(index + 1) === "n") {
                result.addLineToCurrentPage(formatLine(text.substr(lastBreak, index - lastBreak)), speed)
                index += 2;
                lastBreak = index
                line++;
            }
            else if (isBreakCharacter(text.charCodeAt(index))) {
                lastBreakLocation = index;
            }

            if (index - lastBreak === maxLineLength) {
                if (lastBreakLocation === index || lastBreakLocation < lastBreak) {
                    result.addLineToCurrentPage(formatLine(text.substr(lastBreak, maxLineLength)), speed);
                    lastBreak = index;
                    line++;
                }
                else {
                    result.addLineToCurrentPage(formatLine(text.substr(lastBreak, lastBreakLocation - lastBreak)), speed);
                    lastBreak = lastBreakLocation;
                    line++;
                }
            }

            if (line >= maxLinesPerPage) {
                line = 0;
                result.newPage();
            }
        }

        result.addLineToCurrentPage(formatLine(text.substr(lastBreak, text.length - lastBreak)), speed);

        return result;
    }

    function formatLine(text: string) {
        let i = 0;
        while (text.charAt(i) === " ") i++;
        return text.substr(i, text.length);
    }

    //% blockId=story_print_dialog
    //% block="print $text at camera x $x y $y in box width $width height $height||with text color $foreground back color $background $speed"
    //% text.defl=":)"
    //% foreground.shadow=colorindexpicker
    //% foreground.defl=15
    //% background.shadow=colorindexpicker
    //% background.defl=1
    //% x.defl=80
    //% y.defl=90
    //% width.defl=150
    //% height.defl=50
    //% inlineInputMode=inline
    //% blockGap=8
    //% weight=60
    //% group="Text"
    export function printDialog(text: string, x: number, y: number, height: number, width: number, foreground = 15, background = 1, speed?: TextSpeed) {
        const font = image.getFontForText(text);
        const script = _formatText(text, speed === undefined ? TextSpeed.Normal : speed, Math.idiv(width - 8, font.charWidth), Math.idiv(height - 8, font.charHeight));
        script.setColors(foreground, background);
        printScript(script, x - (width >> 1), y - (height >> 1), TEXT_Z, true, true);
    }
}