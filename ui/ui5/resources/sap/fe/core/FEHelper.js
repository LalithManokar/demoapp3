/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/macros/ValueListHelper","sap/fe/macros/field/FieldHelper","sap/m/MessageToast","sap/base/Log"],function(V,F,M,L){"use strict";var w={};var a={launchValueHelpFromActionParameterDialog:function(p,f,s,c){var m=f.getModel(),o=m.getMetaModel(),W=f.getContent&&f.getContent(),b=W.getId(),t=W&&W.getTable&&W.getTable(),d=f&&f.getFilterBar&&f.getFilterBar(),e=t&&d,P=o.getObject(p+"@sapui.name");if(w[b]||e){return;}else{if(!t){w[b]=true;}V.getValueListInfo(f,o,p).then(function(v){if(c){var g,C,h=v.valueListInfo;if(!c.$displayMode){c.$displayMode={};}g=h.$model.getMetaModel().getObject(v.fieldPropertyPath+"@");C=h.$model.getMetaModel().getObject("/"+h.CollectionPath+"/$Type@");c.$displayMode[P]=F.displayMode(g,C);}W.setModel(v.valueListInfo.$model);return V.createValueHelpDialog(p,f,t,d,v,s);}).catch(function(g){var h=g.status&&g.status===404?"Metadata not found ("+g.status+") for value help of property "+p:g.message;L.error(h);M.show(h);});}}};return a;},true);
