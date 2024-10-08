/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
sap.ui.define([
    "sap/ino/commons/formatters/BaseFormatter",
    "sap/ino/commons/formatters/ListFormatter",
    "sap/ino/commons/formatters/ObjectFormatter",
    "sap/ino/commons/models/core/CodeModel",
    "sap/ui/base/Object"
], function(BaseFormatter,
	ListFormatter,
	ObjectFormatter,
	CodeModel,
	Object) {
	"use strict";

	var oObjectListFormatter = Object.extend("sap.ino.commons.formatters.ObjectListFormatter", {});

	jQuery.extend(oObjectListFormatter, ListFormatter, ObjectFormatter);

	oObjectListFormatter.ideaListCampaignBackground = function(sColor) {
		if (sColor && sColor.length === 6) {
			sColor = "#" + sColor;
		} else {
			sColor = "#FFFFFF";
		}
		return "<div class='sapInoIdeaListColor' style='background-color : " + sColor + ";' />";
	};

	oObjectListFormatter.widthCampaignCard = function(oSystem) {
		if (oSystem.phone) {
			return "300px";
		} else {
			return "400px";
		}
	};

	oObjectListFormatter.feedObjectTypeFormatter = function(sObjectType) {
		if (!sObjectType) {
			return;
		}
		return this.getText("FEEDS_FLD_OBJECT_TYPE_" + sObjectType);
	};

	oObjectListFormatter.feedFieldNameFormatter = function(sFieldName) {
		if (!sFieldName) {
			return;
		}
		return this.getText("FEEDS_FLD_NAME_" + sFieldName);
	};

	oObjectListFormatter.feedFieldValueFormatter = function(sValueType, sValue) {
		if (!sValueType || !sValue) {
			return;
		}
		if (sValueType === "BOOLEAN") {
			return Number(sValue) ? this.getText("FEEDS_FLD_VALUE_TRUE") : this.getText("FEEDS_FLD_VALUE_FALSE");
		}
		if (sValueType === "DATE") {
			sValue = sValue.split(".");
			sValue = sValue[0].replace(/-/g, "/");
			return BaseFormatter.toDate(sValue);
		}
		return;
	};

	oObjectListFormatter.feedObjectLinkFormatter = function(sObjectId, sObjectName, sObjectType) {
		if (!sObjectId || !sObjectName || !sObjectType) {
			return;
		}
		var sResult;
		switch (sObjectType) {
			case "IDEA":
				sResult = "<a href='" + this.ideaNavigationLink(sObjectId) + "' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link'>" +
					sObjectName + "</a>";
				break;
			case "WALL":
				sResult = "<a href='" + this.wallNavigationLink(sObjectId) + "' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link'>" +
					sObjectName + "</a>";
				break;
			case "CAMPAIGN":
				sResult = "<a href='" + this.campaignNavigationLink(sObjectId) + "' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link'>" +
					sObjectName + "</a>";
				break;
			case "EVALUATION":
				sResult = "<a href='" + this.evaluationNavigationLink(sObjectId) +
					"' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link' rel='"+sObjectName+"'>" + sObjectName + "</a>";
				break;
			case "BLOG":
				sResult = "<a href='" + this.blogNavigationLink(sObjectId) +
					"' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link' rel='"+sObjectName+"'>" + sObjectName + "</a>";
				break;
			case "LINK":
				sResult = "<a href='" + sObjectId + "' class='sapMLnk sapMLnkMaxWidth' tabindex='0' role='link' rel='"+sObjectName+"'>" + sObjectName +
					"</a>";
				break;
			default:
				sResult = sObjectName;
				break;
		}
		return sResult;
	};

	oObjectListFormatter.feedMsgFormatter = function(oValue) {
		var sResult, sMsgKey;
		if (!oValue || !oValue.FEED_CODE) {
			return;
		}

		var sAction = oValue.FEED_CODE,
			sObjectName = jQuery.sap.encodeHTML(oValue.OBJECT_TEXT || ""),
			sObjectId = oValue.OBJECT_ID,
			sObjectType = oValue.OBJECT_TYPE_CODE,
			sInvolvedObjectName = jQuery.sap.encodeHTML(oValue.INVOLVED_OBJ_TEXT || ""),
			sInvolvedObjectId = oValue.INVOLVED_ID,
			sInvolvedObjectType = oValue.INVOLVED_OBJ_TYPE_CODE,
			sFieldOneValue = oValue.FIELD1_VALUE_OPTION === 'DATE' ? oValue.FIELD1_VALUE : jQuery.sap.encodeHTML(oValue.FIELD1_VALUE || ""),
			sFieldOneName = jQuery.sap.encodeHTML(oValue.FIELD1_NAME || ""),
			sFieldOneText = jQuery.sap.encodeHTML(oValue.FIELD1_TEXT || ""),
			sFieldOneValueOption = jQuery.sap.encodeHTML(oValue.FIELD1_VALUE_OPTION || ""),
			sFieldTwoValue = oValue.FIELD2_VALUE_OPTION === 'DATE' ? oValue.FIELD2_VALUE : jQuery.sap.encodeHTML(oValue.FIELD2_VALUE || ""),
			sFieldTwoName = jQuery.sap.encodeHTML(oValue.FIELD2_NAME || ""),
			sFieldTwoText = jQuery.sap.encodeHTML(oValue.FIELD2_TEXT || ""),
			sFieldTwoValueOption = jQuery.sap.encodeHTML(oValue.FIELD2_VALUE_OPTION || ""),
			sContent = jQuery.sap.encodeHTML(oValue.CONTENT || ""),
			sObjectLink,
			sInvolvedObjectLink;

		sObjectLink = this.feedObjectLinkFormatter(sObjectId, sObjectName, sObjectType);
		sInvolvedObjectName = sInvolvedObjectType === "EVALUATION" ? this.feedObjectTypeFormatter(sInvolvedObjectType) : sInvolvedObjectName;
		sInvolvedObjectId = sInvolvedObjectType === "LINK" ? sContent : sInvolvedObjectId;
		sInvolvedObjectLink = this.feedObjectLinkFormatter(sInvolvedObjectId, sInvolvedObjectName, sInvolvedObjectType);

		// action name
		if (sAction.indexOf("STATUS_ACTION") === 0) { //status change
			if (sAction.indexOf("SUBMIT") > 0) {
				sAction = "STATUS_ACTION_SUBMIT";
			} else if (sAction.indexOf("EVAL") > 0) {
				sAction = "STATUS_ACTION" + "_EVAL";
			} else {
				sAction = "STATUS_ACTION";
			}
		}
		if (sAction.indexOf("CAMP_MAJOR_PUBLISH") === 0) { //campaign major publish
			sAction = "ACTION_FLD_COMPAIGN_MAJOR_CHANGE";
		}
		if (sAction.indexOf("IDEA_RELATION") === 0) { //idea relation change
			sAction = sAction.substr(sAction.lastIndexOf(".") + 1);
		}

		// field name/value
		if (sFieldOneText === "IDEA_FORM") { //idea form field change
			sAction = "ACTION_IDEA_FORM";
			if (["BOOLEAN", "DATE"].indexOf(sFieldOneValueOption) >= 0) {
				sFieldOneValue = this.feedFieldValueFormatter(sFieldOneValueOption, sFieldOneValue);
			} else if (sFieldOneValueOption) {
				sFieldOneValue = sFieldOneValueOption ? CodeModel.getText(sFieldOneValueOption, Number(sFieldOneValue)) : sFieldOneValue;
			}

			if (["BOOLEAN", "DATE"].indexOf(sFieldTwoValueOption) >= 0) {
				sFieldTwoValue = this.feedFieldValueFormatter(sFieldTwoValueOption, sFieldTwoValue);
			} else if (sFieldTwoValueOption) {
				sFieldTwoValue = sFieldTwoValueOption ? CodeModel.getText(sFieldTwoValueOption, Number(sFieldTwoValue)) : sFieldTwoValue;
			}

		} else { //normal field change
			if (["BOOLEAN", "DATE"].indexOf(sFieldOneValueOption) >= 0) {
				sFieldOneValue = this.feedFieldValueFormatter(sFieldOneValueOption, sFieldOneValue);
			} else if (sFieldOneValueOption) {
				sFieldOneValue = CodeModel.getText(sFieldOneValueOption, sFieldOneValue);
			}
			if (["BOOLEAN", "DATE"].indexOf(sFieldTwoValueOption) >= 0) {
				sFieldTwoValue = this.feedFieldValueFormatter(sFieldTwoValueOption, sFieldTwoValue);
			} else if (sFieldTwoValueOption) {
				sFieldTwoValue = CodeModel.getText(sFieldTwoValueOption, sFieldTwoValue);
			}
			sFieldOneName = sFieldOneText ? this.feedFieldNameFormatter(sFieldOneText) : sFieldOneName;
			sFieldTwoName = sFieldTwoText ? this.feedFieldNameFormatter(sFieldTwoText) : sFieldTwoName;
		}

		sObjectType = this.feedObjectTypeFormatter(sObjectType);
		sInvolvedObjectType = this.feedObjectTypeFormatter(sInvolvedObjectType);

		sMsgKey = "FEEDS_MSG_" + sAction;

		sResult = this.getText(sMsgKey, [this.spanWrapperFormatter(sObjectType), sObjectLink, this.spanWrapperFormatter(sInvolvedObjectType),
			sInvolvedObjectLink,
		    this.spanWrapperFormatter(sFieldOneName), this.spanWrapperFormatter(sFieldOneValue), this.spanWrapperFormatter(sFieldTwoName), this.spanWrapperFormatter(
				sFieldTwoValue),""]);

		return this.spanWrapperFormatter(sResult);
	};

	oObjectListFormatter.spanWrapperFormatter = function(sText) {
		return sText ? "<span>" + sText + "</span>" : "";
	};

	oObjectListFormatter.heightCampaignCard = function(oSystem) {
		if (oSystem.phone) {
			return "160px";
		} else {
			return "213px";
		}
	};

	oObjectListFormatter.respListFilterEnable = function(oItemsArray) {
		if ((oItemsArray === null) || (oItemsArray && oItemsArray.length > 1)) {
			return true;
		} else {
			return false;
		}
	};
	oObjectListFormatter.setIdeaHeaderTitleLength = function(bFullScreen){
	    if(!bFullScreen){
	        return "IDEA_HEADER_TITLE_LENGTH_SMALL";
	    }else {
	        return "IDEA_HEADER_TITLE_LENGTH_BIG";
	    }
	};
	oObjectListFormatter.quickLinkFilterInfo = function(oFilterInfo, bActive, aStatus, aOperator) {
	    var that = this;
	    var iCount = 0, 
    	    aParam = [], 
    	    sStatus = bActive ? this.getText('QUICK_LINK_FLD_ACTIVE') : this.getText('QUICK_LINK_FLD_INACTIVE'), 
    	    sVoteNum = '', 
    	    sVoteOperator = '',
    	    arr = '',
    	    result = [],
    	    i;
		if(oFilterInfo && aStatus && aOperator){
		    for(var sKey in oFilterInfo){
		        switch(sKey){
		            case 'CAMPAIGN':
		                aParam.push(that.getText('LIST_TIT_FILTER_CAMPAIGN_HEADER') + ': ' + oFilterInfo[sKey]);
		                break;
		            case 'IDEAFORMID':
		                aParam.push(that.getText('LIST_TIT_FILTER_CAMPAIGN_FORM_HEADER') + ': ' + CodeModel.getText('sap.ino.xs.object.ideaform.IdeaForm.Root',oFilterInfo[sKey]));
		                break;
		            case 'PHASE':
		                arr = oFilterInfo[sKey].split(',');
		                result = [];
		                for(i=0; i<arr.length; i++){
		                    result.push(CodeModel.getText('sap.ino.xs.object.campaign.Phase.Root', arr[i]));
		                }
		                aParam.push(that.getText('LIST_TIT_FILTER_PHASE_HEADER') + ': ' + result.join(','));
		                break;
		            case 'STATUS':
		                arr = oFilterInfo[sKey].split(',');
		                result = [];
		                for(i=0; i<aStatus.length; i++){
		                    if(arr.indexOf(aStatus[i].KEY) >= 0){
		                        result.push(that.getText(aStatus[i].TEXT));
		                    }
		                }
		                if(result.length){
		                    aParam.push(that.getText('LIST_TIT_FILTER_STATUS_HEADER') + ': ' + result.join(','));
		                }
		                break;
		            case 'SUBSTATUS':
		                arr = oFilterInfo[sKey].split(',');
		                result = [];
		                for(i=0; i<arr.length; i++){
		                    result.push(CodeModel.getText('sap.ino.xs.object.idea.Status.Root', arr[i]));
		                }
		                aParam.push(that.getText('LIST_TIT_FILTER_SUB_STATUS') + ': ' + result.join(','));
		                break;
		            case 'RESPCODE':
		                arr = oFilterInfo[sKey] ? JSON.parse(oFilterInfo[sKey]) : [];
		                result = [];
		                for(i=0; i<arr.length; i++){
		                    result.push(CodeModel.getText('sap.ino.xs.object.subresponsibility.ResponsibilityStage.RespValues', arr[i].code));
		                }
		                aParam.push(that.getText('LIST_TIT_FILTER_RESPONSIBILITY_LIST_HEADER') + ': ' + result.join(','));
		                break;
		            case 'AUTHORS':
		                aParam.push(that.getText('LIST_TIT_FILTER_AUTHOR_HEADER') + ': ' + oFilterInfo[sKey]);
		                break;
		            case 'COACHES':
		                aParam.push(that.getText('LIST_TIT_FILTER_COACH_HEADER') + ': ' + oFilterInfo[sKey]);
		                break;
		            case 'DUEFROM':
		                aParam.push(that.getText('QUICK_LINK_FLD_DUE_FROM') + ': ' + oFilterInfo[sKey]);
		                break;
		            case 'DUETO':
		                aParam.push(that.getText('QUICK_LINK_FLD_DUE_TO') + ': ' + oFilterInfo[sKey]);
		                break;
		            case 'VOTENUM':
		                sVoteNum = oFilterInfo[sKey];
		                break;
		            case 'VOTEOPERATOR':
		                sVoteOperator = oFilterInfo[sKey];
		                break;
		            default:
		                break;
		        }
		    }
		    if(sVoteNum && sVoteOperator){
                for(i=0; i<aOperator.length; i++){
                    if(aOperator[i].ACTION === sVoteOperator){
                        sVoteOperator = that.getText(aOperator[i].TEXT);
                    }
                }
                aParam.push(that.getText('LIST_TIT_FILTER_VOTE_NUMBER') + ': ' + sVoteOperator + ' ' + sVoteNum);
		    }
    		iCount = aParam.length;
    		return this.getText('QUICK_LINK_FILTER_INFO_TEXT', [iCount, sStatus]) + '\n' +  aParam.join('\n'); 
		}
		return '';
	};
	
	return oObjectListFormatter;
});