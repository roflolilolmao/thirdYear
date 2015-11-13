
/******************************************************************************************
* Scene prototype
* Is used to manage the entire webgl scene on a canvas
* The canvas must be focusable (tabindex attribute in html)
*	- Initializes and maintains the scene
* 	- Handles Rendering objects, for data renderings and options
*	- Handles Manipulation objects, for mouse and keyboard
* 	- Handles UI events, for camera and rendering modifications
*
* Mathieu Rosser, HE-ARC Ingénierie, 2014-2015
*******************************************************************************************/

/*
* Initializes the scene on the given canvas
*/
var Scene = function(canvasName) {
	this.canvasName = canvasName;
	
	// model view matrix
	this.mvMatrix = mat4.create();
	mat4.identity(this.mvMatrix);

	// projection matrix
	this.pMatrix = mat4.create();
	mat4.identity(this.pMatrix);
	
	// normal matrix
	this.nMatrix = mat4.create();
	mat4.identity(this.nMatrix);
	
	// set of examples data
	this.dataTab2D = [
		"-1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0",
		"0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0",
		"1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0",
		"2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0",
	].join("\n");
	
	// rendering type and options selection
	this.renderingType = null;
	this.renderingOptions = null;

	// camera manipulation
	this.manipulation = new Manipulation(canvasName, [6.0, 2.0, 10.0]);
	
	// data loading and rendering
	this.rendering = null;
	this.dataLoading = null;
	
	// init scene and UI
	this.initWebGL(canvasName);
	this.initUIListeners();
};

/*
* Inits the webgl context when the window is loaded
*/
Scene.prototype.initWebGL = function(canvasName) {
	var me = this;
	window.addEventListener("load", function() {
		// get gl context
		glContext = getGLContext(canvasName);
		//Initializes the program (shaders).
		initProgram();
		//Starts rendering loop, calls drawScene
		renderLoop();
	});
};

//this function is called from initProgram() which is defined in webglTools.js, it is implemented here for clarity
/*
* Inits gl context shaders parameters
*/
Scene.prototype.initShaderParameters = function(prg) {	

	//--- Information for the Vertex Shader ---
	// position
	prg.vertexPositionAttribute = glContext.getAttribLocation(prg, "aVertexPosition");
	glContext.enableVertexAttribArray(prg.vertexPositionAttribute);
	// normal
	prg.vertexNormalAttribute 	= glContext.getAttribLocation(prg, "aVertexNormal");
	glContext.enableVertexAttribArray(prg.vertexNormalAttribute);
	// color
	prg.colorAttribute 			= glContext.getAttribLocation(prg, "aColor");
	glContext.enableVertexAttribArray(prg.colorAttribute);
	// modelview, projection and normal matrix
	prg.pMatrixUniform          = glContext.getUniformLocation(prg, 'uPMatrix');
	prg.mvMatrixUniform         = glContext.getUniformLocation(prg, 'uMVMatrix');
	prg.nMatrixUniform			= glContext.getUniformLocation(prg, 'uNMatrix');

	//--- Information for the Fragment Shader ---
	// options, for using levels or shading rendering or both
	prg.useValueToColorize = glContext.getUniformLocation(prg, 'uUseValueToColorize');
	prg.useShading = glContext.getUniformLocation(prg, 'uUseShading');
	
	// levels rendering thresholds
	prg.vecThreshold = glContext.getUniformLocation(prg, 'uVecThreshold');
	
	// shading rendering light informations
	prg.lightPosition = glContext.getUniformLocation(prg, 'uLightPosition');
	prg.shininess = glContext.getUniformLocation(prg, 'uShininess');
	prg.lightAmbient = glContext.getUniformLocation(prg, 'uLightAmbient');
	prg.materialDiffuse = glContext.getUniformLocation(prg, 'uMaterialDiffuse');
	prg.materialSpecular = glContext.getUniformLocation(prg, 'uMaterialSpecular');
	prg.materialDiffuse = glContext.getUniformLocation(prg, 'uMaterialDiffuse');
};

