//ViewSphere.js

var View = require('./framework/View');
var Mesh = require('./framework/Mesh');
var Texture = require('./framework/Texture');

function ViewSphere(){};

var p = ViewSphere.prototype = new View();
var s = View.prototype;

var gl = null;

var grad3 = [[0,1,1],[0,1,-1],[0,-1,1],[0,-1,-1],
               [1,0,1],[1,0,-1],[-1,0,1],[-1,0,-1],
               [1,1,0],[1,-1,0],[-1,1,0],[-1,-1,0], // 12 cube edges
               [1,0,-1],[-1,0,-1],[0,-1,1],[0,1,1]]; // 4 more to make 16

var perm = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
  129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

var simplex4 = [
  [0,64,128,192],[0,64,192,128],[0,0,0,0],[0,128,192,64],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[64,128,192,0],
  [0,128,64,192],[0,0,0,0],[0,192,64,128],[0,192,128,64],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[64,192,128,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [64,128,0,192],[0,0,0,0],[64,192,0,128],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],[128,192,0,64],[128,192,64,0],
  [64,0,128,192],[64,0,192,128],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[128,0,192,64],[0,0,0,0],[128,64,192,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [128,0,64,192],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [192,0,64,128],[192,0,128,64],[0,0,0,0],[192,64,128,0],
  [128,64,0,192],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [192,64,0,128],[0,0,0,0],[192,128,0,64],[192,128,64,0]
];

p.init = function(vertPath, fragPath){

	gl = window.NS.GL.glContext;
	
	s.init.call(this, vertPath, fragPath);

	this._angle = 0;

	var positions = [];
	var coords = [];
	var indices = [];
	var normals = [];

	var latitudeBands = 15;
    var longitudeBands = 45;
    var radius = 1.2;

	for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            // normalData.push(x);
            // normalData.push(y);
            // normalData.push(z);

            normals.push([x,y,z]);

            coords.push([u-.2,v]);

            positions.push([radius * x, radius * y, radius * z]);

            // textureCoordData.push(u);
            // textureCoordData.push(v);
            // vertexPositionData.push(radius * x);
            // vertexPositionData.push(radius * y);
            // vertexPositionData.push(radius * z);
        }
    }

    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;

            indices.push(first, second, first+1, second, second + 1, first + 1);
            // indexData.push(first);
            // indexData.push(second);
            // indexData.push(first + 1);

            // indexData.push(second);
            // indexData.push(second + 1);
            // indexData.push(first + 1);
        }
    }

	this.mesh = new Mesh();
	this.mesh.init(positions.length, indices.length, gl.TRIANGLES);
	this.mesh.bufferVertex(positions);
	this.mesh.bufferTexCoords(coords);
	this.mesh.bufferIndices(indices);

	// positions = [];
	// coords = [];
	// indices = [0, 1, 2, 0, 2, 3];

	// var size = .2;
	// positions.push([-size, -size, 0]);
	// positions.push([ size, -size, 0]);
	// positions.push([ size,  size, 0]);
	// positions.push([-size,  size, 0]);

	// coords.push([0, 0]);
	// coords.push([1, 0]);
	// coords.push([1, 1]);
	// coords.push([0, 1]);

	// this.mesh = new Mesh();
	// this.mesh.init(4, 6, gl.TRIANGLES);
	// this.mesh.bufferVertex(positions);
	// this.mesh.bufferTexCoords(coords);
	// this.mesh.bufferIndices(indices);

	this.createNoiseTexture();

};

p.createNoiseTexture = function(){

	// PERM TEXTURE
	var pixels = new Uint8Array(256 * 256 * 4);
	
	permTexture = gl.createTexture(); // Generate a unique texture ID
	gl.bindTexture(gl.TEXTURE_2D, permTexture); // Bind the texture to texture unit 0

	// pixels = (char*)malloc( 256*256*4 );
	for(var i = 0; i<256; i++){
		for(var j = 0; j<256; j++) {
		  var offset = (i*256+j)*4;
		  var value = perm[(j+perm[i]) & 0xFF];
		  pixels[offset] = grad3[value & 0x0F][0] * 64 + 64;   // Gradient x
		  pixels[offset+1] = grad3[value & 0x0F][1] * 64 + 64; // Gradient y
		  pixels[offset+2] = grad3[value & 0x0F][2] * 64 + 64; // Gradient z
		  pixels[offset+3] = value;                     // Permuted index
		}
	}
	
	// GLFW texture loading functions won't work here - we need GL_NEAREST lookup.
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	this._permTexture = new Texture();
	this._permTexture.init(permTexture, true);



	var test = new Uint8Array(64 * 1 * 4);
	// debugger;

	var index = 0;
	for (var i=0;i<simplex4.length;i++){
		for (var j=0;j<simplex4[i].length;j++){

			test[index] = simplex4[i][j];

			index++;
		}
	}


	// SIMPLEX TEXTURE
	// gl.activeTexture(gl.TEXTURE1); // Activate a different texture unit (unit 1)

	simplexTexture = gl.createTexture(); // Generate a unique texture ID
	gl.bindTexture(gl.TEXTURE_2D, simplexTexture); // Bind the texture to texture unit 1

	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 64, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, test );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	this._simplexTexture = new Texture();
	this._simplexTexture.init(simplexTexture, true);
};



p.render = function(reflTexture) {

	this.transforms.calculateModelView();

	var mvMatrix = this.transforms.getMvMatrix();

	this.transforms.push();

	var nMatrix = mat4.create();

	mat4.copy(nMatrix, mvMatrix);
    mat4.invert(nMatrix, nMatrix);
    mat4.transpose(nMatrix, nMatrix);

    mat4.translate(mvMatrix, mvMatrix, [0, 0, -5]);
	mat4.rotate(mvMatrix, mvMatrix, this._angle*Math.PI, [0, 0, 1]);
    // mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
    
	// return;
	this.shader.bind();
	// this.shader.uniform("reflTexture", "uniform1i", 0);
	this.shader.uniform("uNMatrix", "uniformMatrix4fv", nMatrix);
	this.shader.uniform("time", "uniform1f", Date.now());
	this.shader.uniform("angle", "uniform1f", this._angle+=.0001);
	

	this.shader.uniform("simplexTexture", "uniform1i", 0);
	this.shader.uniform("permTexture", "uniform1i", 1);
	this.shader.uniform("dustTexture", "uniform1i", 2);
	// reflTexture.bind(this.shader, 0);

	this._simplexTexture.bind(this.shader, 0);
	this._permTexture.bind(this.shader, 1);
	reflTexture.bind(this.shader, 2);
	
	this.draw(this.mesh);

	this.transforms.pop();
};

module.exports = ViewSphere;