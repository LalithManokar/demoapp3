sap.ui.define(["sap/ino/commons/models/aof/PropertyModel","sap/m/MessageToast"],function(){"use strict";var M=function(){throw"Mixin may not be instantiated directly";};M.createMailContent=function(){var c=this.getView().getModel("object")||this.getView().getModel("contextObject");if(c){var s="";var C=c.getProperty("/NAME");var a=c.getProperty("/_OBJECT_TYPE_CODE");if(a==="IDEA"){s=this.getText("MAIL_SUBJECT_TEMPLATE",[c.getProperty("/CAMPAIGN_NAME"),C]);}else{s=C;}var b="";var i=c.getProperty("/ID");if(a&&i){var n=a.toLowerCase();if(n==="idea"||n==="evaluation"){n+="-display";}var o=document.location.origin;if(!o){o=window.location.protocol+"//"+window.location.hostname+(window.location.port?':'+window.location.port:'');}var u=o+document.location.pathname+this.getOwnerComponent().getNavigationLink(n,{id:i});b=this.getText("MAIL_TEMPLATE_"+a,u);}return{subject:s,body:b};}else{var s="";var b="";var o=document.location.origin;if(!o){o=window.location.protocol+"//"+window.location.hostname+(window.location.port?':'+window.location.port:'');}var u=o+document.location.pathname;b=this.getText("MAIL_TEMPLATE_INM",u);return{subject:s,body:b};}};return M;});
