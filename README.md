### ShapeBox

A simple game-like program made to experiment with some concepts I haven't tried before, mainly the seperation of program logic and rendering code. This allows the same application to be compiled to multiple platforms, due to all rendering calls, input calls, and other such calls being defined in an API that is then implemented on a per-platform basis.

### Supported targets

As of now, there are implemtations for both a native version based on [SDL2](https://www.libsdl.org/), and a web version through [WebAssembly](https://webassembly.org/) and [HTML5](https://developer.mozilla.org/en-US/docs/Glossary/HTML5/) + [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/)

### Building

# Native

Building the native version requires these tools:
* clang
* wasm-ld
* make

...and these libraries:
* SDL2

An unoptimized version of the native program can be built my running `make debug` from the command-line. For an optimized version of the program, run `make release`

# Web

As this repository will host the on-line version of the application, the web version is already build and can be found under [bin/wasm/](bin/wasm/)

Re-building the web version requires these tools:
* clang
* wasm-ld
* make
* tsc

To re-build it, run `make wasm`
