/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([],function(){"use strict";return{_getText:function(t,p){return this.i18n.getResourceBundle().getText(t,p);},createContent:function(c){if(c){var s="";var C=c.getProperty("/NAME");var a=c.getProperty("/_OBJECT_TYPE_CODE");if(a==="IDEA"){s=this._getText("MAIL_SUBJECT_TEMPLATE",[c.getProperty("/CAMPAIGN_NAME"),C]);}else{s=C;}var b="";var i=c.getProperty("/ID");if(a&&i){var u=document.location.origin+document.location.pathname+this.getNavigationLink(a.toLowerCase()+"-display",{id:i});b=this.getText("MAIL_TEMPLATE_"+a,u);}return{subject:s,body:b};}}};});
