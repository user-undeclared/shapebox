#ifndef _PLATFORM_HPP
#define _PLATFORM_HPP

typedef unsigned char uint8;

extern "C" namespace platform {
	void setDrawColor(uint8 red, uint8 green, uint8 blue, uint8 alpha);
	void fillRect(int x, int y, int width, int height);
	void clear(void);
	void renderAll(void);

	int mouseX(void);
	int mouseY(void);
}

#endif
