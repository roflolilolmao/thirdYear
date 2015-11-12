var sol;
var mercury;
var venus;
var earth;
var mars;
var jupiter;
var saturn;
var uranus;
var neptune;

var planets = [];
var solarSystem;

var pause = true;
var orbitBool = false;
var translateZ = -2.0;
var vertexBuffer = null;
var indexBuffer = null;
var colorBuffer = null;
var indices = [];
var vertices = [];
var colors = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
mat4.identity(mvMatrix);
mat4.identity(pMatrix);
window.onkeydown = function(e) {
	switch(e.keyCode){
		case 87:
			//w
			translateZ += 0.1;
			break;
		case 83:
			//s
			translateZ -= 0.1;
			break;
		default:
	}
};
function initShaderParameters(prg){
	prg.vertexPositionAttribute = glContext.getAttribLocation(prg, "aVertexPosition");
	glContext.enableVertexAttribArray(prg.vertexPositionAttribute);
	prg.colorAttribute = glContext.getAttribLocation(prg, "aColor");
	glContext.enableVertexAttribArray(prg.colorAttribute);
	prg.pMatrixUniform = glContext.getUniformLocation(prg, 'uPMatrix');
	prg.mvMatrixUniform = glContext.getUniformLocation(prg, 'uMVMatrix');
	prg.fmode = glContext.getUniformLocation(prg, 'fmode');
	prg.vmode = glContext.getUniformLocation(prg, 'vmode');
	prg.radius = glContext.getUniformLocation(prg, 'radius');
	prg.center = glContext.getUniformLocation(prg, 'center');
}
function initBuffers()
{
}
function initScene(){
	sol = createPlanet(1988500, 0, 0, 0.02, [1, 1, 1], 0, glContext);
	mercury = createPlanet(0.3301, 38.86, 69.82, 0.01, [0.4, 0.4, 0.4], 10, glContext);
	venus = createPlanet(4.8676, 34.79, 108.94, 0.015, [0.9, 0.9, 0.7], 20, glContext);
	earth = createPlanet(5.9726, 29.29, 152.10, 0.02, [0.3, 0.5, 1.0], 30, glContext);
	mars = createPlanet(0.64174, 21.97, 249.23, 0.01, [1.0, 0.0, 0.0], 40, glContext);
	jupiter = createPlanet(1898.3, 12.44, 816.62, 0.08, [1.0, 0.5, 0.0], 80, glContext);
	saturn = createPlanet(568.36, 9.09, 1514.50, 0.06, [1.0, 1.0, 0.7], 200, glContext);
	uranus = createPlanet(86.816, 6.49, 3003.62, 0.05, [0.0, 1.0, 1.0], 550, glContext);
	neptune = createPlanet(102.42, 5.37, 4545.67, 0.05, [0.0, 0.0, 1.0], 1100, glContext); planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
	solarSystem = new System(sol, planets, glContext);
	
	// sources
	// http://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html
	// http://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html
	// http://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
	// http://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
	// http://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html
	// http://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html
	// http://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html
	// http://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html
	// http://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html
	
	planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
	solarSystem = new System(sol, planets);
}
function drawSystem()
{
	solarSystem.drawBodies();
	glContext.uniform1i(prg.fmode, 0);
	glContext.uniform1i(prg.vmode, 0);
	if(orbitBool)solarSystem.drawOrbitBodies();
}
function drawScene(){
	glContext.clearColor(0.0, 0.0, 0.0, 1.0);
	// glContext.enable(glContext.DEPTH_TEST);
	
	glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE_MINUS_SRC_ALPHA);
	glContext.enable(glContext.BLEND);
	glContext.disable(glContext.DEPTH_TEST);
	
	glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
	
	glContext.viewport(0, 0, c_width, c_height);
	mat4.perspective(pMatrix, degToRad(60.0), c_width / c_height, 0.1, 10000.0);
	translationMat = mat4.create();
	mat4.identity(translationMat);
	mat4.translate(translationMat, translationMat, [0.0, 0.0, translateZ]);
	
	rotateModelViewMatrixUsingQuaternion();
	glContext.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
	mvtMatrix = mat4.create();
	glContext.uniformMatrix4fv(prg.mvMatrixUniform, false, mat4.multiply(mvtMatrix, translationMat, mvMatrix));
	rotX = 0;
	rotY = 0;
	
	if (!pause) solarSystem.updateBodies();
	
	drawSystem();
}
function initWebGL(){
	glContext = getGLContext('webgl-canvas');
	initProgram();
	initBuffers();
	initScene();
	renderLoop();
}
function pauseBoolF()
{
	pause = !pause;
}
function orbitBoolF()
{
	orbitBool = !orbitBool;
}