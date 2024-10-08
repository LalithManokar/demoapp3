/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([],function(){"use strict";return{convertToUtcString:function(d,e){if(!d){return d;}if(typeof d==="string"){d=new Date(d);}var m=(d.getMonth()+1)>=10?d.getMonth()+1:"0"+(d.getMonth()+1);var D=d.getDate()>=10?d.getDate():"0"+d.getDate();return d.getFullYear()+"-"+m+"-"+D+(e?'T23:59:59.999Z':'T00:00:00.000Z');},convertToLocalDate:function(d,e){if(!d){return d;}if(typeof d==="string"){d=new Date(d);}return new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),e?23:0,e?59:0,e?59:0,e?999:0);}};});
