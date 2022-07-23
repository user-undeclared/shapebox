#ifndef _SHAPES_HPP
#define _SHAPES_HPP

#include "vec2.hpp"
#include "color.hpp"

struct Square {
	Vec2<float> position;
	Vec2<float> pastPosition = Vec2<float>(0.0f, 0.0f);
	Vec2<float> velocity = Vec2<float>(0.0f, 0.0f);
	unsigned size;
	bool released = false;
	bool active = false;
	Color color;

	Square(void) = default;
	Square(Vec2<float> position, unsigned size, Color color)
	: position(position), size(size), color(color) {}

	inline bool collides(Vec2<float> coordinate) {
		return (coordinate.x >= this->position.x && coordinate.x < this->position.x + this->size)
		   	&& (coordinate.y >= this->position.y && coordinate.y < this->position.y + this->size);
	}

	inline bool collides(float x, float y) {
		return (x >= this->position.x && x < this->position.x + this->size)
		   	&& (y >= this->position.y && y < this->position.y + this->size);
	}

	inline float y(void) {
		return this->position.y;
	}
	inline float x(void) {
		return this->position.x;
	}

	inline float setX(float x) {
		this->pastPosition.x = this->position.x;
		this->position.x = x;
		return x;
	}
	inline float setY(float y) {
		this->pastPosition.y = this->position.y;
		this->position.y = y;
		return y;
	}
	inline Vec2<float> setPosition(Vec2<float> position) {
		this->pastPosition = this->position;
		this->position = position;
		return position;
	}
};

#endif
