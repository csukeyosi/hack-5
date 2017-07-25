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
    if (this.length == 1) {
        return this.points[0];
    }

    if (this.length == 2) {

        //-- Define radius function
        if (typeof (Number.prototype.toRad) === "undefined") {
            Number.prototype.toRad = function () {
                return this * Math.PI / 180;
            }
        }

        //-- Define degrees function
        if (typeof (Number.prototype.toDeg) === "undefined") {
            Number.prototype.toDeg = function () {
                return this * (180 / Math.PI);
            }
        }
        var lat1 = this.points[0].x;
        var lat2 = this.points[1].x;
        var lng1 = this.points[0].y;
        var lng2 = this.points[1].y;
        //-- Longitude difference
        var dLng = (lng2 - lng1).toRad();

        //-- Convert to radians
        lat1 = lat1.toRad();
        lat2 = lat2.toRad();
        lng1 = lng1.toRad();

        var bX = Math.cos(lat2) * Math.cos(dLng);
        var bY = Math.cos(lat2) * Math.sin(dLng);
        var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
        var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

        //-- Return result
        return  new Point(lat3.toDeg(), lng3.toDeg());

    }

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