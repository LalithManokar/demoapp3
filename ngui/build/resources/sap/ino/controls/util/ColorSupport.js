/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.controls.util.ColorSupport");(function(){"use strict";sap.ino.controls.util.ColorSupport={};sap.ino.controls.util.ColorSupport.calculateTitleTextColor=function(r,g,b){var a;a=(parseInt(r,16)*0.299)+(parseInt(g,16)*0.587)+(parseInt(b,16)*0.114);if((255-a)<105){return"Dark";}else{return"Light";}};sap.ino.controls.util.ColorSupport.calculateMediaTextColor=function(r,g,b){var a;a=(parseInt(r,16)*299)+(parseInt(g,16)*587)+(parseInt(b,16)*114);a=a/255000;if(a>=0.9){var R=parseInt(r,16);R=(R-40>0)?R-40:0;r=R.toString(16);var G=parseInt(g,16);G=(G-40>0)?G-40:0;g=G.toString(16);var B=parseInt(b,16);B=(B-40>0)?B-40:0;b=B.toString(16);return"#"+r+g+b;}else{return"#FFFFFF";}};})();
