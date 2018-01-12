(function() {
	/* requestAnimationFrame crossbrowser support */
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
})();

(function($) {
	$(document).ready(function() {
		var $window = $(window),
			window_width = $window.width(),
			update_functions = [],
			resize_timeout = '',
			current_window_width = 0,
			$body = $(document.body);
		
		/* SLIDES */
		var $banner = $('#banner');
		if ($banner[0]) {
			$banner.find('article').wrapAll('<div class="slides"></div>');
			$banner.flexslider({
				selector: ".slides > article",
				slideshow: true,
				controlNav: false,
				directionNav: false,
				slideshowSpeed: 7000,
			});
		}
		
		
		/* HEADER */
		var $header_block = $('.header-block');
		if($header_block[0]){
			$window
				.on('scroll.scroll_fix', function() {
					if($window.scrollTop() > 66){
						if($header_block.data('fixed') !== true){
							$header_block
								.data('fixed', true)
								.addClass('sticky');
						}
					}
					else if($header_block.data('fixed') === true){
						$header_block
							.data('fixed', false)
							.removeClass('sticky');
					}
				})
				.trigger('scroll');
		}
		
		/* Banner height test
		$('.pri_header h1 a').on('click', function(){
			alert($window.height() + ' ' + $('.header-block').height() + ' ' + $('#banner').height());
			return false;
		});
		*/
		
		/* NAV */
		var $nav = $('#navbarCollapse');
		if ($nav[0]) {
			requestAnimationFrame(function() {
				$nav.addClass('processed');
			});
			
			var show_dropdown = function($this){
				var	$active = $this.siblings('.dropdown-shown');
				if ($active[0]) {
					clearTimeout($active.data('tm'));
					$active.removeClass('dropdown-shown').find('.dropdown-menu').stop().slideUp(200);
				}
				clearTimeout($this.data('tm'));
				$this.addClass('dropdown-shown').find('.dropdown-menu').stop().slideDown(200);
			}
			var hide_dropdown = function($this){
				$this.data('tm', setTimeout(function() {
					$this.removeClass('dropdown-shown').find('.dropdown-menu').stop().slideUp(200);
				}, 500));
			}
			
			$nav
				.on('mouseenter', '.menu-item-has-children', function() {
					if(window_width > 768){
						show_dropdown($(this));
						return false;
					}
				})
				.on('mouseleave', '.menu-item-has-children', function() {
					if(window_width > 768){
						hide_dropdown($(this));
						return false;
					}
				})
				.on('click', '.dropdown-top-level', function(){
					var $li = $(this).closest('.menu-item-has-children');
					if(!$li.hasClass('dropdown-shown')){
						show_dropdown($li);
						return false;
					}
				})
				.find('.dropdown-toggle')
					.addClass('dropdown-top-level')
					.removeClass('dropdown-toggle')
					.removeData('toggle')
					.removeAttr('data-toggle');
		}
		
		
		/* FORM */
		var change_block_status = function($input) {
			var $block = $input.closest('.form-blocks'),
				$form = $block.closest('form');
				
			if ($input.val().trim().length > 0) {
				var $next = $block.next('.form-blocks'),
					$next_input = $next.find('select, input');
				$block.addClass('processed');
				$next.addClass('visible');
				
				if ($input.get(0).tagName == 'INPUT') {
					$input.addClass('init-width');
					$input.closest('.gfield').removeAttr('style').attr('style', 'width:' + $input.prop('scrollWidth') + 'px!important;');
					$input.removeClass('init-width');
				}
				else if ($input.get(0).tagName == 'SELECT'){
					var $option = $input.find('option[value="' + $input.val() + '"]').first();
					$input.closest('.gfield')
						.removeAttr('style')
						.attr('style', 'width:' + (($option.text().length * 8) + 26) + 'px!important;');
				}
				
				if ($next_input[0] && $next_input.val().trim().length > 0) {
					change_block_status($next_input);
				}
				
				if ($next[0]) {
					if (!$next.hasClass('processed')) {
						$form.removeClass('complete');
					}
					$next.find('input[type=text]').trigger('focus');
				}
				else {
					$form.addClass('complete');
				}
			}
			else {
				if ($input.get(0).tagName == 'INPUT') {
					$input.addClass('init-width').val($input.attr('placeholder'));
					var inp_width = $input.prop('scrollWidth');
					inp_width = inp_width > 40 ? inp_width : 40;
					$input.closest('.gfield').removeAttr('style').attr('style', 'width:' + inp_width + 'px!important;');
					$input.removeClass('init-width').val('');
				}
				$block.removeClass('processed');
				$block.nextAll('.form-blocks').removeClass('visible processed');
				if ($block.next('.form-blocks')[0]) {
					$form.removeClass('complete');
				} else {
					$form.addClass('complete');
				}
			}
		}
		
		// Enter-keycode form submition prevention
		$('#gform_5').on('keydown', function(event){
			var code = (event.keyCode ? event.keyCode : event.which);
        if(code == 13 || code == 10){
				event.preventDefault();
				return false;
			}
		});
		$body.on('change blur', '#gform_fields_5 select, #gform_fields_5 input[type=text]', function() {
			change_block_status($(this));
		});
		requestAnimationFrame(function() {
			var $gform_fields_5 = $('#gform_fields_5');
		
			if($gform_fields_5[0]){
				
				// wrap paired blocks in '.form-blocks'
				var $divs = $gform_fields_5.children('li.gfield_html');
				for(var i = 0, iL = $divs.length; i < iL; i++){
					var $current = $divs.eq(i),
						$next = $current.next();
						
					if($next.hasClass('field_sublabel_below')){
						$current.add($next).wrapAll('<li class="form-blocks"><ul></ul></li>');
					}
				}
				
				// move 'I don't want text' to 'My phone number' block
				var $dont_want = $gform_fields_5.find('#field_5_26');
				if($dont_want[0]){
					$gform_fields_5.find('#field_5_14').closest('.form-blocks')
						.append($dont_want.html())
						.on('change', '#choice_5_26_1', function(){
							var $sibling_ul = $(this).closest('.ginput_container_checkbox').siblings('ul'),
								$best_time = $('#field_5_16').closest('ul');
							if(this.checked){
								$sibling_ul.hide();
								$best_time
									.hide()
									.closest('.form-blocks')
										.addClass('processed')
										.next('.form-blocks')
											.addClass('visible');
							}
							else{
								$sibling_ul.show();
								$best_time.show();
							}
						});
					$dont_want.remove();
					
					
				}
				
				// wrap last of checkboxes into a single block
				$gform_fields_5.find('#field_5_20').add($gform_fields_5.find('#field_5_21'))
					//.wrapAll('<li class="form-blocks lastSect"><ul></ul></li>')
					.appendTo($gform_fields_5.closest('form').find('.gform_footer.top_label'))
					.wrapAll('<ul class="gformcheckbox"></ul>');
				
				
				
				// process 'Add another speciality'
				var $blocks = $gform_fields_5.find('.form-blocks'),
					$block_first = $blocks.eq(0),
					$block_sec = $blocks.eq(1);
				$block_sec.detach();
				$block_first.append('<div class="add_more"><a href="#"><span>Add another specialty</span></a></div>');
				
				$gform_fields_5
					.on('click', '.add_more a', function() {
						$(this).closest('.add_more').remove();
						$block_sec
							.addClass('visible')
							.insertAfter($block_first)
							.find('li')
								.removeAttr('style');
						return false;
					})
					.closest('#gform_5')
						.addClass('form-processed');
			}
		});
	
		
		/* update on screen resize */
		$window.on('resize', function(){
			screen_resize();
			return false;
		});
		var screen_resize = function(){
			clearTimeout(resize_timeout);
			resize_timeout = setTimeout(function(){
				current_window_width = window.innerWidth;
				if(current_window_width != window_width){
					window_width = current_window_width;
					window_height = $window.height();
					screen_update();
				}
			}, 300);
		}
		var screen_update = function(){
			for(var i = 0, iL = update_functions.length; i < iL; i++){
				update_functions[i][0](update_functions[i][1]);
			}
		}
	});
})(jQuery);
/*
var all_locations = [{
	"title": "Sibley Memorial Hospital Community Physician",
	"address": "5215 Loughboro Road NW, Suite 300 Washington, DC 20016",
	'latitude' : "38.9370594",
	'longitude': "-77.1092589",
	'type': 'Johns Hopkins Community Physicians',
}, {
	"title": "North Bethesda Community Physician ",
	"address": "6000 Executive Boulevard, Suite 625 Rockville, MD 20852",
	'latitude' : "39.0479101",
	'longitude': "-77.1227967",
	'type': 'Johns Hopkins Community Physicians',
}, {
	"title": "Montgomery Community Physician",
	"address": "14955 Shady Grove Road, Suite 100 Rockville, MD 20850 ",
	'latitude' : "39.0986337",
	'longitude': "-77.1942226",
	'type': 'Johns Hopkins Community Physicians',
}, {
	"title": "Laurel Community Physician", 
     "address": "14207 Park Center Drive, Suite 102	Laurel, MD 20707",
	'latitude' : "39.0846891",
	'longitude': "-76.880185",
	'type': 'Johns Hopkins Community Physicians',
}, {
	"title": "I Street Community Physician",
    "address": "1400 I Street, NW, Suite 825 Washington, D.C.20005 ",
	'latitude' : "38.9010391",
	'longitude': "-77.0344508",
	'type': 'Johns Hopkins Community Physicians',
}, {
	"title": "Downtown Bethesda Community Physician ",
	"address": "7315 Wisconsin Avenue, Suite 700 Bethesda, MD 20814",
	'latitude' : "38.9826169",
	'longitude': "-77.0950538",
	'type': 'Johns Hopkins Community Physicians',
}, {
	"title": "Bethesda Community Physician",
	"address": "6410 Rockledge Drive, Suite 200 Bethesda, MD 20817",
	'latitude' : "39.0239904",
	'longitude': "-77.1358435",
	'type': 'Johns Hopkins Community Physicians',
}, {
	"title": "Sibley Outpatient Surgery and Imaging Center",
	"address": "5215 Loughboro Road NW Washington, DC 20016",
	'latitude' : "38.9371034",
	'longitude': "-77.1096722",
	'type': 'OutPatient Centers',
}, {
	"title": "Johns Hopkins Health Care and Surgery Center",
	"address": "6420 Rockledge Drive, Suite 4920 Bethesda, MD 20817 ",
	'latitude' : "39.024602",
	'longitude': "-77.1354258",
	'type': 'OutPatient Centers',
}, {
	"title": "Suburban Hospital",
	"address": "8600 Old Georgetown Road Bethesda,MD 20814",
	'latitude' : "38.9974307",
	'longitude': "-77.1126702",
	'type': 'Hospitals',
}, {
	"title": "Sibley Memorial Hospital",
	"address": "5255 Loughboro Road, N.W. Washington, DC 20016 ",
	'latitude' : "38.9365624",
	'longitude': "-77.1114529",
	'type': 'Hospitals',
}]
*/
/* google map init */
function initAutocomplete() {
	var $ = jQuery,
		$window = $(window),
		isMobileCheck = {
			Android: function() {
				return navigator.userAgent.match(/Android/i);
			},
			BlackBerry: function() {
				return navigator.userAgent.match(/BlackBerry/i);
			},
			iOS: function() {
				return navigator.userAgent.match(/iPhone|iPad|iPod/i);
			},
			Opera: function() {
				return navigator.userAgent.match(/Opera Mini/i);
			},
			Windows: function() {
				return navigator.userAgent.match(/IEMobile/i);
			},
			any: function() {
				return (isMobileCheck.Android() || isMobileCheck.BlackBerry() || isMobileCheck.iOS() || isMobileCheck.Opera() || isMobileCheck.Windows())
			}
		},
		isMobile = isMobileCheck.any(),
		google_locs = document.getElementById('actualMap'),
		map, markerCluster, markers = [],
		infowindows = [];
	var methods = {
		
		/* INIT */
		init: function() {
			methods.map_init();
			methods.filter_init();
		},
		
		
		/* MAP */
		map_init: function() {
			if (google_locs) {
				var center_lat = 38.9826169,
					center_lng = -77.0950538,
					map_zoom = 3;
				var center = new google.maps.LatLng(center_lat, center_lng),
					options = {
						'scrollwheel': false,
						'zoom': map_zoom,
						'center': center,
						'mapTypeId': google.maps.MapTypeId.ROADMAP,
						'scaleControl': false,
						'zoomControl': true,
					};
				map = new google.maps.Map(google_locs, options);
				methods.populate_markers(all_locations);
			}
		},
		
		/* - populate markers */
		populate_markers: function(locations, point) {
			var loc_length = locations.length,
				bounds = new google.maps.LatLngBounds(),
				infowindow = new google.maps.InfoWindow({
					'maxWidth': 400,
					'pixelOffset': new google.maps.Size(161, 93)
				});
			contentString = "";
			// clear markers if they are present
			if (markers) {
				for (var i = 0, iL = markers.length; i < iL; i++) {
					markers[i].setMap(null);
				}
			}
			// infowindow close event
			$(google_locs).on('click', '.custom-info-close a', function() {
				infowindow.close();
				for (var m = 0, mL = markers.length; m < mL; m++) {
					markers[m].setOpacity(1);
				}
				return false;
			});
			// create a new set of markers
			markers = new Array(loc_length);
			infowindows = new Array();
			var textarea_dummy = document.createElement('textarea');
			// define custom pollution and youth icons
			var reg_icon = 'http://jhmdc.wpengine.com/wp-content/themes/johns-hopkins/images/marker.png',
				reg_width = 50,
				reg_height = 54;
			for (var i = 0, iL = loc_length; i < iL; i++) {
				var latLng = new google.maps.LatLng(locations[i].latitude, locations[i].longitude);
				textarea_dummy.innerHTML = locations[i].title;
				var icon_url = reg_icon,
					icon_width = reg_width,
					icon_height = reg_height;
				var marker = new google.maps.Marker({
					map: map,
					position: latLng,
					title: textarea_dummy.value,
					address: locations[i].address,
					icon: {
						url: icon_url,
						size: new google.maps.Size(icon_width, icon_height),
					},
				});
				google.maps.event.addListener(marker, 'click', (function(marker, i) {
					return function() {
						var html = '<div class="custom-info"><div class="custom-info-inner">';
						html += '<div class="custom-info-close"><a href="#"></a></div>';
						html += '<h3 class="custom-info-title">' + locations[i].title + '</h3>';
						html += '<div class="custom-info-address">' + locations[i].address + '</div>';
						html += '<div class="custom-info-directions"><a href="https://www.google.com/maps?daddr=' + locations[i].address.replace(/<br\s*[\/]?>/gi, " \n") + '" target="_blank"><span>Directions</span></div>';
						html += '</div></div>';
						infowindow.setContent(html);
						infowindow.open(map, marker);
						for (var m = 0, mL = markers.length; m < mL; m++) {
							if (m != i) {
								markers[m].setOpacity(0.5);
							}
						}
						marker.setOpacity(0);
					}
				})(marker, i));
				markers[i] = marker;
				bounds.extend(latLng);
			}
			//google.maps.event.addListenerOnce(map, 'bounds_changed', function() { this.setZoom(Math.min(5, this.getZoom())); });
			if (point) {
				map.setZoom(12);
				map.setCenter(point);
			} else {
				if(locations.length > 0){
					map.fitBounds(bounds);
				}
			}
		},
		
		
		/* FILTER */
		filter_init: function() {
			var $filter_control = $('#accordion');
			if ($filter_control[0]) {
				var $slide_content = $filter_control.find('.fiters-box');
				// slides
				$filter_control.find('.filters-heading a').on('click', function() {
					if ($slide_content.is(":visible")) {
						$filter_control.removeClass('opened');
						$slide_content.slideUp(250);
					} else {
						$filter_control.addClass('opened');
						$slide_content.slideDown(250);
					}
					return false;
				});
				// submit
				var $inputs = $filter_control.find('input').filter('[name=filters], [type=text]');
				$filter_control.on('submit', 'form', function() {
					methods.apply_filter($inputs);
					return false;
				});
				$inputs.filter('[name=filters]').on('change', function(){
					methods.apply_filter($inputs);
				});
			}
		},
		
		/* - apply filter */
		apply_filter: function($inputs) {
			var locations = [],
				vals = [],
				check = '',
				$checkboxes = $inputs.filter('[type=checkbox]'),
				zipcode = $inputs.filter('[type=text]').val().trim();
			for (var i = 0, iL = $checkboxes.length; i < iL; i++) {
				check = $checkboxes.eq(i).get(0);
				if (check.checked) {
					vals[vals.length] = check.value;
				}
			}
			for (var i = 0, iL = all_locations.length; i < iL; i++) {
				for (var c = 0, cL = vals.length; c < cL; c++) {
					if (all_locations[i].type == vals[c]) {
						locations[locations.length] = all_locations[i];
					}
				}
			}
			if (zipcode.length > 0) {
				var address_data = zipcode + ', United States';
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({
					'address': address_data
				}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						point_1 = results[0].geometry.location;
						//lat = results[0].geometry.location.lat();
						//lng = results[0].geometry.location.lng();
						methods.populate_markers(locations, point_1);
					} else {
						methods.populate_markers(locations);
					}
				});
			} else {
				methods.populate_markers(locations);
			}
		},
		
	}
	/* initialize */
	methods.init();
}