var map;
var infowindow;

/**
* @description Initialize the map, infowindow and the viewmodel.
*/
function initMap() {
	// create the map
	var center =  {lat: 52.3702160, lng: 4.8951680};
	map = new google.maps.Map(document.getElementById('map'), {
		center: center,
		zoom: 13,
		mapTypeControl: false
	});

	// create the infoWindow
	infowindow = new google.maps.InfoWindow();
	google.maps.event.addListener(infowindow,'closeclick',function(){
   		if (infowindow.marker) {
			infowindow.marker.setAnimation(null);
		}
		infowindow.marker = null;
	});

	google.maps.event.addListener(map,'click',function(e){
   		console.log(e)
   		createMarker(e.latLng);
	});

	// create the ViewModel and get the markers
	var vm = new ViewModel();
	getMarkers(center, 'restaurant', function(result) {
		vm.addMarkers(result);
	});
	getMarkers(center, 'gym', function(result) {
		vm.addMarkers(result);
	});

	ko.applyBindings(vm);
}

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

	// markers shown in the list
	self.shown = ko.observableArray([]);

	// markers hidden from the list
	self.hidden = ko.observableArray([]);

	self.showHideRestaurants = function() {
		showHideMarkers(self.shown, self.hidden, 'restaurant');
	};

	self.showHideGyms = function() {
		showHideMarkers(self.shown, self.hidden, 'gym');
	};

	self.addMarkers = function(newMarkers) {
		for (var i=0; i < newMarkers.length; i++) {
			self.shown.push(newMarkers[i]);
		}
	};

	self.openInfoWindow = function(item) {
		populateInfoWindow(item);
	};

 	self.currentFilter = ko.observable();

	self.filteredMarkers = ko.computed(function() {
        if(!self.currentFilter()) {
        	for (var i=0; i < self.shown().length; i++) {
        		self.shown()[i].setMap(map);
        	}
            return self.shown();
        } else {
            return ko.utils.arrayFilter(self.shown(), function(item) {
            	var isMatch = item.title.toLowerCase().indexOf(self.currentFilter().toLowerCase()) !== -1;
            	if (isMatch) {
            		item.setMap(map);
            	} else {
            		item.setMap(null);
            	}
                return isMatch;
            });
        }
    });
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

/**
* @description Retrieve the places and create the respective markers.
* @param {object} center - latitude and longitude.
* @param {string} type - restaurant or gym.
* @param {function} callback - used to rertun the created markers.
*/
function getMarkers(center, type, callback) {
	var request = {
		location: center,
		radius: '500',
		type: [type]
	};

	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, function(results, status) {
		var markers = [];
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			createMarkers(results, markers, type);
		} else {
			alert("Could not retrieve the " + type + "s. (Status error: " + status + ")");
		}

		callback(markers);
	});
}

/**
* @description Create the markers.
* @param {array} results - places retrieved from google.maps.places.PlacesService.
* @param {array} markers - array where the markers will be added.
* @param {string} type - restaurant or gym.
*/
// function createMarkers(results, markers, type) {
// 	var bounds = new google.maps.LatLngBounds();
// 	var defaultIcon = makeMarkerIcon(type === 'restaurant' ? 'static/public/img/restaurant.png' : 'static/public/img/gym.png');
// 	var highlightedIcon = makeMarkerIcon(type === 'restaurant' ? 'static/public/img/restaurant2.png' : 'static/public/img/gym2.png');

// 	for (var i = 0; i < results.length; i++) {
// 		// Get the position from the location array.
// 		var position = results[i].geometry.location;
// 		var title = results[i].name;
// 		// Create a marker per location, and put into markers array.
// 		var marker = new google.maps.Marker({
// 			position: position,
// 			title: title,
// 			animation: google.maps.Animation.DROP,
// 			icon: defaultIcon,
// 			id: i,
// 			isVisible: true,
// 			type: type
// 		});
// 		// Push the marker to our array of markers.
// 		markers.push(marker);

// 		// add listeners
// 		addOnClickListener(marker);
// 		addOnMouseOverListener(marker, highlightedIcon);
// 		addOnMouseOutListener(marker, defaultIcon);

// 		marker.setMap(map);
// 		bounds.extend(marker.position);
// 	}
// 	map.fitBounds(bounds);
// }

function createMarker(position) {
	// Get the position from the location array.
	// var title = 'teste';
	// Create a marker per location, and put into markers array.
	var marker = new google.maps.Marker({
		position: position,
		// title: title,
		animation: google.maps.Animation.DROP,
		// icon: defaultIcon,
		// id: i,
		isVisible: true
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
		path,
		new google.maps.Size(44, 44),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(44,44));

	return markerImage;
}