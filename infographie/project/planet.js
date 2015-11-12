var deltaT = 24 * 60 * 10;
// var deltaT = 1;
var ASTRONOMICAL_UNIT = 149597870700;
var G = 6.67e-11;
// var G = 1;
var  VISUAL_FACTOR = 10;
var MASS_FACTOR = 1e24 / ASTRONOMICAL_UNIT / ASTRONOMICAL_UNIT;
var POSITION_FACTOR = 1e9 / ASTRONOMICAL_UNIT;
var SPEED_FACTOR = 1 / ASTRONOMICAL_UNIT;
function Planet(mass, speed, pos, radius, color, orbitFactor, context)
{
	this.context = context;
	this.radius = radius;
	this.mass = mass;
	this.speed = speed;
	this.color = color;
	this.pos = pos;
	this.orbitFactor = orbitFactor;
}
Planet.prototype.update = function(mainBody)
{
	var a = vec3.create(); // acceleration vector
	var d = vec3.create(); // direction vector
	vec3.subtract(d, mainBody.pos, this.pos);
	var dist = vec3.dist(mainBody.pos, this.pos);
	vec3.scale(a, d, mainBody.mass / (dist * dist * dist) * deltaT); // dist ^ 3 for normalization
	
	vec3.add(this.speed, this.speed, a);
	var deltaPos = vec3.create();
	vec3.scale(deltaPos, this.speed, SPEED_FACTOR * deltaT);
	vec3.add(this.pos, this.pos, deltaPos);
	if(this.mass == earth.mass)
	{
		console.clear();
		console.log('pos',this.pos);
		console.log('speed',this.speed);
	}
}
Planet.prototype.draw = function()
{
	vertices = [];
	indices = [];
	colors = [];
	
	var c = [this.pos[0] / VISUAL_FACTOR, this.pos[1] / VISUAL_FACTOR, this.pos[2] / VISUAL_FACTOR];
	var radius = this.radius;
	vertices.push(
		c[0] + radius,
		c[1] + radius,
		c[2]
	);
	vertices.push(
		c[0] - radius,
		c[1] + radius,
		c[2]
	);
	vertices.push(
		c[0] + radius,
		c[1] - radius,
		c[2]
	);
	vertices.push(
		c[0] - radius,
		c[1] - radius,
		c[2]
	);
	colors.push(this.color[0], this.color[1], this.color[2], 1.0);
	colors.push(this.color[0], this.color[1], this.color[2], 1.0);
	colors.push(this.color[0], this.color[1], this.color[2], 1.0);
	colors.push(this.color[0], this.color[1], this.color[2], 1.0);
	indices.push(0, 1, 2, 3);
	
	if(this.mass == sol.mass)
	{
		this.context.uniform1i(prg.fmode, 2);
		this.context.uniform1i(prg.vmode, 2);
	}
	else
	{
		this.context.uniform1i(prg.fmode, 1);
		this.context.uniform1i(prg.vmode, 1);
	}
		
	this.context.uniform1f(prg.radius, radius);
	this.context.uniform3f(prg.center, c[0], c[1], 0.0);
	
	vertexBuffer = getVertexBufferWithVertices(vertices);
	indexBuffer = getIndexBufferWithIndices(indices);
	colorBuffer = getVertexBufferWithVertices(colors);
	this.context.bindBuffer(this.context.ARRAY_BUFFER, vertexBuffer);
	this.context.vertexAttribPointer(prg.vertexPositionAttribute, 3, this.context.FLOAT, false, 0, 0);
	this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
	this.context.vertexAttribPointer(prg.colorAttribute, 4, this.context.FLOAT, false, 0, 0);
	this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexBuffer);
	this.context.drawElements(this.context.TRIANGLE_STRIP, indices.length, this.context.UNSIGNED_SHORT,0);
}
Planet.prototype.drawOrbit = function(mainBody)
{
	vertices = [];
	indices = [];
	colors = [];
	
	vertices.push(this.pos[0] / VISUAL_FACTOR, this.pos[1] / VISUAL_FACTOR, this.pos[2] / VISUAL_FACTOR);
	indices.push(indices.length);
	colors.push(this.color[0], this.color[1], this.color[2], 1.0);
	
	var s = vec3.create();
	var p = vec3.create();
	vec3.copy(s, this.speed);
	vec3.copy(p, this.pos);
	for(var j = 0; j < 50; j++)
	{
		var a = vec3.create();
		var d = vec3.create(); // direction vector
		vec3.subtract(d, mainBody.pos, p);
		var dist = vec3.dist(mainBody.pos, p);
		vec3.scale(a, d, mainBody.mass / (dist * dist * dist)); // dist ^ 3 for normalization
		vec3.add(s, s, a);
		var deltaPos = vec3.create();
		vec3.scale(deltaPos, s, SPEED_FACTOR * this.orbitFactor * deltaT);
		vec3.add(p, p, deltaPos);
		
		vertices.push(p[0] / VISUAL_FACTOR, p[1] / VISUAL_FACTOR, p[2] / VISUAL_FACTOR);
		indices.push(indices.length);
		colors.push(this.color[0], this.color[1], this.color[2], 1.0);
	}

	vertexBuffer = getVertexBufferWithVertices(vertices);
	indexBuffer = getIndexBufferWithIndices(indices);
	colorBuffer = getVertexBufferWithVertices(colors);
	
	this.context.bindBuffer(this.context.ARRAY_BUFFER, vertexBuffer);
	this.context.vertexAttribPointer(prg.vertexPositionAttribute, 3, this.context.FLOAT, false, 0, 0);
	this.context.bindBuffer(this.context.ARRAY_BUFFER, colorBuffer);
	this.context.vertexAttribPointer(prg.colorAttribute, 4, this.context.FLOAT, false, 0, 0);
	this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, indexBuffer);
	this.context.drawElements(this.context.LINE_STRIP, indices.length, this.context.UNSIGNED_SHORT,0);
}

function System(mainBody, bodies)
{
	this.mainBody = mainBody;
	this.bodies = bodies;
	this.mass = 0;
	for (i in bodies)
	{
		this.mass += bodies[i].mass;
	}
	this.speed = mainBody.speed;
	this.pos = mainBody.pos;
	this.orbitFactor = mainBody.orbitFactor;
}
System.prototype = Planet.prototype;
System.prototype.constructor = System;
System.prototype.updateBodies = function ()
{
	for(i in this.bodies)
	{
		this.bodies[i].update(this.mainBody);
	}
}
System.prototype.drawBodies = function ()
{
	this.mainBody.draw();
	for(i in this.bodies)
	{
		this.bodies[i].draw();
	}
}
System.prototype.drawOrbitBodies = function ()
{
	for(i in this.bodies)
	{
		this.bodies[i].drawOrbit(this.mainBody);
	}
}
function createPlanet(mass, speed, position, radius, color, orbitFactor, glContext)
{
	var m = MASS_FACTOR * mass * G;
	var s = speed * 1e3;
	var p = POSITION_FACTOR * position;
	return new Planet(m, [s, 0, 0], [0, p, 0], radius, color, orbitFactor, glContext);
}
