/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/base/assert","sap/base/util/array/uniqueSort","sap/base/util/uid","sap/gantt/misc/Format","sap/gantt/config/TimeHorizon","sap/base/Log","sap/ui/core/Core"],function(a,u,b,F,T,L,C){"use strict";var U={};U.assign=function(i,d){if(typeof(i)!==typeof(d)){return d;}else if((typeof i==="undefined")||i===null){return d;}else{return i;}};U.assignDeep=function(i,d){if(!i&&!d){return null;}else if(i&&!d){return i;}else if(!i&&d){return d;}else if(typeof(i)==="object"&&typeof(d)==="object"){var r=i;for(var c in d){if(typeof(r[c])!=="boolean"&&!r[c]){r[c]=d[c];}else if(typeof(d[c])==="object"&&typeof(r[c])==="object"){r[c]=this.assignDeep(r[c],d[c]);}}return r;}else{return i;}};U.generateRowUid=function(d,o,s,p,r){jQuery.each(d,function(k,v){v.uid=v.id;if(p){v.uid=p+"|"+v.uid;}else if(v.bindingObj&&v.bindingObj.findNode){var n=v.bindingObj.findNode(v.rowIndex);while(n.parent&&n.level>0){n=n.parent;v.uid=n.context.getObject()[r]+"|"+v.uid;}}var c=(v.index===undefined)?-1:v.index;var e=(v.chartScheme===undefined)?"":v.chartScheme;v.uid="PATH:"+v.uid+"|SCHEME:"+e+"["+c+"]";v.data.uid=v.uid;for(var i=0;i<s.length;i++){var D,f;if(typeof s[i]==="string"){D=s[i];f="id";}else{D=s[i].name;f=s[i].idName?s[i].idName:"id";}if(D in v.data){for(var j=0;j<v.data[D].length;j++){var g=v.data[D][j];if(g[f]===undefined){g[f]=b();}g.uid=v.uid+"|DATA:"+D+"["+g[f]+"]";g.__id__=g[f];}}}});};U.getChartSchemeByShapeUid=function(s){return U.parseUid(s).chartScheme||"";};U.generateUidForRelationship=function(d,r){var s="relationship";var D="PATH:DUMMY|SCHEME:DUMMY[0]";for(var i=0;i<d.length;i++){if(d[i][r]===undefined){d[i][r]=b();}d[i].uid=D+"|DATA:"+s+"["+d[i][r]+"]";d[i].__id__=d[i][r];}};U.generateObjectPathToObjectMap=function(d,m,p){var r;for(var i in d){var o=d[i],c,e;if(o.objectInfoRef){c=o.objectInfoRef.id;o=o.objectInfoRef;}else{c=o.id;}if(p&&p!=""){c=p.concat(".").concat(c);}e=c.concat("-").concat(U.parseUid(o.uid).rowIndex);m[e]=o;if(o.children&&o.children.length>0){r=this.generateObjectPathToObjectMap(o.children,m,c);}}return r;};U.getShapeDataNameByUid=function(s){return U.parseUid(s).shapeDataName;};U.getIdByUid=function(s,r){return r?U.parseUid(s).rowId:U.parseUid(s).shapeId;};U.parseUid=function(s){var r=/(PATH:(.+)\|SCHEME:(.*?\[-?\d+\]))(?:\|DATA:(.+)\[(.*)\])?$/g;var m=r.exec(s);var c={};if(m){var d=m[3];if(d){var R=d.match(/\[-?\d+\]/)[0].slice(1,-1);d=d.replace(/\[-?\d+\]/,"");}var e=m[1],f=m[2],g=f.split("|"),h=g[g.length-1];c={rowId:h,rowPath:f,rowUid:e,chartScheme:d,shapeDataName:m[4],shapeId:m[5],rowIndex:R};}else{L.warning("UID "+s+" does not match regular expression.");}return c;};U.scaleBySapUiSize=function(m,n){switch(m){case"sapUiSizeCozy":return n*1.5;case"sapUiSizeCondensed":return n*0.78;default:return n;}};U.findSapUiSizeClass=function(c){var $,d;if(c){$=c.$();}var s=".sapUiSizeCompact,.sapUiSizeCondensed,.sapUiSizeCozy";if(!$||$.length===0){d=jQuery(document.body).find(s);}else{d=$.closest(s);}if(d.hasClass("sapUiSizeCondensed")){return"sapUiSizeCondensed";}else if(d.hasClass("sapUiSizeCompact")){return"sapUiSizeCompact";}else if(d.hasClass("sapUiSizeCozy")){return"sapUiSizeCozy";}else{return"sapUiSizeCozy";}};U.floatEqual=function(v,V){return Math.abs(v-V)<0.0001;};U.calculateStringLength=function(s){var l=0;if(s.match("[\u4E00-\u9FFF]")===null){l=s.length;}else{l=s.length+s.match(/[\u4E00-\u9FFF]/g).length;}return l;};U.judgeTimeHorizonValidity=function(v,t){if(!v||!v.getStartTime()||!v.getEndTime()){return false;}var V=F.abapTimestampToDate(v.getStartTime()).getTime(),o=F.abapTimestampToDate(v.getEndTime()).getTime(),c=F.abapTimestampToDate(t.getStartTime()).getTime(),d=F.abapTimestampToDate(t.getEndTime()).getTime();return(V-c>=0)&&(d-o>=0);};U.getShapeDatumById=function(i,c){return U.getDatumById(i,"sap-gantt-shape-id",c);};U.getRowDatumById=function(i,c){return U.getDatumById(i,"sap-gantt-row-id",c)||[];};U.getRowDatumRefById=function(i,c){return U.getRowDatumById(i,c).map(function(I){return I.objectInfoRef;});};U.getRowDatumByShapeUid=function(s,c){var p=this.parseUid(s),r=p.rowUid,R=p.rowId;var d=null;var e=this.getRowDatumById(R,c);var f=e.filter(function(d){return d.objectInfoRef.uid.indexOf(r)>=0;});if(f.length>0){d=f[0].objectInfoRef;}return d;};U.getShapeDatumByShapeUid=function(s,c){var p=this.parseUid(s),S=p.shapeId,r=p.rowUid;var d=this.getShapeDatumById(S,c);var f=d.filter(function(D){return D.uid.indexOf(r)>=0;});return f[0];};U.getRowDatumByEventTarget=function(t){var d=null;var $=jQuery(t).closest("g[data-sap-gantt-row-id]");if($.length){d=d3.select($.get(0)).datum();}return d;};U.getDatumById=function(i,A,c){a(typeof i==="string"||i instanceof Array,"vId must be string or array");a(c,"sContainer must specify");var p=i?i:"";var I=p;if(typeof p==="string"){I=[p];}var d=[];I.forEach(function(e){var s=["[id='",c,"']"," [data-",A,"='",e,"']"].join("");jQuery(s).each(function(_,f){var $=d3.select(f),n=$.datum();var g=d.some(function(o){var O=o.uid||o.objectInfoRef.uid,N=n.uid||n.objectInfoRef.uid;if(O!==N){return false;}else{var S=o.shapeData?o.shapeData.length:0;var h=n.shapeData?n.shapeData.length:0;return S===h;}});if(!g){d.push(n);}});});return u(d);};U.attributeEqualSelector=function(c,v){return"["+c+"="+"'"+v+"'"+"]";};U.calculateHorizonByWidth=function(o,O,c,d){var e=F.abapTimestampToDate(o.getStartTime());var f=F.abapTimestampToDate(o.getEndTime());var r=Math.abs(e.getTime()-f.getTime())/O;var s;if(d){s=d;}else{s=e;}var E=new Date();if(isFinite(r)&&typeof r==="number"&&isFinite(c)&&typeof c==="number"){E.setTime(s.getTime()+c*r);}else{E=f;}return new T({startTime:s,endTime:E});};U.safeCall=function(s,c,d,e){var o=s;for(var p=0;p<c.length;p++){var f=c[p];if(!o||typeof o[f]!=="function"){return d;}else if(p<c.length-1){o=o[f]();}else{o=o[f].apply(o,e);}}return o;};U.getShapeBias=function(s){var r=C.getConfiguration().getRTL(),n=r?-s.getXBias():s.getXBias(),c=s.getYBias();return{x:n,y:c};};return U;},true);
