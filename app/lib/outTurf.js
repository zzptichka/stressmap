(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.turf = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var invariant = require('@turf/invariant');

//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html

/**
 * Takes two {@link Point|points} and finds the geographic bearing between them,
 * i.e. the angle measured in degrees from the north line (0 degrees)
 *
 * @name bearing
 * @param {Geometry|Feature<Point>|Array<number>} start starting Point
 * @param {Geometry|Feature<Point>|Array<number>} end ending Point
 * @param {Object} [options] Optional parameters
 * @param {boolean} [options.final=false] calculates the final bearing if true
 * @returns {number} bearing in decimal degrees, between -180 and 180 degrees (positive clockwise)
 * @example
 * var point1 = turf.point([-75.343, 39.984]);
 * var point2 = turf.point([-75.534, 39.123]);
 *
 * var bearing = turf.bearing(point1, point2);
 *
 * //addToMap
 * var addToMap = [point1, point2]
 * point1.properties['marker-color'] = '#f00'
 * point2.properties['marker-color'] = '#0f0'
 * point1.properties.bearing = bearing
 */
function bearing(start, end, options) {
    // Backwards compatible with v4.0
    var final = (typeof options === 'object') ? options.final : options;
    if (final === true) return calculateFinalBearing(start, end);

    var degrees2radians = Math.PI / 180;
    var radians2degrees = 180 / Math.PI;
    var coordinates1 = invariant.getCoord(start);
    var coordinates2 = invariant.getCoord(end);

    var lon1 = degrees2radians * coordinates1[0];
    var lon2 = degrees2radians * coordinates2[0];
    var lat1 = degrees2radians * coordinates1[1];
    var lat2 = degrees2radians * coordinates2[1];
    var a = Math.sin(lon2 - lon1) * Math.cos(lat2);
    var b = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    var bear = radians2degrees * Math.atan2(a, b);

    return bear;
}

/**
 * Calculates Final Bearing
 * @private
 * @param {Feature<Point>} start starting Point
 * @param {Feature<Point>} end ending Point
 * @returns {number} bearing
 */
function calculateFinalBearing(start, end) {
    // Swap start & end
    var bear = bearing(end, start);
    bear = (bear + 180) % 360;
    return bear;
}

module.exports = bearing;
module.exports.default = bearing;

},{"@turf/invariant":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} obj Object
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */
function getCoord(obj) {
    if (!obj) throw new Error('obj is required');

    var coordinates = getCoords(obj);

    // getCoord() must contain at least two numbers (Point)
    if (coordinates.length > 1 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number') {
        return coordinates;
    } else {
        throw new Error('Coordinate is not a valid Point');
    }
}

/**
 * Unwrap coordinates from a Feature, Geometry Object or an Array of numbers
 *
 * @name getCoords
 * @param {Array<number>|Geometry|Feature} obj Object
 * @returns {Array<number>} coordinates
 * @example
 * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
 *
 * var coord = turf.getCoords(poly);
 * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
 */
function getCoords(obj) {
    if (!obj) throw new Error('obj is required');
    var coordinates;

    // Array of numbers
    if (obj.length) {
        coordinates = obj;

    // Geometry Object
    } else if (obj.coordinates) {
        coordinates = obj.coordinates;

    // Feature
    } else if (obj.geometry && obj.geometry.coordinates) {
        coordinates = obj.geometry.coordinates;
    }
    // Checks if coordinates contains a number
    if (coordinates) {
        containsNumber(coordinates);
        return coordinates;
    }
    throw new Error('No valid coordinates');
}

/**
 * Checks if coordinates contains a number
 *
 * @name containsNumber
 * @param {Array<any>} coordinates GeoJSON Coordinates
 * @returns {boolean} true if Array contains a number
 */
function containsNumber(coordinates) {
    if (coordinates.length > 1 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number') {
        return true;
    }

    if (Array.isArray(coordinates[0]) && coordinates[0].length) {
        return containsNumber(coordinates[0]);
    }
    throw new Error('coordinates must only contain numbers');
}

/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @name geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) throw new Error('type and name required');

    if (!value || value.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + value.type);
    }
}

/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 */
function featureOf(feature, type, name) {
    if (!feature) throw new Error('No feature passed');
    if (!name) throw new Error('.featureOf() requires a name');
    if (!feature || feature.type !== 'Feature' || !feature.geometry) {
        throw new Error('Invalid input to ' + name + ', Feature with geometry required');
    }
    if (!feature.geometry || feature.geometry.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
    }
}

/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name collectionOf
 * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function collectionOf(featureCollection, type, name) {
    if (!featureCollection) throw new Error('No featureCollection passed');
    if (!name) throw new Error('.collectionOf() requires a name');
    if (!featureCollection || featureCollection.type !== 'FeatureCollection') {
        throw new Error('Invalid input to ' + name + ', FeatureCollection required');
    }
    for (var i = 0; i < featureCollection.features.length; i++) {
        var feature = featureCollection.features[i];
        if (!feature || feature.type !== 'Feature' || !feature.geometry) {
            throw new Error('Invalid input to ' + name + ', Feature with geometry required');
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
        }
    }
}

/**
 * Get Geometry from Feature or Geometry Object
 *
 * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
 * @returns {Geometry|null} GeoJSON Geometry Object
 * @throws {Error} if geojson is not a Feature or Geometry Object
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getGeom(point)
 * //={"type": "Point", "coordinates": [110, 40]}
 */
function getGeom(geojson) {
    if (!geojson) throw new Error('geojson is required');
    if (geojson.geometry !== undefined) return geojson.geometry;
    if (geojson.coordinates || geojson.geometries) return geojson;
    throw new Error('geojson must be a valid Feature or Geometry Object');
}

/**
 * Get Geometry Type from Feature or Geometry Object
 *
 * @throws {Error} **DEPRECATED** in v5.0.0 in favor of getType
 */
function getGeomType() {
    throw new Error('invariant.getGeomType has been deprecated in v5.0 in favor of invariant.getType');
}

/**
 * Get GeoJSON object's type, Geometry type is prioritize.
 *
 * @param {GeoJSON} geojson GeoJSON object
 * @param {string} [name] name of the variable to display in error message
 * @returns {string} GeoJSON type
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getType(point)
 * //="Point"
 */
function getType(geojson, name) {
    if (!geojson) throw new Error((name || 'geojson') + ' is required');
    // GeoJSON Feature & GeometryCollection
    if (geojson.geometry && geojson.geometry.type) return geojson.geometry.type;
    // GeoJSON Geometry & FeatureCollection
    if (geojson.type) return geojson.type;
    throw new Error((name || 'geojson') + ' is invalid');
}

