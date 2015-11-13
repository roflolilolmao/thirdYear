
/******************************************************************************************
* Manipulation handling prototype
* Used to manage camera (flying camera) manipulation with mouse and keyboard on a canvas
* The canvas MUST BE focusable and "selectable" by adding the "tabindex" property in HTML
*
* Left click allows pitch/yaw rotation on camera
* Right click allows up/down translation
* Mouse wheel allows forward/backward translation
* W/S keys allow forward/backward translation
* A/D keys allow left/right translation
* Q/E keys allows up/down translation
*
* Mathieu Rosser, HE-ARC Ingénierie, 2014-2015
*******************************************************************************************/

/*
* Creates the manipulation object on the canvas, by binding events listener
*/
var Manipulation = function(canvasName, translation) {
	this.initCamera(translation);
	
	var me = this;
	
	// add mouse listener on canvas when loaded
	window.addEventListener("load", function () {
		me.canvas = document.getElementById(canvasName);
	
		me.canvas.addEventListener("mousedown", me.handleMouseDown.bind(me));
		me.canvas.addEventListener("wheel", me.handleWheel.bind(me));
		me.canvas.addEventListener("contextmenu", me.handleContextMenu.bind(me));
		
		// allow dragging with the mouse "outside" the canvas
		document.addEventListener("mouseup", me.handleMouseUp.bind(me));
		document.addEventListener("mousemove", me.handleMouseMove.bind(me));
	});
	
	// add keyboard listener on window
	window.addEventListener("keydown", this.handleKeyDown.bind(this));	
};

/*
* Init flying camera, with a given translation, a pitch angle, and a yaw angle (in degree)
* Yaw is the left/right rotation
* Pitch is the top/bottom rotation
*/
Manipulation.prototype.initCamera = function(translation, pitch, yaw) {	
	this.pitch = pitch || 0.0;	
	this.yaw = yaw || 0.0;

	this.posX = translation[0];
	this.posY = translation[1];
	this.posZ = translation[2];
	
	this.oldMousePos = {x: 0, y: 0};
};

/*
* Handle mouse down event, by entering in left or right dragging mode
*/
Manipulation.prototype.handleMouseDown = function(event) {	
	// left/right click to enter drag mode
	this.draggingLeft = (event.which === 1 || event.button === 1);
	this.draggingRight = (event.which === 2 || event.button === 2);
	this.oldMousePos.x = event.clientX;
	this.oldMousePos.y = event.clientY;
};

/*
* Handle mouse up event, by stopping draging modes
*/
Manipulation.prototype.handleMouseUp = function(event) {	
	this.draggingLeft = false;
	this.draggingRight = false;
};

/*
* Handle mouse move events
* Rotates the camera (pitch/yaw) on left click
* Go up/down or right click
*/
Manipulation.prototype.handleMouseMove = function(event) {	
	event = event || window.event; // IE-ism
	this.mousePos = {
	  x: event.clientX,
	  y: event.clientY
	};

	var dX = this.mousePos.x - this.oldMousePos.x;
	var dY = this.mousePos.y - this.oldMousePos.y;

	if (this.draggingLeft){
		// move camera pitch/yaw
		this.yaw -= dX / 5.0;
		this.pitch -= dY / 5.0;
	}

	if (this.draggingRight) {
		// go up/down
		this.posY += dY / 20.0;
	}
	
	this.oldMousePos = this.mousePos;
};

/*
* Handle mouse wheel event, by going forward or backward
*/
Manipulation.prototype.handleWheel = function(event) {	
	if (event.deltaY < 0) { // Chrome, Firefox
		// go forward
		this.posX -= Math.sin(degToRad(this.yaw));
		this.posZ -= Math.cos(degToRad(this.yaw));
			
	} else {
		// go backward
		this.posX += Math.sin(degToRad(this.yaw));
		this.posZ += Math.cos(degToRad(this.yaw));
	}
	
	// dont scroll page, focus on canvas only
	event.preventDefault();
};

/*
* Hide right click context menu
*/
Manipulation.prototype.handleContextMenu = function(event) {
	event.preventDefault();
};

/*
* Handle key down when canvas is focused, and go forward/backward, up/down or left/right
*/
Manipulation.prototype.handleKeyDown = function(event) {
	// handle keys only if canvas is focused
	if (this.canvas != document.activeElement) {
		return;
	}
	
	switch(event.keyCode){		
		case 87: //w
			// go forward
			this.posX -= Math.sin(degToRad(this.yaw));
			this.posZ -= Math.cos(degToRad(this.yaw));
			break;
		case 83: //s
			// go back
			this.posX += Math.sin(degToRad(this.yaw));
			this.posZ += Math.cos(degToRad(this.yaw));
			break;
			
		case 68: //d
			// go right
			this.posX += Math.cos(degToRad(-this.yaw));
			this.posZ += Math.sin(degToRad(-this.yaw));
			break;
			
		case 65: //a
			// go left
			this.posX -= Math.cos(degToRad(-this.yaw));
			this.posZ -= Math.sin(degToRad(-this.yaw));
			break;
			
		case 81: //q
			// go up
			this.posY += 1.0;
			break;
			
		case 69: //e
			// go down
			this.posY -= 1.0;
			break;
	}
};

/*
* Translates the given model-view matrix by the current manipulation translation
*/
Manipulation.prototype.translateModelViewMatrix = function (mvMatrix) {
	return mat4.translate(mvMatrix, mvMatrix, [-this.posX, -this.posY, -this.posZ]);
};

/*
* Rotates the given model-view matrix by the current pitch and yaw of the camera
*/
Manipulation.prototype.rotateModelViewMatrix = function(mvMatrix) {
	mat4.rotate(mvMatrix, mvMatrix, degToRad(-this.pitch), [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(-this.yaw), [0, 1, 0]);
	return mvMatrix;
};
