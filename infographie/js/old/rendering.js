
/******************************************************************************************
* Rendering prototype - abstract prototype which should not be directly used
* This prototype defines methods to render loaded data on a webgl context, with XYZ axes
* There are severals subprototypes which implements it:
*	- RenderingTriangles, which renders the data as a set of triangles
* 	- RenderingPipes, which renders the data as pipes elements
* 	- RenderingTriangleStrips, which renders data as triangle strips (same as triangle...)
*	- RenderingWireFrame, which renders the data as a mesh (line strips, based on triangle strip)
* 
* There are 2 possibles options, implemented or not by subprototypes:
*	- options.useLevels, using rendering by colors levels in fragment shader
*	- options.useShading, using rendering by normals shading (phong) in fragment share
*
* Mathieu Rosser, HE-ARC Ingénierie, 2014-2015
*******************************************************************************************/

/*
* Rendering object, based on a DataLoading object (loaded data) and specific rendering options
*/
var Rendering = function(dataLoading, options) {
	this.dataLoading = dataLoading;
	this.setOptions(options);

	// get data and colors
	this.dataTab2D = dataLoading.getData();
	this.colors = dataLoading.getColors();
	
	// Delta X / Y between 2 data on the scene
	this.deltaX = 0.4;
	this.deltaY = 0.4;
	
	// stats info
	this.linesNumber = this.dataTab2D.length;
	this.columnsNumber = this.dataTab2D[0].length;
	
	this.minValue = dataLoading.getMinMaxData()[0];
	this.maxValue = dataLoading.getMinMaxData()[1];
	
	// colors levels, for options.useLevels
	var colors = [
		[1.0, 0.0, 0.0],
		[0.0, 1.0, 0.0],
		[0.0, 0.0, 1.0],
		[1.0, 0.0, 1.0],
		[1.0, 1.0, 0.0],
		[0.0, 1.0, 1.0],
		[1.0, 1.0, 1.0],
		[0.0, 0.0, 0.0],
	];

	// calculates colors thresholds, to apply levels in fragment share
	var delta = Math.abs(this.maxValue - this.minValue) / 8;
	this.threshold = [];
	for (var i = 0; i < 8; i++) {
		this.threshold.push(this.minValue + (i + 1) * delta, colors[i][0], colors[i][1], colors[i][2]);
	}
};

/*
* Sets rendering options: useLevels, useShading
*/
Rendering.prototype.setOptions = function(options) {
	this.options = {
		useLevels: (options && options.useLevels) || false,
		useShading: (options && options.useShading) || false,
	};
};

/*
* Init data buffers, as JS array and GPU buffer, for axes and 2D array
*/
Rendering.prototype.initBuffers = function() {	
	this.verticesAxes = [];
	this.indicesAxes = [];
	this.colorsAxes = [];
	this.vertexAxesBuffer = null;
	this.indexAxesBuffer = null;
	this.colorAxesBuffer = null;
	
	this.normalsData = [];
	this.verticesData = [];
	this.indicesData = [];
	this.colorsData = [];
	
	this.vertexDataBuffer = [];
	this.indexDataBuffer = [];
	this.colorDataBuffer = [];
	this.normalsDataBuffer = [];

	this.initBuffersAxes();
	this.initBuffersData();
};

/*
* Init data (array and buffer) for the axes
*/
Rendering.prototype.initBuffersAxes = function() {	
	var axePosition = 0.0;

	// X axis
	var xLength = this.columnsNumber * this.deltaX + 1.0;
	this.verticesAxes.push(0.0, axePosition, 0.0);
	this.verticesAxes.push(xLength, axePosition, 0.0);

	// Z Axis
	var zLength = this.maxValue + 1.0;
	this.verticesAxes.push(0.0, axePosition, 0.0);
	this.verticesAxes.push(0.0, zLength, 0.0);

	// Y axis
	var yLength = -1 * (this.linesNumber * this.deltaY + 1.0);
	this.verticesAxes.push(0.0, axePosition, 0.0);
	this.verticesAxes.push(0.0, axePosition, yLength);

	this.indicesAxes.push(0, 1, 2, 3, 4, 5);

	for (var i = 0; i < 6; i++) {
		this.colorsAxes.push(0.0, 0.0, 0.0, 1.0);
	}

	this.vertexAxesBuffer = getVertexBufferWithVertices(this.verticesAxes);					
	this.indexAxesBuffer = getIndexBufferWithIndices(this.indicesAxes);
	this.colorAxesBuffer = getVertexBufferWithVertices(this.colorsAxes);
};

/*
* Init buffers and array for data - abstract, implemented by subprototype
*/
Rendering.prototype.initBuffersData = function() {};

/*
* Draw the rendering object: draw axes, and data
*/
Rendering.prototype.draw = function() {
	this.drawAxes();
	this.drawData();
};

