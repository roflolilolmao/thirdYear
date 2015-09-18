
/******************************************************************************************
* DataLoading prototype - abstract, should not be directly used
* This prototype defines a way to load data and storing data and colors representation
* Data are stored in a 2D array, and colors in a correspoding 2D array
* Subprototypes are used to load data from:
*	- Direct input text
* 	- Text file
* 	- Image file
* 	- Mathematical function, of the form F(x, y) = ...
*
* Mathieu Rosser, HE-ARC Ingénierie, 2014-2015
*******************************************************************************************/

/*
* New loading, which will call the callbackOnload function at the end of the processing
* Uses the data and colors variables as loaded data if provided
*/
var DataLoading = function(callbackOnload, data, colors) {
	this.data = data;
	this.colors = colors;
	this.callbackOnload = callbackOnload;
	this.calculateData();
	this.terminateLoading();
};

/*
* Maximum represented value in scene, all values are scaled down if upper that it
*/
DataLoading.limitMaxValue = 15.0;

/*
* Calculates the data to load - Abstract, implemented by subprototype
*/
DataLoading.prototype.calculateData = function() {};

/*
* Terminate the loading, by calculating the min and max value, and calls the callback function
*/
DataLoading.prototype.terminateLoading = function() {		
	this.calculateMinMax();
	this.callbackOnload(this);
};

/*
* Calculates the min and max values of the data
*/
DataLoading.prototype.calculateMinMax = function() {
	var linesNumber = this.data.length;
	this.minValue = +Infinity;
	this.maxValue = -Infinity;
		
	for (var i = 0; i < linesNumber; i++) {
		this.minValue = Math.min(this.minValue, Math.min.apply(null, this.data[i]));
		this.maxValue = Math.max(this.maxValue, Math.max.apply(null, this.data[i]));
	}
};

/*
* Returns the loaded data, as a 2D array
*/
DataLoading.prototype.getData = function() {
	return this.data;
};

/*
* Returns min and max values
*/
DataLoading.prototype.getMinMaxData = function() {
	return [this.minValue, this.maxValue];
};

/*
* Returns the colors corresponding to data, as a 2D array
*/
DataLoading.prototype.getColors = function() {
	return this.colors;
};

/******************************************************************************************
* DataLoading as text prototype - is used to load data from direct input text
* Format of text is: column separated by comma, lines by linefeed character
*******************************************************************************************/

/*
* New data loading object
*/
var DataLoadingText = function(callbackOnload, text) {
	this.text = text;
	DataLoading.call(this, callbackOnload, [], []);
};

DataLoadingText.prototype = Object.create(DataLoading.prototype);

/*
* Calculates the data corresponding to the input text
* Reads each line, and for each line, read each column
* Limits the values to a maximum if needed
*/
DataLoadingText.prototype.calculateData = function() {
	var textLines = this.text.split("\n");
		
	for (var i = 0; i < textLines.length; i++) {
		var textColumns = textLines[i].replace(/\s+/g, '').split(",");	// delete spaces chars and split
		var dataLine = [];
		var colors = [];
		
		for (var j = 0; j < textColumns.length; j++) {
			dataLine.push(+(textColumns[j]));	// data as float
			colors.push([]);	// no colors now, done later
		}
		
		this.data.push(dataLine);
		this.colors.push(colors);
	}
	
	// limit the values if needed and calculates colors
	
	this.calculateMinMax();
	var maxLimit = Math.max(Math.abs(this.maxValue), Math.abs(this.minValue));
	var normalize = Math.min(maxLimit, DataLoading.limitMaxValue);

	
	for (var i = 0; i < this.data.length; i++) {
		for (var j = 0; j < this.data[i].length; j++) {
			// limit
			if (maxLimit > DataLoading.limitMaxValue) {
				this.data[i][j] = this.data[i][j] * DataLoading.limitMaxValue / maxLimit;
			}
			
			// color, as grey levels
			var color = Math.abs(this.data[i][j]) * 1.0 / normalize;
			this.colors[i][j] = [color, color, color];
		}
	}
};

