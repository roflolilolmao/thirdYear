
function vec(x, y, z)
{
	this.x = x;
	this.y = y;
	this.z = z;
	function normalize()
	{
		var norm = Math.sqrt(x * x + y * y + z * z);
		if (norm == 0.0)
			norm = 1.0;
		return [x / norm, y / norm, z / norm];
	}
	function add(v)
	{
		return vec(x + v.x, y + v.y, z + v.z);
	}
	function substract(v)
	{
		return vec(x - v.x, y - v.y, z - v.z);
	}
	function multiply(f)
	{
		return vec(f * x, f * y, f * z);
	}
}
