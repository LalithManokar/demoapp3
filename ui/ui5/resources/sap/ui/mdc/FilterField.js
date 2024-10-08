/*!
 * SAPUI5

		(c) Copyright 2009-2019 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/mdc/base/FieldBase','sap/ui/mdc/base/FieldBaseRenderer','sap/base/util/merge'],function(F,a,m){"use strict";var b=F.extend("sap.ui.mdc.FilterField",{metadata:{library:"sap.ui.mdc",properties:{},events:{change:{parameters:{value:{type:"string"},valid:{type:"boolean"},conditions:{type:"object[]"},promise:{type:"boolean"}}}}},renderer:a});b.prototype.init=function(){F.prototype.init.apply(this,arguments);};b.prototype.exit=function(){F.prototype.exit.apply(this,arguments);};b.prototype._fireChange=function(c,v,w,p){var V;if(c){if(v){if(c.length==1){V=c[0].values[0];}}else{V=w;}}this.fireChange({value:V,valid:v,conditions:m([],c),promise:p});};return b;},true);
