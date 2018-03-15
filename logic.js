// Store API 
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

var plate = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

var map = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ.T6YbdDixkOBWH_k9GbS8JQ");




var earthquakes = new L.layerGroup();
var faults = new L.layerGroup();


var myMap = L.map("map", {
  center: [46.06, -114.34],
  zoom: 4,
  layers: [map]
});



d3.json(url, function(response) {
  
  function styleData(feature) {
  return {
    stroke: false,
    fillOpacity: .7,
    fillColor: getColor(feature.properties.mag),
    radius: circRad(feature.properties.mag)    
    };
  }


  function getColor(mag){
    switch(true){
      case mag < 1:
        return "#66FF66";
      case mag < 2:
        return "#CCFF33";
      case mag < 3:
        return "#CCCC66";
      case mag < 4:
        return "#FFCC66";
      case mag < 5:
        return "#FF9966";
      default:
        return "#FF6666";
  }};

  function circRad(r) {
    return r*7;
  }

  //figure out how to do circle outlines

  
  L.geoJSON(response, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleData,
    onEachFeature: function(feature, layer) {


      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

  }).addTo(earthquakes);
  earthquakes.addTo(myMap);
})




d3.json(plate, function(response){

  function polystyle(feature){
    return {
     fillColor: 'yellow',
     weight: 1.5,
     opacity: 1,
     color: 'orange', 
     fillOpacity: 0.0
    };
  }

  L.geoJSON(response, {style: polystyle}).addTo(faults);
  faults.addTo(myMap);
})



// Satellite map

var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYmJhbGVzMTEiLCJhIjoiY2plYmptdmFwMGRydzJybzdpdzBxazk1aiJ9.ASSE0faIpkFAu87MR5RM0g");

var baseMaps = {
  "Map": map,
  "Satellite Map": satmap
};

var overlayMaps = {
  "Earthquakes": earthquakes,
  "Plates": faults
};


L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);


// Legend
var legend = L.control({position: 'bottomright'});


function getColor(d) {
    return d <= 1 ? "#66FF66":
           d <= 2 ? "#CCFF33":
           d <= 3 ? "#CCCC66":
           d <= 4 ? "#FFCC66":
           d <= 5 ? "#FF9966":
           d > 5 ? "#FF6666":
                    "#ffffff";
  }

//need better color scheme 

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
