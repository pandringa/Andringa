var gradients = [
	["#DE6262","#FFB88C"],
	["#70e1f5","#ffd194"],
	["#B3FFAB","#12FFF7"],
	["#F0C27B","#4B1248"],
	["#C9FFBF","#FFAFBD"],
	["#B993D6","#8CA6DB"],
	["#D3959B","#BFE6BA"],
	["#DAD299","#B0DAB9"],
	["#5D4157","#A8CABA"],
	["#DDD6F3","#FAACA8"],
	["#DE6262","#cbad6d"],
	["#4B6CB7","#182848"],
	["#FC354C","#0ABFBC"],
	["#5F2C82","#49A09D"],
	["#7474BF","#7474BF"],
	["#3D7EAA","#FFE47A"],
	["#5C258D","#4389A2"],
	["#C2E59C","#64B3F4"],
	["#348F50","#56B4D3"]
]

var current = one = document.querySelector('.background.one');
var next = two = document.querySelector('.background.two');

function changeGradient(){
	var r = Math.floor(Math.random()*gradients.length);
	next.style.background = "linear-gradient(to right, "+gradients[r][0]+", "+gradients[r][1]+")";
	next.style.opacity = 1;
	current.style.opacity = 0;
	
	var temp = next;
	next = current;
	current = temp;
}
changeGradient()

setTimeout(changeGradient, 2000)
setInterval(changeGradient,8*1000)