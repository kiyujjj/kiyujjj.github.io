var map;

_.dom = {};
_.dom.set = function(callback){
  var THIS = this;

  if(_.TOUCH){
    $('head').append('<meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=0" />');
    $('body').attr('id', 'body_touch');
  }

  $('<div id="map_canvas" />').appendTo('#wrapper');

  $(window).on('resize', function(){
    THIS.resize();
  });

  if(callback) callback();
}

_.dom.resize = function(){
  if(map){
    google.maps.event.trigger(map, 'resize');
    if(_.CENTER) map.setCenter(_.CENTER);
  }
}


// !map ------------------------------>
_.mapLoad = function(){
  _.mzoom = 18;

  var c = _.mapCookie();

  var lat = c.lat;
  var lng = c.lng;
  var zoom = _.czoom = parseFloat(c.zoom);
  var maptype = 'roadmap';
  lat = _.ll(lat);
  lng = _.ll(lng);
  if(!(lat >= -90 && lat <= 90) || !(lng > -180 && lng < 180)){
    lat = _.MAP_DEF[0];
    lng = _.MAP_DEF[1];
  }
  var ll = new google.maps.LatLng(lat,lng);

  var opts = {
    zoom: zoom,
    center: ll,
    panControl: false,
    // panControlOptions: {
    //   position: google.maps.ControlPosition.LEFT_TOP
    // },
    mapTypeControl: false,
    mapTypeId: _.maptype(maptype),
    scrollwheel:true,
    keyboardShorts: true,
    scaleControl: true,
    streetViewControl: false,
    streetViewControlOptions: {
      position: _.TOUCH ? google.maps.ControlPosition.LEFT_CENTER : google.maps.ControlPosition.LEFT_TOP
    },
    zoomControl: _.TOUCH ? false : true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: google.maps.ControlPosition.LEFT_TOP
    },
    backgroundColor: '#f9f9f9'
  };

  map = new google.maps.Map(_.$('map_canvas'), opts);
  map.setOptions({styles:[{"stylers": [{ "visibility": "on" }]}]});

}

_.mapCookie = function(){
  var n = ['lat','lng','zoom','maptype'];
  var d = _.MAP_DEF = [35.681382,139.766084, 16, 'ROADMAP'];
  var v = new Array(n.length);
  if(_.cookie.get('map')){
    var v = _.cookie.get('map').split('*');
  }
  var c = {};
  for(i=0; i < n.length; i++){
    c[n[i]] = v[i] ? v[i] : d[i];
  }
  return c;
}

_.maptype = function(type){
  var maptype;
  switch(type){
    case 'satellite': maptype = google.maps.MapTypeId.SATELLITE; break;
    case 'hybrid': maptype = google.maps.MapTypeId.HYBRID; break;
    case 'terrain': maptype = google.maps.MapTypeId.TERRAIN; break;
    default: maptype = google.maps.MapTypeId.ROADMAP; break;
  }
  return maptype;
}

_.ll = function(v){
  if(!v) return 0;
  return Math.floor(v*1000000)/1000000;
}
