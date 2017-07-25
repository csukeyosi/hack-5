var map;
var infowindow;
var locations = [];

 function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function Region(points) {
        this.points = points || [];
        this.length = points.length;
    }

    Region.prototype.area = function () {
        var area = 0,
            i,
            j,
            point1,
            point2;

        for (i = 0, j = this.length - 1; i < this.length; j=i,i++) {
            point1 = this.points[i];
            point2 = this.points[j];
            area += point1.x * point2.y;
            area -= point1.y * point2.x;
        }
        area /= 2;

        return area;
    };

    Region.prototype.centroid = function () {
        var x = 0,
            y = 0,
            i,
            j,
            f,
            point1,
            point2;

        for (i = 0, j = this.length - 1; i < this.length; j=i,i++) {
            point1 = this.points[i];
            point2 = this.points[j];
            f = point1.x * point2.y - point2.x * point1.y;
            x += (point1.x + point2.x) * f;
            y += (point1.y + point2.y) * f;
        }

        f = this.area() * 6;

        return new Point(x / f, y / f);
    };


/**
* @description Initialize the map, infowindow and the viewmodel.
*/
function initMap() {
	// create the map
	var center =  {lat: 52.3702160, lng: 4.8951680};
	map = new google.maps.Map(document.getElementById('map'), {
		center: center,
		zoom: 15,
		mapTypeControl: false
	});
	google.maps.event.addListener(map,'click',function(e){
   		createMarker(e.latLng, '00FF00');
   		locations.push(new Point(e.latLng.lat(), e.latLng.lng()));
	});

	addCityAutoComplete();
	addPinAutoComplete();

	// create the ViewModel and get the markers
	var vm = new ViewModel();
	ko.applyBindings(vm);
};
/**
 * @description Retrieve the places and create the respective markers.
 * @param {object} center - latitude and longitude.
 * @param {string} type - restaurant or gym.
 * @param {function} callback - used to rertun the created markers.
 */
 function getMarkers(center) {
 	var request = {
 		location: center,
 		radius: '200',
 		type: ['lodging']
 	};

 	var service = new google.maps.places.PlacesService(map);
 	service.nearbySearch(request, function(results, status) {
 		var markers = [];
 		if (status == google.maps.places.PlacesServiceStatus.OK) {
 			for (var i = 0; i < results.length; i++) {
 				console.log(results[i])
 				createMarker(results[i].geometry.location, '0000FF');
 			}
 		} else {
 			alert("Could not retrieve the " + type + "s. (Status error: " + status + ")");
 		}

 	});
 }

function addCityAutoComplete() {
	var options = {
  		types: ['(cities)']
 	};
	var input = document.getElementById('city-auto');
	var cityAutocomplete = new google.maps.places.Autocomplete(input, options);
	cityAutocomplete.bindTo('bounds', map);
	cityAutocomplete.addListener('place_changed', function() {
      var place = cityAutocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      map.setCenter(place.geometry.location);
      map.setZoom(15);
    });
};

function addPinAutoComplete() {
	var options = {
  		strictBounds: true
 	};
	var input = document.getElementById('pin-auto');
	var pinAutocomplete = new google.maps.places.Autocomplete(input, options);
	pinAutocomplete.bindTo('bounds', map);
	pinAutocomplete.addListener('place_changed', function() {
      var place = pinAutocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      var marker = new google.maps.Marker({
          map: map,
          anchorPoint: new google.maps.Point(0, -29)
        });
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      locations.push(new Point(place.geometry.location.lat(), place.geometry.location.lng()));

      map.setCenter(place.geometry.location);
      map.setZoom(15);
    });
};

function getCentroid() {
	var centroid = new Region(locations).centroid();
	var myLatlng = new google.maps.LatLng(centroid.x, centroid.y);
	getMarkers(myLatlng);

	return myLatlng;
};

/**
* @description Create a feedback alert when the google maps api load goes wrong.
*/
function handleError() {
	alert("Sorry! Something went wrong. Could not retrieve the map.");
}

/**
* @description Control the list and the buttons.
*/
var ViewModel = function() {
	var self = this;

 	self.getCentroid = function() {
		var myLatlng = getCentroid();
		// createMarker(myLatlng);
	};
};


/**
* @description Show/Hide the maskers.
* @param shown - markers shown.
* @param hidden - markers hidedn.
* @param type - restaurant or gym.
*/
function showHideMarkers(shown, hidden, type) {
	infowindow.close();

	var removed = shown.remove(function(item) {
		return item.type === type;
	});

	var isHide = removed.length;

	for (var j = 0; j < removed.length; j++) {
		removed[j].setMap(null);
		hidden.push(removed[j]);
	}

	if (!isHide) {
		removed = hidden.remove(function(item) {
			return item.type === type;
		});

		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < removed.length; i++) {
			removed[i].setMap(map);
			bounds.extend(removed[i].position);
			shown.push(removed[i]);
		}

		map.fitBounds(bounds);
	}
}