exports.getCoord = getCoord;
exports.getCoords = getCoords;
exports.containsNumber = containsNumber;
exports.geojsonType = geojsonType;
exports.featureOf = featureOf;
exports.collectionOf = collectionOf;
exports.getGeom = getGeom;
exports.getGeomType = getGeomType;
exports.getType = getType;

},{}],3:[function(require,module,exports){
'use strict';

var invariant = require('@turf/invariant');
var helpers = require('@turf/helpers');

//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html

/**
 * Calculates the distance between two {@link Point|points} in degrees, radians,
 * miles, or kilometers. This uses the
 * [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula)
 * to account for global curvature.
 *
 * @name distance
 * @param {Geometry|Feature<Point>|Array<number>} from origin point
 * @param {Geometry|Feature<Point>|Array<number>} to destination point
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
 * @returns {number} distance between the two points
 * @example
 * var from = turf.point([-75.343, 39.984]);
 * var to = turf.point([-75.534, 39.123]);
 *
 * var distance = turf.distance(from, to, "miles");
 *
 * //addToMap
 * var addToMap = [from, to];
 * from.properties.distance = distance;
 * to.properties.distance = distance;
 */
function distance(from, to, options) {
    // Backwards compatible with v4.0
    var units = (typeof options === 'object') ? options.units : options;

    var degrees2radians = Math.PI / 180;
    var coordinates1 = invariant.getCoord(from);
    var coordinates2 = invariant.getCoord(to);
    var dLat = degrees2radians * (coordinates2[1] - coordinates1[1]);
    var dLon = degrees2radians * (coordinates2[0] - coordinates1[0]);
    var lat1 = degrees2radians * coordinates1[1];
    var lat2 = degrees2radians * coordinates2[1];

    var a = Math.pow(Math.sin(dLat / 2), 2) +
          Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);

    return helpers.radiansToDistance(2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)), units);
}

module.exports = distance;
module.exports.default = distance;

},{"@turf/helpers":5,"@turf/invariant":4}],4:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geometry, properties, bbox, id) {
    if (geometry === undefined) throw new Error('geometry is required');
    if (properties && properties.constructor !== Object) throw new Error('properties must be an Object');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
    if (id && ['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');

    var feat = {type: 'Feature'};
    if (id) feat.id = id;
    if (bbox) feat.bbox = bbox;
    feat.properties = properties || {};
    feat.geometry = geometry;
    return feat;
}

/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<number>} coordinates Coordinates
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = 'Point';
 * var coordinates = [110, 50];
 *
 * var geometry = turf.geometry(type, coordinates);
 *
 * //=geometry
 */
function geometry(type, coordinates, bbox) {
    // Validation
    if (!type) throw new Error('type is required');
    if (!coordinates) throw new Error('coordinates is required');
    if (!Array.isArray(coordinates)) throw new Error('coordinates must be an Array');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');

    var geom;
    switch (type) {
    case 'Point': geom = point(coordinates).geometry; break;
    case 'LineString': geom = lineString(coordinates).geometry; break;
    case 'Polygon': geom = polygon(coordinates).geometry; break;
    case 'MultiPoint': geom = multiPoint(coordinates).geometry; break;
    case 'MultiLineString': geom = multiLineString(coordinates).geometry; break;
    case 'MultiPolygon': geom = multiPolygon(coordinates).geometry; break;
    default: throw new Error(type + ' is invalid');
    }
    if (bbox) geom.bbox = bbox;
    return geom;
}

/**
 * Takes coordinates and properties (optional) and returns a new {@link Point} feature.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length === undefined) throw new Error('Coordinates must be an array');
    if (coordinates.length < 2) throw new Error('Coordinates must be at least 2 numbers long');
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) throw new Error('Coordinates must contain numbers');

    return feature({
        type: 'Point',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a {@link Polygon} feature.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Polygon>} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *   [-2.275543, 53.464547],
 *   [-2.275543, 53.489271],
 *   [-2.215118, 53.489271],
 *   [-2.215118, 53.464547],
 *   [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */
function polygon(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    for (var i = 0; i < coordinates.length; i++) {
        var ring = coordinates[i];
        if (ring.length < 4) {
            throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (i === 0 && j === 0 && !isNumber(ring[0][0]) || !isNumber(ring[0][1])) throw new Error('Coordinates must contain numbers');
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error('First and last Position are not equivalent.');
            }
        }
    }

    return feature({
        type: 'Polygon',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link LineString} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<LineString>} a LineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var linestring1 = turf.lineString([
 *   [-21.964416, 64.148203],
 *   [-21.956176, 64.141316],
 *   [-21.93901, 64.135924],
 *   [-21.927337, 64.136673]
 * ]);
 * var linestring2 = turf.lineString([
 *   [-21.929054, 64.127985],
 *   [-21.912918, 64.134726],
 *   [-21.916007, 64.141016],
 *   [-21.930084, 64.14446]
 * ], {name: 'line 1', distance: 145});
 *
 * //=linestring1
 *
 * //=linestring2
 */
function lineString(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length < 2) throw new Error('Coordinates must be an array of two or more positions');
    // Check if first point of LineString contains two numbers
    if (!isNumber(coordinates[0][1]) || !isNumber(coordinates[0][1])) throw new Error('Coordinates must contain numbers');

    return feature({
        type: 'LineString',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var features = [
 *  turf.point([-75.343, 39.984], {name: 'Location A'}),
 *  turf.point([-75.833, 39.284], {name: 'Location B'}),
 *  turf.point([-75.534, 39.123], {name: 'Location C'})
 * ];
 *
 * var collection = turf.featureCollection(features);
 *
 * //=collection
 */
function featureCollection(features, bbox, id) {
    if (!features) throw new Error('No features passed');
    if (!Array.isArray(features)) throw new Error('features must be an Array');
    if (bbox && bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
    if (id && ['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');

    var fc = {type: 'FeatureCollection'};
    if (id) fc.id = id;
    if (bbox) fc.bbox = bbox;
    fc.features = features;
    return fc;
}

/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiLineString',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPoint',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, bbox, id) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPolygon',
        coordinates: coordinates
    }, properties, bbox, id);
}

/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = {
 *     "type": "Point",
 *       "coordinates": [100, 0]
 *     };
 * var line = {
 *     "type": "LineString",
 *     "coordinates": [ [101, 0], [102, 1] ]
 *   };
 * var collection = turf.geometryCollection([pt, line]);
 *
 * //=collection
 */
function geometryCollection(geometries, properties, bbox, id) {
    if (!geometries) throw new Error('geometries is required');
    if (!Array.isArray(geometries)) throw new Error('geometries must be an Array');

    return feature({
        type: 'GeometryCollection',
        geometries: geometries
    }, properties, bbox, id);
}

// https://en.wikipedia.org/wiki/Great-circle_distance#Radius_for_spherical_Earth
var factors = {
    miles: 3960,
    nauticalmiles: 3441.145,
    degrees: 57.2957795,
    radians: 1,
    inches: 250905600,
    yards: 6969600,
    meters: 6373000,
    metres: 6373000,
    centimeters: 6.373e+8,
    centimetres: 6.373e+8,
    kilometers: 6373,
    kilometres: 6373,
    feet: 20908792.65
};

var areaFactors = {
    kilometers: 0.000001,
    kilometres: 0.000001,
    meters: 1,
    metres: 1,
    centimetres: 10000,
    millimeter: 1000000,
    acres: 0.000247105,
    miles: 3.86e-7,
    yards: 1.195990046,
    feet: 10.763910417,
    inches: 1550.003100006
};

