#include <cstdint>
#include "sdl-state.hpp"
#include "simulation/platform.hpp"

typedef unsigned char uint8;

namespace platform {
	void setDrawColor(uint8 red, uint8 green, uint8 blue, uint8 alpha)
	{
		SDL_SetRenderDrawColor(renderer, red, green, blue, alpha);
	}

	void fillRect(int x, int y, int width, int height) 
	{
		SDL_Rect rect { x, y, width, height };
		SDL_RenderFillRect(renderer, &rect);
	}

	void clear(void)
	{
		SDL_RenderClear(renderer);
	}

	void renderAll(void)
	{
		SDL_RenderPresent(renderer);
	}

	int mouseX(void)
	{
		int x;
		SDL_GetMouseState(&x, NULL);
		return x;
	}

	int mouseY(void)
	{
		int y;
		SDL_GetMouseState(NULL, &y);
		return y;
	}
}
