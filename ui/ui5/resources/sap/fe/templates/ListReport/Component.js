/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/core/TemplateComponent","sap/fe/VariantManagement"],function(T,V){"use strict";var L=T.extend("sap.fe.templates.ListReport.Component",{metadata:{properties:{variantManagement:{type:"sap.fe.VariantManagement",defaultValue:V.None}},library:"sap.fe",manifest:"json"},onBeforeBinding:function(c){},onAfterBinding:function(c){this.getRootControl().getController().onAfterBinding(c);},getViewData:function(){var v={};if(this.getVariantManagement()===sap.fe.VariantManagement.None){v.noPageVariantManagement=true;}else{v.noPageVariantManagement=false;}v.entitySetName=this.getEntitySet();return v;}});return L;},true);
