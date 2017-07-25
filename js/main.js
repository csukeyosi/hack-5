var map;

function initMap() {
    map = new Map();
}
function getCentroid() {
    return map.getCentroid();
}
function resetSearch() {
	map = new Map();
	document.getElementById('city-auto').value = "";
	document.getElementById('pin-auto').value = "";
}