/*
* Inits the rendering of the scene
* If a new rendering is selected in UI, it is changed here
* If new data as been loaded, they are processed to be rendered on the scene
*/
Scene.prototype.initRendering = function(newDataLoading) {
	// new data
	if (newDataLoading) {
		this.dataLoading = newDataLoading;
	}
	
	// nothing to render
	if (this.dataLoading == null) {
		this.rendering = null;
		
	// scene rendering
	} else {
		// creates a new rendering with options if needed (new type of rendering or new data)
		var newRendering = eval(this.renderingType);
		if (this.rendering == null || !(this.rendering instanceof newRendering) || newDataLoading) {
			
			this.rendering = new newRendering(this.dataLoading, this.renderingOptions);
			this.rendering.initBuffers();
		
		// use the same rendering if possible but changes the options
		} else {
			this.rendering.setOptions(this.renderingOptions);
		}

		// init camera for new loading
		if (newDataLoading) {
			this.initCamera(false, false);
		// focus canvas for a changed rendering
		} else {
			this.focusCanvas();
		}
	}
	
	// update selected rendering in UI
	this.refreshActiveRenderingButton();
};

/*
* give focus to the canvas, which _must have_ a tabindex html attribute
*/
Scene.prototype.focusCanvas = function() {
	// don't focus canvas on launch of the app (first call)
	if (this.isInit) {
		var canvas = document.getElementById(this.canvasName);
		canvas.focus();					// focus canvas, for keyboard event
		canvas.scrollIntoView(true);	// scroll to canvas, for view
	}
	this.isInit = true;
};

/*
* Initializes the camera on the scene
* We can move on lines (Y) and/or on columns (X) - each coin (origin, X, Y, XY) of the scene
* Use the loaded data to manages the camera manipulations
*/
Scene.prototype.initCamera = function(moveLine, moveColumn) {
	var data = this.dataLoading.getData();
	
	// set movement on Y (line) or X (column)
	var factorLine = moveLine ? -data.length - 10 : 15;
	var factorColumn = moveColumn ? data[0].length + 10 : -10;
	var angleLeftRight = 0.0;
	
	// sets left/right angle of the camera
	if (!moveLine && !moveColumn) {
		angleLeftRight = -40.0;
	} else if (moveLine && moveColumn) {
		angleLeftRight = 135.0;
	} else if (moveLine) {
		angleLeftRight = -135.0;
	} else if (moveColumn) {
		angleLeftRight = 40.0;
	}

	// moves the camera on the scene
	var z = this.dataLoading.getMinMaxData()[1] + 2.0;
	this.manipulation.initCamera([this.rendering.deltaX * factorColumn, z, this.rendering.deltaY * factorLine], -20.0, angleLeftRight);	
	mat4.identity(this.mvMatrix);

	// focus canvas on changes
	this.focusCanvas();
};

/*
* Inits the camera in a sky, above the scene, looking to it
* Uses loaded data to find the best sky position
*/
Scene.prototype.skyCamera = function() {
	var data = this.dataLoading.getData();
	
	// Y and X pos
	var middleLine = data.length / 2.0;
	var middleColumn = data[0].length / 2.0;
	
	// moves camera
	var z = Math.abs(this.dataLoading.getMinMaxData()[1]) * 8;
	this.manipulation.initCamera([middleColumn * this.rendering.deltaX, z, -middleLine * this.rendering.deltaY], -90.0, 0.0);	
	mat4.identity(this.mvMatrix);
	
	this.focusCanvas();
};

/*
* Draws the scene - initializes context, matrix (based on camera manipulation) and draw the rendering
*/
Scene.prototype.draw = function() {
	// background color http://prideout.net/archive/colors.php
	glContext.clearColor(0.529, 0.808, 0.922, 1.0); // turquoise

	//activate z-buffer
	glContext.enable(glContext.DEPTH_TEST);

	//resets color and depth buffer before drawing
	glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);

	//defines viewport dimensions based on the webgl canvas size
	glContext.viewport(0, 0, c_width, c_height);
			
	// projection
	mat4.perspective(this.pMatrix, degToRad(60), c_width / c_height, 0.1, 1000.0);

	// model view, based on camera manipulation (translation and rotation)
	mat4.identity(this.mvMatrix);
	this.mvMatrix = this.manipulation.rotateModelViewMatrix(this.mvMatrix);
    this.mvMatrix = this.manipulation.translateModelViewMatrix(this.mvMatrix);

	// normals matrix
	mat4.copy(this.nMatrix, this.mvMatrix);
	mat4.invert(this.nMatrix, this.nMatrix);
	mat4.transpose(this.nMatrix, this.nMatrix);

	//send the projection and model view matrices to the vertex shader
	glContext.uniformMatrix4fv(prg.pMatrixUniform, false, this.pMatrix);
	glContext.uniformMatrix4fv(prg.mvMatrixUniform, false, this.mvMatrix);	
	glContext.uniformMatrix4fv(prg.nMatrixUniform, false, this.nMatrix);	

	// render the data 2D scene
	if (this.rendering != null) {
		this.rendering.draw();
	}
};

