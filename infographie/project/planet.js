function planet(mass, speed, color, pos)
{
	this.mass = mass;
	this.speed = speed;
	this.color = color;
	this.pos = pos;
	this.update = function (planets)
	{
		var acc = vec3.create();
		for(i in planets)
		{
			if(this.pos.str == i.pos.str)
				continue;
			var dir = vec3();
			vec3.subtract(dir, this.pos, i.pos);
			vec3.normalize(dir, dir);
			var change = vec3.create();
			
			vec3.scale(change, dir, 1.0 * this.mass * i.mass / vec3.squaredDistance(this.pos, i.pos));
			vec3.add(acc, acc, change);
		}
		vec3.add(this.speed, this.speed, acc);
	}
	this.initBuff = function ()
	{
		vertices.push(pos[0], pos[1], pos[2]);
		indices.push(indices.length);
		colors.push(color[0], color[1], color[2], 1.0);
	}
}
function solarSystem(planets)
{
	this.planets = planets;
	this.update = function ()
	{
		for(i in this.planets)
			i.update(this.planets);
	}
	this.initBuff = function ()
	{
		indices = [];
		vertices = [];
		colors = [];
		
		for(i in this.planets)
			i.initBuff();
	}
}
