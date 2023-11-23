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
    potion_parent_div: HTMLDivElement;
    current_health: number;

    constructor() {        
        const parentDiv = document.querySelector('div');
        this.health_bar = document.createElement('img') as HTMLImageElement;
        this.potion_parent_div = document.createElement('div') as HTMLDivElement;
        this.current_health = 8;

        this.health_bar.setAttribute('style', 'position: absolute; height: 10vh; width: 15vw; image-rendering: pixelated;');
        this.set_health_bar(0, 1);

        this.potion_parent_div.setAttribute('style', 'position: relative; top: 9vh; left: 6vw; height: 5vh; width: 10vw;');
        
        parentDiv?.appendChild(this.health_bar);
        parentDiv?.appendChild(this.potion_parent_div);
        
        for (let i = 0; i < 3; i++) {
            const potion = new Image();
            potion.src = './textures/hud/potion9by9.png';
            potion.setAttribute('style', `position: absolute; left: ${3*i}vw; height: 4vh; width: 3vw; image-rendering: pixelated;`);
            this.potion_parent_div.appendChild(potion);
        }
    }

    set_health_bar(change:number, multiplyer:number) {
        this.current_health += change * multiplyer;
        console.log(this.current_health);
        this.health_bar.src = `./textures/hud/health_bar/HealthBar-${health_bar_states[8-this.current_health]}.png`;
    }

}