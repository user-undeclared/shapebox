type Simulation = {
	start: (screenWidth: number, screenHeight: number) => void,
	mouseDown: (mouseX: number, mouseY: number) => void,
	mouseUp: () => void,
	update: (deltaTime: number) => void,
	render: () => void
};

const WASM_FILENAME = "bin/wasm/shapebox.wasm";

const noWasmErrorMessage = 
	"Your browser does not support\n" +
	"WebAssembly, which is needed\n" + 
	"to run this program. Sorry :(";
const jsErrorMessage =
	"Something broke within the\n" + 
	"internal code of this webpage.\n" + 
	"Please let me know";
const loadingMessage =
	"Loading the program...";

function resizeCanvas(canvas: HTMLCanvasElement): void {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function showMessageBox(message: string): HTMLDivElement {
	const messageBox = document.createElement("div");
	messageBox.className = "error-box";
	messageBox.innerText = message;
	document.body.appendChild(messageBox);
	return messageBox;
}

function runSimulation(target: HTMLCanvasElement, simulation: Simulation): void {
	const context = target.getContext("2d");
	let startTime: number;
	context;

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
		showMessageBox(noWasmErrorMessage);
		jsErrorMessage;
		return;
	}

	const loadingMessageBox = showMessageBox(loadingMessage);

	const wasmModule = fetch(WASM_FILENAME);
	const drawCanvas = document.createElement("canvas");
	const screenCanvas = document.getElementById("screen") as HTMLCanvasElement;
	const drawContext = drawCanvas.getContext("2d");
	const screenContext = screenCanvas.getContext("2d");
	const mousePosition = { x: 0, y: 0 };

	if(drawContext === null || screenContext === null)
		throw new Error("getting canvas contexts returned null");

	const wasmImports = {
		env: {
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
	}

	const wasmInstance = await WebAssembly.instantiateStreaming(await wasmModule, wasmImports);
	const simulation = wasmInstance.instance.exports as Simulation;

	function windowResize() {
		resizeCanvas(drawCanvas);
		resizeCanvas(screenCanvas); 
	}

	function averageMousePosition(event: TouchEvent) {
		const sum = { x: 0, y: 0 };
		for(const touch of event.targetTouches) {
			sum.x += touch.clientX;
			sum.y += touch.clientY;
		}
		mousePosition.x = sum.x / event.targetTouches.length,
		mousePosition.y = sum.y / event.targetTouches.length
	}

	window.addEventListener("resize", windowResize);
	window.addEventListener("mousemove", function(event: MouseEvent) {
		mousePosition.x = event.clientX;
		mousePosition.y = event.clientY;
	});
	window.addEventListener("mousedown", function(event: MouseEvent) {
		simulation.mouseDown(event.clientX, event.clientY);
	});
	window.addEventListener("mouseup", simulation.mouseUp);
	window.addEventListener("touchstart", function(event: TouchEvent) {
		event.preventDefault();
		event.stopPropagation();
		if(event.targetTouches.length == 1) {
			const touch = event.targetTouches[0]!;
			simulation.mouseDown(touch.clientX, touch.clientY);
		}
		else {
			averageMousePosition(event);
		}

	});
	window.addEventListener("touchmove", function(event: TouchEvent) {
		event.preventDefault();
		event.stopPropagation();
		averageMousePosition(event);
	});
	window.addEventListener("touchend", function(event: TouchEvent) {
		event.preventDefault();
		event.stopPropagation();
		if(event.targetTouches.length == 0) {
			simulation.mouseUp();
		}
		else {
			averageMousePosition(event);
		}
	});

	document.body.removeChild(loadingMessageBox);
	windowResize();
	runSimulation(screenCanvas, simulation);
}

window.addEventListener("load", async function() {
	try {
		await main();
	}
	catch(error) {
		console.error(error);
		showMessageBox(jsErrorMessage);
	}
});
