namespace story {
    let stateStack: ConversationState[];

    enum State {
        Idle,
        Printing,
        Choosing
    }

    class ConversationState {
        state: State;
        lastAnswer: string;
        cancelled: boolean;
        registeredMenuHandler: boolean;
        currentTask: story.Task;

        constructor() {
            this.state = State.Idle;
        }

        showMenu(choices: string[]) {
            if (this.cancelled) return;
            if (!this.registeredMenuHandler) {
                this.registeredMenuHandler = true;
                story.menu.onMenuOptionSelected((option: string, index: number) => {
                    this.lastAnswer = option;
                    story.menu.closeMenu();
                });
            }

            let arrows = img`
                1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
                1 1 1 1 1 1 1 1 1 6 6 6 6 6 6 6 1 
                1 1 1 1 6 1 1 1 1 6 6 6 6 6 6 6 1 
                1 1 1 1 6 1 1 1 1 1 6 6 6 6 6 1 1 
                1 1 1 6 6 6 1 1 1 1 6 6 6 6 6 1 1 
                1 1 1 6 6 6 1 1 1 1 1 6 6 6 1 1 1 
                1 1 6 6 6 6 6 1 1 1 1 6 6 6 1 1 1 
                1 1 6 6 6 6 6 1 1 1 1 1 6 1 1 1 1 
                1 6 6 6 6 6 6 6 1 1 1 1 6 1 1 1 1 
                1 6 6 6 6 6 6 6 1 1 1 1 1 1 1 1 1 
                1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
            `
            let abutton = img`
                1 1 1 1 1 1 1 1 1 1 1 
                1 1 1 6 6 6 6 6 1 1 1 
                1 1 6 6 6 6 6 6 6 1 1 
                1 6 6 6 6 1 6 6 6 6 1 
                1 6 6 6 1 6 1 6 6 6 1 
                1 6 6 6 1 1 1 6 6 6 1 
                1 6 6 6 1 6 1 6 6 6 1 
                1 6 6 6 1 6 1 6 6 6 1 
                1 1 6 6 6 6 6 6 6 1 1 
                1 1 1 6 6 6 6 6 1 1 1 
                1 1 1 1 1 1 1 1 1 1 1 
            `

            const arrowText = new story.TextSprite(story.TEXT_Z + 1);
            arrowText.setText("SELECT");
            arrowText.setColor(15);
            arrowText.top = screen.height - (arrows.height >> 1) - (arrowText.getHeight() >> 1);

            const buttonText = new story.TextSprite(story.TEXT_Z + 1);
            buttonText.setText("OK");
            buttonText.setColor(15);
            buttonText.top = screen.height - (arrows.height >> 1) - (buttonText.getHeight() >> 1);

            const arrowIcon = new story.IconSprite(story.TEXT_Z + 1);
            arrowIcon.top = screen.height - arrows.height;
            arrowIcon.setIcon(arrows);

            const buttonIcon = new story.IconSprite(story.TEXT_Z + 1);
            buttonIcon.top = screen.height - abutton.height;
            buttonIcon.setIcon(abutton);

            const totalWidth = arrowText.getWidth() + buttonText.getWidth() + arrows.width + abutton.width + 4;
            
            arrowIcon.left = (screen.width >> 1) - (totalWidth >> 1);
            arrowText.left = arrowIcon.left + arrows.width + 1
            buttonIcon.left = arrowText.left + arrowText.getWidth() + 2;
            buttonText.left = buttonIcon.left + abutton.width + 1;

            const backdrop = new story.RectangleSprite(story.TEXT_Z);
            backdrop.setDimensions(156, arrows.height);
            backdrop.top = screen.height - backdrop.height;
            backdrop.left = (screen.width >> 1) - (backdrop.width >> 1);

            story.menu.showMenu(choices, story.menu.MenuStyle.List, story.menu.MenuLocation.BottomHalf);
            pauseUntil(() => !story.menu.isMenuOpen());

            buttonText.destroy();
            arrowIcon.destroy();
            arrowText.destroy();
            buttonIcon.destroy();
            backdrop.destroy();
        }

        cancel() {
            if (story.menu.isMenuOpen()) {
                story.menu.closeMenu();
            }
            if (this.currentTask && this.currentTask.cancel) {
                this.currentTask.cancel();
                this.currentTask = null;
            }
            this.cancelled = true;
        }
    }