/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (num === undefined || num === null || isNaN(num)) throw new Error('num is required');
    if (precision && !(precision >= 0)) throw new Error('precision must be a positive number');
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToDistance
 * @param {number} radians in radians across the sphere
 * @param {string} [units="kilometers"] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToDistance(radians, units) {
    if (radians === undefined || radians === null) throw new Error('radians is required');

    if (units && typeof units !== 'string') throw new Error('units must be a string');
    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error(units + ' units is invalid');
    return radians * factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name distanceToRadians
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} radians
 */
function distanceToRadians(distance, units) {
    if (distance === undefined || distance === null) throw new Error('distance is required');

    if (units && typeof units !== 'string') throw new Error('units must be a string');
    var factor = factors[units || 'kilometers'];
    if (!factor) throw new Error(units + ' units is invalid');
    return distance / factor;
}

/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name distanceToDegrees
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function distanceToDegrees(distance, units) {
    return radians2degrees(distanceToRadians(distance, units));
}

/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAngle
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAngle(bearing) {
    if (bearing === null || bearing === undefined) throw new Error('bearing is required');

    var angle = bearing % 360;
    if (angle < 0) angle += 360;
    return angle;
}

/**
 * Converts an angle in radians to degrees
 *
 * @name radians2degrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radians2degrees(radians) {
    if (radians === null || radians === undefined) throw new Error('radians is required');

    var degrees = radians % (2 * Math.PI);
    return degrees * 180 / Math.PI;
}

/**
 * Converts an angle in degrees to radians
 *
 * @name degrees2radians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degrees2radians(degrees) {
    if (degrees === null || degrees === undefined) throw new Error('degrees is required');

    var radians = degrees % 360;
    return radians * Math.PI / 180;
}

/**
 * Converts a distance to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} distance to be converted
 * @param {string} originalUnit of the distance
 * @param {string} [finalUnit=kilometers] returned unit
 * @returns {number} the converted distance
 */
function convertDistance(distance, originalUnit, finalUnit) {
    if (distance === null || distance === undefined) throw new Error('distance is required');
    if (!(distance >= 0)) throw new Error('distance must be a positive number');

    var convertedDistance = radiansToDistance(distanceToRadians(distance, originalUnit), finalUnit || 'kilometers');
    return convertedDistance;
}

/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeter, acre, mile, yard, foot, inch
 * @param {number} area to be converted
 * @param {string} [originalUnit=meters] of the distance
 * @param {string} [finalUnit=kilometers] returned unit
 * @returns {number} the converted distance
 */
function convertArea(area, originalUnit, finalUnit) {
    if (area === null || area === undefined) throw new Error('area is required');
    if (!(area >= 0)) throw new Error('area must be a positive number');

    var startFactor = areaFactors[originalUnit || 'meters'];
    if (!startFactor) throw new Error('invalid original units');

    var finalFactor = areaFactors[finalUnit || 'kilometers'];
    if (!finalFactor) throw new Error('invalid final units');

    return (area / startFactor) * finalFactor;
}

/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
}

/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */
function isObject(input) {
    return (!!input) && (input.constructor === Object);
}

/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 */
var earthRadius = 6371008.8;

exports.feature = feature;
exports.geometry = geometry;
exports.point = point;
exports.polygon = polygon;
exports.lineString = lineString;
exports.featureCollection = featureCollection;
exports.multiLineString = multiLineString;
exports.multiPoint = multiPoint;
exports.multiPolygon = multiPolygon;
exports.geometryCollection = geometryCollection;
exports.round = round;
exports.radiansToDistance = radiansToDistance;
exports.distanceToRadians = distanceToRadians;
exports.distanceToDegrees = distanceToDegrees;
exports.bearingToAngle = bearingToAngle;
exports.radians2degrees = radians2degrees;
exports.degrees2radians = degrees2radians;
exports.convertDistance = convertDistance;
exports.convertArea = convertArea;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.earthRadius = earthRadius;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Callback for coordEach
 *
 * @callback coordEachCallback
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * Starts at index 0.
 * @param {number} featureIndex The current index of the feature being processed.
 * @param {number} featureSubIndex The current subIndex of the feature being processed.
 */

/**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 *
 * @name coordEach
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, featureSubIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordEach(features, function (currentCoord, coordIndex, featureIndex, featureSubIndex) {
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=featureSubIndex
 * });
 */
function coordEach(geojson, callback, excludeWrapCoord) {
    // Handles null Geometry -- Skips this GeoJSON
    if (geojson === null) return;
    var featureIndex, geometryIndex, j, k, l, geometry, stopG, coords,
        geometryMaybeCollection,
        wrapShrink = 0,
        coordIndex = 0,
        isGeometryCollection,
        type = geojson.type,
        isFeatureCollection = type === 'FeatureCollection',
        isFeature = type === 'Feature',
        stop = isFeatureCollection ? geojson.features.length : 1;

    // This logic may look a little weird. The reason why it is that way
    // is because it's trying to be fast. GeoJSON supports multiple kinds
    // of objects at its root: FeatureCollection, Features, Geometries.
    // This function has the responsibility of handling all of them, and that
    // means that some of the `for` loops you see below actually just don't apply
    // to certain inputs. For instance, if you give this just a
    // Point geometry, then both loops are short-circuited and all we do
    // is gradually rename the input until it's called 'geometry'.
    //
    // This also aims to allocate as few resources as possible: just a
    // few numbers and booleans, rather than any temporary arrays as would
    // be required with the normalization approach.
    for (featureIndex = 0; featureIndex < stop; featureIndex++) {
        geometryMaybeCollection = (isFeatureCollection ? geojson.features[featureIndex].geometry :
            (isFeature ? geojson.geometry : geojson));
        isGeometryCollection = (geometryMaybeCollection) ? geometryMaybeCollection.type === 'GeometryCollection' : false;
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (geometryIndex = 0; geometryIndex < stopG; geometryIndex++) {
            var featureSubIndex = 0;
            geometry = isGeometryCollection ?
                geometryMaybeCollection.geometries[geometryIndex] : geometryMaybeCollection;

            // Handles null Geometry -- Skips this geometry
            if (geometry === null) continue;
            coords = geometry.coordinates;
            var geomType = geometry.type;

            wrapShrink = (excludeWrapCoord && (geomType === 'Polygon' || geomType === 'MultiPolygon')) ? 1 : 0;

            switch (geomType) {
            case null:
                break;
            case 'Point':
                callback(coords, coordIndex, featureIndex, featureSubIndex);
                coordIndex++;
                featureSubIndex++;
                break;
            case 'LineString':
            case 'MultiPoint':
                for (j = 0; j < coords.length; j++) {
                    callback(coords[j], coordIndex, featureIndex, featureSubIndex);
                    coordIndex++;
                    if (geomType === 'MultiPoint') featureSubIndex++;
                }
                if (geomType === 'LineString') featureSubIndex++;
                break;
            case 'Polygon':
            case 'MultiLineString':
                for (j = 0; j < coords.length; j++) {
                    for (k = 0; k < coords[j].length - wrapShrink; k++) {
                        callback(coords[j][k], coordIndex, featureIndex, featureSubIndex);
                        coordIndex++;
                    }
                    if (geomType === 'MultiLineString') featureSubIndex++;
                }
                if (geomType === 'Polygon') featureSubIndex++;
                break;
            case 'MultiPolygon':
                for (j = 0; j < coords.length; j++) {
                    for (k = 0; k < coords[j].length; k++)
                        for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                            callback(coords[j][k][l], coordIndex, featureIndex, featureSubIndex);
                            coordIndex++;
                        }
                    featureSubIndex++;
                }
                break;
            case 'GeometryCollection':
                for (j = 0; j < geometry.geometries.length; j++)
                    coordEach(geometry.geometries[j], callback, excludeWrapCoord);
                break;
            default:
                throw new Error('Unknown Geometry Type');
            }
        }
    }
}

