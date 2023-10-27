import { main_loop, setup } from "../src/app.js";

document.addEventListener("DOMContentLoaded", () => {
    main();
});

function main() {
    setup();

    main_loop();
}
