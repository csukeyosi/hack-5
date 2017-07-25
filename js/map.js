function Map() {
    this.center =  {lat: 52.3702160, lng: 4.8951680};
    this.map = new google.maps.Map(document.getElementById('map'), {
        center: this.center,
        zoom: 13,
        mapTypeControl: false
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
        this.createMarker(e.latLng);
        this.locations.push(new Point(e.latLng.lat(), e.latLng.lng()));
        console.log(this.locations);
    }.bind(this));
}

Map.prototype.createMarker = function(position) {
    // Get the position from the location array.
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

    // add listeners
    this.addOnClickListener(marker);
    marker.setMap(this.map);
};

/**
 * @description Add Marker's onclick event listener.
 * @param {google.maps.Marker} marker
 */
Map.prototype.addOnClickListener = function(marker) {
    marker.addListener('click', function() {
        populateInfoWindow(this);
    });
};

/**
 * @description This function populates the infowindow when the marker is clicked. We'll only allow
 * one infowindow which will open at the marker that is clicked, and populate based
 * on that markers position.
 * @param {google.maps.Marker} marker - the clicked marker.
 */
Map.prototype.populateInfoWindow = function(marker) {
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
        infowindow.open(this, marker);
    } else {
        infowindow.close();
    }
};

Map.prototype.getCentroid = function() {
    var region = new Region(this.locations);
    console.log(region.centroid());
};