/**
 * Callback for coordReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback coordReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} featureIndex The current index of the feature being processed.
 * @param {number} featureSubIndex The current subIndex of the feature being processed.
 */

/**
 * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
 *
 * @name coordReduce
 * @param {FeatureCollection|Geometry|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentCoord, coordIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordReduce(features, function (previousValue, currentCoord, coordIndex, featureIndex, featureSubIndex) {
 *   //=previousValue
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=featureSubIndex
 *   return currentCoord;
 * });
 */
function coordReduce(geojson, callback, initialValue, excludeWrapCoord) {
    var previousValue = initialValue;
    coordEach(geojson, function (currentCoord, coordIndex, featureIndex, featureSubIndex) {
        if (coordIndex === 0 && initialValue === undefined) previousValue = currentCoord;
        else previousValue = callback(previousValue, currentCoord, coordIndex, featureIndex, featureSubIndex);
    }, excludeWrapCoord);
    return previousValue;
}

/**
 * Callback for propEach
 *
 * @callback propEachCallback
 * @param {Object} currentProperties The current properties being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Iterate over properties in any GeoJSON object, similar to Array.forEach()
 *
 * @name propEach
 * @param {(FeatureCollection|Feature)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentProperties, featureIndex)
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propEach(features, function (currentProperties, featureIndex) {
 *   //=currentProperties
 *   //=featureIndex
 * });
 */
function propEach(geojson, callback) {
    var i;
    switch (geojson.type) {
    case 'FeatureCollection':
        for (i = 0; i < geojson.features.length; i++) {
            callback(geojson.features[i].properties, i);
        }
        break;
    case 'Feature':
        callback(geojson.properties, 0);
        break;
    }
}


/**
 * Callback for propReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback propReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentProperties The current properties being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @name propReduce
 * @param {(FeatureCollection|Feature)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentProperties, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propReduce(features, function (previousValue, currentProperties, featureIndex) {
 *   //=previousValue
 *   //=currentProperties
 *   //=featureIndex
 *   return currentProperties
 * });
 */
function propReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    propEach(geojson, function (currentProperties, featureIndex) {
        if (featureIndex === 0 && initialValue === undefined) previousValue = currentProperties;
        else previousValue = callback(previousValue, currentProperties, featureIndex);
    });
    return previousValue;
}

/**
 * Callback for featureEach
 *
 * @callback featureEachCallback
 * @param {Feature<any>} currentFeature The current feature being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Iterate over features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name featureEach
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex)
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.featureEach(features, function (currentFeature, featureIndex) {
 *   //=currentFeature
 *   //=featureIndex
 * });
 */
function featureEach(geojson, callback) {
    if (geojson.type === 'Feature') {
        callback(geojson, 0);
    } else if (geojson.type === 'FeatureCollection') {
        for (var i = 0; i < geojson.features.length; i++) {
            callback(geojson.features[i], i);
        }
    }
}

/**
 * Callback for featureReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback featureReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name featureReduce
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.featureReduce(features, function (previousValue, currentFeature, featureIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   return currentFeature
 * });
 */
function featureReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    featureEach(geojson, function (currentFeature, featureIndex) {
        if (featureIndex === 0 && initialValue === undefined) previousValue = currentFeature;
        else previousValue = callback(previousValue, currentFeature, featureIndex);
    });
    return previousValue;
}

/**
 * Get all coordinates from any GeoJSON object.
 *
 * @name coordAll
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @returns {Array<Array<number>>} coordinate position array
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * var coords = turf.coordAll(features);
 * //= [[26, 37], [36, 53]]
 */
function coordAll(geojson) {
    var coords = [];
    coordEach(geojson, function (coord) {
        coords.push(coord);
    });
    return coords;
}

/**
 * Callback for geomEach
 *
 * @callback geomEachCallback
 * @param {Geometry} currentGeometry The current geometry being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array. Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} currentProperties The current feature properties being processed.
 */

/**
 * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
 *
 * @name geomEach
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentGeometry, featureIndex, currentProperties)
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomEach(features, function (currentGeometry, featureIndex, currentProperties) {
 *   //=currentGeometry
 *   //=featureIndex
 *   //=currentProperties
 * });
 */
function geomEach(geojson, callback) {
    var i, j, g, geometry, stopG,
        geometryMaybeCollection,
        isGeometryCollection,
        geometryProperties,
        featureIndex = 0,
        isFeatureCollection = geojson.type === 'FeatureCollection',
        isFeature = geojson.type === 'Feature',
        stop = isFeatureCollection ? geojson.features.length : 1;

    // This logic may look a little weird. The reason why it is that way
    // is because it's trying to be fast. GeoJSON supports multiple kinds
    // of objects at its root: FeatureCollection, Features, Geometries.
    // This function has the responsibility of handling all of them, and that
    // means that some of the `for` loops you see below actually just don't apply
    // to certain inputs. For instance, if you give this just a
    // Point geometry, then both loops are short-circuited and all we do
    // is gradually rename the input until it's called 'geometry'.
    //
    // This also aims to allocate as few resources as possible: just a
    // few numbers and booleans, rather than any temporary arrays as would
    // be required with the normalization approach.
    for (i = 0; i < stop; i++) {

        geometryMaybeCollection = (isFeatureCollection ? geojson.features[i].geometry :
            (isFeature ? geojson.geometry : geojson));
        geometryProperties = (isFeatureCollection ? geojson.features[i].properties :
            (isFeature ? geojson.properties : {}));
        isGeometryCollection = (geometryMaybeCollection) ? geometryMaybeCollection.type === 'GeometryCollection' : false;
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (g = 0; g < stopG; g++) {
            geometry = isGeometryCollection ?
                geometryMaybeCollection.geometries[g] : geometryMaybeCollection;

            // Handle null Geometry
            if (geometry === null) {
                callback(null, featureIndex, geometryProperties);
                continue;
            }
            switch (geometry.type) {
            case 'Point':
            case 'LineString':
            case 'MultiPoint':
            case 'Polygon':
            case 'MultiLineString':
            case 'MultiPolygon': {
                callback(geometry, featureIndex, geometryProperties);
                break;
            }
            case 'GeometryCollection': {
                for (j = 0; j < geometry.geometries.length; j++) {
                    callback(geometry.geometries[j], featureIndex, geometryProperties);
                }
                break;
            }
            default:
                throw new Error('Unknown Geometry Type');
            }
        }
        // Only increase `featureIndex` per each feature
        featureIndex++;
    }
}

