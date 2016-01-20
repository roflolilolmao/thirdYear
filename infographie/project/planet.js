var deltaT = 24 * 60 * 10;
var ASTRONOMICAL_UNIT = 149597870700;
var G = 6.67e-11;
var distanceFactor = 10;
var visualFactor = 1;
var MASS_FACTOR = 1e24 / ASTRONOMICAL_UNIT / ASTRONOMICAL_UNIT;
var POSITION_FACTOR = 1e9 / ASTRONOMICAL_UNIT;
var SPEED_FACTOR = 1 / ASTRONOMICAL_UNIT;

function Planet(name, mass, speed, pos, radius, inclination, deltaRot, deltaRotAtmo, texTab, boolNormal, boolHalo, boolAtmo)
{
    this.name = name;
    this.radius = radius;
    this.mass = mass;
    this.speed = speed;
    this.pos = pos;
    this.inclination = inclination;
    this.rotation = 0;
    this.rotationAtmo = 0;
    this.deltaRot = deltaRot;
    this.deltaRotAtmo = deltaRotAtmo;
    this.texTab = texTab;
    this.boolNormal = boolNormal;
    this.boolHalo = boolHalo;
    this.boolAtmo = boolAtmo;
}
Planet.prototype.update = function(mainBody)
{
    this.updateRevolution(mainBody);
    this.updateRotation();
}
Planet.prototype.updateRevolution = function(mainBody)
{
    newtonGravitation(mainBody, this);
}
Planet.prototype.updateRotation = function()
{
    this.rotation += this.deltaRot + 1;
    this.rotationAtmo += this.deltaRotAtmo + 1;
    this.rotation %= 1;
    this.rotationAtmo %= 1;
}
Planet.prototype.draw = function(mainBodyPos)
{
    var c = [
        (this.pos[0] + mainBodyPos[0]) / distanceFactor,
        (this.pos[1] + mainBodyPos[1]) / distanceFactor,
        (this.pos[2] + mainBodyPos[2]) / distanceFactor
    ];
    glContext.uniform1f(prg.radius, this.radius / visualFactor);
    glContext.uniform1f(prg.rotation, this.rotation);
    glContext.uniform1f(prg.inclination, this.inclination);
    glContext.uniform1f(prg.rotationAtmo, this.rotationAtmo);
    glContext.uniform3f(prg.center, c[0], c[1], c[2]);
    
    glContext.uniform1i(prg.atmo, this.boolAtmo);
    glContext.uniform1i(prg.normal, this.boolNormal);
    glContext.uniform1i(prg.halo, this.boolHalo);
    
    glContext.uniform1i(prg.fmode, 1);
    if(this.mass == sol.mass)
        glContext.uniform1i(prg.fmode, 0);
    if(this.mass == earth.mass)
        glContext.uniform1i(prg.fmode, 2);
    
    glContext.activeTexture(glContext.TEXTURE0);
    glContext.bindTexture(glContext.TEXTURE_2D, this.texTab.main);
    glContext.uniform1i(prg.colorTextureUniform, 0);
    if(this.texTab.normal != null)
    {
        glContext.activeTexture(glContext.TEXTURE1);
        glContext.bindTexture(glContext.TEXTURE_2D, this.texTab.normal);
        glContext.uniform1i(prg.normalTextureUniform, 1);
    }
    if(this.texTab.atmo != null)
    {
        glContext.activeTexture(glContext.TEXTURE2);
        glContext.bindTexture(glContext.TEXTURE_2D, this.texTab.atmo);
        glContext.uniform1i(prg.atmosphere, 2);
    }
    if(this.name == 'Earth')
    {
        glContext.activeTexture(glContext.TEXTURE3);
        glContext.bindTexture(glContext.TEXTURE_2D, this.texTab.night);
        glContext.uniform1i(prg.earthNight, 3);
        glContext.activeTexture(glContext.TEXTURE4);
        glContext.bindTexture(glContext.TEXTURE_2D, this.texTab.spec);
        glContext.uniform1i(prg.specularTextureUniform, 4);
        glContext.activeTexture(glContext.TEXTURE5);
        glContext.bindTexture(glContext.TEXTURE_2D, this.texTab.atmoNormal);
        glContext.uniform1i(prg.atmosphereNormals, 5);
    }
    
    glContext.drawElements(glContext.TRIANGLES, indicesArray[0].length, glContext.UNSIGNED_SHORT,0);
}
// Planet.prototype.drawOrbit = function(mainBody)
// {
    // var s = vec3.create();
    // var p = vec3.create();
    // vec3.copy(s, this.speed);
    // vec3.copy(p, this.pos);
    // for(var j = 0; j < 50; j++)
    // {
        // var a = vec3.create();
        // var d = vec3.create(); // direction vector
        // vec3.subtract(d, mainBody.pos, p);
        // var dist = vec3.dist(mainBody.pos, p);
        // vec3.scale(a, d, mainBody.mass / (dist * dist * dist)); // dist ^ 3 for normalization
        // vec3.add(s, s, a);
        // var deltaPos = vec3.create();
        // vec3.scale(deltaPos, s, SPEED_FACTOR * this.orbitFactor * deltaT);
        // vec3.add(p, p, deltaPos);
    // }
    
    // glContext.drawElements(glContext.LINE_STRIP, indices.length, glContext.UNSIGNED_SHORT,0);
// }

function System(orbitBody, bodies, mainBody)
{
    this.name = orbitBody.name;
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
    this.orbitBody.updateRotation();
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
function createPlanet(name, mass, speed, position, radius, inclination, deltaRot, deltaRotAtmo, texTab, boolNormal, boolHalo, boolAtmo)
{
    var m = MASS_FACTOR * mass * G;
    var s = -speed * 1e3;
    var p = POSITION_FACTOR * position;
    return new Planet(name, m, [s, 0, 0], [0, p, 0], radius, inclination, deltaRot, deltaRotAtmo, texTab, boolNormal, boolHalo, boolAtmo);
}