function createMarker(position, color) {
	// Get the position from the location array.
	// var title = 'teste';
	// Create a marker per location, and put into markers array.
	console.log(position)
	var marker = new google.maps.Marker({
		position: position,
		// title: title,
		animation: google.maps.Animation.DROP,
		// icon: defaultIcon,
		// id: i,
		isVisible: true,
		icon : makeMarkerIcon('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + color)
		// type: type
	});
	// Push the marker to our array of markers.
	// markers.push(marker);

	// add listeners
	addOnClickListener(marker);
	// addOnMouseOverListener(marker, highlightedIcon);
	// addOnMouseOutListener(marker, defaultIcon);

	marker.setMap(map);
	// bounds.extend(marker.position);
	// map.fitBounds(bounds);
};

/**
* @description Add Marker's onclick event listener.
* @param {google.maps.Marker} marker
*/
function addOnClickListener(marker) {
	marker.addListener('click', function() {
		populateInfoWindow(this);
	});
}

/**
* @description Add Marker's onmouseover event listener.
* @param {google.maps.Marker} marker
* @param {google.maps.MarkerImage} highlightedIcon
*/
function addOnMouseOverListener(marker, highlightedIcon) {
	marker.addListener('mouseover', function() {
		this.setIcon(highlightedIcon);
	});
}

/**
* @description Add Marker's onmouseout event listener.
* @param {google.maps.Marker} marker
* @param {google.maps.MarkerImage} defaultIcon
*/
function addOnMouseOutListener(marker, defaultIcon) {
	marker.addListener('mouseout', function() {
		this.setIcon(defaultIcon);
	});
}

/**
* @description This function populates the infowindow when the marker is clicked. We'll only allow
* one infowindow which will open at the marker that is clicked, and populate based
* on that markers position.
* @param {google.maps.Marker} marker - the clicked marker.
*/
function populateInfoWindow(marker) {
	if (infowindow.marker) {
		infowindow.marker.setAnimation(null);
	}

	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
       	marker.setAnimation(google.maps.Animation.BOUNCE);
		// Clear the infowindow content to give the streetview time to load.
		infowindow.setContent('');
		infowindow.marker = marker;

		var params = ('term=' + marker.title +
			'&latitude=' + marker.position.lat() +
			'&longitude=' + marker.position.lng());
		var content;
		$.get('/yelp_search?' + params, function(data, status) {
			if (status === 'success' && data.businesses.length > 0) {
				var business = data.businesses[0];
				content = '<div class="bold">' + marker.title + '</div>' +
					'<hr>' +

					'<div>' +
					'<p>Phone: ' + business.display_phone +'<br>' + 'Rating: '+ business.rating + '</p>' +
					'</div>' +

					'<p>For more info:</p>' +

					'<div id="pano">' +
					'<a href=' + business.url + '><img id="" class="img-infowindow text-center" src='+ business.image_url +'></img></a>' +
					'</div>';
			} else {
				content = '<div class="bold">' + marker.title + '</div>' +
					'<hr>' +
					'<div>No Additional Information Found</div>';
			}
		}).fail(function() {
    		content = '<div class="bold">' + marker.title + '</div>' +
					'<hr>' +
					'<div>Error: could not retrieve additional information.</div>';
    	}).always(function() {
    		infowindow.setContent(content);
  		});

		// Open the infowindow on the correct marker.
		infowindow.open(map, marker);

		focusOnMarker(marker);
	} else {
		infowindow.close();
	}
}

/**
* @description Move the map towards the marker.
* @param {google.maps.Marker} marker - marker that will be focused.
*/
function focusOnMarker(marker) {
	var bounds = new google.maps.LatLngBounds();
	bounds.extend(marker.position);
	if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
       var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.001, bounds.getNorthEast().lng() + 0.001);
       var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.001, bounds.getNorthEast().lng() - 0.001);
       bounds.extend(extendPoint1);
       bounds.extend(extendPoint2);
    }

	map.fitBounds(bounds);
}

/**
* @description The icon will be 44 px wide by 44 high, have an origin
* of 0, 0 and be anchored at 10, 34).
* @param {string} path - path to the file.
* @return {google.maps.MarkerImage}
*/
function makeMarkerIcon(path) {
	var markerImage = new google.maps.MarkerImage(
		path
		// new google.maps.Size(44, 44),
		// new google.maps.Point(0, 0),
		// new google.maps.Point(10, 34),
		// new google.maps.Size(44,44)
		);

	return markerImage;
}