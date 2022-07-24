CXX=clang
CFLAGS=-xc++ -lstdc++ -Wall -Wextra -pedantic -std=c++17 -Isrc/
DEBUG_FLAGS=-ggdb -ftrapv
RELEASE_FLAGS=-Ofast -fomit-frame-pointer -feliminate-unused-debug-symbols -flto -fPIC
WASM_FLAGS=-Os --target=wasm32 -fno-builtin --no-standard-libraries -nostdlib -Wl,--no-entry -Wl,--allow-undefined -Wl,--import-memory -Wl,--export-all

DEBUG_NAME=shapebox-debug
RELEASE_NAME=shapebox

CORE_SRC=$(shell find src/simulation/ -type f -iname "*.c*")
NATIVE_SRC=$(shell find src/native/ -type f -iname "*.c*")
WASM_SRC=src/wasm/**.ts

BIN=bin

.PHONY: all
all: debug wasm release

debug: $(CORE_SRC) $(NATIVE_SRC)
	$(CXX) $(CFLAGS) -o $(BIN)/$(DEBUG_NAME) $^ -lSDL2

wasm: $(CORE_SRC) $(WASM_SRC)
	tsc -p src/wasm/
	$(CXX) $(CFLAGS) $(WASM_FLAGS) -o $(BIN)/$(RELEASE_NAME).wasm $(CORE_SRC)

release: $(CORE_SRC) $(NATIVE_SRC)
	$(CXX) $(CFLAGS) $(RELEASE_FLAGS) -o $(BIN)/$(RELEASE_NAME) $^ -lSDL2
