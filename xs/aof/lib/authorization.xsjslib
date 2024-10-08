var AOF = $.import("sap.ino.xs.aof.core", "framework");
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var Message = $.import("sap.ino.xs.aof.lib", "message");

/**
 * Checks whether the object key vKey is in the list of objects for which the application user is authorized. Example:
 * Check the authorization to update an idea.
 * 
 * @param sAuthView
 *            name of the db-view which contains the accessible ids
 * @param vAuthKeyColumn
 *            column name of accessible ids in db-view
 * @param sAuthFailMsg
 *            message to be written if the check fails
 * @returns true if check succeeded otherwise a CancelProcessingException is thrown
 */
function instanceAccessCheck(sAuthView, vAuthKeyColumn, sAuthFailMsg) {
    return function(vKey, oRequest, fnMessage, oContext) {
        var hq = oContext.getHQ();
        var sSelect = 'select ' + vAuthKeyColumn + ' from "' + sAuthView + '" where ' + vAuthKeyColumn + ' = ?';
        var result = hq.statement(sSelect).execute(vKey);
        if (result.length < 1) {
            fnMessage(AOF.MessageSeverity.Fatal, sAuthFailMsg, vKey, AOF.Node.Root, null);
            return false;
        }
        return true;
    };
}

function compositeAccessCheck(aAccessChecks) {
    return function(vKey, oRequest, fnMessage, oContext) {
        var i;
        for (i = 0; i < aAccessChecks.length; i++) {
            var fCheck = aAccessChecks[i];
            var bCheckResult = fCheck(vKey, oRequest, fnMessage, oContext);
            if (!bCheckResult) {
                return false;
            }
        }
        return true;
    };
}

function atLeastOneAccessCheck(aAccessChecks) {
    return function(vKey, oRequest, fnMessage, oContext) {
        var oMessageBuffer = Message.createMessageBuffer(true);
        for (var i = 0; i < aAccessChecks.length; i++) {
            var fCheck = aAccessChecks[i];
            var bCheckResult = fCheck(vKey, oRequest, oMessageBuffer.addMessage, oContext);
            if (bCheckResult) {
                return true;
            }
        }
        fnMessage(oMessageBuffer.getMessages());
        return false;
    };
}

function atLeastOneMulKeysAccessCheck(aAccessChecks) {
    return function(aKey, oRequest, fnMessage, oContext) {
        var oMessageBuffer = Message.createMessageBuffer(true);
        for (var i = 0; i < aAccessChecks.length; i++) {
            var fCheck = aAccessChecks[i];
            var bCheckResult = fCheck(aKey[i], oRequest, oMessageBuffer.addMessage, oContext);
            if (bCheckResult) {
                return true;
            }
        }
        fnMessage(oMessageBuffer.getMessages());
        return false;
    };
}

/**
 * Checks whether the parent key, to which the path sReqParentProp points, is in the list of objects for which the
 * application user is authorized. Example: Check the authorization to create a comment on an idea.
 * 
 * @param sAuthView
 *            name of the db-view which contains the accessible ids
 * @param vAuthKeyColumn
 *            column name of accessible ids in db-view
 * @param sRequParentProp
 *            property path to the parent id in the request object
 * @param sAuthFailMsg
 *            message to be written if the check fails
 * @param bAuthKeyOptional
 *            is auth key optional and access is granted     
 * @returns true if check succeeded otherwise a CancelProcessingException is thrown
 */

function parentInstanceAccessCheck(sAuthView, vAuthKeyColumn, sRequParentProp, sAuthFailMsg, bAuthKeyOptional) {
    return function(vKey, oRequest, fnMessage, oContext) {
        var hq = oContext.getHQ();
        var sSelect = 'select ' + vAuthKeyColumn + ' from "' + sAuthView + '" where ' + vAuthKeyColumn + ' = ?';
        var vAuthKey = _.getObjectPathValue(oRequest, sRequParentProp);
        if (vAuthKey) {
            var result = hq.statement(sSelect).execute(vAuthKey);
            if (result.length < 1) {
                fnMessage(AOF.MessageSeverity.Fatal, sAuthFailMsg, vKey, AOF.Node.Root, null);
                return false;
            }
        } else if (!bAuthKeyOptional) {
            fnMessage(AOF.MessageSeverity.Fatal, sAuthFailMsg, vKey, AOF.Node.Root, null);
        }
        return true;
    };
}

/**
 * Checks whether the user has a certain privilege assigned.
 * 
 * @param sPrivilege
 *            name of the privilege
 * @param sAuthFailMsg
 *            message to be written if the check fails
 * @returns true if check succeeded otherwise a CancelProcessingException is thrown
 */
function privilegeCheck(sPrivilege, sAuthFailMsg) {
    return function(vKey, oRequest, fnMessage, oContext) {
        var hq = oContext.getHQ();
        var oUser = oContext.getUser();
        var sSelect = "select PRIVILEGE from sys.effective_privileges where user_name = ? and privilege = ?";
        var result = hq.statement(sSelect).execute(oUser.Name, sPrivilege);
        if (result.length < 1) {
            fnMessage(AOF.MessageSeverity.Fatal, sAuthFailMsg, vKey, AOF.Node.Root, null);
            return false;
        }
        return true;
    };
}

function conditionCheck(sView, sKeyCol, sCondition, sAuthFailMsg, sNode, sRefField) {
    return function(vKey, oRequest, fnMessage, oContext) {
        var hq = oContext.getHQ();
        var sSelect = 'select 1 as authorized from "' + sView + '" where ' + sKeyCol + ' = ? and ' + sCondition;
        var result = hq.statement(sSelect).execute(vKey);
        if (result.length < 1) {
            fnMessage(AOF.MessageSeverity.Fatal, sAuthFailMsg, vKey, sNode, sRefField);
            return false;
        }
        return true;
    };
}

function hasIgnoreAuthCheck(){
    return $.session.hasSystemPrivilege("sap.ino.xs.rest.api::IgnoreAuthCheck");
}
