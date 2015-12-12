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
var translateZ = -10.12;
var timeFactor = 1;
var selected = -1;

var vertexBuffer = null;
var indexBuffer = null;
var normalsBuffer = null;
var textureBuffer = null;

var textureBuffersArray = [];
var vertexBuffersArray = [];
var normalBuffersArray = [];
var indexBuffersArray = [];

var indicesArray = [];

var textCoordsBuffer = null;
var textCoords = [];
var texColorTab = new Array();

var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var nMatrix = mat4.create();
mat4.identity(mvMatrix);
mat4.identity(pMatrix);
window.onkeydown = function(e) {
    switch(e.keyCode){
        case 87: // w
            translateZ += 1.0;
            break;
        case 83: // s
            translateZ -= 1.0;
            break;
        case 80: // p
            pauseBoolF();
            break;
        default:
    }
};
function initShaderParameters(prg)
{
    prg.vertexPositionAttribute = glContext.getAttribLocation(prg, "aVertexPosition");
    glContext.enableVertexAttribArray(prg.vertexPositionAttribute);
    prg.textureCoordsAttribute  = glContext.getAttribLocation(prg, "aTextureCoord");
    glContext.enableVertexAttribArray(prg.textureCoordsAttribute);
    prg.colorTextureUniform     = glContext.getUniformLocation(prg, "uColorTexture");
    prg.normalTextureUniform    = glContext.getUniformLocation(prg, "uNormalTexture");
    prg.specularTextureUniform  = glContext.getUniformLocation(prg, "uSpecularTexture");
    prg.earthNight              = glContext.getUniformLocation(prg, "uEarthNight");
    prg.atmosphere              = glContext.getUniformLocation(prg, "uAtmosphere");
    prg.atmosphereNormals       = glContext.getUniformLocation(prg, "uAtmosphereNormals");
    prg.pMatrixUniform          = glContext.getUniformLocation(prg, 'uPMatrix');
    prg.mvMatrixUniform         = glContext.getUniformLocation(prg, 'uMVMatrix');
    prg.nMatrixUniform          = glContext.getUniformLocation(prg, 'uNMatrix');
    prg.radius                  = glContext.getUniformLocation(prg, 'radius');
    prg.rotation                = glContext.getUniformLocation(prg, 'rotation');
    prg.rotationAtmo            = glContext.getUniformLocation(prg, 'rotationAtmo');
    prg.center                  = glContext.getUniformLocation(prg, 'center');
    prg.offset                  = glContext.getUniformLocation(prg, 'offset');
    prg.colorPlanet             = glContext.getUniformLocation(prg, 'uColor');
    prg.fmode = glContext.getUniformLocation(prg, 'fmode');
    prg.inclination = glContext.getUniformLocation(prg, 'inclination');
}
function initBuffers()
{
    // vertices
    glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffersArray[0]);
    glContext.vertexAttribPointer(prg.vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0);
    // vertex normals
    // glContext.bindBuffer(glContext.ARRAY_BUFFER, normalBuffersArray[0]);
    // glContext.vertexAttribPointer(prg.normalPositionAttribute, 3, glContext.FLOAT, false, 0, 0);
    // tex
    glContext.bindBuffer(glContext.ARRAY_BUFFER, textureBuffersArray[0]);
    glContext.vertexAttribPointer(prg.textureCoordsAttribute, 2, glContext.FLOAT, false, 0, 0);
    
    glContext.activeTexture(glContext.TEXTURE0);
    glContext.bindTexture(glContext.TEXTURE_2D, texColorTab[0]);
    glContext.uniform1i(prg.colorTextureUniform, 0);
    glContext.activeTexture(glContext.TEXTURE1);
    glContext.bindTexture(glContext.TEXTURE_2D, texColorTab[1]);
    glContext.uniform1i(prg.normalTextureUniform, 1);
    glContext.activeTexture(glContext.TEXTURE2);
    glContext.bindTexture(glContext.TEXTURE_2D, texColorTab[2]);
    glContext.uniform1i(prg.specularTextureUniform, 2);
    glContext.activeTexture(glContext.TEXTURE3);
    glContext.bindTexture(glContext.TEXTURE_2D, texColorTab[3]);
    glContext.uniform1i(prg.earthNight, 3);
    glContext.activeTexture(glContext.TEXTURE4);
    glContext.bindTexture(glContext.TEXTURE_2D, texColorTab[4]);
    glContext.uniform1i(prg.atmosphere, 4);
    glContext.activeTexture(glContext.TEXTURE5);
    glContext.bindTexture(glContext.TEXTURE_2D, texColorTab[5]);
    glContext.uniform1i(prg.atmosphereNormals, 5);
    glContext.activeTexture(glContext.TEXTURE6);
    // indices
    glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffersArray[0]);
}
function initScene()
{
    sol = createPlanet("Sol", 1988500, 0, 0, 0.1, [1, 1, 1], 0, 7.25, 0.0005, -0.0001);
    mercury = createPlanet("Mercury", 0.3301, 38.86, 69.82, 0.01, [0.5, 0.3, 0.2], 10, 0.034, 0.01, 0);
    venus = createPlanet("Venus", 4.8676, 34.79, 108.94, 0.015, [0.9, 0.9, 0.7], 20, 177.36, 0.001, -0.005);
    earth = createPlanet("Earth", 5.9726, 29.29, 152.10, 0.02, [0.3, 0.5, 1.0], 30, 23.44, 0.0015, 0.0003);
    moon = createPlanet("Moon", 0.07342, 0.964, 0.4055, 0.01, [0.8, 0.8, 0.8], 5, 6.68, 0.02, 0);
    
    mars = createPlanet("Mars", 0.64174, 21.97, 249.23, 0.01, [1.0, 0.0, 0.0], 40, 25.19, 0.015, 0.03);
    jupiter = createPlanet("Jupiter", 1898.3, 12.44, 816.62, 0.08, [1.0, 0.5, 0.0], 80, 3.13, 0.015, 0.03);
    saturn = createPlanet("Saturn", 568.36, 9.09, 1514.50, 0.06, [1.0, 1.0, 0.7], 200, 26.73, 0.015, 0.03);
    uranus = createPlanet("Uranus", 86.816, 6.49, 3003.62, 0.05, [0.0, 1.0, 1.0], 550, 82.23, 0.015, 0.03);
    neptune = createPlanet("Neptune", 102.42, 5.37, 4545.67, 0.05, [0.0, 0.0, 1.0], 1100, 1.76917, 0.015, 0.03);
    
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
    if(orbitBool)solarSystem.drawOrbit();
}
function drawScene()
{
    glContext.clearColor(0.0, 0.0, 0.0, 1.0);
    glContext.enable(glContext.DEPTH_TEST);
    
    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
    
    glContext.viewport(0, 0, c_width, c_height);
    mat4.perspective(pMatrix, degToRad(60.0), c_width / c_height, 0.1, 10000.0);
    translationMat = mat4.create();
    mat4.identity(translationMat);
    mat4.translate(translationMat, translationMat, [0.0, 0.0, translateZ]);
    
    // mat4.translate(translationMat, translationMat, [-earthSystem.pos[0] / distanceFactor, -earthSystem.pos[1] / distanceFactor, -earthSystem.pos[2] / distanceFactor]);
    
    rotateModelViewMatrixUsingQuaternion();
    glContext.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
    mvtMatrix = mat4.create();
    mat4.multiply(mvtMatrix, translationMat, mvMatrix);
    glContext.uniformMatrix4fv(prg.mvMatrixUniform, false, mvtMatrix);
    mat4.copy(nMatrix, mvtMatrix);
    mat4.invert(nMatrix, nMatrix);
    mat4.transpose(nMatrix, nMatrix);
    glContext.uniformMatrix4fv(prg.nMatrixUniform, false, nMatrix);
    rotX = 0;
    rotY = 0;
    
    if (!pause)
    {
        for(var i = 0; i < timeFactor; i++)
            solarSystem.update();
    }
    var offset = selected == -1 ? [0, 0, 0] : 
        [solarSystem.bodies[selected].pos[0], solarSystem.bodies[selected].pos[1], solarSystem.bodies[selected].pos[2]];
    glContext.uniform3f(prg.offset, -offset[0] / distanceFactor,
                                    -offset[1] / distanceFactor,
                                    -offset[2] / distanceFactor);
    if(indicesArray.length > 0)
    {
        drawSystem();
    }
}
function loadRessources()
{
    loadModel("ressources/earth.obj");
    
    // initTextureWithImage("ressources/texMap2k_Sun_main.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap2k_Sun_atmosphere.jpg", texColorTab);
    
    // initTextureWithImage("ressources/texMap4k_Mercury_main.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap4k_Mercury_normal.jpg", texColorTab);
    
    // initTextureWithImage("ressources/texMap2k_Venus_main.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap2k_Venus_normal.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap2k_Venus_atmosphere.jpg", texColorTab);
    
    initTextureWithImage("ressources/texMap4k_Earth_main.jpg", texColorTab);
    initTextureWithImage("ressources/texMap4k_Earth_normal.jpg", texColorTab);
    initTextureWithImage("ressources/earth_spec.jpg", texColorTab);
    initTextureWithImage("ressources/texMap4k_Earth_night.jpg", texColorTab);
    initTextureWithImage("ressources/texMap4k_Earth_atmosphere.jpg", texColorTab);
    initTextureWithImage("ressources/texMap4k_Earth_atmosphere_normal.jpg", texColorTab);
    
    // initTextureWithImage("ressources/texMap4k_Mars_main.png", texColorTab);
    // initTextureWithImage("ressources/texMap2k_Mars_normal.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap2k_Mars_atmosphere.jpg", texColorTab);
    
    // initTextureWithImage("ressources/texMap4k_Jupiter_main.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap4k_Jupiter_normal.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap4k_Jupiter_atmosphere.jpg", texColorTab);
    
    // initTextureWithImage("ressources/texMap2k_Saturn_main.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap2k_Saturn_normal.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap2k_Saturn_atmosphere.jpg", texColorTab);
    
    // initTextureWithImage("ressources/texMap2k_Uranus_main.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap2k_Uranus_atmosphere.jpg", texColorTab);
    
    // initTextureWithImage("ressources/texMap2k_Neptune_main.jpg", texColorTab);
    // initTextureWithImage("ressources/texMap2k_Neptune_atmosphere.jpg", texColorTab);
    
}
function initWebGL()
{
    glContext = getGLContext('webgl-canvas');
    updateDistanceFactor();
    updateVisualFactor();
    initProgram();
    loadRessources();
    initScene();
    initSelector();
}
function initSelector()
{
    var select = document.getElementById("bodySelector");
    var para = document.createElement("option");
    var node = document.createTextNode(solarSystem.orbitBody.name);
    para.setAttribute("value", -1);
    para.appendChild(node);
    select.appendChild(para);
    for (i in solarSystem.bodies)
    {
        var para = document.createElement("option");
        var node = document.createTextNode(solarSystem.bodies[i].name);
        para.setAttribute("value", i);
        para.appendChild(node);
        select.appendChild(para);
    }
}
function selector()
{
    selected = document.getElementById("bodySelector").selectedIndex - 1;
}
function pauseBoolF()
{
    pause = !pause;
}
function orbitBoolF()
{
    orbitBool = !orbitBool;
}
function updateTimeFactor()
{
    timeFactor = document.getElementById("timeRange").value;
}
function updateVisualFactor()
{
    var v = document.getElementById("visualRange").value;
    v = v < 20 ? v / 20 : v -19;
    visualFactor = v;
}
function updateDistanceFactor()
{
    var v = document.getElementById("distanceRange").value;
    v = v / 40;
    distanceFactor = v;
}
function handleOBJModel(filename, data){
    console.info(filename + ' has been retrieved from the server');
    
    var objData = new OBJ.Mesh(data);
    
    // pushpush
    vertexBuffer = getVertexBufferWithVertices(objData.vertices);
    normalsBuffer = getVertexBufferWithVertices(objData.vertexNormals);
    textureBuffer = getVertexBufferWithVertices(objData.textures);
    indexBuffer = getIndexBufferWithIndices(objData.indices);
    
    vertexBuffersArray.push(vertexBuffer);
    normalBuffersArray.push(normalsBuffer);
    textureBuffersArray.push(textureBuffer);
    indexBuffersArray.push(indexBuffer);
    indicesArray.push(objData.indices);
        
    initBuffers();
    renderLoop();
}