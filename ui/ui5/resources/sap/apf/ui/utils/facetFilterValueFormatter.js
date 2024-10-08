/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/ui/utils/formatter"],function(f){"use strict";sap.apf.ui.utils.FacetFilterValueFormatter=function(u,c){"use strict";this.getFormattedFFData=function(F,s,p){var a,t;var o=new sap.apf.ui.utils.formatter({getEventCallback:u.getEventCallback.bind(u),getTextNotHtmlEncoded:c.getTextNotHtmlEncoded,getExits:u.getCustomFormatExit()},p,F);var T=p.text;F.forEach(function(b){a=o.getFormattedValue(s,b[s]);t=a;if(T!==undefined&&b[T]!==undefined){t=a+" - "+b[T];}b.formattedValue=t;});return F;};};});
