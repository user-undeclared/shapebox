"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const WASM_FILENAME = "bin/wasm/shapebox.wasm";
const noWasmMessageBox = createMessageBox("Your browser does not support\n" +
    "WebAssembly, which is needed\n" +
    "to run this program. Sorry :(");
const jsErrorMessageBox = createMessageBox("Something broke within the\n" +
    "internal code of this webpage.\n" +
    "Please let me know");
const loadingBox = createMessageBox("Loading the program...");
function createMessageBox(message) {
    const messageBox = document.createElement("div");
    messageBox.className = "error-box";
    messageBox.innerText = message;
    return messageBox;
}
function resizeSimulation(simulation, screenCanvas, drawCanvas) {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    screenCanvas.width = drawCanvas.width = newWidth;
    screenCanvas.height = drawCanvas.height = newHeight;
    simulation.resize(newWidth, newHeight);
}
function setPositionToEventTarget(position, event) {
    position.x = event.clientX;
    position.y = event.clientY;
}
function setToAverageTouchPosition(position, event) {
    const sum = { x: 0, y: 0 };
    for (const touch of event.targetTouches) {
        sum.x += touch.clientX;
        sum.y += touch.clientY;
    }
    position.x = sum.x / event.targetTouches.length,
        position.y = sum.y / event.targetTouches.length;
}
function touchStartHandler(simulation, mousePosition, event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.targetTouches.length == 1) {
        const touch = event.targetTouches[0];
        simulation.mouseDown(touch.clientX, touch.clientY);
    }
    else {
        setToAverageTouchPosition(mousePosition, event);
    }
}
function touchMoveHandler(mousePosition, event) {
    event.preventDefault();
    event.stopPropagation();
    setToAverageTouchPosition(mousePosition, event);
}
function touchEndHandler(simulation, mousePosition, event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.targetTouches.length == 0) {
        simulation.mouseUp();
    }
    else {
        setToAverageTouchPosition(mousePosition, event);
    }
}
function runSimulation(target, simulation) {
    let startTime;
    simulation.start(target.width, target.height);
    window.requestAnimationFrame(firstFrame);
    function firstFrame(timestamp) {
        startTime = timestamp;
        window.requestAnimationFrame(renderLoop);
    }
    function renderLoop(timestamp) {
        const deltaTime = (timestamp - startTime) / 1000;
        startTime = timestamp;
        simulation.update(deltaTime);
        simulation.render();
        window.requestAnimationFrame(renderLoop);
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof WebAssembly === "undefined") {
            document.body.appendChild(noWasmMessageBox);
            return;
        }
        document.body.appendChild(loadingBox);
        const wasmModule = fetch(WASM_FILENAME);
        const mousePosition = { x: 0, y: 0 };
        const screenCanvas = document.getElementById("screen");
        const drawCanvas = document.createElement("canvas");
        const screenContext = screenCanvas.getContext("2d");
        const drawContext = drawCanvas.getContext("2d");
        if (drawContext === null || screenContext === null) {
            document.body.removeChild(loadingBox);
            throw new Error("getting canvas contexts returned null");
        }
        const wasmImports = {
            env: {
                memory: new WebAssembly.Memory({ initial: 2 }),
                setDrawColor(red, green, blue, alpha) {
                    drawContext.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha / 256})`;
                },
                fillRect(x, y, width, height) {
                    drawContext.fillRect(x, y, width, height);
                },
                clear() {
                    drawContext.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
                },
                renderAll() {
                    screenContext.drawImage(drawCanvas, 0, 0);
                },
                mouseX() {
                    return mousePosition.x;
                },
                mouseY() {
                    return mousePosition.y;
                }
            }
        };
        const wasmInstance = yield WebAssembly.instantiateStreaming(yield wasmModule, wasmImports);
        const simulation = wasmInstance.instance.exports;
        window.addEventListener("resize", () => resizeSimulation(simulation, screenCanvas, drawCanvas));
        window.addEventListener("mousemove", (event) => setPositionToEventTarget(mousePosition, event));
        window.addEventListener("mousedown", (event) => simulation.mouseDown(event.clientX, event.clientY));
        window.addEventListener("mouseup", () => simulation.mouseUp());
        window.addEventListener("touchstart", (event) => touchStartHandler(simulation, mousePosition, event));
        window.addEventListener("touchmove", (event) => touchMoveHandler(mousePosition, event));
        window.addEventListener("touchend", (event) => touchEndHandler(simulation, mousePosition, event));
        document.body.removeChild(loadingBox);
        screenCanvas.width = drawCanvas.width = window.innerWidth;
        screenCanvas.height = drawCanvas.height = window.innerHeight;
        runSimulation(screenCanvas, simulation);
    });
}
window.addEventListener("load", function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield main();
        }
        catch (error) {
            console.error(error);
            document.body.appendChild(jsErrorMessageBox);
        }
    });
});
