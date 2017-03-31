//------------------------------------------------------------------------------
// geotool.js - version 1.0.0
//
//	Copyright (c) 2005 Craftworks Corp. All Right Reserved.
//
//	This library is free software; you can redistribute it and/or
//	modify it under the terms of the GNU Lesser General Public
//	License as published by the Free Software Foundation; either
//	version 2.1 of the License, or (at your option) any later version.
//
//	This library is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the GNU
//	Lesser General Public License for more details.
//
//	You should have received a copy of the GNU Lesser General Public
//	License along with this library; if not, write to the Free Software
//	Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA	02111-1307	USA
//
//	For details, see the Craftworks web site: http://www.craft-works.co.jp/
//
//	AUTHOR: Isam Nakane <isam@craft-works.co.jp>
//
//	SYNOPSIS:
//		wgs = Geotool.wgs2tky(deg.lat, deg.lng);
//		dms.lat = Geotool.dms2deg(wgs.lat);
//		dms.lng = Geotool.dms2deg(wgs.lng);
//		boolean = Geotool.isJapan(deg.lat, deg.lng);
//
//------------------------------------------------------------------------------

// http://www.craft-works.co.jp/blog/archives/28

var Geotool = {
	// radian
	RD : Math.PI / 180,

	// --------------- WGS 84 ---------------
	// (Equatorial radius, Ellipticity, Eccentricity)
	A_WGS	: 6378137,
	F_WGS	: 1 / 298.257222101,
	E2_WGS : 0.006694380022900787, // 2 * F_WGS - Math.pow(F_WGS, 2)

	// --------------- Bessel 1841 ---------------
	// (Equatorial radius, Ellipticity, Eccentricity)
	A_TKY	: 6377397.155,
	F_TKY	: 1 / 299.1528128,
	E2_TKY : 0.006674372231802145, // 2 * F_TKY - Math.pow(F_TKY, 2)

	// parallel distance
	DX_T :	148, DX_W : -148,
	DY_T : -507, DY_W : +507, 
	DZ_T : -681, DZ_W : +681, 

	dms2deg : function(dms) {
		dms = dms + "";
		if (dms.match(/^(\d{2,3})(\d{2})(\d{2}\.?\d*)$/)) {
			return (RegExp.$1 / 1 + RegExp.$2 / 60 + RegExp.$3 / 3600);
		} else {
			return false;
		}
	},

	deg2dms : function(deg) {
		var sf = Math.round(deg * 360000);
		var s	= Math.floor(sf / 100) % 60;
		var m	= Math.floor(sf / 6000) % 60;
		var d = Math.floor(sf / 360000);
		sf %= 100;
		if (m	< 10) m	= "0" + m;
		if (s	< 10) s	= "0" + s;
		if (sf < 10) sf = "0" + sf;
		var dms = "" + d + "." + m + "." + s + "." + sf;
		return dms;
	},

	blh2xyz : function(b, l, h, a, e2) {
		b *= this.RD;
		l *= this.RD;
		var sb = Math.sin(b);
		var cb = Math.cos(b);
		var rn = a / Math.sqrt(1 - e2 * Math.pow(sb, 2));
		var x = (rn + h) * cb * Math.cos(l);
		var y = (rn + h) * cb * Math.sin(l);
		var z = (rn * (1 - e2) + h) * sb;
		return [x, y, z];
	},

	xyz2blh : function(x, y, z, a, e2) {
		var bda = Math.sqrt(1 - e2);
		var p = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		var t = Math.atan2(z, p * bda);
		var st = Math.sin(t);
		var ct = Math.cos(t);
		var b = Math.atan2(z + e2 * a / bda * Math.pow(st, 3), p - e2 * a * Math.pow(ct, 3));
		var l = Math.atan2(y, x);
		var sb = Math.sin(b);
		var rn = a / Math.sqrt(1 - e2 * Math.pow(sb, 2));
		var h = p / Math.cos(b) - rn;
		var blh = new Array(b / this.RD, l / this.RD, h);
		return blh;
	},

	wgs2tky : function(bb, bl) { // lat, lng (degree)
		var xyz = this.blh2xyz(bb, bl, 0, this.A_WGS, this.E2_WGS);
		var blh = this.xyz2blh(xyz[0] + this.DX_T, xyz[1] + this.DY_T, xyz[2] + this.DZ_T, this.A_TKY, this.E2_TKY);
		return { x : blh[1], y : blh[0], lat : blh[0], lng : blh[1] };
	},

	tky2wgs : function(bb, bl) { // lat, lng (degree)
		var xyz = this.blh2xyz(bb, bl, 0, this.A_TKY, this.E2_TKY);
		var blh = this.xyz2blh(xyz[0] + this.DX_W, xyz[1] + this.DY_W, xyz[2] + this.DZ_W, this.A_WGS, this.E2_WGS);
		return { x : blh[1], y : blh[0], lat : blh[0], lng : blh[1] };
	},

	isJapan : function(lat, lng) { // WGS
		if (	 lat >	24 && lat <	50
			&& lng > 122 && lng < 152 ) {
			return true;
		} else {
			return false;
		}
	}

};

