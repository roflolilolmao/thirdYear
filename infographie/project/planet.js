var deltaT = 24 * 60 * 10;
// var deltaT = 1;
var ASTRONOMICAL_UNIT = 149597870700;
var G = 6.67e-11;
// var G = 1;
var VISUAL_FACTOR = 10;
var MASS_FACTOR = 1e24 / ASTRONOMICAL_UNIT / ASTRONOMICAL_UNIT;
var POSITION_FACTOR = 1e9 / ASTRONOMICAL_UNIT;
var SPEED_FACTOR = 1 / ASTRONOMICAL_UNIT;

function Planet(mass, speed, pos, radius, color, orbitFactor, inclination)
{
	this.radius = radius;
	this.mass = mass;
	this.speed = speed;
	this.color = color;
	this.pos = pos;
	this.orbitFactor = orbitFactor;
    this.inclination = inclination;
}
Planet.prototype.update = function(mainBody)
{
    newtonGravitation(mainBody, this);
}
Planet.prototype.draw = function(mainBodyPos)
{
	if(this.mass == sol.mass)
	{
		glContext.uniform1i(prg.fmode, 2);
		glContext.uniform1i(prg.vmode, 2);
	}
	else
	{
		glContext.uniform1i(prg.fmode, 1);
		glContext.uniform1i(prg.vmode, 1);
	}
	var c = [
		(this.pos[0] + mainBodyPos[0]) / VISUAL_FACTOR,
		(this.pos[1] + mainBodyPos[1]) / VISUAL_FACTOR,
		(this.pos[2] + mainBodyPos[2]) / VISUAL_FACTOR
	];
	glContext.uniform1f(prg.radius, this.radius);
	glContext.uniform3f(prg.center, c[0], c[1], 0.0);
	glContext.uniform3f(prg.colorPlanet, this.color[0], this.color[1], this.color[2]);
    
    glContext.uniform1i(prg.fmode, 1);
    glContext.uniform1f(prg.inclination, this.inclination);
    if(this.mass == sol.mass)
        glContext.uniform1i(prg.fmode, 0);
	
	glContext.drawElements(glContext.TRIANGLES, indicesArray[0].length, glContext.UNSIGNED_SHORT,0);

	//console.log(this.color);
}
Planet.prototype.drawOrbit = function(mainBody)
{
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
		
	}
	
	// glContext.drawElements(glContext.LINE_STRIP, indices.length, glContext.UNSIGNED_SHORT,0);
}

function System(orbitBody, bodies, mainBody)
{
	this.orbitBody = orbitBody;
	this.bodies = bodies;
	this.mainBody = mainBody;
	this.mass = 0;
	for (i in bodies)
	{
		this.mass += bodies[i].mass;
	}
	this.speed = orbitBody.speed;
	this.pos = orbitBody.pos;
	orbitBody.pos = [0, 0, 0];
	this.orbitFactor = orbitBody.orbitFactor;
}
System.prototype = Object.create(Planet.prototype);
System.prototype.constructor = System;
System.prototype.update = function ()
{
	if(this.mainBody != null)
		newtonGravitation(this.mainBody, this);
	for(i in this.bodies)
	{
		this.bodies[i].update(this.orbitBody);
	}
}
System.prototype.draw = function ()
{
	this.orbitBody.draw(this.pos);
	for(i in this.bodies)
	{
		this.bodies[i].draw(this.pos);
	}
}
System.prototype.drawOrbit = function ()
{
	for(i in this.bodies)
	{
		this.bodies[i].drawOrbit(this.orbitBody);
	}
}

function newtonGravitation(mainBody, orbitBody)
{
	var a = vec3.create(); // acceleration vector
	var d = vec3.create(); // direction vector
	vec3.subtract(d, mainBody.pos, orbitBody.pos);
	var dist = vec3.dist(mainBody.pos, orbitBody.pos);
	vec3.scale(a, d, mainBody.mass / (dist * dist * dist) * deltaT); // dist ^ 3 for normalization
	
	vec3.add(orbitBody.speed, orbitBody.speed, a);
	var deltaPos = vec3.create();
	vec3.scale(deltaPos, orbitBody.speed, SPEED_FACTOR * deltaT);
	vec3.add(orbitBody.pos, orbitBody.pos, deltaPos);
}
function createPlanet(mass, speed, position, radius, color, orbitFactor, glContext)
{
	var m = MASS_FACTOR * mass * G;
	var s = speed * 1e3;
	var p = POSITION_FACTOR * position;
	return new Planet(m, [s, 0, 0], [0, p, 0], radius, color, orbitFactor, glContext);
}
