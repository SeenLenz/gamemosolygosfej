enum HealthBarStates {
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
export let currentHealth = 8;

export class gamePlayHud {
    
    healthBar: HTMLImageElement;

    constructor() {        
        const parentDiv = document.querySelector('div');
        this.healthBar = document.createElement('img') as HTMLImageElement;

        this.healthBar.setAttribute('style', 'position:absolute; height: 10vh; width: 15vw; image-rendering: pixelated;');
        this.setHealtBar(0, 1);
        
        parentDiv?.appendChild(this.healthBar);
    }

    setHealtBar(change:number, multiplyer:number) {
        currentHealth += change * multiplyer;
        this.healthBar.src = `./textures/hud/health_bar/HealthBar-${HealthBarStates[8-currentHealth]}.png`;
    }

    
}