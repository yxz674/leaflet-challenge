// use the URL of this JSON to pull in the data for our visualization.For example "All Earthquakes from the Past 7 Days"
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
var earthquakes = L.layerGroup();
// Create the base layers.
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a baseMaps object.
var baseMaps = {
  "Street Map": street,
  "Topographic Map": topo
};

// Create an overlay object to hold our overlay.
var overlayMaps = {
  Earthquakes: earthquakes
};

// Create our map, giving it the streetmap and earthquakes layers to display on load.
var myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 5,
  layers: [street, earthquakes]
});
// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Add Legend to the Map
var legend = L.control({position: "bottomright"});
var colors = ["#7CFC00","#ADFF2F","#FFD700","#FF8C00","#D2691E","#A52A2A"];
var grades = ['-10-10', '10-30', '30-50', '50-70', '70-90','90+'];
legend.onAdd = function(myMap) {
  var div = L.DomUtil.create("div", "info legend");
  for (var i = 0; i < colors.length; i++) {
    div.innerHTML += '<i style="background:' + colors[i] + '"></i><span>' + grades[i] + '</span><br>'}
  return div;
};
legend.addTo(myMap);

 // Perform a GET request to the query URL/
d3.json(queryURL).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    // console.log(data.features);
// data markers reflect the magnitude of the earthquake by their size and and depth of the earthquake by color (different green). Earthquakes with higher magnitudes should appear larger and earthquakes with greater depth should appear darker in color.
  function markerSize(magnitude) {
    return magnitude * 3;
  };
  function chooseColor(grades) {
    switch (true) {
    case grades > 90:
        return "#A52A2A";
    case grades > 70:
        return "#D2691E";
    case grades > 50:
        return "#FF8C00";
    case grades > 30:
        return "#FFD700";
    case grades > 10:
        return "#ADFF2F";
    default:
        return "#7CFC00";
    }
  }
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
  }
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng,{
          color: "#4d4d4d",
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          fillOpacity: 1.5,
          radius: markerSize(feature.properties.mag),
          weight: 1.5
        }
      );
    },
    onEachFeature: onEachFeature
  }).addTo(earthquakes);
  earthquakes.addTo(myMap);
});
