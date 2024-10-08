/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/core/UIComponent"],function(U){"use strict";var T=U.extend("sap.fe.core.TemplateComponent",{metadata:{properties:{entitySet:{type:"string",defaultValue:null},navigation:{type:"object"}},library:"sap.fe"},onBeforeBinding:function(c,p){return true;},onAfterBinding:function(c){return true;}});return T;},true);
