// Map Path Maker
// D. Hillman
// March 2019 - Aug 2021
// following initializes starting location

var maplat = 0;
var maplong = 0;
var mapzoom = 3;

// map type 
var maptype = "terrain";
var idval = 0;

var bshapes = [],
          goo=google.maps,
          map=map||null,
          shape,
		  tmp;
var mapset = [];    //holds features for the map, lat, long, zoom

//var bshapes = [];


function initialize() {
    goo = google.maps,
		map_in = new goo.Map(document.getElementById('map_in'), 
			{ zoom: mapzoom,  
				center: new goo.LatLng(maplat, maplong),
			 	mapTypeId: maptype
                 }),
		bshapes = [],
        selected_shape  = null,
	
	    drawman = new google.maps.drawing.DrawingManager({
				map:map_in,
				drawingControl: true,
				drawingControlOptions: {
					position: google.maps.ControlPosition.TOP_CENTER,
					drawingModes: ['polyline', 'marker', 'circle', 'polygon', 'rectangle']
				},
				markerOptions: {
					icon: '/static/working/red.png',
					draggable: true
				},
				polylineOptions: {
					strokeColor: '#FF0000',
					strokeOpacity: 0.5,
					strokeWeight: 6,
					editable: true
				},
				circleOptions: {
					fillColor: '#FFFF00',
					fillOpacity: 0.3,
					strokeWeight: 5,
					clickable: true,
					editable: true,
					zIndex: 1
				},
				polygonOptions: {
					fillColor: '#FFFF00',
					fillOpacity: 0.3,
					strokeWeight: 5,
					clickable: true,
					editable: true
				},
				rectangleOptions: {
					fillColor: '#FFFF00',
					fillOpacity: 0.3,
					strokeWeight: 5,
					clickable: true,
					editable: true
				}
		    }),
		
		byId = function(s){return document.getElementById(s)},
		
		genDate = function() {
			var currentdate = new Date(); 
			var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
			return datetime	
		},

		clearSelection  = function() {
			if(selected_shape){
                selected_shape.set((selected_shape.type === google.maps.drawing.OverlayType.MARKER) 
					?'draggable':'editable',false);
				byId('status').value = "";
				selected_shape = null;
                }
			},

		setSelection = function(shape){
                            clearSelection();
                            selected_shape=shape;
							byId('obid').value = selected_shape.myid;
							byId('obtype').value = selected_shape.type;
							byId('obdate').value = selected_shape.mydt;
							byId('obmsg').value = selected_shape.mymsg;
							byId('status').value = selected_shape.myid + " selected";
                            selected_shape.set((selected_shape.type
                                                  ===
                                                  google.maps.drawing.OverlayType.MARKER
                                                 )?'draggable':'editable',true);
                          },

		clearShapes     = function(){
                           for(var i=0;i<bshapes.length;++i){
                              if (bshapes[i].type != 'PATH') bshapes[i].setMap(null);
                            }
                            bshapes=[];
							byId('status').value = "Objects Cleared";
							byId('obid').value = "";
							byId('obtype').value = "";
							byId('obdate').value = "";
							byId('obmsg').value = "";
                          },

		updateMessage = function(){
                            for(var i=0;i<bshapes.length;++i){
                            	if (bshapes[i].myid == byId('obid').value) {
									bshapes[i].mymsg = byId('obmsg').value
									break;
							  	}
                            }
							},
						  
		linkMarkers = function(){
							geoline = []
                            for(var i=0;i<bshapes.length;++i){
                            	if (bshapes[i].type == 'MARKER') {
									shape = bshapes[i]
								  	geoline.push(IO.p_(shape.getPosition()))
							  	}
                            }
							tmp=new goo.Polyline({
								path:IO.ll_(geoline),
								strokeColor: '#FF0000',
							  	strokeOpacity: 0.5,
							  	strokeWeight: 5,
							  	editable: true
						  	});
			  	   			goo.event.addListener(tmp, 'click', function() {
          						setSelection(tmp);
        					});	 
       						tmp.setValues({map: map_in, type:'POLYLINE',mydt:genDate(),mymsg:'via linking',myid:create_UUID()}) ;  
			  				bshapes.push(tmp);
							setSelection(tmp);
                          },				  
						  
		//following added to gather up map latlong and zoom
		getMapData		= function() {
								var coords = map_in.getCenter(); 
								mapset = [];
								mapset.push(map_in.getZoom());
								mapset.push(coords.lng());
								mapset.push(coords.lat());
						};

    goo.event.addListener(drawman, 'overlaycomplete', function(e) {
        var shape   = e.overlay;
        shape.type  = e.type.toUpperCase();
		shape.myid = create_UUID();
		shape.mydt = genDate();
		shape.mymsg = "initial creation";
        goo.event.addListener(shape, 'click', function() {
          setSelection(this);
        });
        setSelection(shape);
        bshapes.push(shape);
      });

	goo.event.addListener(map_in, 'mousemove', function(event) {
        byId('llpos').value = event.latLng.lat().toPrecision(6) + ', ' + event.latLng.lng().toPrecision(6);
    });  
	
	goo.event.addListener(map_in, 'dragend', getMapData)

	goo.event.addListener(map_in, 'zoom_changed', getMapData)
	  
    goo.event.addListener(map_in, 'click',clearSelection);

    goo.event.addDomListener(byId('clear_shapes'), 'click', clearShapes);

	goo.event.addDomListener(byId('link_markers'), 'click', linkMarkers);
	
	goo.event.addDomListener(byId('upd_msg'), 'click', updateMessage);
	
	goo.event.addDomListener(byId('dataClear'), 'click', function() {byId('data').value = "" }) ;
	
	goo.event.addDomListener(byId('mapCopy'), 'click', function()  {
		var mdata = byId("data")
		mdata.select();
		document.execCommand("copy")
		byId('status').value = "Map copied to clipboard"
	});

	goo.event.addDomListener(byId('GetmapCopy'), 'click', function()  {
		var mdata = byId('tsample').value
		byId('data').value = mdata
	});
		


	goo.event.addDomListener(byId('save_raw'), 'click', function(){
	  ashapes = IO.IN(bshapes,false);
	  byId('data').value=JSON.stringify(ashapes);
	  });

	goo.event.addDomListener(byId('restore'), 'click', function(){
		bshapes=IO.OUT(JSON.parse(byId('data').value),map_in);
    });
    
}


