#include "platform.hpp"
#include "structs/color.hpp"
#include "structs/shapes.hpp"
#include "clamp.hpp"
#include "simulation.hpp"

#define MAX_SQUARES 16
#define SQUARE_SIZE 32
#define GRAVITY 32.0f
#define WALL_FRICTION 4

Square squareBuffer[MAX_SQUARES];
const Color clearColor { 0x00, 0x00, 0x00, 0xff };

unsigned screenWidth;
unsigned screenHeight;
int lastSquare;

int addSquare(Vec2<float> position, float size, Color color) {
	for(unsigned squareIndex = 0; squareIndex < MAX_SQUARES; squareIndex++) {
		Square& square = squareBuffer[squareIndex];
		if(square.active) continue;
		
		Square newSquare(position, size, color);
		newSquare.active = true;
		squareBuffer[squareIndex] = newSquare;
		return squareIndex;
	}

	return -1;
}

extern "C" namespace simulation {
	void start(unsigned width, unsigned height) {
		screenWidth = width;
		screenHeight = height;
	}

	void update(float deltaTime) {
		for(unsigned squareIndex = 0; squareIndex < MAX_SQUARES; squareIndex++) {
			Square& square = squareBuffer[squareIndex];
			if(!square.active) continue;

			unsigned maxX = screenWidth - square.size;
			unsigned maxY = screenHeight - square.size;

			if(!square.released) {
				Vec2<float> position = Vec2<float>(platform::mouseX(), platform::mouseY()) - square.size / 2;
				square.movePosition(position.clamp(Vec2<float>(0, 0), Vec2<float>(maxX, maxY)));
				continue;
			}

			square.velocity.y += GRAVITY;
			square.movePosition(square.position + (square.velocity * deltaTime));

			if(square.position.y > screenHeight) {
				square.active = false;
				// hide the square offscreen in the top-left corner
				square.position = Vec2<float>(-square.size, -square.size);
				continue;
			}

			if(square.position.y < 0) {
				square.velocity.y = 0;
				square.position.y = 0;
				square.velocity.x -= square.velocity.x / WALL_FRICTION;
			}

			if(square.position.x > maxX || square.position.x < 0) {
				square.velocity.x = 0;
				square.velocity.y -= square.velocity.y / WALL_FRICTION;
				square.position.x = clamp<float>(square.position.x, 0, maxX);
			}
		}	
	}

	void render(void) {
		platform::setDrawColor(EXPAND_COLOR(clearColor));
		platform::clear();

		for(unsigned squareIndex = 0; squareIndex < MAX_SQUARES; squareIndex++) {
			Square& square = squareBuffer[squareIndex];
			platform::setDrawColor(EXPAND_COLOR(square.color));
			platform::fillRect(square.position.x, square.position.y, square.size, square.size);
		}

		platform::renderAll();
	}

	void mouseDown(int mouseX, int mouseY) {
		for(unsigned squareIndex = 0; squareIndex < MAX_SQUARES; squareIndex++) {
			Square& square = squareBuffer[squareIndex];
			if(square.collides(mouseX, mouseY)) {
				square.released = false;
				lastSquare = squareIndex;
				return;
			}
		}

		lastSquare = addSquare(Vec2<float>(mouseX, mouseY) - SQUARE_SIZE / 2, SQUARE_SIZE, Color { 0xff, 0x00, 0x00, 0xff });
	}

	void mouseUp(void) {
		if(lastSquare < 0) return;
		Square& square = squareBuffer[lastSquare];
		square.released = true;
		square.velocity = square.velocity + ((square.position - square.pastPosition) * 32.0f);
	}

	void resize(unsigned newWidth, unsigned newHeight) {
		screenWidth = newWidth;
		screenHeight = newHeight;
	}
}
