/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define(["sap/ino/commons/formatters/BaseListFormatter","sap/m/GroupHeaderListItem","sap/ui/base/Object"],function(B,G,O){"use strict";var l=O.extend("sap.ino.commons.formatters.ListFormatter",{});jQuery.extend(l,B);l.listThreshold=function(s){if(s.desktop){return 20;}else if(s.tablet){return 20;}else{return 10;}};l.showFilter=function(s,p){return!!(s||p);};return l;});