/*
* Draw the axes buffer on the global GL context
*/
Rendering.prototype.drawAxes = function() {
	// vertex pos and normals
	glContext.bindBuffer(glContext.ARRAY_BUFFER, this.vertexAxesBuffer);
	glContext.vertexAttribPointer(prg.vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0);
	glContext.vertexAttribPointer(prg.vertexNormalAttribute, 3, glContext.FLOAT, false, 0, 0);

	// colors
	glContext.bindBuffer(glContext.ARRAY_BUFFER, this.colorAxesBuffer);
	glContext.vertexAttribPointer(prg.colorAttribute, 4, glContext.FLOAT, false, 0, 0);

	// indices
	glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this.indexAxesBuffer);
					
	// drawing
	glContext.drawElements(glContext.LINES, this.indicesAxes.length, glContext.UNSIGNED_SHORT,0);
};

/*
* Draw the 2D data, which a given GL primitive
* Called by inherited prototype - should NOT be called directy in base class
*/
Rendering.prototype.drawData = function(glPrimitive) {
	
	// render each array of data
	for (var i = 0; i < this.verticesData.length; i++) {
		// vertex pos
		glContext.bindBuffer(glContext.ARRAY_BUFFER, this.vertexDataBuffer[i]);
		glContext.vertexAttribPointer(prg.vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0);

		// normals (if existing)
		if (this.options.useShading && i < this.normalsData.length) {
			glContext.bindBuffer(glContext.ARRAY_BUFFER, this.normalsDataBuffer[i]);
			glContext.vertexAttribPointer(prg.vertexNormalAttribute, 3, glContext.FLOAT, false, 0, 0);
		} else {
			glContext.vertexAttribPointer(prg.vertexNormalAttribute, 3, glContext.FLOAT, false, 0, 0);
		}
		
		// colors
		glContext.bindBuffer(glContext.ARRAY_BUFFER, this.colorDataBuffer[i]);
		glContext.vertexAttribPointer(prg.colorAttribute, 4, glContext.FLOAT, false, 0, 0);

		// indices
		glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, this.indexDataBuffer[i]);
						
		// drawing
		glContext.drawElements(glPrimitive, this.indicesData[i].length, glContext.UNSIGNED_SHORT,0);
	}
};

/******************************************************************************************
* Rendering as triangles prototype
* Is used to render the 2D data as a mesh of triangles
* By defaults, render the data with the colors (grey levels) given by the DataLoading objects
* Allows the useLevels and useShading options (alone or combined !)
* Calculates the normals for each triangle
*******************************************************************************************/

/*
* New rendering as triangles
*/
var RenderingTriangles = function(dataLoading, options) {
	Rendering.call(this, dataLoading, options);
};

RenderingTriangles.prototype = Object.create(Rendering.prototype);

/*
* Init buffers of data with the loaded data
*/
RenderingTriangles.prototype.initBuffersData = function() {
	var y = - this.deltaY;
	
	// proceed each 2D data, by line and column
	for (var ligne = 0; ligne < this.dataTab2D.length - 1; ligne++) {

		var x = this.deltaX;
		var myVertices = [];
		var myIndices = [];
		var myColors = [];
		var myNormals = [];
		
		for (var colonne = 0; colonne < this.dataTab2D[ligne].length - 1; colonne++) {
		
			// triangle 1 - vertex, colors and indices
			var dataCurrent = this.dataTab2D[ligne+1][colonne];
			var dataNext1 = this.dataTab2D[ligne][colonne];
			var dataNext2 = this.dataTab2D[ligne][colonne+1];
			var colorCurrent = this.colors[ligne+1][colonne];
			var colorNext1 = this.colors[ligne][colonne];
			var colorNext2 = this.colors[ligne][colonne+1];
			
			myVertices.push(x, dataCurrent, y - this.deltaY);
			myVertices.push(x, dataNext1, y);
			myVertices.push(x + this.deltaX, dataNext2, y);
						
			myColors.push(colorCurrent[0], colorCurrent[1], colorCurrent[2], 1.0);
			myColors.push(colorNext1[0], colorNext1[1], colorNext1[2], 1.0);			
			myColors.push(colorNext2[0], colorNext2[1], colorNext2[2], 1.0);

			myIndices.push(myIndices.length);
			myIndices.push(myIndices.length);
			myIndices.push(myIndices.length);
		
			// triangle 2 - vertex, colors and indices
			dataNext1 = dataNext2;
			colorNext1 = colorNext2;
			dataNext2 = this.dataTab2D[ligne+1][colonne+1];
			colorNext2 = this.colors[ligne+1][colonne+1];
			
			myVertices.push(x, dataCurrent, y - this.deltaY);
			myVertices.push(x + this.deltaX, dataNext1, y);
			myVertices.push(x + this.deltaX, dataNext2, y - this.deltaY);
			
			myColors.push(colorCurrent[0], colorCurrent[1], colorCurrent[2], 1.0);
			myColors.push(colorNext1[0], colorNext1[1], colorNext1[2], 1.0);			
			myColors.push(colorNext2[0], colorNext2[1], colorNext2[2], 1.0);

			myIndices.push(myIndices.length);
			myIndices.push(myIndices.length);
			myIndices.push(myIndices.length);
		
			x += this.deltaX;
		}
		
		y -= this.deltaY;

		// calculates normals for the current vertex
		var myNormals = calculateNormalsForVertices(myVertices);

		this.verticesData.push(myVertices);
		this.indicesData.push(myIndices);
		this.colorsData.push(myColors);
		this.normalsData.push(myNormals);

		this.vertexDataBuffer.push(getVertexBufferWithVertices(myVertices));					
		this.indexDataBuffer.push(getIndexBufferWithIndices(myIndices));
		this.colorDataBuffer.push(getVertexBufferWithVertices(myColors));
		this.normalsDataBuffer.push(getVertexBufferWithVertices(myNormals));
	}
};

