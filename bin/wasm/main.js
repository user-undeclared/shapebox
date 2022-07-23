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
const noWasmErrorMessage = "Your browser does not support\n" +
    "WebAssembly, which is needed\n" +
    "to run this program. Sorry :(";
const jsErrorMessage = "Something broke within the\n" +
    "internal code of this webpage.\n" +
    "Please let me know";
const loadingMessage = "Loading the program...";
function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
function showMessageBox(message) {
    const messageBox = document.createElement("div");
    messageBox.className = "error-box";
    messageBox.innerText = message;
    document.body.appendChild(messageBox);
    return messageBox;
}
function runSimulation(target, simulation) {
    const context = target.getContext("2d");
    let startTime;
    context;
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
            showMessageBox(noWasmErrorMessage);
            jsErrorMessage;
            return;
        }
        const loadingMessageBox = showMessageBox(loadingMessage);
        const wasmModule = fetch(WASM_FILENAME);
        const drawCanvas = document.createElement("canvas");
        const screenCanvas = document.getElementById("screen");
        const drawContext = drawCanvas.getContext("2d");
        const screenContext = screenCanvas.getContext("2d");
        const mousePosition = { x: 0, y: 0 };
        if (drawContext === null || screenContext === null)
            throw new Error("getting canvas contexts returned null");
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
        function windowResize() {
            resizeCanvas(drawCanvas);
            resizeCanvas(screenCanvas);
        }
        function averageMousePosition(event) {
            const sum = { x: 0, y: 0 };
            for (const touch of event.targetTouches) {
                sum.x += touch.clientX;
                sum.y += touch.clientY;
            }
            mousePosition.x = sum.x / event.targetTouches.length,
                mousePosition.y = sum.y / event.targetTouches.length;
        }
        window.addEventListener("resize", windowResize);
        window.addEventListener("mousemove", function (event) {
            mousePosition.x = event.clientX;
            mousePosition.y = event.clientY;
        });
        window.addEventListener("mousedown", function (event) {
            simulation.mouseDown(event.clientX, event.clientY);
        });
        window.addEventListener("mouseup", simulation.mouseUp);
        window.addEventListener("touchstart", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.targetTouches.length == 1) {
                const touch = event.targetTouches[0];
                simulation.mouseDown(touch.clientX, touch.clientY);
            }
            else {
                averageMousePosition(event);
            }
        });
        window.addEventListener("touchmove", function (event) {
            event.preventDefault();
            event.stopPropagation();
            averageMousePosition(event);
        });
        window.addEventListener("touchend", function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.targetTouches.length == 0) {
                simulation.mouseUp();
            }
            else {
                averageMousePosition(event);
            }
        });
        document.body.removeChild(loadingMessageBox);
        windowResize();
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
            showMessageBox(jsErrorMessage);
        }
    });
});