/*
* Changes the current rendering used by the scene - Rendering name, options (levels / shading)
* Refresh directly the rendering if needed
*/
Scene.prototype.changeRendering = function(renderingName, _useLevels, _useShading, refresh) {
	this.renderingType = renderingName;
	this.renderingOptions = {
		useLevels: _useLevels,
		useShading: _useShading,
	};
	
	if (refresh) {
		this.initRendering();
	}
}

/*
* Inits the UI listeners and sets the callback methods for interactions
* Defines rendering / data loading / camera manipulations buttons and their corresponding actions
*/
Scene.prototype.initUIListeners = function() {
	var me = this;
	
	// possible rendering and options, linked to a button (options are in order: useLevels, useShading)
	this.mapButtonRendering = {
		"btn-render-pipes": 			["RenderingPipes", false, false],
		"btn-render-wireframe":			["RenderingWireFrame", false, false],
		"btn-render-triangles":			["RenderingTriangles", false, false],
		"btn-render-shading":			["RenderingTriangles", false, true],
		"btn-render-levels":			["RenderingTriangles", true, false],
		"btn-render-levels-shading":	["RenderingTriangles", true, true],
	};
	
	window.addEventListener("load", function() {
		// get some UI objects
		var textareaData = document.getElementById("data-text");
		var buttonData = document.getElementById("data-text-btn");
		var fileData = document.getElementById("data-file");
		var fileImage = document.getElementById("data-image-file");
		var canvas = document.getElementById("image-canvas");
		
		// load data as direct text button - changes rendering (without refresh) and loads data
		// when loaded, the data loading object calls the init rendering method
		buttonData.addEventListener("click", function() {
			me.changeRendering("RenderingTriangles", true, false);
			new DataLoadingText(me.initRendering.bind(me), textareaData.value);
		});
		
		// load data from a mathematic function F(x, y) - changes rendering and loads data
		document.getElementById("data-function-btn").addEventListener("click", function() {
			me.changeRendering("RenderingTriangles", true, false);
			new DataLoadingFunction(me.initRendering.bind(me), document.getElementById("data-function").value);
		});

		// load data from a file - changes rendering and loads data asynchronously (with rendering callback)
		
		fileData.addEventListener("click", function() {
			fileData.value = null;
		});

		fileData.addEventListener("change", function() {
			me.changeRendering("RenderingTriangles", true, false);
			new DataLoadingTextFile(me.initRendering.bind(me), fileData.files[0]);
		});
		
		// load data from an image - changes rendering and loads image
		
		fileImage.addEventListener("click", function() {
			fileImage.value = null;
		});

		fileImage.addEventListener("change", function() {
			me.changeRendering("RenderingTriangles", false, false);
			new DataLoadingImageFile(me.initRendering.bind(me), fileImage.files[0], canvas);
		});
		
		// sets actions of rendering buttons
		for (var btn in me.mapButtonRendering) {
			(function (b) {
				var data = me.mapButtonRendering[b];
				document.getElementById(btn).addEventListener("click", function() {
					me.changeRendering(data[0], data[1], data[2], true);		
				});
			})(btn);
		}

		// reset camera button
		document.getElementById("btn-camera-reset").addEventListener("click", function() {
			me.initCamera();
		});

		// sky camera button
		document.getElementById("btn-camera-sky").addEventListener("click", function() {
			me.skyCamera();
		});
		
		// camera coins selections (origin, X, Y, XY) and their corresponding camera changes
		document.getElementById("select-camera").addEventListener("change", function() {
			var value = document.getElementById("select-camera").value;
			var moveLine = (value == "1" || value == "3");
			var moveColumn = (value == "1" || value == "2");
			me.initCamera(moveLine, moveColumn);
		});

		// by default, load the sample data
		textareaData.value = me.dataTab2D;
		buttonData.click();
	});
};

/*
* Refresh the state of rendering buttons
* Sets active the button which corresponds to the currently displayed rendering
*/
Scene.prototype.refreshActiveRenderingButton = function() {
	// defines selection for each button
	for (var b in this.mapButtonRendering) {
		var btn = document.getElementById(b);
		var btnRendering = this.mapButtonRendering[b][0];
		var useLevels = this.mapButtonRendering[b][1];
		var useShading = this.mapButtonRendering[b][2];
		
		var selected = (btnRendering == this.renderingType 
						&& useLevels == this.renderingOptions.useLevels 
						&& useShading == this.renderingOptions.useShading);
		btn.className = selected ? "actif" : "";
	}
};