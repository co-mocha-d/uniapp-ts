
const getType = (o)=>{
	let s = Object.prototype.toString.call(o);
	return s.match(/\[object (.*?)\]/)[1].toLowerCase();
}
export default getType