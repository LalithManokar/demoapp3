/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ino.wall.ThemeFactory");(function(){"use strict";sap.ui.core.Element.extend("sap.ino.wall.ThemeFactory",{metadata:{}});sap.ino.wall.ThemeFactory.getImage=function(i,p){if(!p){p="sap.ino.wall";}var c=sap.ui.getCore().getConfiguration().getTheme();var r=sap.ui.getCore().getConfiguration().getRTL();return sap.ui.resource(p,"themes/"+c+"/img"+(r?"-RTL":"")+"/ThemeFactory/"+i);};})();