/**
 * Callback for geomReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback geomReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Geometry} currentGeometry The current Feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {Object} currentProperties The current feature properties being processed.
 */

/**
 * Reduce geometry in any GeoJSON object, similar to Array.reduce().
 *
 * @name geomReduce
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentGeometry, featureIndex, currentProperties)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomReduce(features, function (previousValue, currentGeometry, featureIndex, currentProperties) {
 *   //=previousValue
 *   //=currentGeometry
 *   //=featureIndex
 *   //=currentProperties
 *   return currentGeometry
 * });
 */
function geomReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    geomEach(geojson, function (currentGeometry, currentIndex, currentProperties) {
        if (currentIndex === 0 && initialValue === undefined) previousValue = currentGeometry;
        else previousValue = callback(previousValue, currentGeometry, currentIndex, currentProperties);
    });
    return previousValue;
}

/**
 * Callback for flattenEach
 *
 * @callback flattenEachCallback
 * @param {Feature} currentFeature The current flattened feature being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array. Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} featureSubIndex The subindex of the current element being processed in the
 * array. Starts at index 0 and increases if the flattened feature was a multi-geometry.
 */

/**
 * Iterate over flattened features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name flattenEach
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex, featureSubIndex)
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenEach(features, function (currentFeature, featureIndex, featureSubIndex) {
 *   //=currentFeature
 *   //=featureIndex
 *   //=featureSubIndex
 * });
 */
function flattenEach(geojson, callback) {
    geomEach(geojson, function (geometry, featureIndex, properties) {
        // Callback for single geometry
        var type = (geometry === null) ? null : geometry.type;
        switch (type) {
        case null:
        case 'Point':
        case 'LineString':
        case 'Polygon':
            callback(feature(geometry, properties), featureIndex, 0);
            return;
        }

        var geomType;

        // Callback for multi-geometry
        switch (type) {
        case 'MultiPoint':
            geomType = 'Point';
            break;
        case 'MultiLineString':
            geomType = 'LineString';
            break;
        case 'MultiPolygon':
            geomType = 'Polygon';
            break;
        }

        geometry.coordinates.forEach(function (coordinate, featureSubIndex) {
            var geom = {
                type: geomType,
                coordinates: coordinate
            };
            callback(feature(geom, properties), featureIndex, featureSubIndex);
        });

    });
}

/**
 * Callback for flattenReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback flattenReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} featureSubIndex The subindex of the current element being processed in the
 * array. Starts at index 0 and increases if the flattened feature was a multi-geometry.
 */

/**
 * Reduce flattened features in any GeoJSON object, similar to Array.reduce().
 *
 * @name flattenReduce
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex, featureSubIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenReduce(features, function (previousValue, currentFeature, featureIndex, featureSubIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   //=featureSubIndex
 *   return currentFeature
 * });
 */
function flattenReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    flattenEach(geojson, function (currentFeature, featureIndex, featureSubIndex) {
        if (featureIndex === 0 && featureSubIndex === 0 && initialValue === undefined) previousValue = currentFeature;
        else previousValue = callback(previousValue, currentFeature, featureIndex, featureSubIndex);
    });
    return previousValue;
}

/**
 * Callback for segmentEach
 *
 * @callback segmentEachCallback
 * @param {Feature<LineString>} currentSegment The current segment being processed.
 * @param {number} featureIndex The featureIndex currently being processed, starts at index 0.
 * @param {number} featureSubIndex The featureSubIndex currently being processed, starts at index 0.
 * @param {number} segmentIndex The segmentIndex currently being processed, starts at index 0.
 * @returns {void}
 */

/**
 * Iterate over 2-vertex line segment in any GeoJSON object, similar to Array.forEach()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON
 * @param {Function} callback a method that takes (currentSegment, featureIndex, featureSubIndex)
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentEach(polygon, function (currentSegment, featureIndex, featureSubIndex, segmentIndex) {
 *   //= currentSegment
 *   //= featureIndex
 *   //= featureSubIndex
 *   //= segmentIndex
 * });
 *
 * // Calculate the total number of segments
 * var total = 0;
 * turf.segmentEach(polygon, function () {
 *     total++;
 * });
 */
function segmentEach(geojson, callback) {
    flattenEach(geojson, function (feature, featureIndex, featureSubIndex) {
        var segmentIndex = 0;

        // Exclude null Geometries
        if (!feature.geometry) return;
        // (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
        var type = feature.geometry.type;
        if (type === 'Point' || type === 'MultiPoint') return;

        // Generate 2-vertex line segments
        coordReduce(feature, function (previousCoords, currentCoord) {
            var currentSegment = lineString([previousCoords, currentCoord], feature.properties);
            callback(currentSegment, featureIndex, featureSubIndex, segmentIndex);
            segmentIndex++;
            return currentCoord;
        });
    });
}

/**
 * Callback for segmentReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback segmentReduceCallback
 * @param {*} [previousValue] The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} [currentSegment] The current segment being processed.
 * @param {number} featureIndex The featureIndex currently being processed, starts at index 0.
 * @param {number} featureSubIndex The featureSubIndex currently being processed, starts at index 0.
 * @param {number} segmentIndex The segmentIndex currently being processed, starts at index 0.
 */

/**
 * Reduce 2-vertex line segment in any GeoJSON object, similar to Array.reduce()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON
 * @param {Function} callback a method that takes (previousValue, currentSegment, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentReduce(polygon, function (previousSegment, currentSegment, featureIndex, featureSubIndex, segmentIndex) {
 *   //= previousSegment
 *   //= currentSegment
 *   //= featureIndex
 *   //= featureSubIndex
 *   //= segmentInex
 *   return currentSegment
 * });
 *
 * // Calculate the total number of segments
 * var initialValue = 0
 * var total = turf.segmentReduce(polygon, function (previousValue) {
 *     previousValue++;
 *     return previousValue;
 * }, initialValue);
 */
function segmentReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    var started = false;
    segmentEach(geojson, function (currentSegment, featureIndex, featureSubIndex, segmentIndex) {
        if (started === false && initialValue === undefined) previousValue = currentSegment;
        else previousValue = callback(previousValue, currentSegment, featureIndex, featureSubIndex, segmentIndex);
        started = true;
    });
    return previousValue;
}

/**
 * Create Feature
 *
 * @private
 * @param {Geometry} geometry GeoJSON Geometry
 * @param {Object} properties Properties
 * @returns {Feature} GeoJSON Feature
 */
function feature(geometry, properties) {
    if (geometry === undefined) throw new Error('No geometry passed');

    return {
        type: 'Feature',
        properties: properties || {},
        geometry: geometry
    };
}

/**
 * Create LineString
 *
 * @private
 * @param {Array<Array<number>>} coordinates Line Coordinates
 * @param {Object} properties Properties
 * @returns {Feature<LineString>} GeoJSON LineString Feature
 */
