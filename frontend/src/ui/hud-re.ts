enum health_bar_states {
    Full,
    Dmg1,
    Dmg2,
    Dmg3,
    Dmg4,
    Dmg5,
    Dmg6,
    Dmg7,
    Empty
}

export class gamePlayHud {
    
    health_bar: HTMLImageElement;
    health_potion_parent: HTMLDivElement;
    buff_potion_parent: HTMLDivElement;
    timer: HTMLLabelElement;
    current_health: number;

    constructor() {        
        const parentDiv = document.querySelector('div');
        this.health_bar = document.createElement('img') as HTMLImageElement;
        this.health_potion_parent = document.createElement('div') as HTMLDivElement;
        this.buff_potion_parent = document.createElement('div') as HTMLDivElement;
        this.timer = document.createElement('label') as HTMLLabelElement;
        this.current_health = 8;

        this.health_bar.setAttribute('style', 'position: absolute; top: 1vh; left: 1vw; height: 10vh; width: 15vw; image-rendering: pixelated;');
        this.set_health_bar(0, 1);

        this.health_potion_parent.setAttribute('style', 'position: relative; top: 14vh; left: 1vw; height: 5vh; width: 10vw;');

        this.buff_potion_parent.setAttribute('style', 'position: relative; top: 17vh; left: 1vw; height: 5vh; width: 10vw');

        const timer_bg = new Image();
        timer_bg.src = './textures/hud/timer_bg.png';
        timer_bg.setAttribute('style', 'position: absolute; top: 3vh; left: 46vw; width: 8vw; height: 5vh; image-rendering: pixelated;');
        this.timer.setAttribute('style', 'position: absolute; top: 3vh; left: 46vw; height: 5vh; width: 8vw; font-family: "press start 2p"; text-align: center; line-height: 5vh;');        
        
        parentDiv?.appendChild(this.health_bar);
        parentDiv?.appendChild(this.health_potion_parent);
        parentDiv?.appendChild(this.buff_potion_parent);
        parentDiv?.appendChild(timer_bg);
        parentDiv?.appendChild(this.timer);
        
        for (let i = 0; i < 3; i++) {
            const health_potion = new Image();
            health_potion.src = './textures/hud/health_potion.png';
            health_potion.setAttribute('style', `position: absolute; left: ${3*i}vw; height: 4vh; width: 3vw; image-rendering: pixelated;`);
            this.health_potion_parent.appendChild(health_potion);            
        }
        for (let i = 0; i < 2; i++) {
            const buff_potion = new Image();
            buff_potion.src = './textures/hud/resistance_potion.png';
            buff_potion.setAttribute('style', `position: absolute; left: ${3*i}vw; height: 4vh; width: 3vw; image-rendering: pixelated;`);
            this.buff_potion_parent.appendChild(buff_potion);
        }
    }

    set_health_bar(change:number, multiplyer:number) {
        this.current_health += change * multiplyer;
        console.log(this.current_health);
        this.health_bar.src = `./textures/hud/health_bar/HealthBar-${health_bar_states[8-this.current_health]}.png`;
    }

    format_timer(milli_sec:number) {
        let sec_total = Math.floor(milli_sec / 1000);

        const min = Math.floor(sec_total / 60);
        const sec = Math.floor(sec_total % 60);

        if (min < 10) {
            if (sec < 10) {
                return `0${min}:0${sec}`;                
            }
            return `0${min}:${sec}`;
        }
        return `${min}:${sec}`;
    }

}