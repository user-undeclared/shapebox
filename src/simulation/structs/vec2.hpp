#ifndef _VEC2_HPP
#define _VEC2_HPP

template <typename T>
class Vec2 {
private:
	static T clamp(T value, T low, T high) {
		if(value < low) return low;
		if(value > high) return high;
		return value;
	}

public:
	T x;
	T y;

	Vec2(void) = default;
	Vec2(T x, T y) : x(x), y(y) {}

	Vec2 operator+(T value) {
		return Vec2(this->x + value, this->y + value);
	}
	Vec2 operator-(T value) {
		return Vec2(this->x - value, this->y - value);
	}
	Vec2 operator*(T value) {
		return Vec2(this->x * value, this->y * value);
	}
	Vec2 operator/(T value) {
		return Vec2(this->x / value, this->y / value);
	}

	Vec2 operator+(Vec2 value) {
		return Vec2(this->x + value.x, this->y + value.y);
	}
	Vec2 operator-(Vec2 value) {
		return Vec2(this->x - value.x, this->y - value.y);
	}
	Vec2 operator*(Vec2 value) {
		return Vec2(this->x * value.x, this->y * value.y);
	}
	Vec2 operator/(Vec2 value) {
		return Vec2(this->x / value.x, this->y / value.y);
	}

	Vec2 clamp(Vec2 low, Vec2 high) {
		return Vec2(
			clamp(this->x, low.x, high.x),
			clamp(this->y, low.y, high.y)
		);
	}
};

#endif
