var map;
var pinList = new PinList();


function initMap() {
    map = new Map(pinList);
}
function getCentroid() {
    return map.getCentroid();
}
function resetSearch() {
	map = new Map(pinList);
	document.getElementById('city-auto').value = "";
	document.getElementById('pin-auto').value = "";
	pinList.deleteAll();
}

function removePin(pin) {
    pinList.removePin($(pin).parent().parent()[0]);
}