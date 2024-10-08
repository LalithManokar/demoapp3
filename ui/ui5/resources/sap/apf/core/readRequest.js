/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/core/request"],function(r){"use strict";sap.apf.core.ReadRequest=function(i,R,s,e){var c=i.instances.coreApi;var m=i.instances.messageHandler;this.type="readRequest";this.send=function(f,C,o){var a;var b=function(d,n){var M;var E;var D=[];if(d&&d.type&&d.type==="messageObject"){m.putMessage(d);M=d;}else{D=d.data;E=d.metadata;}C(D,E,M);};if(f){a=f.getInternalFilter();}else{a=new sap.apf.core.utils.Filter(m);}R.sendGetInBatch(a,b,o);};this.getMetadata=function(){return c.getEntityTypeMetadata(s,e);};this.getMetadataFacade=function(){return c.getMetadataFacade(s);};};});
