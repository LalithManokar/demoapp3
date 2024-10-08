/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ui/base/ManagedObject"
], function (ManagedObject) {
    "use strict";

    var Action = {
        All: "",
        Create : "create",
        Copy : "copy",
        Update : "update",
        Del : "del",
        Action : "action"
    };

    var ApplicationObjectChange = ManagedObject.extend("sap.ino.commons.models.aof.ApplicationObjectChange", {
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

        fireChange : function(oChange) {
            this.fireEvent("objectChanged", oChange);
            switch (oChange.actionName) {
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

    ApplicationObjectChange = new ApplicationObjectChange();
    ApplicationObjectChange.Action = Action;
    
    return ApplicationObjectChange;
});