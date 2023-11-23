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

export class gamePlayHud {
    
    healthBar: HTMLImageElement;
    potionParentDiv: HTMLDivElement;
    currentHealth: number;

    constructor() {        
        const parentDiv = document.querySelector('div');
        this.healthBar = document.createElement('img') as HTMLImageElement;
        this.potionParentDiv = document.createElement('div') as HTMLDivElement;
        this.currentHealth = 8;

        this.healthBar.setAttribute('style', 'position: absolute; height: 10vh; width: 15vw; image-rendering: pixelated;');
        this.setHealthBar(0, 1);

        this.potionParentDiv.setAttribute('style', 'position: relative; top: 9vh; left: 6vw; height: 5vh; width: 10vw;');
        
        parentDiv?.appendChild(this.healthBar);
        parentDiv?.appendChild(this.potionParentDiv);
        
        for (let i = 0; i < 3; i++) {
            const potion = new Image();
            potion.src = './textures/hud/potion9by9.png';
            potion.setAttribute('style', `position: absolute; left: ${3*i}vw; height: 4vh; width: 3vw; image-rendering: pixelated;`);
            this.potionParentDiv.appendChild(potion);
        }
    }

    setHealthBar(change:number, multiplyer:number) {
        this.currentHealth += change * multiplyer;
        console.log(this.currentHealth);
        this.healthBar.src = `./textures/hud/health_bar/HealthBar-${HealthBarStates[8-this.currentHealth]}.png`;
    }

}