/*
* Draw the data of the 2D array buffers
*/
RenderingTriangles.prototype.drawData = function() {
	// activates levels rendering
	if (this.options.useLevels == true) {
		glContext.uniform1i(prg.useValueToColorize, true);

		glContext.uniform4fv(prg.vecThreshold, this.threshold);
	}
	
	// activates shading rendering
	if (this.options.useShading == true) {
		glContext.uniform1i(prg.useShading, true);
	
		glContext.uniform3f(prg.lightPosition, 0.0, 0.0, 1.0);
		glContext.uniform3f(prg.lightAmbient, 0.4, 0.2, 0.1);
		glContext.uniform3f(prg.materialSpecular, 0.5, 0.5, 0.5);
		glContext.uniform3f(prg.materialDiffuse, 0.2, 0.2, 0.8);
		
		glContext.uniform1f(prg.shininess, 24.0);
	}

	// draw all the data as triangle
	Rendering.prototype.drawData.call(this, glContext.TRIANGLES);
	
	// disable options
	glContext.uniform1i(prg.useShading, false);
	glContext.uniform1i(prg.useValueToColorize, false);
};


/******************************************************************************************
* Rendering as pipes prototype
* Is used to render the tab 2D as a set of pipes - "3D lines"
* Pipes are rendering by triangles
*******************************************************************************************/

/*
* New pipes rendering object
*/
var RenderingPipes = function(dataLoading, options) {
	Rendering.call(this, dataLoading, options);
};

RenderingPipes.prototype = Object.create(Rendering.prototype);

/*
* Init buffers of data as pipes
*/
RenderingPipes.prototype.initBuffersData = function() {
	var y = - this.deltaY;
	
	// set vertices, colors and indices for each data (by line and column)
	for (var ligne = 0; ligne < this.dataTab2D.length; ligne++) {

		var x = this.deltaX;

		var vertices = [];
		var colors = [];
		var indices = [];
		var ind = 0;

		for (var colonne = 0; colonne < this.dataTab2D[ligne].length; colonne++) {

			var data = this.dataTab2D[ligne][colonne];

			vertices.push(x+0.1, 0.0, y+0.1);	// 0
			vertices.push(x+0.1, 0.0, y-0.1);	// 1
			vertices.push(x-0.1, 0.0, y+0.1);	// 2
			vertices.push(x-0.1, 0.0, y-0.1);	// 3
			
			vertices.push(x+0.1, data, y+0.1);	// 4
			vertices.push(x+0.1, data, y-0.1);	// 5
			vertices.push(x-0.1, data, y+0.1);	// 6
			vertices.push(x-0.1, data, y-0.1);	// 7
			
			var c = this.colors[ligne][colonne];
			for (var i = 0; i < 8; i++) {				
				colors.push(c[0], c[1], c[2], 1.0);
			}
			
			// pipe faces
			indices.push(ind + 0, ind + 1, ind + 2, ind + 1, ind + 2, ind + 3); // bot face
			indices.push(ind + 0, ind + 1, ind + 4, ind + 4, ind + 5, ind + 1); // round face 1
			indices.push(ind + 0, ind + 2, ind + 4, ind + 4, ind + 6, ind + 2); // round face 2
			indices.push(ind + 1, ind + 3, ind + 5, ind + 5, ind + 7, ind + 3); // round face 3
			indices.push(ind + 2, ind + 3, ind + 6, ind + 6, ind + 7, ind + 3); // round face 4
			indices.push(ind + 4, ind + 5, ind + 6, ind + 5, ind + 6, ind + 7); // top face
						
			ind = vertices.length / 3;
			
			x += this.deltaX;
		}
		
		y -= this.deltaY;

		this.verticesData.push(vertices);
		this.indicesData.push(indices);
		this.colorsData.push(colors);

		this.vertexDataBuffer.push(getVertexBufferWithVertices(vertices));					
		this.indexDataBuffer.push(getIndexBufferWithIndices(indices));
		this.colorDataBuffer.push(getVertexBufferWithVertices(colors));
	}
};

