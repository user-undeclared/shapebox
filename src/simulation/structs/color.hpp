#ifndef _COLOR_HPP
#define _COLOR_HPP

struct Color {
	unsigned char red;
	unsigned char green;
	unsigned char blue;
	unsigned char alpha;
};

#define EXPAND_COLOR(color) color.red, color.green, color.blue, color.alpha

#endif