function lineString(coordinates, properties) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length < 2) throw new Error('Coordinates must be an array of two or more positions');

    return {
        type: 'Feature',
        properties: properties || {},
        geometry: {
            type: 'LineString',
            coordinates: coordinates
        }
    };
}

/**
 * Callback for lineEach
 *
 * @callback lineEachCallback
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed.
 * @param {number} lineIndex The index of the current element being processed in the array, starts at index 0.
 * @param {number} lineSubIndex The sub-index of the current line being processed at index 0
 */

/**
 * Iterate over line or ring coordinates in LineString, Polygon, MultiLineString, MultiPolygon Features or Geometries,
 * similar to Array.forEach.
 *
 * @name lineEach
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (currentLine, lineIndex, lineSubIndex)
 * @example
 * var mtLn = turf.multiLineString([
 *   turf.lineString([[26, 37], [35, 45]]),
 *   turf.lineString([[36, 53], [38, 50], [41, 55]])
 * ]);
 *
 * turf.lineEach(mtLn, function (currentLine, lineIndex) {
 *   //=currentLine
 *   //=lineIndex
 * });
 */
function lineEach(geojson, callback) {
    // validation
    if (!geojson) throw new Error('geojson is required');
    var type = geojson.geometry ? geojson.geometry.type : geojson.type;
    if (!type) throw new Error('invalid geojson');
    if (type === 'FeatureCollection') throw new Error('FeatureCollection is not supported');
    if (type === 'GeometryCollection') throw new Error('GeometryCollection is not supported');
    var coordinates = geojson.geometry ? geojson.geometry.coordinates : geojson.coordinates;
    if (!coordinates) throw new Error('geojson must contain coordinates');

    switch (type) {
    case 'LineString':
        callback(coordinates, 0, 0);
        return;
    case 'Polygon':
    case 'MultiLineString':
        var subIndex = 0;
        for (var line = 0; line < coordinates.length; line++) {
            if (type === 'MultiLineString') subIndex = line;
            callback(coordinates[line], line, subIndex);
        }
        return;
    case 'MultiPolygon':
        for (var multi = 0; multi < coordinates.length; multi++) {
            for (var ring = 0; ring < coordinates[multi].length; ring++) {
                callback(coordinates[multi][ring], ring, multi);
            }
        }
        return;
    default:
        throw new Error(type + ' geometry not supported');
    }
}

/**
 * Callback for lineReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback lineReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed.
 * @param {number} lineIndex The index of the current element being processed in the
 * array. Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} lineSubIndex The sub-index of the current line being processed at index 0
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name lineReduce
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var mtp = turf.multiPolygon([
 *   turf.polygon([[[12,48],[2,41],[24,38],[12,48]], [[9,44],[13,41],[13,45],[9,44]]]),
 *   turf.polygon([[[5, 5], [0, 0], [2, 2], [4, 4], [5, 5]]])
 * ]);
 *
 * turf.lineReduce(mtp, function (previousValue, currentLine, lineIndex, lineSubIndex) {
 *   //=previousValue
 *   //=currentLine
 *   //=lineIndex
 *   //=lineSubIndex
 *   return currentLine
 * }, 2);
 */
function lineReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    lineEach(geojson, function (currentLine, lineIndex, lineSubIndex) {
        if (lineIndex === 0 && initialValue === undefined) previousValue = currentLine;
        else previousValue = callback(previousValue, currentLine, lineIndex, lineSubIndex);
    });
    return previousValue;
}

exports.coordEach = coordEach;
exports.coordReduce = coordReduce;
exports.propEach = propEach;
exports.propReduce = propReduce;
exports.featureEach = featureEach;
exports.featureReduce = featureReduce;
exports.coordAll = coordAll;
exports.geomEach = geomEach;
exports.geomReduce = geomReduce;
exports.flattenEach = flattenEach;
exports.flattenReduce = flattenReduce;
exports.segmentEach = segmentEach;
exports.segmentReduce = segmentReduce;
exports.lineEach = lineEach;
exports.lineReduce = lineReduce;

},{}],7:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var bearing = _interopDefault(require('@turf/bearing'));
var distance = _interopDefault(require('@turf/distance'));
var rhumbBearing = _interopDefault(require('@turf/rhumb-bearing'));
var rhumbDistance = _interopDefault(require('@turf/rhumb-distance'));
var invariant = require('@turf/invariant');
var meta = require('@turf/meta');
var helpers = require('@turf/helpers');

// (logic of computation inspired by:
// https://stackoverflow.com/questions/32771458/distance-from-lat-lng-point-to-minor-arc-segment)

/**
 * Returns the minimum distance between a {@link Point} and a {@link LineString}, being the distance from a line the
 * minimum distance between the point and any segment of the `LineString`.
 *
 * @name pointToLineDistance
 * @param {Feature<Point>|Array<number>} pt Feature or Geometry
 * @param {Feature<LineString>|Array<Array<number>>} line GeoJSON Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
 * @param {boolean} [options.mercator=false] if distance should be on Mercator or WGS84 projection
 * @returns {number} distance between point and line
 * @example
 * var pt = turf.point([0, 0]);
 * var line = turf.lineString([[1, 1],[-1, 1]]);
 *
 * var distance = turf.pointToLineDistance(pt, line, 'miles');
 * //=69.11854715938406
 */
function pointToLineDistance(pt, line, options) {
    // Optional params
    options = options || {};
    // var units = options.units;
    // var mercator = options.mercator;

    // validation
    if (typeof options !== 'object') throw new Error('options must be an object');
    if (!pt) throw new Error('pt is required');
    if (Array.isArray(pt)) pt = helpers.point(pt);
    else if (pt.type === 'Point') pt = helpers.feature(pt);
    else invariant.featureOf(pt, 'Point', 'point');

    if (!line) throw new Error('line is required');
    if (Array.isArray(line)) line = helpers.lineString(line);
    else if (line.type === 'LineString') line = helpers.feature(line);
    else invariant.featureOf(line, 'LineString', 'line');

    var distance$$1 = Infinity;
    var p = pt.geometry.coordinates;
    meta.segmentEach(line, function (segment) {
        var a = segment.geometry.coordinates[0];
        var b = segment.geometry.coordinates[1];
        var d = distanceToSegment(p, a, b, options);
        if (distance$$1 > d) distance$$1 = d;
    });
    return distance$$1;
}


/**
 * Returns the distance between a point P on a segment AB.
 *
 * @private
 * @param {Array<number>} p external point
 * @param {Array<number>} a first segment point
 * @param {Array<number>} b second segment point
 * @param {Object} [options] Optional parameters
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
 * @param {boolean} [options.mercator=false] if distance should be on Mercator or WGS84 projection
 * @returns {number} distance
 */
