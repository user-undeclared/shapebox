#include <string>
#include <cstdlib>

#define SDL_MAIN_HANDLED
#include <SDL2/SDL.h>

#include "sdl-state.hpp"
#include "simulation/platform.hpp"
#include "simulation/simulation.hpp"

#define PROGRAM_TITLE "SandBox"
#define WINDOW_WIDTH 512
#define WINDOW_HEIGHT 512

#define EXPAND_RECT(rect) rect.x, rect.y, rect.w, rect.h

SDL_Window* window;
SDL_Renderer* renderer;

inline void showErrorBox(const char* title, const char* message)
{
	SDL_ShowSimpleMessageBox(SDL_MESSAGEBOX_ERROR, title, message, NULL);
}

int initializeSDL(void)
{
	if(SDL_Init(SDL_INIT_VIDEO) != 0) {
		return -1;
	}

	window = SDL_CreateWindow(PROGRAM_TITLE, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, WINDOW_WIDTH, WINDOW_HEIGHT, 0);
	if(window == NULL) {
		SDL_Quit();
		return -1;
	}

	renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_PRESENTVSYNC);
	if(renderer == NULL) {
		SDL_DestroyWindow(window);
		SDL_Quit();
		return -1;
	}

	return 0;
}

void terminateSDL(void)
{
	SDL_DestroyRenderer(renderer);
	SDL_DestroyWindow(window);
	SDL_Quit();
}

int main(void)
{
	if(initializeSDL() < 0)
	{
		std::string errorMessage("Failed to initialize SDL:\n");
		errorMessage.operator+=(SDL_GetError());
		showErrorBox("INITIALIZATION ERROR", errorMessage.c_str());
		return 1;
	}

	simulation::start(WINDOW_WIDTH, WINDOW_HEIGHT);

	SDL_Event event;
	Uint64 startTime = SDL_GetTicks64();

	while(true)
	{
		while(SDL_PollEvent(&event) != 0)
		{
			switch(event.type)
			{
			case SDL_QUIT: goto exit;

			case SDL_KEYDOWN: {
				const SDL_Keysym& key = event.key.keysym;
				if(key.sym == SDLK_q && key.mod & KMOD_CTRL)
					goto exit;
			} break;

			case SDL_MOUSEBUTTONDOWN:
				simulation::mouseDown(event.button.x, event.button.y);
				break;

			case SDL_MOUSEBUTTONUP:
				simulation::mouseUp();
				break;
			}
		}

		Uint64 endTime = SDL_GetTicks64();
		float deltaTime = float(endTime - startTime) / 1000.0f;
		startTime = endTime;

		simulation::update(deltaTime);
		simulation::render();
	}

exit:
	terminateSDL();
	return 0;
}