/*
* Draw the pipes with triangle rendering
*/
RenderingPipes.prototype.drawData = function() {
	Rendering.prototype.drawData.call(this, glContext.TRIANGLES);
};

/******************************************************************************************
* Rendering as triangle strip prototype
* Same prototype as RenderingTriangles, without any supported options
* Is used by sub-prototype to render the tab 2D as a set of line strips - Wireframe
*******************************************************************************************/

/*
* New rendering as triangle strip object
*/
var RenderingTriangleStrip = function(dataLoading, options) {
	Rendering.call(this, dataLoading, options);
};

RenderingTriangleStrip.prototype = Object.create(Rendering.prototype);

/*
* Init data buffers for triangle strips rendering
*/
RenderingTriangleStrip.prototype.initBuffersData = function() {
	var y = - this.deltaY;
	
	// each data is processed, by each line and column
	for (var ligne = 0; ligne < this.dataTab2D.length - 1; ligne++) {

		var x = this.deltaX;
		var myVertices = [];
		var myIndices = [];
		var myColors = [];
		
		for (var colonne = 0; colonne < this.dataTab2D[ligne].length; colonne++) {

			var dataCurrent = this.dataTab2D[ligne][colonne];
			var dataNext = this.dataTab2D[ligne+1][colonne];
			
			myVertices.push(x, dataCurrent, y);
			myVertices.push(x, dataNext, y - this.deltaY);
			
			var color = this.colors[ligne][colonne];
			myColors.push(color[0], color[1], color[2], 1.0);
			
			color = this.colors[ligne+1][colonne];
			myColors.push(color[0], color[1], color[2], 1.0);
			
			myIndices.push(myIndices.length);
			myIndices.push(myIndices.length);

			x += this.deltaX;
		}
		
		y -= this.deltaY;

		this.verticesData.push(myVertices);
		this.indicesData.push(myIndices);
		this.colorsData.push(myColors);

		this.vertexDataBuffer.push(getVertexBufferWithVertices(myVertices));					
		this.indexDataBuffer.push(getIndexBufferWithIndices(myIndices));
		this.colorDataBuffer.push(getVertexBufferWithVertices(myColors));
	}
};

/*
* Rendering as triangle strip
*/
RenderingTriangleStrip.prototype.drawData = function() {
	Rendering.prototype.drawData.call(this, glContext.TRIANGLE_STRIP);
};

/******************************************************************************************
* Rendering as wireframe prototype
* Is used to render the tab 2D as a set of lines - with LINE_STRIP gl primitif
* Completes the triangle strips prototype, for each separating lines
*******************************************************************************************/

/*
* New rendering as wireframe
*/
var RenderingWireFrame = function(dataLoading, options) {
	RenderingTriangleStrip.call(this, dataLoading, options);
};

RenderingWireFrame.prototype = Object.create(RenderingTriangleStrip.prototype);

/*
* Init buffers data for rendering
*/
RenderingWireFrame.prototype.initBuffersData = function() {
	// compute base rendering from triangle strip
	RenderingTriangleStrip.prototype.initBuffersData.call(this);

	// compute lines between data, missing in RenderingTriangleStrip
	var y = - this.deltaY;
	
	for (var ligne = 0; ligne < this.dataTab2D.length; ligne++) {

		var x = this.deltaX;
		var myVertices = [];
		var myIndices = [];
		var myColors = [];
		
		for (var colonne = 0; colonne < this.dataTab2D[ligne].length; colonne++) {

			var dataCurrent = this.dataTab2D[ligne][colonne];
			
			myVertices.push(x, dataCurrent, y);
			
			var color = this.colors[ligne][colonne];			
			myColors.push(color[0], color[1], color[2], 1.0);
			
			myIndices.push(myIndices.length);	

			x += this.deltaX;
		}
		
		y -= this.deltaY;

		this.verticesData.push(myVertices);
		this.indicesData.push(myIndices);
		this.colorsData.push(myColors);
		
		this.vertexDataBuffer.push(getVertexBufferWithVertices(myVertices));					
		this.indexDataBuffer.push(getIndexBufferWithIndices(myIndices));
		this.colorDataBuffer.push(getVertexBufferWithVertices(myColors));		
	}
};

/*
* Draw data as line strips
*/
RenderingWireFrame.prototype.drawData = function() {
	Rendering.prototype.drawData.call(this, glContext.LINE_STRIP);
};