type Simulation = {
	start: (screenWidth: number, screenHeight: number) => void,
	update: (deltaTime: number) => void,
	render: () => void,
	mouseDown: (mouseX: number, mouseY: number) => void,
	mouseUp: () => void,
	resize: (newWidth: number, newHeight: number) => void;
};

type Vec2 = { x: number, y: number };

const WASM_FILENAME = "bin/shapebox.wasm";

const noWasmMessageBox = createMessageBox(
	"Your browser does not support\n" +
	"WebAssembly, which is needed\n" + 
	"to run this program. Sorry :("
);
const jsErrorMessageBox = createMessageBox(
	"Something broke within the\n" + 
	"internal code of this webpage.\n" + 
	"Please let me know"
);
const loadingBox = createMessageBox(
	"Loading the program..."
);

function createMessageBox(message: string): HTMLDivElement {
	const messageBox = document.createElement("div");
	messageBox.className = "error-box";
	messageBox.innerText = message;
	return messageBox;
}

function resizeSimulation(simulation: Simulation, screenCanvas: HTMLCanvasElement, drawCanvas: HTMLCanvasElement) {
	const newWidth = window.innerWidth;
	const newHeight = window.innerHeight;
	screenCanvas.width = drawCanvas.width = newWidth;
	screenCanvas.height = drawCanvas.height = newHeight;
	simulation.resize(newWidth, newHeight);
}

function setPositionToEventTarget(position: Vec2, event: MouseEvent) {
	position.x = event.clientX;
	position.y = event.clientY;
}

function setToAverageTouchPosition(position: Vec2, event: TouchEvent) {
	const sum = { x: 0, y: 0 };
	for(const touch of event.targetTouches) {
		sum.x += touch.clientX;
		sum.y += touch.clientY;
	}
	position.x = sum.x / event.targetTouches.length,
	position.y = sum.y / event.targetTouches.length
}

function touchStartHandler(simulation: Simulation, mousePosition: Vec2, event: TouchEvent) {
	event.preventDefault();
	event.stopPropagation();
	if(event.targetTouches.length == 1) {
		const touch = event.targetTouches[0]!;
		simulation.mouseDown(touch.clientX, touch.clientY);
	}
	else {
		setToAverageTouchPosition(mousePosition, event);
	}
}

function touchMoveHandler(mousePosition: Vec2, event: TouchEvent) {
	event.preventDefault();
	event.stopPropagation();
	setToAverageTouchPosition(mousePosition, event);
}

function touchEndHandler(simulation: Simulation, mousePosition: Vec2, event: TouchEvent) {
	event.preventDefault();
	event.stopPropagation();
	if(event.targetTouches.length == 0) {
		simulation.mouseUp();
	}
	else {
		setToAverageTouchPosition(mousePosition, event);
	}
}

function runSimulation(target: HTMLCanvasElement, simulation: Simulation): void {
	let startTime: number;
	simulation.start(target.width, target.height);
	window.requestAnimationFrame(firstFrame);

	function firstFrame(timestamp: number) {
		startTime = timestamp;
		window.requestAnimationFrame(renderLoop);
	}

	function renderLoop(timestamp: number) {
		const deltaTime = (timestamp - startTime) / 1000;
		startTime = timestamp;

		simulation.update(deltaTime);
		simulation.render();

		window.requestAnimationFrame(renderLoop);
	}
}

async function main() {
	if(typeof WebAssembly === "undefined") {
		document.body.appendChild(noWasmMessageBox);
		return;
	}

	document.body.appendChild(loadingBox);

	const wasmModule = fetch(WASM_FILENAME);
	const mousePosition = { x: 0, y: 0 };

	// Two identical canvases and rendering contexts are used to simulate double-buffering,
	// and to make all drawn shapes only show on the screen when platform::renderAll is called
	const screenCanvas = document.getElementById("screen") as HTMLCanvasElement;
	const drawCanvas = document.createElement("canvas");
	const screenContext = screenCanvas.getContext("2d");
	const drawContext = drawCanvas.getContext("2d");

	if(drawContext === null || screenContext === null) {
		document.body.removeChild(loadingBox);
		throw new Error("getting canvas contexts returned null");
	}

	const wasmImports = {
		env: {
			// TODO: figure out the size of this programatically rather than hard-coding it
			memory: new WebAssembly.Memory({ initial: 2 }),
			setDrawColor(red: number, green: number, blue: number, alpha: number): void {
				drawContext.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha / 256})`;
			},
			fillRect(x: number, y: number, width: number, height: number): void {
				drawContext.fillRect(x, y, width, height);
			},
			clear(): void {
				drawContext.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
			},
			renderAll(): void {
				screenContext.drawImage(drawCanvas, 0, 0);
			},
			mouseX(): number {
				return mousePosition.x;
			},
			mouseY(): number {
				return mousePosition.y;
			}
		}
	};

	const wasmInstance = await WebAssembly.instantiateStreaming(await wasmModule, wasmImports);
	const simulation = wasmInstance.instance.exports as Simulation;

	window.addEventListener("resize",     ()                  => resizeSimulation(simulation, screenCanvas, drawCanvas));
	window.addEventListener("mousemove",  (event: MouseEvent) => setPositionToEventTarget(mousePosition, event));
	window.addEventListener("mousedown",  (event: MouseEvent) => simulation.mouseDown(event.clientX, event.clientY));
	window.addEventListener("mouseup",    ()                  => simulation.mouseUp());
	window.addEventListener("touchstart", (event: TouchEvent) => touchStartHandler(simulation, mousePosition, event));
	window.addEventListener("touchmove",  (event: TouchEvent) => touchMoveHandler(mousePosition, event));
	window.addEventListener("touchend",   (event: TouchEvent) => touchEndHandler(simulation, mousePosition, event));

	document.body.removeChild(loadingBox);
	screenCanvas.width = drawCanvas.width = window.innerWidth;
	screenCanvas.height = drawCanvas.height = window.innerHeight;
	runSimulation(screenCanvas, simulation);
}

window.addEventListener("load", async function() {
	try {
		await main();
	}
	catch(error) {
		console.error(error);
		document.body.appendChild(jsErrorMessageBox);
	}
});
