// Helpers
function hasClass(el, className) {
  if (!el) return false;
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}
function addClass(el, className) {
  if (!el) return false;
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
  return true;
}
function removeClass(el, className) {
  if (!el) return false;
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
  return false;
}
function toggleClass(el, className) {
  if ( hasClass(el, className) )
    return removeClass(el, className);
  else 
    return addClass(el, className);
}

var gradients = [
	["#DE6262","#FFB88C"],
	["#70e1f5","#ffd194"],
	["#B3FFAB","#12FFF7"],
	["#F0C27B","#4B1248"],
	["#FF4E50","#F9D423"],
	["#B993D6","#8CA6DB"],
	["#606c88","#3f4c6b"],
	["#C9FFBF","#FFAFBD"],
	["#B993D6","#8CA6DB"],
	["#00d2ff","#3a7bd5"],
	["#D3959B","#BFE6BA"],
	["#DAD299","#B0DAB9"],
	["#5D4157","#A8CABA"],
	["#DDD6F3","#FAACA8"],
	["#DE6262","#cbad6d"],
	["#4B6CB7","#182848"],
	["#FC354C","#0ABFBC"],
	["#E43A15","#E65245"],
	["#5F2C82","#49A09D"],
	["#7474BF","#7474BF"],
	["#3D7EAA","#FFE47A"],
	["#1CD8D2","#93EDC7"],
	["#5C258D","#4389A2"],
	["#C2E59C","#64B3F4"],
	["#348F50","#56B4D3"]
]

var current = one = document.querySelector('.background.one');
var next = two = document.querySelector('.background.two');
var card = document.querySelector('.card');

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
changeGradient()

function flip(){
	toggleClass(card, "flip")
}
card.onclick = flip

setInterval(changeGradient,8*1000)