var map = L.map('map').setView([19.615, 37.216], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// مجموعة لتخزين العناصر المرسومة
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// إضافة أدوات الرسم
var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
    remove: true
  },
  draw: {
    polyline: true,
    polygon: true,
    rectangle: true,
    circle: false,
    marker: true
  }
});
map.addControl(drawControl);

// عند إضافة عنصر جديد
map.on(L.Draw.Event.CREATED, function (e) {
  var layer = e.layer;
  drawnItems.addLayer(layer);
});

// عند تعديل أو حذف العناصر
map.on(L.Draw.Event.EDITED, function () {
  console.log('تم تعديل العناصر');
});
map.on(L.Draw.Event.DELETED, function () {
  console.log('تم حذف العناصر');
});

// تصدير البيانات المعدلة
function exportEditedData() {
  var features = [];
  drawnItems.eachLayer(function(layer) {
    if (layer instanceof L.Marker) {
      features.push({
        type: 'Feature',
        properties: { type: 'Marker' },
        geometry: { type: 'Point', coordinates: [layer.getLatLng().lng, layer.getLatLng().lat] }
      });
    } else if (layer instanceof L.Polyline) {
      var coords = layer.getLatLngs().map(function(latlng) {
        return [latlng.lng, latlng.lat];
      });
      features.push({
        type: 'Feature',
        properties: { type: 'Polyline' },
        geometry: { type: 'LineString', coordinates: coords }
      });
    } else if (layer instanceof L.Polygon) {
      var coords = layer.getLatLngs()[0].map(function(latlng) {
        return [latlng.lng, latlng.lat];
      });
      features.push({
        type: 'Feature',
        properties: { type: 'Polygon' },
        geometry: { type: 'Polygon', coordinates: [coords] }
      });
    }
  });

  var geojson = { type: 'FeatureCollection', features: features };
  downloadFile(JSON.stringify(geojson), 'edited_data.geojson', 'application/json');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
