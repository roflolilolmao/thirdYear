  /**
  Copyright (c) 2013 Aaron Boman and aaronboman.com

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  **/
  
  if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (str) {
      return this.slice(0, str.length) === str;
	};
  }
  
  var OBJ = {};
  window.OBJ = OBJ;

  /**
   * The main Mesh class. The constructor will parse through the OBJ file data
   * and collect the vertex, vertex normal, texture, and face information. This
   * information can then be used later on when creating your VBOs. See
   * OBJ.initMeshBuffers for an example of how to use the newly created Mesh
   *
   * @class Mesh
   * @constructor
   *
   * @param {String} objectData a string representation of an OBJ file with newlines preserved.
   */
  OBJ.Mesh = function (objectData) {
    /*
     The OBJ file format does a sort of compression when saving a model in a
     program like Blender. There are at least 3 sections (4 including textures)
     within the file. Each line in a section begins with the same string:
       * 'v': indicates vertex section
       * 'vn': indicates vertex normal section
       * 'f': indicates the faces section
       * 'vt': indicates vertex texture section (if textures were used on the model)
     Each of the above sections (except for the faces section) is a list/set of
     unique vertices.

     Each line of the faces section contains a list of
     (vertex, [texture], normal) groups
     Some examples:
         // the texture index is optional, both formats are possible for models
         // without a texture applied
         f 1/25 18/46 12/31
         f 1//25 18//46 12//31

         // A 3 vertex face with texture indices
         f 16/92/11 14/101/22 1/69/1

         // A 4 vertex face
         f 16/92/11 40/109/40 38/114/38 14/101/22

     The first two lines are examples of a 3 vertex face without a texture applied.
     The second is an example of a 3 vertex face with a texture applied.
     The third is an example of a 4 vertex face. Note: a face can contain N
     number of vertices.

     Each number that appears in one of the groups is a 1-based index
     corresponding to an item from the other sections (meaning that indexing
     starts at one and *not* zero).

     For example:
         `f 16/92/11` is saying to
           - take the 16th element from the [v] vertex array
           - take the 92nd element from the [vt] texture array
           - take the 11th element from the [vn] normal array
         and together they make a unique Vertex.
     Using all 3+ unique Vertices from the face line will produce a polygon.

     Now, you could just go through the OBJ file and create a new Vertex for
     each face line and WebGL will draw what appears to be the same model.
     However, vertices will be overlapped and duplicated all over the place.

     Consider a cube in 3D space centered about the origin and each side is
     2 units long. The front face (with the positive Z-axis pointing towards
     you) would have a Top Right vertex (looking orthogonal to its normal)
     mapped at (1,1,1) The right face would have a Top Left vertex (looking
     orthogonal to its normal) at (1,1,1) and the top face would have a Bottom
     Right vertex (looking orthogonal to its normal) at (1,1,1). Each face
     has a vertex at the same coordinates, however, three distinct vertices
     will be drawn at the same spot.

     To solve the issue of duplicate Vertices (the `(vertex, [texture], normal)`
     groups), while iterating through the face lines, when a group is encountered
     the whole group string ('16/92/11') is checked to see if it exists in the
     packed.hashindices object, and if it doesn't, the indices it specifies
     are used to look up each attribute in the corresponding attribute arrays
     already created. The values are then copied to the corresponding unpacked
     array (flattened to play nice with WebGL's ELEMENT_ARRAY_BUFFER indexing),
     the group string is added to the hashindices set and the current unpacked
     index is used as this hashindices value so that the group of elements can
     be reused. The unpacked index is incremented. If the group string already
     exists in the hashindices object, its corresponding value is the index of
     that group and is appended to the unpacked indices array.
     */
    var verts = [], vertNormals = [], textures = [], unpacked = {};
    // unpacking stuff
    unpacked.verts = [];
    unpacked.norms = [];
    unpacked.textures = [];
    unpacked.hashindices = {};
    unpacked.indices = [];
    unpacked.index = 0;
    // array of lines separated by the newline
    var lines = objectData.split('\n'), i;
    for (i = 0; i < lines.length; i++) {
      // if this is a vertex
      var line;
      if (lines[i].startsWith('v ')) {
        line = lines[i].slice(2).split(" ");
        verts.push(line[0]);
        verts.push(line[1]);
        verts.push(line[2]);
      } else if (lines[i].startsWith('vn')) {
        // if this is a vertex normal
        line = lines[i].slice(3).split(" ");
        vertNormals.push(line[0]);
        vertNormals.push(line[1]);
        vertNormals.push(line[2]);
      } else if (lines[i].startsWith('vt')) {
        // if this is a texture
        line = lines[i].slice(3).split(" ");
        textures.push(line[0]);
        textures.push(line[1]);
      } else if (lines[i].startsWith('f ')) {
        // if this is a face
        /*
        split this face into an array of Vertex groups
        for example:
           f 16/92/11 14/101/22 1/69/1
        becomes:
          ['16/92/11', '14/101/22', '1/69/1'];
        */
        line = lines[i].slice(2).split(" ");
        var quad = false;
        for (var j=0; j<line.length; j++){
            // Triangulating quads
            // quad: 'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2 v3/t3/vn3/'
            // corresponding triangles:
            //      'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2'
            //      'f v2/t2/vn2 v3/t3/vn3 v0/t0/vn0'
            if(j === 3 && !quad) {
                // add v2/t2/vn2 in again before continuing to 3
                j = 2;
                quad = true;
            }
            if(line[j] in unpacked.hashindices){
                unpacked.indices.push(unpacked.hashindices[line[j]]);
            }
            else{
                /*
                Each element of the face line array is a Vertex which has its
                attributes delimited by a forward slash. This will separate
                each attribute into another array:
                    '19/92/11'
                becomes:
                    Vertex = ['19', '92', '11'];
                where
                    Vertex[0] is the vertex index
                    Vertex[1] is the texture index
                    Vertex[2] is the normal index
                 Think of faces having Vertices which are comprised of the
                 attributes location (v), texture (vt), and normal (vn).
                 */
                var Vertex = line[ j ].split( '/' );
                /*
                 The verts, textures, and vertNormals arrays each contain a
                 flattend array of coordinates.

                 Because it gets confusing by referring to Vertex and then
                 vertex (both are different in my descriptions) I will explain
                 what's going on using the vertexNormals array:

                 Vertex[2] will contain the one-based index of the vertexNormals
                 section (vn). One is subtracted from this index number to play
                 nice with javascript's zero-based array indexing.

                 Because vertexNormal is a flattened array of x, y, z values,
                 simple pointer arithmetic is used to skip to the start of the
                 vertexNormal, then the offset is added to get the correct
                 component: +0 is x, +1 is y, +2 is z.

                 This same process is repeated for verts and textures.
                 */
                // vertex position
                unpacked.verts.push(verts[(Vertex[0] - 1) * 3 + 0]);
                unpacked.verts.push(verts[(Vertex[0] - 1) * 3 + 1]);
                unpacked.verts.push(verts[(Vertex[0] - 1) * 3 + 2]);
                // vertex textures
                unpacked.textures.push(textures[(Vertex[1] - 1) * 2 + 0]);
                unpacked.textures.push(textures[(Vertex[1] - 1) * 2 + 1]);
                // vertex normals
                unpacked.norms.push(vertNormals[(Vertex[2] - 1) * 3 + 0]);
                unpacked.norms.push(vertNormals[(Vertex[2] - 1) * 3 + 1]);
                unpacked.norms.push(vertNormals[(Vertex[2] - 1) * 3 + 2]);
                // add the newly created vertex to the list of indices
                unpacked.hashindices[line[j]] = unpacked.index;
                unpacked.indices.push(unpacked.index);
                // increment the counter
                unpacked.index += 1;
            }
            if(j === 3 && quad) {
                // add v0/t0/vn0 onto the second triangle
                unpacked.indices.push( unpacked.hashindices[line[0]]);
            }
        }
      }
    }
    this.vertices = unpacked.verts;
    this.vertexNormals = unpacked.norms;
    this.textures = unpacked.textures;
    this.indices = unpacked.indices;
  }
  