function distanceToSegment(p, a, b, options) {
    options = options || {};
    var units = options.units;
    var mercator = options.mercator;

    var distanceAP = (mercator !== true) ? distance(a, p, units) : euclideanDistance(a, p, units);
    var azimuthAP = helpers.bearingToAngle((mercator !== true) ? bearing(a, p) : rhumbBearing(a, p));
    var azimuthAB = helpers.bearingToAngle((mercator !== true) ? bearing(a, b) : rhumbBearing(a, b));
    var angleA = Math.abs(azimuthAP - azimuthAB);
    // if (angleA > 180) angleA = Math.abs(angleA - 360);
    // if the angle PAB is obtuse its projection on the line extending the segment falls outside the segment
    // thus return distance between P and the start point A
    /*
        P__
        |\ \____
        | \     \____
        |  \         \____
        |   \_____________\
        H    A             B
     */
    if (angleA > 90) return distanceAP;

    var azimuthBA = (azimuthAB + 180) % 360;
    var azimuthBP = helpers.bearingToAngle((mercator !== true) ? bearing(b, p) : rhumbBearing(b, p));
    var angleB = Math.abs(azimuthBP - azimuthBA);
    if (angleB > 180) angleB = Math.abs(angleB - 360);
    // also if the angle ABP is acute the projection of P falls outside the segment, on the other side
    // so return the distance between P and the end point B
    /*
                        ____P
                   ____/   /|
              ____/       / |
         ____/           /  |
        /______________/    |
       A               B    H
    */
    if (angleB > 90) return (mercator !== true) ? distance(p, b, units) : euclideanDistance(p, b, units);
    // finally if the projection falls inside the segment
    // return the distance between P and the segment
    /*
                     P
                  __/|\
               __/   | \
            __/      |  \
         __/         |   \
        /____________|____\
       A             H     B
    */
    if (mercator !== true) return distanceAP * Math.sin(helpers.degrees2radians(angleA));
    return mercatorPH(a, b, p, units);
}

/**
 * Returns the distance between a point P on a segment AB, on Mercator projection
 *
 * @private
 * @param {Array<number>} a first segment point
 * @param {Array<number>} b second segment point
 * @param {Array<number>} p external point
 * @param {string} [units='kilometers'] can be degrees, radians, miles, or kilometers
 * @returns {number} distance
 */
function mercatorPH(a, b, p, units) {
    var delta = 0;
    // translate points if any is crossing the 180th meridian
    if (Math.abs(a[0]) >= 180 || Math.abs(b[0]) >= 180 || Math.abs(p[0]) >= 180) {
        delta = (a[0] > 0 || b[0] > 0 || p[0] > 0) ? -180 : 180;
    }

    var origin = helpers.point(p);
    var A = toMercator([a[0] + delta, a[1]]);
    var B = toMercator([b[0] + delta, b[1]]);
    var P = toMercator([p[0] + delta, p[1]]);
    var h = toWGS84(euclideanIntersection(A, B, P));

    if (delta !== 0) h[0] -= delta; // translate back to original position
    var distancePH = rhumbDistance(origin, h, units);
    return distancePH;
}

/**
 * Returns the point H projection of a point P on a segment AB, on the euclidean plain
 * from https://stackoverflow.com/questions/10301001/perpendicular-on-a-line-segment-from-a-given-point#answer-12499474
 *            P
 *           |
 *           |
 *  _________|____
 * A          H   B
 *
 * @private
 * @param {Array<number>} a first segment point
 * @param {Array<number>} b second segment point
 * @param {Array<number>} p external point
 * @returns {Array<number>} projected point
 */
function euclideanIntersection(a, b, p) {
    var x1 = a[0], y1 = a[1],
        x2 = b[0], y2 = b[1],
        x3 = p[0], y3 = p[1];
    var px = x2 - x1, py = y2 - y1;
    var dab = px * px + py * py;
    var u = ((x3 - x1) * px + (y3 - y1) * py) / dab;
    var x = x1 + u * px, y = y1 + u * py;
    return [x, y]; // H
}

/**
 * Returns euclidean distance between two points
 *
 * @private
 * @param {Object} from first point
 * @param {Object} to second point
 * @param {string} [units='kilometers'] can be degrees, radians, miles, or kilometers
 * @returns {number} squared distance
 */
function euclideanDistance(from, to, units) {
    // translate points if any is crossing the 180th meridian
    var delta = 0;
    if (Math.abs(from[0]) >= 180) {
        delta = (from[0] > 0) ? -180 : 180;
    }
    if (Math.abs(to[0]) >= 180) {
        delta = (to[0] > 0) ? -180 : 180;
    }
    var p1 = toMercator([from[0] + delta, from[1]]);
    var p2 = toMercator([to[0] + delta, to[1]]);

    var sqr = function (n) { return n * n; };
    var squareD = sqr(p1[0] - p2[0]) + sqr(p1[1] - p2[1]);
    var d = Math.sqrt(squareD);
    return helpers.convertDistance(d, 'meters', units);
}

/**
 * Convert lon/lat values to 900913 x/y.
 * from https://github.com/mapbox/sphericalmercator
 *
 * @private
 * @param {Array<number>} lonLat WGS84 point
 * @returns {Array<number>} Mercator [x, y] point
 */
function toMercator(lonLat) {
    var D2R = Math.PI / 180,
        // 900913 properties.
        A = 6378137.0,
        MAXEXTENT = 20037508.342789244;

    var xy = [
        A * lonLat[0] * D2R,
        A * Math.log(Math.tan((Math.PI * 0.25) + (0.5 * lonLat[1] * D2R)))
    ];
    // if xy value is beyond maxextent (e.g. poles), return maxextent.
    if (xy[0] > MAXEXTENT) xy[0] = MAXEXTENT;
    if (xy[0] < -MAXEXTENT) xy[0] = -MAXEXTENT;
    if (xy[1] > MAXEXTENT) xy[1] = MAXEXTENT;
    if (xy[1] < -MAXEXTENT) xy[1] = -MAXEXTENT;
    return xy;
}

/**
 * Convert 900913 x/y values to lon/lat.
 * from https://github.com/mapbox/sphericalmercator
 *
 * @private
 * @param {Array<number>} xy Mercator [x, y] point
 * @returns {Array<number>} WGS84 [lon, lat] point
 */
function toWGS84(xy) {
    // 900913 properties.
    var R2D = 180 / Math.PI,
        A = 6378137.0;

    return [
        (xy[0] * R2D / A),
        ((Math.PI * 0.5) - 2.0 * Math.atan(Math.exp(-xy[1] / A))) * R2D
    ];
}

