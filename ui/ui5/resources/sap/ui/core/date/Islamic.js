/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./UniversalDate','../CalendarType','sap/base/Log'],function(U,C,L){"use strict";var I=U.extend("sap.ui.core.date.Islamic",{constructor:function(){var a=arguments;if(a.length>1){a=f(a);}this.oDate=this.createDate(Date,a);this.sCalendarType=C.Islamic;}});I.UTC=function(){var a=f(arguments);return Date.UTC.apply(Date,a);};I.now=function(){return Date.now();};var B=1400,G=1721425.5,c=1948439.5,d=-42521587200000,O=86400000;var o=null;var s=["A","B"];function t(a){var b=a.year,k=a.month,l=a.day,n,q,r,M,D,u,J;u=0;if((k+1)>2){u=j(b)?-1:-2;}J=(G-1)+(365*(b-1))+Math.floor((b-1)/4)+(-Math.floor((b-1)/100))+Math.floor((b-1)/400)+Math.floor((((367*(k+1))-362)/12)+u+l);J=Math.floor(J)+0.5;D=J-c;M=Math.floor(D/29.530588853);if(M<0){n=Math.floor(M/12)+1;q=M%12;if(q<0){q+=12;}r=D-m(n,q)+1;}else{M++;while(g(M)>D){M--;}n=Math.floor(M/12)+1;q=M%12;r=(D-g(12*(n-1)+q))+1;}return{day:r,month:q,year:n};}function e(a){var b=a.year,k=a.month,l=a.day,M=b<1?m(b,k):g(12*(b-1)+k),J=l+M+c-1,n=Math.floor(J-0.5)+0.5,D=n-G,q=Math.floor(D/146097),Q=h(D,146097),r=Math.floor(Q/36524),u=h(Q,36524),v=Math.floor(u/1461),w=h(u,1461),y=Math.floor(w/365),Y=(q*400)+(r*100)+(v*4)+y,x,z,A,E,F,H,K,N;if(!(r==4||y==4)){Y++;}A=G+(365*(Y-1))+Math.floor((Y-1)/4)-(Math.floor((Y-1)/100))+Math.floor((Y-1)/400);E=n-A;F=(G-1)+(365*(Y-1))+Math.floor((Y-1)/4)-(Math.floor((Y-1)/100))+Math.floor((Y-1)/400)+Math.floor((739/12)+((j(Y)?-1:-2))+1);K=0;if(n<F){K=0;}else{K=j(Y)?1:2;}x=Math.floor((((E+K)*12)+373)/367);H=(G-1)+(365*(Y-1))+Math.floor((Y-1)/4)-(Math.floor((Y-1)/100))+Math.floor((Y-1)/400);N=0;if(x>2){N=j(Y)?-1:-2;}H+=Math.floor((((367*x)-362)/12)+N+1);z=(n-H)+1;return{day:z,month:x-1,year:Y};}function f(a){var b=Array.prototype.slice.call(a),k,l;k={year:a[0],month:a[1],day:a[2]!==undefined?a[2]:1};l=e(k);b[0]=l.year;b[1]=l.month;b[2]=l.day;return b;}function i(){var D,a;o={};D=sap.ui.getCore().getConfiguration().getFormatSettings().getLegacyDateFormat();D=_(D)?D:"A";a=sap.ui.getCore().getConfiguration().getFormatSettings().getLegacyDateCalendarCustomizing();a=a||[];if(!a.length){L.warning("No calendar customizations.");return;}a.forEach(function(E){if(E.dateFormat===D){var b=p(E.gregDate);var k=new Date(Date.UTC(b.year,b.month-1,b.day));var M=k.getTime();var l=(M-d)/O;b=p(E.islamicMonthStart);var n=(b.year-1)*12+b.month-1;o[n]=l;}});L.info("Working with date format: ["+D+"] and customization: "+JSON.stringify(a));}function p(D){return{year:parseInt(D.substr(0,4)),month:parseInt(D.substr(4,2)),day:parseInt(D.substr(6,2))};}function g(a){if(!o){i();}var b=o[a];if(!b){var y=Math.floor(a/12)+1;var k=a%12;b=m(y,k);}return b;}function m(y,a){return Math.ceil(29.5*a)+(y-1)*354+Math.floor((3+11*y)/30.0);}function h(a,b){return a-(b*Math.floor(a/b));}function j(y){return!(y%400)||(!(y%4)&&!!(y%100));}function _(a){return s.indexOf(a)!==-1;}I.prototype._getIslamic=function(){return t({day:this.oDate.getDate(),month:this.oDate.getMonth(),year:this.oDate.getFullYear()});};I.prototype._setIslamic=function(a){var b=e(a);return this.oDate.setFullYear(b.year,b.month,b.day);};I.prototype._getUTCIslamic=function(){return t({day:this.oDate.getUTCDate(),month:this.oDate.getUTCMonth(),year:this.oDate.getUTCFullYear()});};I.prototype._setUTCIslamic=function(a){var b=e(a);return this.oDate.setUTCFullYear(b.year,b.month,b.day);};I.prototype.getDate=function(D){return this._getIslamic().day;};I.prototype.getMonth=function(){return this._getIslamic().month;};I.prototype.getYear=function(){return this._getIslamic().year-B;};I.prototype.getFullYear=function(){return this._getIslamic().year;};I.prototype.setDate=function(D){var a=this._getIslamic();a.day=D;return this._setIslamic(a);};I.prototype.setMonth=function(M,D){var a=this._getIslamic();a.month=M;if(D!==undefined){a.day=D;}return this._setIslamic(a);};I.prototype.setYear=function(y){var a=this._getIslamic();a.year=y+B;return this._setIslamic(a);};I.prototype.setFullYear=function(y,M,D){var a=this._getIslamic();a.year=y;if(M!==undefined){a.month=M;}if(D!==undefined){a.day=D;}return this._setIslamic(a);};I.prototype.getUTCDate=function(D){return this._getUTCIslamic().day;};I.prototype.getUTCMonth=function(){return this._getUTCIslamic().month;};I.prototype.getUTCFullYear=function(){return this._getUTCIslamic().year;};I.prototype.setUTCDate=function(D){var a=this._getUTCIslamic();a.day=D;return this._setUTCIslamic(a);};I.prototype.setUTCMonth=function(M,D){var a=this._getUTCIslamic();a.month=M;if(D!==undefined){a.day=D;}return this._setUTCIslamic(a);};I.prototype.setUTCFullYear=function(y,M,D){var a=this._getUTCIslamic();a.year=y;if(M!==undefined){a.month=M;}if(D!==undefined){a.day=D;}return this._setUTCIslamic(a);};return I;});
