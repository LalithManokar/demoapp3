/*!
 * @copyright@
 */
sap.ui.define([
       "sap/ino/commons/models/aof/ApplicationObject",
       "sap/ino/commons/models/aof/PropertyModel",
       "sap/ino/commons/models/core/ReadSource",
       "sap/ino/commons/models/core/Extensibility",
       "sap/ino/commons/application/Configuration",
       "sap/ui/core/message/Message",
       "sap/ui/core/MessageType",
       "sap/ui/core/format/DateFormat",
       "sap/ino/commons/models/core/CodeModel"
   ], function(ApplicationObject, PropertyModel, ReadSource, Extensibility, Configuration, Message, MessageType, DateFormat, CodeModel) {
    "use strict";

    var Status = {
        Draft : "sap.ino.config.CAMP_DRAFT",
        Published : "sap.ino.config.CAMP_PUBLISHED"
    };

    var Campaign = ApplicationObject.extend("sap.ino.commons.models.object.Campaign", {
        objectName : "sap.ino.xs.object.campaign.Campaign",
        readSource : ReadSource.getDefaultODataSource("CampaignFull"),
        invalidation : {
            entitySets : ["CampaignFull", "CampaignSmall", "CampaignSmallIdeaAssign", "CampaignCount", "CampaignSearch", "CampaignSearchParams", "CampaignEntityCount", "MyCampaignFollow"]
        },
        determinations : {
            onCreate : function(oData, oCampaign) {
                var dToday = DateFormat.setBeginOfDay(new Date());
                var dOneYearAfter = new Date();
                dOneYearAfter.setFullYear(dOneYearAfter.getFullYear() + 1);
                sap.ui.ino.models.util.Date.setEndOfDay(dOneYearAfter);

                var aVoteCodes = CodeModel.getCodes("sap.ino.xs.object.campaign.VoteType.Root");
                var sVoteCode;
                if (aVoteCodes && aVoteCodes.length > 0) {
                    sVoteCode = aVoteCodes[0].CODE;
                }

                var oInitialCampaignData = {
                    VALID_FROM : dToday,
                    VALID_TO : dOneYearAfter,
                    SUBMIT_FROM : dToday,
                    SUBMIT_TO : dOneYearAfter,
                    IS_BLACK_BOX : 0,
                    STATUS_CODE : Status.Draft,
                    COLOR_CODE : "FFFFFF",
                    VOTE_TYPE_CODE : sVoteCode,
                    LanguageTexts : [],
                    Managers : [],
                    Experts : [],
                    Coaches : [],
                    Participants : [],
                    LanguagePages : [],
                    Attachments : []
                };
                _mergeLanguageTexts(oInitialCampaignData, oCampaign);
                Extensibility.initExtensionNode(oInitialCampaignData, "Extension", oCampaign);
                return oInitialCampaignData;
            },

            onRead : function(oData, oCampaign) {
                _mergeLanguageTexts(oData, oCampaign);
                oData.LanguagePages.sort(function(a, b) {
                    return a.PAGE_NO - b.PAGE_NO;
                });
                oData.Phases.sort(function(a, b) {
                    return a.SEQUENCE_NO - b.SEQUENCE_NO;
                });
                Extensibility.initExtensionNode(oData, "Extension", oCampaign);
                return oData;
            },

            onPersist : function(oData, oCampaign) {
                /*
                 * we need to invalidate all touched groups due to they must not be deleted if the are used in the
                 * campaign or they now can be deleted as they are no longer part of the campaign => we simply
                 * invalidate all groups
                 */
                PropertyModel.invalidateCachedProperties("sap.ino.xs.object.iam.Group");
            },

            onNormalizeData : function(oCampaign) {
                // determine page number based on current array order
                // page numbers are cross-language which does not hurt as relative order in language is important
                jQuery.each(oCampaign.LanguagePages || [], function(iIndex, oPage) {
                    oPage.PAGE_NO = iIndex;
                });

                jQuery.each(oCampaign.Phases || [], function(iIndex, oPage) {
                    oPage.SEQUENCE_NO = iIndex;
                });

                return oCampaign;
            },

            onMergeConcurrentChanges : function(oMergeResult, oUserChange) {
                // When two users have created texts in the same language
                // there are two objects after standard merge
                // As the UI shows only one text per language we make sure that for this
                // case the user change wins
                jQuery.each(oUserChange.LanguageTexts || [], function(iIndex, oText) {
                    if (oText.ID < 0) {
                        var sLanguage = oText.LANG;
                        var iId = oText.ID;
                        var aDuplicate = jQuery.grep(oMergeResult.LanguageTexts || [], function(oText, iIndex) {
                            return oText.LANG === sLanguage && oText.ID !== iId;
                        });
                        jQuery.sap.assert((aDuplicate.length <= 1));
                        if (aDuplicate.length === 1) {
                            // apply user change to existing text
                            oText.ID = aDuplicate[0].ID;
                            jQuery.extend(aDuplicate[0], oText);
                            for (var i = 0; oMergeResult.LanguageTexts; i++) {
                                if (oMergeResult.LanguageTexts[i].ID === iId) {
                                    oMergeResult.LanguageTexts.splice(i, 1);
                                    return;
                                }
                            }
                        }
                    }
                });

                return oMergeResult;
            }

        },
        actions : {
            publish : {
                enabledCheck : function(oCampaign, bEnabled) {
                    if (bEnabled === undefined) {
                        return oCampaign.getProperty("/property/actions/create/enabled");
                    } else {
                        var bUpdate = oCampaign.getProperty("/property/actions/update/enabled");
                        var bSubmit = oCampaign.getProperty("/property/actions/submit/enabled");
                        return bUpdate && bSubmit && bEnabled;
                    }
                },
                execute : function(vKey, oCampaign, oParameter, oActionMetadata, oSettings) {
                    var bDraft = (oCampaign.getProperty("/STATUS_CODE") == Status.Draft);

                    var oDeferred = new jQuery.Deferred();
                    var oModifyRequest = oCampaign.modify(oSettings);
                    oModifyRequest.fail(oDeferred.reject);
                    if (bDraft) {
                        oModifyRequest.done(function() {
                            var oSubmitRequest = oCampaign.submit(oSettings);
                            oSubmitRequest.fail(oDeferred.reject);
                            oSubmitRequest.done(oDeferred.resolve);
                        });
                    } else {
                        oModifyRequest.done(oDeferred.resolve);
                    }
                    return oDeferred.promise();
                }
            },
            save : {
                enabledCheck : function(oCampaign) {
                    if (oCampaign.getProperty("/ID") < 0) {
                        return oCampaign.getProperty("/property/actions/create/enabled");
                    } else {
                        var bUpdate = oCampaign.getProperty("/property/actions/update/enabled");
                        var bDraft = (oCampaign.getProperty("/STATUS_CODE") == Status.Draft);
                        return bUpdate && bDraft;
                    }
                },
                execute : function(vKey, oCampaign, oParameter, oActionMetadata, oSettings) {
                    return oCampaign.modify(oSettings);
                }
            }
        },

        setProperty : function(sPath, vValue) {
            if (sPath === "/SUBMIT_TO" || sPath === "/VALID_TO") {
                sap.ui.ino.models.util.Date.setEndOfDay(vValue);
            }
            return ApplicationObject.prototype.setProperty.apply(this, arguments);
        },

        setCampaignImage : function(oData) {
        	this._setImage(oData, "CAMPAIGN_DETAIL_IMG", "/CAMPAIGN_IMAGE_ASSIGN_ID", "/CAMPAIGN_IMAGE_ID");
        },
        
        setCampaignBackgroundImage : function(oData) {
        	this._setImage(oData, "BACKGROUND_IMG", "/CAMPAIGN_BACKGROUND_IMAGE_ASSIGN_ID", "/CAMPAIGN_BACKGROUND_IMAGE_ID");
        },
        
        setCampaignMobileSmallBackgroundImage : function(oData) {
            this._setImage(oData, "SMALL_BACKGROUND_IMG", "/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ASSIGN_ID", "/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID");
        },
        
        setCampaignListImage : function(oData) {
            this._setImage(oData, "CAMPAIGN_LIST_IMG", "/CAMPAIGN_LIST_IMAGE_ASSIGN_ID", "/CAMPAIGN_LIST_IMAGE_ID");
        },
        
        _setImage : function(oData, sRoleTypeCode, sAssignmentIdPropertyName, sAttachmentIdPropertyName) {
            var sPropertyName = "/Attachments";
            oData.ROLE_TYPE_CODE = sRoleTypeCode;
            var aChildrenData = this.getProperty(sPropertyName);
            aChildrenData = aChildrenData ? aChildrenData : [];
            var iAssignmentId = 0;
            var iAttachmentId = 0;
            jQuery.each(aChildrenData, function(oKey, sChildData) {
                if (sChildData.ATTACHMENT_ID == oData.ATTACHMENT_ID) {
                    iAssignmentId = sChildData.ID;
                    jQuery.each(aChildrenData, function(oKey, sChildData) {
                        if (sChildData.ROLE_TYPE_CODE === sRoleTypeCode) {
                            sChildData.ROLE_TYPE_CODE = "ATTACHMENT";
                            iAttachmentId = sChildData.ATTACHMENT_ID;
                        }
                    });
                    sChildData.ROLE_TYPE_CODE = oData.ROLE_TYPE_CODE;
                    return false;
                }
                return true;
            });

            if (iAssignmentId === 0) {
                iAssignmentId = this.getNextHandle();
                oData.ID = iAssignmentId;
                jQuery.each(aChildrenData, function(oKey, sChildData) {
                    if (sChildData.ROLE_TYPE_CODE === sRoleTypeCode) {
                        sChildData.ROLE_TYPE_CODE = "ATTACHMENT";
                        iAttachmentId = sChildData.ATTACHMENT_ID;
                    }
                });
                aChildrenData.push(oData);
            } else {
            	aChildrenData = jQuery.grep(aChildrenData, function(oChild, iIndex) {
            		if(oChild.ATTACHMENT_ID !== iAttachmentId){
            			return true;
            		}
            		
            		return false;
            	});
            }
            this.setProperty(sAssignmentIdPropertyName, iAssignmentId);
            this.setProperty(sAttachmentIdPropertyName, oData.ATTACHMENT_ID);
            this.setProperty(sPropertyName, aChildrenData);
        },

        clearCampaignImage : function(assignmentId) {
        	this._clearImage(assignmentId, "/CAMPAIGN_IMAGE_ASSIGN_ID", "/CAMPAIGN_IMAGE_ID");
        },
        
        clearCampaignBackgroundImage : function(assignmentId) {
        	this._clearImage(assignmentId, "/CAMPAIGN_BACKGROUND_IMAGE_ASSIGN_ID", "/CAMPAIGN_BACKGROUND_IMAGE_ID");
        },
        
        clearCampaignMobileSmallBackgroundImage : function(assignmentId) {
            this._clearImage(assignmentId, "/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ASSIGN_ID", "/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID");
        },
        
        clearCampaignListImage : function(assignmentId) {
            this._clearImage(assignmentId, "/CAMPAIGN_LIST_IMAGE_ASSIGN_ID", "/CAMPAIGN_LIST_IMAGE_ID");
        },
        
        _clearImage : function(assignmentId, sAssignmentIdPropertyName, sAttachmentIdPropertyName) {
        	this.setProperty(sAssignmentIdPropertyName, null);
            this.setProperty(sAttachmentIdPropertyName, null);
            var sPropertyName = "/Attachments";
            var aChildrenData = this.getProperty(sPropertyName);
            aChildrenData = jQuery.grep(aChildrenData, function(oChild, iIndex) {
        		if(oChild.ID !== assignmentId){
        			return true;
        		}
        		return false;
        	});
            this.setProperty(sPropertyName, aChildrenData);
        },

        addAttachment : function(oNewAttachment) {
            oNewAttachment.ROLE_TYPE_CODE = "ATTACHMENT";
            this.addChild(oNewAttachment, "Attachments");
        },

        removeAttachment : function(iId) {
            var aAttachment = jQuery.grep(this.getProperty("/Attachments"), function(oAttachment) {
                return oAttachment.ID === iId;
            });
            var oAttachment = aAttachment && aAttachment[0];
            if (oAttachment) {
                if (oAttachment.ROLE_TYPE_CODE === "CAMPAIGN_DETAIL_IMG") {
                    this.setProperty("/CAMPAIGN_IMAGE_ASSIGN_ID", null);
                    this.setProperty("/CAMPAIGN_IMAGE_ID", null);
                } else if (oAttachment.ROLE_TYPE_CODE === "BACKGROUND_IMG") {
                    this.setProperty("/CAMPAIGN_BACKGROUND_IMAGE_ASSIGN_ID", null);
                    this.setProperty("/CAMPAIGN_BACKGROUND_IMAGE_ID", null);
                } else if (oAttachment.ROLE_TYPE_CODE === "SMALL_BACKGROUND_IMG") {
                    this.setProperty("/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ASSIGN_ID", null);
                    this.setProperty("/CAMPAIGN_SMALL_BACKGROUND_IMAGE_ID", null);
                } else if (oAttachment.ROLE_TYPE_CODE === "CAMPAIGN_LIST_IMG") {
                    this.setProperty("/CAMPAIGN_LIST_IMAGE_ASSIGN_ID", null);
                    this.setProperty("/CAMPAIGN_LIST_IMAGE_ID", null);
                }
                this.removeChild(oAttachment);
            }
        },
        
        addTag : function(oNewTag) {
            var oMessage;
            var aTags = this.getProperty("/Tags");

            if (!oNewTag.NAME || jQuery.trim(oNewTag.NAME).length === 0) {
                oMessage = new sap.ui.ino.application.Message({
                    key : "MSG_INVALID_EMPTY_TAG",
                    level : sap.ui.core.MessageType.Error,
                    group : "TAG"
                });
                return oMessage;
            }

            oNewTag.NAME = jQuery.trim(oNewTag.NAME);

            if (!oNewTag.TAG_ID && oNewTag.NAME) {
                // Tags are created "on the fly"
                // so for new tags (not only tag assignment)
                // a new handle is used
                oNewTag.TAG_ID = this.getNextHandle();
            }
            var aMatches = jQuery.grep(aTags, function(oTag) {
                return oTag.TAG_ID === oNewTag.TAG_ID;
            });

            if (aMatches.length === 0) {
                this.addChild(oNewTag, "Tags");
            }
        },

        // No XS HTML check possible, check on UI
        validateHTML : function(iId) {
            var aMessage = [];
            jQuery.each(this.getData().LanguagePages, function(i, oLanguagePage) {
                if (iId && oLanguagePage.ID != iId) {
                    return;
                }
                var aCodes = CodeModel.getCodes("sap.ino.xs.object.basis.Language.Root", function(oLanguage) {
                    return oLanguage.ISO_CODE == oLanguagePage.LANG;
                });
                var oMessage = {
                    "TYPE" : "E",
                    "MESSAGE" : "MSG_CAMPAIGN_INVALID_HTML",
                    "REF_ID" : oLanguagePage.ID,
                    "REF_NODE" : "LanguagePages",
                    "REF_FIELD" : "HTML_CONTENT",
                    "PARAMETERS" : [oLanguagePage.TITLE, "{code>sap.ino.xs.object.basis.Language.Root:" + aCodes[0].CODE + "}"]
                };
                try {
                    // Validate HTML
                    var aResult = new jQuery(oLanguagePage.HTML_CONTENT);
                    if (!aResult || aResult.length === 0) {
                        aMessage.push(oMessage);
                    }
                } catch (e) {
                    aMessage.push(oMessage);
                }
            });
            return aMessage;
        },

        determinePageCreate : function(sLangCode) {
            return {
                ID : this.getNextHandle(),
                PAGE_NO : 0,
                HTML_CONTENT : "<p></p>",
                TITLE : "",
                IS_VISIBLE : 1,
                LANG : sLangCode
            };
        },

        determinePhaseCreate : function() {
            var aPhases = this.getProperty("/Phases");
            var iSeqNo = 0;
            for (var ii = 0; ii < aPhases.length; ++ii) {
                iSeqNo = aPhases[ii].SEQUENCE_NO >= iSeqNo ? aPhases[ii].SEQUENCE_NO + 1 : iSeqNo;
            }

            var aPhaseCodes = CodeModel.getCodes("sap.ino.xs.object.campaign.Phase.Root");
            var sPhaseCode = "";
            var bSuccess = true;
            // get a not used phase code
            for (var jj = 0; jj < aPhaseCodes.length; ++jj) {
                sPhaseCode = aPhaseCodes[jj].CODE;
                bSuccess = true;

                for (var kk = 0; kk < aPhases.length; ++kk) {
                    if (sPhaseCode === aPhases[kk].PHASE_CODE) {
                        bSuccess = false;
                        break;
                    }
                }

                if (bSuccess) {
                    break;
                }
            }

            var aStatusCodes = CodeModel.getCodes("sap.ino.xs.object.status.Model.Root");
            var sStatusCode = (aStatusCodes && aStatusCodes.length > 0) ? aStatusCodes[0].CODE : "";

            return {
                PHASE_CODE : sPhaseCode,
                STATUS_MODEL_CODE : sStatusCode,
                EVALUATION_MODEL_CODE : "",
                VOTING_ACTIVE : 1,
                SHOW_IDEA_IN_COMMUNITY : 1,
                IDEA_CONTENT_EDITABLE : 1,
                SEQUENCE_NO : iSeqNo,
                AUTO_EVAL_PUB_CODE : ""
            };
        },

        setData : function(oData) {
            ApplicationObject.prototype.setData.apply(this, arguments);

            // this is done to give the possibility to trigger an update of the language binding, as the index of the
            // languages in the languagetexts might have changed
            var oEvtBus = sap.ui.getCore().getEventBus();
            oEvtBus.publish("sap.ui.ino.models.object.Campaign", "language_update", {});
        }
    });

    function _mergeLanguageTexts(oData, oCampaign) {
        var aExistingLanguageTexts = oData.LanguageTexts;
        var aCodes = CodeModel.getCodes("sap.ino.xs.object.basis.Language.Root", function(oLanguage) {
            var aFound = jQuery.grep(aExistingLanguageTexts, function(oLanguageText) {
                return oLanguageText.LANG == oLanguage.ISO_CODE;
            });
            // only take currently unused language codes
            return aFound.length === 0;
        });

        var aInitialLanguageTexts = jQuery.map(aCodes, function(oLanguageCode) {
            return {
                LANG : oLanguageCode.ISO_CODE,
                ID : oCampaign.getNextHandle(),
                NAME : "",
                SHORT_NAME : "",
                DESCRIPTION : "",
                IDEA_DESCRIPTION_TEMPLATE : ""
            };
        });

        oData.LanguageTexts = oData.LanguageTexts.concat(aInitialLanguageTexts);

        return oData;
    }

    Campaign.Status = Status;
    
    return Campaign;
    
});