var IO={
  //returns array with storable google.maps.Overlay-definitions
  IN:function(arr,		//array with google.maps.Overlays
					encoded		//boolean indicating whether paths should be stored encoded
              ){
      	  ashapes = [] 
		  //following sets up the path information
	  	  if (byId('pathid').value == "") byId('pathid').value = create_UUID();	
		  var coords = map_in.getCenter(); 

	  	  tmp={type:"PATH",pathid:byId('pathid').value, pathname:byId('pathname').value||"no name", maplat: coords.lat(),maplong: coords.lng(), mapzoom: map_in.getZoom(), maptype: map_in.mapTypeId};
	  	  ashapes.push(tmp)
		  
		  for(var i = 0; i < arr.length; i++)
		  {   
			shape=arr[i];
// following line stores type, msg, and id			  
			tmp={type:shape.type,mydt:shape.mydt,mymsg:shape.mymsg,myid:shape.myid||null};
			switch(shape.type){
			   case 'CIRCLE':
				  tmp.radius=shape.getRadius();
				  tmp.geometry=this.p_(shape.getCenter());
				break;
			   case 'MARKER': 
				  tmp.geometry=this.p_(shape.getPosition());   
				break;  
			   case 'RECTANGLE': 
				  tmp.geometry=this.b_(shape.getBounds()); 
				 break;   
			   case 'POLYLINE': 
				  tmp.geometry=this.l_(shape.getPath(),encoded);
				 break;   
			   case 'POLYGON': 
				  tmp.geometry=this.m_(shape.getPaths(),encoded);
				  
				 break;   
		   }
		   ashapes.push(tmp);
		}
		return ashapes;
  },

  
  //returns array with google.maps.Overlays
  OUT:function(arr,    //array containing the stored shape-definitions
               map    //map where to draw the shapes
               ){

      bshapes = []
	  
	  for(var i = 0; i < arr.length; i++)
      {   
        shape=arr[i];  
		  
        switch(shape.type){
			case 'PATH':
				byId('pathid').value = shape.pathid;
				byId('pathname').value = shape.pathname;
				map.mapTypeId = shape.maptype;
				map.setZoom(shape.mapzoom);
				map.setCenter(new google.maps.LatLng(shape.maplat, shape.maplong));
				map.panTo(new google.maps.LatLng(shape.maplat, shape.maplong));
				tmp = {type: 'PATH', pathid: shape.pathid, pathname: shape.pathname,maplat: shape.maplat , maplong: shape.maplong, mapzoom: shape.mapzoom, maptype: shape.maptype};
			break
           case 'CIRCLE':
              tmp=new goo.Circle({
				  radius:Number(shape.radius),
				  center:this.pp_.apply(this,shape.geometry),
				  fillColor: '#FFFF00',
				  fillOpacity: 0.5,
				  strokeWeight: 5,
				  clickable: true,
				  editable: true,
				  zIndex: 1
			  });
            break;
           case 'MARKER': 
              tmp=new goo.Marker({
				  position:this.pp_.apply(this,shape.geometry),
				  icon: 'red.png',
   				  draggable: true
			  });
            break;  
           case 'RECTANGLE': 
              tmp=new goo.Rectangle({
				  bounds:this.bb_.apply(this,shape.geometry),
				  fillColor: '#FFFF00',
				  fillOpacity: 0.5,
				  strokeWeight: 5,
				  clickable: true,
				  editable: true
			  });
             break;   
           case 'POLYLINE': 
              tmp=new goo.Polyline({
				  path:this.ll_(shape.geometry),
				  strokeColor: '#FF0000',
				  strokeOpacity: 0.5,
				  strokeWeight: 5,
				  editable: true
			  });
             break;   
           case 'POLYGON': 
              tmp=new goo.Polygon({
				  paths:this.mm_(shape.geometry),
			  	  fillColor: '#FFFF00',
				  fillOpacity: 0.5,
				  strokeWeight: 5,
				  clickable: true,
				  editable: true
			  });
             break;   
       }
	   goo.event.addListener(tmp, 'click', function() {
          setSelection(this);
        });	  
       if (shape.type != 'PATH') tmp.setValues({map: map, type:shape.type,mydt:shape.mydt,mymsg:shape.mymsg,myid:shape.myid,geometry:shape.geometry}) ;  
	   bshapes.push(tmp);
    }
    return bshapes;
  },

  l_:function(path,e){
    path=(path.getArray)?path.getArray():path;
    if(e){
      return google.maps.geometry.encoding.encodePath(path);
    }else{
      var r=[];
      for(var i=0;i<path.length;++i){
        r.push(this.p_(path[i]));
      }
      return r;
    }
  },
  ll_:function(path){
    if(typeof path==='string'){
      return google.maps.geometry.encoding.decodePath(path);
    }
    else{
      var r=[];
      for(var i=0;i<path.length;++i){
        r.push(this.pp_.apply(this,path[i]));
      }
      return r;
    }
  },

  m_:function(paths,e){
    var r=[];
    paths=(paths.getArray)?paths.getArray():paths;
    for(var i=0;i<paths.length;++i){
        r.push(this.l_(paths[i],e));
      }
     return r;
  },
  mm_:function(paths){
    var r=[];
    for(var i=0;i<paths.length;++i){
        r.push(this.ll_.call(this,paths[i]));
        
      }
     return r;
  },
  p_:function(latLng){
    return([latLng.lat(),latLng.lng()]);
  },
  pp_:function(lat,lng){
    return new google.maps.LatLng(lat,lng);
  },
  b_:function(bounds){
    return([this.p_(bounds.getSouthWest()),
            this.p_(bounds.getNorthEast())]);
  },
  bb_:function(sw,ne){
    return new google.maps.LatLngBounds(this.pp_.apply(this,sw),
                                        this.pp_.apply(this,ne));
  },
  t_:function(s){
    var t=['CIRCLE','MARKER','RECTANGLE','POLYLINE','POLYGON'];
    for(var i=0;i<t.length;++i){
       if(s===google.maps.drawing.OverlayType[t[i]]){
         return t[i];
       }
    }
  }
  
}

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

google.maps.event.addDomListener(window, 'load', initialize);

