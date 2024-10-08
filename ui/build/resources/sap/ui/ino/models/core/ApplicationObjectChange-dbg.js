/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.models.core.ApplicationObjectChange");

(function() {
    "use strict";

    var Action = {
        Create : "create",
        Copy : "copy",
        Update : "update",
        Del : "del",
        Action : "action"
    };

    sap.ui.base.ManagedObject.extend("sap.ui.ino.models.core.ApplicationObjectChange", {
        metadata : {
            events : {
                "objectChanged" : {},
                "objectCreated" : {},
                "objectCopied" : {},
                "objectUpdated" : {},
                "objectDeleted" : {},
                "objectCustomActionExecuted" : {}
            }
        },

        fireChange : function(oApplicationObject, vKey, sActionName, oInstanceData) {
            var oChange = {
                object : oApplicationObject,
                key : vKey,
                actionName : sActionName,
                instanceData : oInstanceData
            };
            this.fireEvent("objectChanged", oChange);
            switch (sActionName) {
                case Action.Create :
                    this.fireEvent("objectCreated", oChange);
                    break;
                case Action.Copy :
                    this.fireEvent("objectCopied", oChange);
                    break;
                case Action.Update :
                    this.fireEvent("objectUpdated", oChange);
                    break;
                case Action.Del :
                    this.fireEvent("objectDeleted", oChange);
                    break;
                default :
                    this.fireEvent("objectCustomActionExecuted", oChange);
                    break;
            }
        },

        attachChange : function(sActionName, fnFunction) {
            switch (sActionName) {
                case Action.Create :
                    this.attachEvent("objectCreated", fnFunction);
                    break;
                case Action.Copy :
                    this.attachEvent("objectCopied", fnFunction);
                    break;
                case Action.Update :
                    this.attachEvent("objectUpdated", fnFunction);
                    break;
                case Action.Del :
                    this.attachEvent("objectDeleted", fnFunction);
                    break;
                case Action.Action :
                    this.attachEvent("objectCustomActionExecuted", fnFunction);
                    break;
                default :
                    this.attachEvent("objectChanged", fnFunction);
                    break;
            }
        },

        detachChange : function(sActionName, fnFunction) {
            switch (sActionName) {
                case Action.Create :
                    this.detachEvent("objectCreated", fnFunction);
                    break;
                case Action.Copy :
                    this.detachEvent("objectCopied", fnFunction);
                    break;
                case Action.Update :
                    this.detachEvent("objectUpdated", fnFunction);
                    break;
                case Action.Del :
                    this.detachEvent("objectDeleted", fnFunction);
                    break;
                case Action.Action :
                    this.detachEvent("objectCustomActionExecuted", fnFunction);
                    break;
                default :
                    this.detachEvent("objectChanged", fnFunction);
                    break;
            }
        }
    });

    sap.ui.ino.models.core.ApplicationObjectChange = new sap.ui.ino.models.core.ApplicationObjectChange();
    sap.ui.ino.models.core.ApplicationObjectChange.Action = Action;
}());