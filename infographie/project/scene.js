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

var earthSystem;
var solarSystem;

var pause = true;
var orbitBool = false;
var translateZ = -2.0;
var vertexBuffer = null;
var indexBuffer = null;
//var colorBuffer = null;
var indices = [];
var vertices = [];
//var colors = [];
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
function initShaderParameters(prg)
{
	prg.vertexPositionAttribute = glContext.getAttribLocation(prg, "aVertexPosition");
	glContext.enableVertexAttribArray(prg.vertexPositionAttribute);
	//prg.colorAttribute = glContext.getAttribLocation(prg, "aColor");
	//glContext.enableVertexAttribArray(prg.colorAttribute);
	prg.pMatrixUniform = glContext.getUniformLocation(prg, 'uPMatrix');
	prg.mvMatrixUniform = glContext.getUniformLocation(prg, 'uMVMatrix');
	prg.fmode = glContext.getUniformLocation(prg, 'fmode');
	prg.vmode = glContext.getUniformLocation(prg, 'vmode');
	prg.radius = glContext.getUniformLocation(prg, 'radius');
	prg.center = glContext.getUniformLocation(prg, 'center');
	prg.colorPlanet = glContext.getUniformLocation(prg, 'uColor');
}
function initBuffers()
{
	vertices = [];
	indices = [];
	colors = [];
	vertices.push(1.0, 1.0, 0.0);
	vertices.push(-1.0, 1.0, 0.0);
	vertices.push(1.0, -1.0, 0.0);
	vertices.push(-1.0, -1.0, 0.0);
	//colors.push(1.0, 1.0, 1.0, 1.0);
	//colors.push(1.0, 1.0, 1.0, 1.0);
	//colors.push(1.0, 1.0, 1.0, 1.0);
	//colors.push(1.0, 1.0, 1.0, 1.0);
	indices.push(0,  1,  2,  3);
	vertexBuffer = getVertexBufferWithVertices(vertices);
	indexBuffer = getIndexBufferWithIndices(indices);
	//colorBuffer = getVertexBufferWithVertices(colors);

	glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
	glContext.vertexAttribPointer(prg.vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0);
	//glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);
	//glContext.vertexAttribPointer(prg.colorAttribute, 4, glContext.FLOAT, false, 0, 0);
	glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);

}
function initScene()
{
	sol = createPlanet(1988500, 0, 0, 0.02, [1, 1, 1], 0);
	mercury = createPlanet(0.3301, 38.86, 69.82, 0.01, [0.5, 0.3, 0.2], 10);
	venus = createPlanet(4.8676, 34.79, 108.94, 0.015, [0.9, 0.9, 0.7], 20);
	earth = createPlanet(5.9726, 29.29, 152.10, 0.02, [0.3, 0.5, 1.0], 30);
	moon = createPlanet(0.07342, 0.964, 0.4055, 0.01, [0.8, 0.8, 0.8], 5);
	
	mars = createPlanet(0.64174, 21.97, 249.23, 0.01, [1.0, 0.0, 0.0], 40);
	jupiter = createPlanet(1898.3, 12.44, 816.62, 0.08, [1.0, 0.5, 0.0], 80);
	saturn = createPlanet(568.36, 9.09, 1514.50, 0.06, [1.0, 1.0, 0.7], 200);
	uranus = createPlanet(86.816, 6.49, 3003.62, 0.05, [0.0, 1.0, 1.0], 550);
	neptune = createPlanet(102.42, 5.37, 4545.67, 0.05, [0.0, 0.0, 1.0], 1100);
	
	earthSystem = new System(earth, [moon], sol);
	planets = [mercury, venus, earthSystem, mars, jupiter, saturn, uranus, neptune];
	solarSystem = new System(sol, planets, null);
	
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
}
function drawSystem()
{
	solarSystem.draw();
	glContext.uniform1i(prg.fmode, 0);
	glContext.uniform1i(prg.vmode, 0);
	if(orbitBool)solarSystem.drawOrbit();
}
function drawScene()
{
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
	
	if (!pause) solarSystem.update();
	
	drawSystem();
}
function initWebGL()
{
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