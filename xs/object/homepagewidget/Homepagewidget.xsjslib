const _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var auth = $.import("sap.ino.xs.aof.lib", "authorization");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var check = $.import("sap.ino.xs.aof.lib", "check");

var Message = $.import("sap.ino.xs.aof.lib", "message");
var IAMMessage = $.import("sap.ino.xs.object.iam", "message");

const WidgetTypeCode = ['COMMUNITY_WIDGET','BACKOFFICE_WIDGET'];

this.definition = {
	Root: {
		table: "sap.ino.db.homepagewidget::t_homepagewidget",
		sequence: "sap.ino.db.homepagewidget::s_homepagewidget",
		determinations: {},
		attributes: {
			IS_VISIBLE: {
				required: true
			},
			HTML_CONTENT: {
				required: true
			},
			TITLE: {
				readOnly: false
			},
			TYPE_CODE: {
				required: true
			}
		}
	},
	actions: {
		read: {
			authorizationCheck: false
		},
		create: {
			authorizationCheck: false
		},
		update: {
			authorizationCheck: false
		},
		del: {
			authorizationCheck: false
		},
		getHomepageWidget:{
		    authorizationCheck: false,
			execute: getHomepageWidget,
			isStatic:true
		},
		updateHomepageWidget:{
		    authorizationCheck: false,
			execute: updateHomepageWidget,
			isStatic:true
		},
		getCommunityHomepageWidget:{
		    authorizationCheck: false,
			execute: getCommunityHomepageWidget,
			isStatic:true
		},
		getBackofficeHomepageWidget:{
		    authorizationCheck: false,
			execute: getBackofficeHomepageWidget,
			isStatic:true
		}
	}
};

// function personalizeReadAuthorizationCheck(vKey, addMessage, oContext) {
// 	if (vKey !== oContext.getUser().ID) {
// 		return addMessage(Message.MessageSeverity.Error, IAMMessage.AUTH_MISSING_USER_SETTINGS_READ, vKey, "Root");
// 	}
// 	return true;
// }

// function personalizeUpdateAuthorizationCheck(vKey, addMessage, oContext) {
// 	if (vKey.identity_id !== oContext.getUser().ID) {
// 		return addMessage(Message.MessageSeverity.Error, IAMMessage.AUTH_MISSING_USER_SETTINGS_UPDATE, vKey.identity_id, "Root");
// 	}
// 	return true;
// }
function getHomepageWidget(vKey, oWorkObject, addMessage, getNextHandle, oContext, oNode){
	var oHQ = oContext.getHQ();
	var sSelect = 'SELECT * FROM "sap.ino.db.homepagewidget::t_homepagewidget" WHERE TYPE_CODE = \'BACKOFFICE_WIDGET\' or TYPE_CODE = \'COMMUNITY_WIDGET\'';
	var aResult = oHQ.statement(sSelect).execute();


	return aResult;
}


function getCommunityHomepageWidget(vKey, oWorkObject, addMessage, getNextHandle, oContext, oNode){
	var oHQ = oContext.getHQ();
	var sSelect = 'SELECT * FROM "sap.ino.db.homepagewidget::t_homepagewidget" WHERE TYPE_CODE = \'COMMUNITY_WIDGET\'';
	var aResult = oHQ.statement(sSelect).execute();


	return aResult;
}

function getBackofficeHomepageWidget(vKey, oWorkObject, addMessage, getNextHandle, oContext, oNode){
	var oHQ = oContext.getHQ();
	var sSelect = 'SELECT * FROM "sap.ino.db.homepagewidget::t_homepagewidget" WHERE TYPE_CODE = \'BACKOFFICE_WIDGET\'';
	var aResult = oHQ.statement(sSelect).execute();


	return aResult;
}

function updateHomepageWidget(oReq, oWorkObject, addMessage, getNextHandle, oContext, oNode){
	var oHQ = oContext.getHQ();
	var sSelectQuery = 'SELECT * FROM "sap.ino.db.homepagewidget::t_homepagewidget" WHERE TYPE_CODE = \'BACKOFFICE_WIDGET\' or TYPE_CODE = \'COMMUNITY_WIDGET\'';
	var aResult = oHQ.statement(sSelectQuery).execute();
	var homepageWidget = AOF.getApplicationObject("sap.ino.xs.object.homepagewidget.Homepagewidget");
    var resultObj, widgetObjId;
	
	_.each(oReq.WIDGET,function(value,code){
	    var widgetObj = value;
		resultObj = _.find(aResult, function(item) {
			return item.TYPE_CODE === code;
		});
		widgetObjId = resultObj && resultObj.ID || undefined;
		if (!~WidgetTypeCode.indexOf(code)) {
			return false;
		}
		if (!widgetObjId) {
		    try{
			return homepageWidget.create({
			    IS_VISIBLE:widgetObj.IS_VISIBLE,
			    HTML_CONTENT:widgetObj.HTML_CONTENT,
			    TITLE:widgetObj.TITLE,
			    TYPE_CODE:widgetObj.TYPE_CODE
			});
		    } catch(e){
		        var exceptionRes = e;
		        return exceptionRes;
		    }
		}
		if (resultObj.IS_VISIBLE !== widgetObj.IS_VISIBLE || resultObj.TITLE !== widgetObj.TITLE || resultObj.HTML_CONTENT !== widgetObj.HTML_CONTENT) {
			var oResponse = homepageWidget.update({
				ID: widgetObjId,
				IS_VISIBLE:widgetObj.IS_VISIBLE,
			    HTML_CONTENT:widgetObj.HTML_CONTENT,
			    TITLE:widgetObj.TITLE || "" ,
			    TYPE_CODE:widgetObj.TYPE_CODE
			});
			return oResponse;
		}
	});
}


//END