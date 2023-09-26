import { App } from "../application/app.js";

document.addEventListener("DOMContentLoaded", () => {
    main();
});

function main() {
    const app = new App();

    app.setup();

    // change to infinte loop
    app.main_loop();
}
