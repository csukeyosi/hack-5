function PinList() {
    this.pins = [];
    this.element = $('#pinslist')[0];
}

PinList.prototype.createPinHTML = function(name) {
    return '<li class="pin">' +
                '<div class="pin-name">' + name + '</div>' +
                '<a href="#" title="Delete your Pin" ><div class="pin-delete" onclick="removePin(this)">x</div> </a>' +
            '</li>';
};

PinList.prototype.addPin = function(name) {
    var comaIndex = name.indexOf(',');
    if (comaIndex > -1) {
        name = name.substr(0, comaIndex);
    }

    this.pins.push(name);
    $(this.element).append(this.createPinHTML(name));
};

PinList.prototype.removePin = function(pin) {

    var name = pin.firstChild.innerText;
    var index = this.pins.indexOf(name);
    if (index > -1) {
        this.pins.splice(index, 1);
    }

    pin.remove();

    $(this).trigger('pinRemoved', pin);
};

PinList.prototype.deleteAll = function() {
    var pins = $("#pinslist .pin");
    for (var i = 0; i < pins.length; i++) {
        $(this).trigger('pinRemoved', pins[i]);
    }
    $("#pinslist .pin").remove();
}