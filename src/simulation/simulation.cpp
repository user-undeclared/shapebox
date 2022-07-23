#include "platform.hpp"
#include "structs/color.hpp"
#include "structs/shapes.hpp"
#include "simulation.hpp"

#define MAX_SQUARES 16

unsigned screenWidth;
unsigned screenHeight;

const Color clearColor { 0x00, 0x00, 0x00, 0xff };
const float gravity = 32.0f;
const unsigned squareSize = 32;

int lastSquare;

Square squareBuffer[MAX_SQUARES];
int addSquare(Vec2<float> position, float size, Color color) {
	for(unsigned index = 0; index < MAX_SQUARES; index++) {
		Square& square = squareBuffer[index];
		if(square.active) continue;
		
		Square newSquare(position, size, color);
		newSquare.active = true;
		squareBuffer[index] = newSquare;
		return index;
	}

	return -1;
}

extern "C" namespace simulation {
	void start(unsigned width, unsigned height) {
		screenWidth = width;
		screenHeight = height;
	}

	void mouseDown(int mouseX, int mouseY) {
		for(unsigned index = 0; index < MAX_SQUARES; index++) {
			Square& square = squareBuffer[index];
			if(square.collides(mouseX, mouseY)) {
				square.released = false;
				lastSquare = index;
				return;
			}
		}

		lastSquare = addSquare(Vec2<float>(mouseX, mouseY) - squareSize / 2, squareSize, Color { 0xff, 0x00, 0x00, 0xff });
	}

	void mouseUp(void) {
		if(lastSquare < 0) return;
		Square& square = squareBuffer[lastSquare];
		square.released = true;
		square.velocity = square.velocity + ((square.position - square.pastPosition) * 32.0f);
	}

	void update(float deltaTime) {
		for(unsigned index = 0; index < MAX_SQUARES; index++) {
			Square& square = squareBuffer[index];
			if(!square.active) continue;

			unsigned maxX = screenWidth - square.size;
			unsigned maxY = screenHeight - square.size;

			if(!square.released) {
				Vec2<float> position = Vec2<float>(platform::mouseX(), platform::mouseY()) - square.size / 2;
				square.setPosition(position.clamp(Vec2<float>(0, 0), Vec2<float>(maxX, maxY)));
				continue;
			}

			square.velocity.y += gravity;
			square.setPosition(square.position + (square.velocity * deltaTime));

			if(square.y() > screenHeight) {
				square.active = false;
				continue;
			}

			if(square.y() < 0) {
				square.velocity.y = 0;
				square.setY(0);
				square.velocity.x -= square.velocity.x / 4;
			}

			if(square.x() > maxX) {
				square.velocity.x = 0;
				square.setX(maxX);
				square.velocity.y -= square.velocity.y / 4;
			}

			if(square.x() < 0) {
				square.velocity.x = 0;
				square.setX(0);
				square.velocity.y -= square.velocity.y / 4;
			}
		}	
	}

	void render(void) {
		platform::setDrawColor(EXPAND_COLOR(clearColor));
		platform::clear();

		for(unsigned index = 0; index < MAX_SQUARES; index++) {
			Square& square = squareBuffer[index];
			platform::setDrawColor(EXPAND_COLOR(square.color));
			platform::fillRect(square.position.x, square.position.y, square.size, square.size);
		}

		platform::renderAll();
	}
}
