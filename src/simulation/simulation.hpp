#ifndef _SIMULATION_HPP
#define _SIMULATION_HPP

extern "C" namespace simulation {
	void start(unsigned screenWidth, unsigned screenHeight);
	void mouseDown(int mouseX, int mouseY);
	void mouseUp(void);
	void update(float deltaTime);
	void render(void);
}

#endif
