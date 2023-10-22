import { main_loop, setup } from "../application/app.js";

document.addEventListener("DOMContentLoaded", () => {
    main();
});

function main() {
    setup();

    main_loop();
}
