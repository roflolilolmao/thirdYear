/*
* Fonctions pour calculer les normales d'un triangle
* Les 3 vertex du triangle auront la même normale, calculée à partir du 1er point
* Issu des fonctions du fichier JS Marching Cubes
*/

function crossProduct(u, v) {
	var p = [];
	p.push(u[1]*v[2] - u[2]*v[1],
			u[2]*v[0] - u[0]*v[2],
			u[0]*v[1] - u[1]*v[0]);
			
	return p;
}

function normalize(v) {

	var n = [];
	
	var m = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
	m = (m == 0) ? 1.0 : m;
	
	n.push(v[0]/m, v[1]/m, v[2]/m);
	return n;
}


function calculateNormalsForVertices(vertices) {
	var normals = [];
	for(var t = 0; t < vertices.length - 12; t+=3){
		var t0 = t * 3;
		var t1 = t0 + 3;
		var t2 = t0 + 6;
		
		var v0 = [vertices[t0], vertices[t0+1], vertices[t0+2]];
		var v1 = [vertices[t1], vertices[t1+1], vertices[t1+2]];
		var v2 = [vertices[t2], vertices[t2+1], vertices[t2+2]];
		
		var u = [v1[0]- v0[0], v1[1]- v0[1], v1[2]- v0[2]];
		var v = [v2[0]- v0[0], v2[1]- v0[1], v2[2]- v0[2]];
		
		var normal = normalize( crossProduct(u, v) );
		
		normals.push(normal[0], normal[1], normal[2]);
		normals.push(normal[0], normal[1], normal[2]);
		normals.push(normal[0], normal[1], normal[2]);
	}
	
	return normals;
}