    //% blockId=arcade_story_start_conversation
    //% block="start conversation"
    //% weight=100
    //% handlerStatement=1
    //% group="Conversation"
    export function startConveration(callback: () => void) {
        cancelCurrentConversation();

        control.runInParallel(() => {
            let state = currentConversation();
            if (state.cancelled) {
                state.cancelled = false;
                state.state = State.Idle;
            }

            callback();
            
            state = currentConversation();
            if (state.cancelled) {
                state.cancelled = false;
                state.state = State.Idle;
            }
        });
    }
    
    //% blockId=arcade_story_print_character_text
    //% block="print character text $text|| with label $label"
    //% weight=90
    //% group="Conversation"
    export function printCharacterText(text: string, label?: string) {
        if (currentConversation().cancelled) {
            return;
        }
        const task = printDialog(text, 80, 90, 50, 150);

        if (label) {
            const padding = 1;
            const labelText = new story.TextSprite(story.TEXT_Z + 2);
            labelText.setText(label);
            labelText.top = 65 - labelText.getHeight();
            labelText.attachToTask(task);
            labelText.left = 3;

            const labelBackdrop = new story.RectangleSprite(story.TEXT_Z + 1);
            labelBackdrop.setDimensions(labelText.getWidth() + (padding << 1), labelText.getHeight() + (padding << 1));
            labelBackdrop.setColor(6);
            labelBackdrop.left = labelText.left - padding;
            labelBackdrop.top = 65 - labelText.getHeight() - padding;
            labelBackdrop.attachToTask(task);
        }

        currentConversation().currentTask = task;
        pauseUntilTaskIsComplete(task);
    }

    //% blockId=arcade_story_show_player_choices
    //% block="show player choices $choice1 $choice2 ||$choice3 $choice4 $choice5"
    //% inlineInputMode=inline
    //% weight=80
    //% group="Conversation"
    export function showPlayerChoices(choice1: string, choice2: string, choice3?: string, choice4?: string, choice5?: string) {
        const choices = [choice1, choice2];
        if (choice3) choices.push(choice3);
        if (choice4) choices.push(choice4);

        currentConversation().showMenu(choices);
    }

    //% blockId=arcade_story_last_answer
    //% block="last answer equals $choice"
    //% weight=70
    //% group="Conversation"
    export function checkLastAnswer(choice: string): boolean {
        return currentConversation().lastAnswer === choice;
    }

    //% blockId=arcade_story_cancel_conversation
    //% block="cancel conversation"
    //% weight=60
    //% group="Conversation"
    export function cancelCurrentConversation() {
        currentConversation().cancel();
    }

    function printDialog(text: string, x: number, y: number, height: number, width: number, foreground = 15, background = 1, speed?: story.TextSpeed) {
        const font = image.getFontForText(text);
        const script = story._formatText(text, speed === undefined ? story.TextSpeed.Normal : speed, Math.idiv(width - 8, font.charWidth), Math.idiv(height - 8, font.charHeight));
        script.setColors(foreground, 0);

        const left = x - (width >> 1);
        const top = y - (height >> 1)

        const bubble = new story.Bubble(story.TEXT_Z, true);
        bubble.setAlign(left, top);
        bubble.foregroundColor = script.foregroundColor;
        bubble.backgroundColor = script.backgroundColor;
        bubble.pagePauseLength = script.pagePauseMillis;
        bubble.startMessage(script.pages);

        const backdrop = new story.RectangleSprite(story.TEXT_Z - 1);
        backdrop.setColor(background);
        backdrop.setDimensions(width, height);
        backdrop.left = left;
        backdrop.top = top;
        backdrop.attachToTask(bubble);

        return bubble;
    }

    function pauseUntilTaskIsComplete(task: story.Task) {
        const state = currentConversation();
        pauseUntil(() => task.isDone() || state.cancelled);
    }

    function currentConversation() {
        if (!stateStack) {
            stateStack = [];

            game.addScenePushHandler(() => {
                stateStack.push(new ConversationState());
            });

            game.addScenePopHandler(() => {
                if (stateStack.length) {
                    stateStack[stateStack.length - 1].cancel();
                    stateStack.pop();
                }
            });
        }
        if (!stateStack.length) {
            stateStack.push(new ConversationState());    
        }
        return stateStack[stateStack.length - 1];
    }
}