module.exports = pointToLineDistance;
module.exports.default = pointToLineDistance;

},{"@turf/bearing":1,"@turf/distance":3,"@turf/helpers":5,"@turf/invariant":8,"@turf/meta":6,"@turf/rhumb-bearing":9,"@turf/rhumb-distance":11}],8:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],9:[function(require,module,exports){
'use strict';

var invariant = require('@turf/invariant');
var helpers = require('@turf/helpers');

// https://en.wikipedia.org/wiki/Rhumb_line
/**
 * Takes two {@link Point|points} and finds the bearing angle between them along a Rhumb line
 * i.e. the angle measured in degrees start the north line (0 degrees)
 *
 * @name rhumbBearing
 * @param {(Geometry|Feature<Point>)|Position} start starting Point
 * @param {(Geometry|Feature<Point>)|Position} end ending Point
 * @param {Object} [options] Optional parameters
 * @param {boolean} [options.final=false] calculates the final bearing if true
 * @returns {number} bearing from north in decimal degrees, between -180 and 180 degrees (positive clockwise)
 * @example
 * var point1 = turf.point([-75.343, 39.984], {"marker-color": "#F00"});
 * var point2 = turf.point([-75.534, 39.123], {"marker-color": "#00F"});
 *
 * var bearing = turf.rhumbBearing(point1, point2);
 *
 * //addToMap
 * var addToMap = [point1, point2];
 * point1.properties.bearing = bearing;
 * point2.properties.bearing = bearing;
 */
function rhumbBearing(start, end, options) {
    // validation
    if (!start) throw new Error('start point is required');
    if (!end) throw new Error('end point is required');
    var final = (typeof options === 'object') ? options.final : options;

    var bear360;

    if (final) bear360 = calculateRhumbBearing(invariant.getCoord(end), invariant.getCoord(start));
    else bear360 = calculateRhumbBearing(invariant.getCoord(start), invariant.getCoord(end));

    var bear180 = (bear360 > 180) ? -(360 - bear360) : bear360;

    return bear180;
}

/**
 * Returns the bearing from тАШthisтАЩ point to destination point along a rhumb line.
 * Adapted from Geodesy: https://github.com/chrisveness/geodesy/blob/master/latlon-spherical.js
 *
 * @private
 * @param   {Array<number>} from - origin point.
 * @param   {Array<number>} to - destination point.
 * @returns {number} Bearing in degrees from north.
 * @example
 * var p1 = new LatLon(51.127, 1.338);
 * var p2 = new LatLon(50.964, 1.853);
 * var d = p1.rhumbBearingTo(p2); // 116.7 m
 */
function calculateRhumbBearing(from, to) {
    // ╧Ж => phi
    // ╬Ф╬╗ => deltaLambda
    // ╬Ф╧И => deltaPsi
    // ╬╕ => theta
    var phi1 = helpers.degrees2radians(from[1]);
    var phi2 = helpers.degrees2radians(to[1]);
    var deltaLambda = helpers.degrees2radians((to[0] - from[0]));
    // if deltaLambdaon over 180┬░ take shorter rhumb line across the anti-meridian:
    if (deltaLambda > Math.PI) deltaLambda -= 2 * Math.PI;
    if (deltaLambda < -Math.PI) deltaLambda += 2 * Math.PI;

    var deltaPsi = Math.log(Math.tan(phi2 / 2 + Math.PI / 4) / Math.tan(phi1 / 2 + Math.PI / 4));

    var theta = Math.atan2(deltaLambda, deltaPsi);

    return (helpers.radians2degrees(theta) + 360) % 360;
}

module.exports = rhumbBearing;
module.exports.default = rhumbBearing;

},{"@turf/helpers":5,"@turf/invariant":10}],10:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],11:[function(require,module,exports){
'use strict';

var helpers = require('@turf/helpers');
var invariant = require('@turf/invariant');

// https://en.wikipedia.org/wiki/Rhumb_line
/**
 * Calculates the distance along a rhumb line between two {@link Point|points} in degrees, radians,
 * miles, or kilometers.
 *
 * @name rhumbDistance
 * @param {(Geometry|Feature<Point>)|Position} from origin point
 * @param {(Geometry|Feature<Point>)|Position} to destination point
 * @param {Object} [options] Optional parameters
 * @param {string} [options.units="kilometers"] can be degrees, radians, miles, or kilometers
 * @returns {number} distance between the two points
 * @example
 * var from = turf.point([-75.343, 39.984]);
 * var to = turf.point([-75.534, 39.123]);
 *
 * var distance = turf.rhumbDistance(from, to, "miles");
 *
 * //addToMap
 * var addToMap = [from, to];
 * from.properties.distance = distance;
 * to.properties.distance = distance;
 */
function rhumbDistance(from, to, options) {
    // validation
    if (!from) throw new Error('from point is required');
    if (!to) throw new Error('to point is required');
    var units = (typeof options === 'object') ? options.units : options || 'kilometers';

    var origin = invariant.getCoord(from);
    var destination = invariant.getCoord(to);

    // compensate the crossing of the 180th meridian (https://macwright.org/2016/09/26/the-180th-meridian.html)
    // solution from https://github.com/mapbox/mapbox-gl-js/issues/3250#issuecomment-294887678
    destination[0] += (destination[0] - origin[0] > 180) ? -360 : (origin[0] - destination[0] > 180) ? 360 : 0;
    var distanceInMeters = calculateRhumbDistance(origin, destination);
    var distance = helpers.convertDistance(distanceInMeters, 'meters', units);
    return distance;
}

/**
 * Returns the distance travelling from тАШthisтАЩ point to destination point along a rhumb line.
 * Adapted from Geodesy: https://github.com/chrisveness/geodesy/blob/master/latlon-spherical.js
 *
 * @private
 * @param   {Array<number>} origin point.
 * @param   {Array<number>} destination point.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance in km between this point and destination point (same units as radius).
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = new LatLon(50.964, 1.853);
 *     var d = p1.distanceTo(p2); // 40.31 km
 */
function calculateRhumbDistance(origin, destination, radius) {
    // ╧Ж => phi
    // ╬╗ => lambda
    // ╧И => psi
    // ╬Ф => Delta
    // ╬┤ => delta
    // ╬╕ => theta

    radius = (radius === undefined) ? helpers.earthRadius : Number(radius);
    // see www.edwilliams.org/avform.htm#Rhumb

    var R = radius;
    var phi1 = origin[1] * Math.PI / 180;
    var phi2 = destination[1] * Math.PI / 180;
    var DeltaPhi = phi2 - phi1;
    var DeltaLambda = Math.abs(destination[0] - origin[0]) * Math.PI / 180;
    // if dLon over 180┬░ take shorter rhumb line across the anti-meridian:
    if (DeltaLambda > Math.PI) DeltaLambda -= 2 * Math.PI;

    // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
    // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
    var DeltaPsi = Math.log(Math.tan(phi2 / 2 + Math.PI / 4) / Math.tan(phi1 / 2 + Math.PI / 4));
    var q = Math.abs(DeltaPsi) > 10e-12 ? DeltaPhi / DeltaPsi : Math.cos(phi1);

    // distance is pythagoras on 'stretched' Mercator projection
    var delta = Math.sqrt(DeltaPhi * DeltaPhi + q * q * DeltaLambda * DeltaLambda); // angular distance in radians
    var dist = delta * R;

    return dist;
}

module.exports = rhumbDistance;
module.exports.default = rhumbDistance;

},{"@turf/helpers":5,"@turf/invariant":12}],12:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],13:[function(require,module,exports){
module.exports = {
   helpers: require('@turf/helpers'),
   pointToLineDistance: require('@turf/point-to-line-distance')   
};
},{"@turf/helpers":5,"@turf/point-to-line-distance":7}]},{},[13])(13)
});
