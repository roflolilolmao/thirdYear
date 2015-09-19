////////////////////////////////////////////////
////              Model Loader              ////
////////////////////////////////////////////////

//		<script src="js/OBJ_loader.js"></script>		


/**
* Creates the buffers that contain the geometry of the model (in OBJ format)
*/
var textureBuffersArray = [];

function handleOBJModel(filename, data){
	console.info(filename + ' has been retrieved from the server');
	
	var objData = new OBJ.Mesh(data);
	vertexBuffer = getVertexBufferWithVertices(objData.vertices);
	normalsBuffer = getVertexBufferWithVertices(objData.vertexNormals);
	textureBuffer = getVertexBufferWithVertices(objData.textures);
	indexBuffer = getIndexBufferWithIndices(objData.indices);
	
	vertexBuffersArray.push(vertexBuffer);
	normalBuffersArray.push(normalsBuffer);
	textureBuffersArray.push(textureBuffer);
	indexBuffersArray.push(indexBuffer);
	indicesArray.push(objData.indices);	
}

function showPayloadInfo( filename, payload ) {
	console.info(filename + ' has been retrieved from the server');

	console.info("v: " + payload.vertices);
	console.info("i: " + payload.indices);
	console.info("c: " + payload.colors);
	
	var passTable = [];
	passTable = payload.indices;
	
	console.info("#polygones : " + passTable.length / 3);
}

/**
* Creates the buffers that contain the geometry of the model
*/
function handleJSONModel( filename, payload ) {
	showPayloadInfo( filename, payload );
	
	indices = payload.indices;

	//initializes buffers: sends data from the JavaScript arrays to the graphics card
	vertexBuffer = getVertexBufferWithVertices(payload.vertices);					
	normalsBuffer = getVertexBufferWithVertices(payload.normals);
	indexBuffer = getIndexBufferWithIndices(payload.indices);
	
	//init lights
	initLights();
	//Starts rendering loop, calls drawScene
	renderLoop();	
}

/**
* Creates an AJAX request to load a model asynchronously
*/
function loadModel(filename){
	var request = new XMLHttpRequest();
	console.info('Requesting ' + filename);
	request.open("GET",filename);
	
	request.onreadystatechange = function() {
	  if (request.readyState == 4) {
		if(request.status == 404) {
			console.info(filename + ' does not exist');
		 }
		else {
			var re = /(?:\.([^./]+))?$/;
			var ext = re.exec(filename)[1];
			console.info('file: '+ filename + ', ext: ' + ext);
			switch( ext ){
				case "json": handleJSONModel(filename, JSON.parse(request.responseText)); break;
				case "obj":  handleOBJModel(filename, request.responseText); break;
				default: console.info("unknown format extension: " + ext );
			}
		}
	  }
	}
	request.send();
}