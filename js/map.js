function Map(pinList) {
    this.center =  {lat: 52.3702160, lng: 4.8951680};
    this.leftPins = pinList;
    this.map = new google.maps.Map(document.getElementById('map'), {
        center: this.center,
        zoom: 15,
        mapTypeControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        }
    });
    this.locations = [];

    this.infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(this.infowindow,'closeclick',function(){
        if (this.infowindow.marker) {
            this.infowindow.marker.setAnimation(null);
        }
        infowindow.marker = null;
    }.bind(this));

    google.maps.event.addListener(this.map,'click',function(e){
        this.getAddress(e.latLng, function(results) {
            var title = 'address not found';
            if (results.length > 0) {
                title = results[0].formatted_address;
            }
            var marker = this.createMarker(e, e.latLng, title, '0ab21b');
            this.locations.push(new Point(e.latLng.lat(), e.latLng.lng(), title, marker));
            this.leftPins.addPin(title);

        }.bind(this));
    }.bind(this));


    $(this.leftPins).on('pinRemoved', function(event, removedPin) {
        var pinName = $(removedPin)[0].firstChild.innerText;

        for (var i = 0; i < this.locations.length; i++) {
            var locationName = this.locations[i].title;
            var comaIndex = locationName.indexOf(',');
            if (comaIndex > -1) {
                var strippedName = locationName.substring(0, comaIndex);
            }

            if (pinName === strippedName) {
                this.locations[i].marker.setMap(null);
                this.locations.splice(i, 1);
                return;
            }
        }

    }.bind(this));

    this.addCityAutoComplete();
    this.addPinAutoComplete();
}

Map.prototype.createMarker = function(element, position, title, color, bestmatch, isHotel) {
   // Get the position from the location array.
    // var title = 'teste';
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
        bestmatch: bestmatch,
        isHotel: isHotel,
        title: title,
        element: element,
        position: position,
        // title: title,
        animation: google.maps.Animation.DROP,
        // icon: defaultIcon,
        // id: i,
        isVisible: true,
        icon : this.makeMarkerIcon('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + color)
        // type: type
    });

    this.addOnClickListener(marker);
    marker.setMap(this.map);

    return marker;
};

/**
 * @description Add Marker's onclick event listener.
 * @param {google.maps.Marker} marker
 */
Map.prototype.addOnClickListener = function(marker) {
    marker.addListener('click', function() {
        this.populateInfoWindow(marker);
    }.bind(this));
};

/**
 * @description This function populates the infowindow when the marker is clicked. We'll only allow
 * one infowindow which will open at the marker that is clicked, and populate based
 * on that markers position.
 * @param {google.maps.Marker} marker - the clicked marker.
 */
Map.prototype.populateInfoWindow = function(marker) {
    if (this.infowindow.marker) {
        this.infowindow.marker.setAnimation(null);
    }

    // Check to make sure the infowindow is not already opened on this marker.
    if (this.infowindow.marker != marker) {
        // marker.setAnimation(google.maps.Animation.BOUNCE);
        // Clear the infowindow content to give the streetview time to load.
        this.infowindow.setContent('');
        this.infowindow.marker = marker;
        var self = this;

        var params = ('term=' + marker.title +
            '&latitude=' + marker.position.lat() +
            '&longitude=' + marker.position.lng());
        var content;
        $.get('/yelp_search?' + params, function(data, status) {
            if (status === 'success' && data.businesses.length > 0) {
                var buttonClass = 'but-reserve';
                if(marker.bestmatch) {
                    buttonClass = 'but-reserve but-reservegold';
                }
                var business = data.businesses[0];
                if (marker.isHotel) {
                    business.url = "https://www.booking.com";
                }
                content = '<div id="pano" style="width:150px;height: 100px;overflow: hidden;margin: 8px 0">' +
                    '<a href="'+ business.url + '"><img id="" class="img-infowindow text-center" width="100%" height="auto" src='+ business.image_url +'></img></a>' +
                    '</div>' +
                    '<div style="Font-size: 13px;line-height: 17px;font-weight: bold;width:150px;">' + marker.title + '</div>' +
                    '<hr>' +

                    '<div>' +
                    '<p style="Font-size: 13px;line-height: 17px;width:150px;">Phone: ' + business.display_phone +'<br>' + 'Rating: '+ business.rating + '</p>' +
                    '</div>' +

                    '<p style="Font-size: 13px;line-height: 17px;width:150px;">For more info:</p>';
                 if (marker.isHotel) {
                    content += '<a href="https://www.booking.com" class="'+ buttonClass +'">Book Now</a>';
                }
            } else {
                content = '<div class="bold">' + marker.title + '</div>';
            }
        }).fail(function() {
            content = '<div class="bold">' + marker.title + '</div>' +
                '<hr>' +
                '<div>Error: could not retrieve additional information.</div>';
        }).always(function() {
            self.infowindow.setContent(content);
        });

        // Open the infowindow on the correct marker.
        this.infowindow.open(this, marker);
    } else {
        this.infowindow.close();
    }
};

Map.prototype.getCentroid = function() {
    var centroid = new Region(this.locations).centroid();
    var myLatlng = new google.maps.LatLng(centroid.x, centroid.y);
    this.getMarkers(myLatlng);

    return myLatlng;
};

Map.prototype.addCityAutoComplete = function() {
    var options = {
        types: ['(cities)']
    };
    var input = document.getElementById('city-auto');
    var cityAutocomplete = new google.maps.places.Autocomplete(input, options);
    cityAutocomplete.bindTo('bounds', this.map);
    cityAutocomplete.addListener('place_changed', function() {
      var place = cityAutocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      this.map.setCenter(place.geometry.location);
      this.map.setZoom(15);
    }.bind(this));
};

Map.prototype.addPinAutoComplete = function() {
    var options = {
        strictBounds: true
    };
    var input = document.getElementById('pin-auto');
    var pinAutocomplete = new google.maps.places.Autocomplete(input, options);
    pinAutocomplete.bindTo('bounds', this.map);
    pinAutocomplete.addListener('place_changed', function() {
      var place = pinAutocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      var marker = this.createMarker(place, place.geometry.location, place.name, '0ab21b');
      this.locations.push(new Point(place.geometry.location.lat(), place.geometry.location.lng(), place, marker));
      this.leftPins.addPin(place.name);

      this.map.setCenter(place.geometry.location);
      this.map.setZoom(15);
    }.bind(this));
};

/**
* @description The icon will be 44 px wide by 44 high, have an origin
* of 0, 0 and be anchored at 10, 34).
* @param {string} path - path to the file.
* @return {google.maps.MarkerImage}
*/
Map.prototype.makeMarkerIcon = function(path) {
    var markerImage = new google.maps.MarkerImage(path);
    return markerImage;
};

 Map.prototype.getMarkers = function(center) {
    var request = {
        location: center,
        radius: '300',
        type: ['lodging']
    };

    var service = new google.maps.places.PlacesService(this.map);
    service.nearbySearch(request, function(results, status) {
        var markers = [];
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                if (i === 0) {
                    this.createMarker(results[i], results[i].geometry.location, results[i].name, 'febb02', true, true);
                } else {
                    this.createMarker(results[i], results[i].geometry.location, results[i].name, '003580', false, true);
                }
            }
        } else {
            alert("Could not retrieve the " + type + "s. (Status error: " + status + ")");
        }

    }.bind(this));
 };

 Map.prototype.getAddress = function(position, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            var results = JSON.parse(xmlHttp.responseText).results;
            callback(results);
        }
    }
    var theUrl = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.lat() + ',' + position.lng() + '&sensor=true';
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
 };