/******************************************************************************************
* DataLoading as text file prototype - is used to load data from text file
*******************************************************************************************/

/*
* New dataloading from text file : reads the file and gives the input text to the parent
*/
var DataLoadingTextFile = function(callbackOnload, file) {
	var me = this;
	var reader = new FileReader();
	
	reader.onload = function(e) {
		var text = reader.result;
		DataLoadingText.call(me, callbackOnload, text);
	};
	
	reader.readAsText(file, "utf-8");
};

DataLoadingTextFile.prototype = Object.create(DataLoadingText.prototype);

/******************************************************************************************
* DataLoading as image file - is used to load data from image file
* Reads the image, print it on the given canvas, and reads all pixels of the image
* Calculates the grey levels of each pixel to store the 2D data of each pixel [y][x]
* Stores the RGB values for the colors
*******************************************************************************************/

var DataLoadingImageFile = function(callbackOnload, file, canvas) {
	var me = this;
	var reader = new FileReader();
	
	reader.onload = function(e) {
		// load image
		var img = new Image();
		img.src = reader.result;
		
		img.onload = function(e) {
			// resize the image to a maximum of [300, 300]
			var ratioResizing = Math.max(img.width / 300.0, 1.0);
			ratioResizing = Math.max(img.height / 300.0, ratioResizing);
			
			var width = Math.floor(img.width / ratioResizing);
			var height = Math.floor(img.height / ratioResizing);
			
			canvas.width = width;
			canvas.height = height;
				
			// print on canvas
			var context = canvas.getContext("2d");
			context.drawImage(img, 0, 0, width, height);
			
			// read pixels
			var imageData = context.getImageData(0, 0, width, height).data;
			
			var tab2D = [];
			var colors = [];
			for (var i = 0; i < height; i++) {
				var line = [];
				var c = [];
				for (var j = 0; j < width; j++) {
					line.push(0);
					c.push([]);
				}
				tab2D.push(line);
				colors.push(c);
			}
			
			// stores 2D data (grey level) and the RGB colors of each pixel
			var index = 0;
			for (var i = height - 1; i >= 0 ; i--) {
				for (var j = 0; j < width; j++) {
					//var h = (imageData[index] + imageData[index + 1] + imageData[index + 2]) / 3.0;
					var h = 0.34 * imageData[index] + 0.5 * imageData[index + 1] + 0.16 * imageData[index + 2];	// R G B --> Gray
					
					// value = grey level
					tab2D[i][j] = h * 1.0 / 255.0 * DataLoading.limitMaxValue;
					// colors = RGB
					colors[i][j] = [imageData[index] / 255.0, imageData[index+1] / 255.0, imageData[index+2] / 255.0];
					index += 4;
				}
			}
		
			// gives the loaded data to the parent
			DataLoading.call(me, callbackOnload, tab2D, colors);
		};
	};
	
	reader.readAsDataURL(file);
};

DataLoadingImageFile.prototype = Object.create(DataLoading.prototype);

/******************************************************************************************
* DataLoading from mathematical function - is used to computes 2D data from a mathematical
* The function F(x, y) is computed for x & y [0, 100] and results are stored in 2D array
*******************************************************************************************/

/*
* Computes the mathematical function and stores data
*/
var DataLoadingFunction = function(callbackOnload, functionText) {
	this.functionText = functionText;
	
	var allValues = [];
	
	for (var y = 0; y < 100; y++) {
		
		var values = [];
		// computes function value for each [y][x] pair
		for (var x = 0; x < 100; x++) {
			var value = eval(this.functionText.replace("x", x).replace("y", y));
			values.push(value);
		}
		
		allValues.push(values.join(","));
	}
	
	// gives data to parent
	var text = allValues.join("\n");	
	DataLoadingText.call(this, callbackOnload, text);
};

DataLoadingFunction.prototype = Object.create(DataLoadingText.prototype);
