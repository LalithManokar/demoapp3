var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var Message = $.import("sap.ino.xs.aof.lib", "message");
var IdeaMessage = $.import("sap.ino.xs.object.idea", "message");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var dbConnection = $.import("sap.ino.xs.xslib", "dbConnection");
const getHQ = dbConnection.getHQ;
var oLHQ = getHQ();

var aTypeCode = ["CreatedViewer", "UpdatedViewer", "StatusChangeViewer", "CommentViewer"];

this.definition = {
	actions: {
		create: {
			authorizationCheck: false,
			historyEvent: "IDEA_LATEST_CREATED"
		},
		update: {
			authorizationCheck: false,
			historyEvent: "IDEA_LATEST_UPDATED"
		},
		del: {
			authorizationCheck: false,
			historyEvent: "IDEA_LATEST_DELETED"
		},
		read: {
			authorizationCheck: false
		},
		bulkDelete: {
			authorizationCheck: false,
			execute: bulkDelete,
			isStatic: true,
			historyEvent: "IDEA_LATEST_DELETE"
		},
		deleteViewerByIdAndTypeCode: {
			authorizationCheck: false,
			execute: deleteViewerByIdAndTypeCode,
			isStatic: true,
		},
		deleteViewerByObjectIdAndTypeCode: {
			authorizationCheck: false,
			execute: deleteViewerByObjectIdAndTypeCode,
			isStatic: true,
		}
	},

	Root: {
		table: "sap.ino.db.idea::t_idea_latest",
		sequence: "sap.ino.db.idea::s_idea_latest",
		historyTable: "sap.ino.db.idea::t_idea_latest_h",
		determinations: {
			onCreate: [],
			onModify: [determine.systemAdminData]
		},
		consistencyChecks: [],
		nodes: {
			CreatedViewer: {
				table: "sap.ino.db.idea::t_idea_latest_created_viewer",
				sequence: "sap.ino.db.idea::s_idea_latest_created_viewer",
				historyTable: "sap.ino.db.idea::t_idea_latest_created_viewer_h",
				parentKey: "OBJECT_ID",
				attributes: {
					IDENTITY_ID: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					}
				}
			},
			UpdatedViewer: {
				table: "sap.ino.db.idea::t_idea_latest_updated_viewer",
				sequence: "sap.ino.db.idea::s_idea_latest_updated_viewer",
				historyTable: "sap.ino.db.idea::t_idea_latest_updated_viewer_h",
				parentKey: "OBJECT_ID",
				attributes: {
					IDENTITY_ID: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					}
				}
			},
			StatusChangeViewer: {
				table: "sap.ino.db.idea::t_idea_latest_statuschange_viewer",
				sequence: "sap.ino.db.idea::s_idea_latest_statuschange_viewer",
				historyTable: "sap.ino.db.idea::t_idea_latest_statuschange_viewer_h",
				parentKey: "OBJECT_ID",
				attributes: {
					IDENTITY_ID: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					}
				}
			},
			CommentViewer: {
				table: "sap.ino.db.idea::t_idea_latest_comment_viewer",
				sequence: "sap.ino.db.idea::s_idea_latest_comment_viewer",
				historyTable: "sap.ino.db.idea::t_idea_latest_comment_viewer_h",
				parentKey: "OBJECT_ID",
				attributes: {
					IDENTITY_ID: {
						foreignKeyTo: "sap.ino.xs.object.iam.Identity.Root"
					}
				}
			},

		},
		attributes: {
			OBJECT_ID: {
				required: true
			},
			OBJECT_TYPE_CODE: {
				required: true
			},
			INVOLVED_ID: {
				required: true
			},
			INVOLVED_OBJECT_TYPE_CODE: {
				required: true
			},
			TYPE_CODE: {
				required: true
			},
			CREATED_AT: {
				readOnly: true
			},
			CREATED_BY_ID: {
				readOnly: true
			},
			CHANGED_AT: {
				readOnly: true,
				concurrencyControl: true
			},
			CHANGED_BY_ID: {
				readOnly: true
			}
		}
	}
};

function bulkDelete(oParameters, oBulkAccess, addMessage, getNextHandle, oContext) {
	if (!oParameters || !oParameters.bulkDeleteObject || !oParameters.bulkDeleteCondition) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_LATEST_PARAMETER_REQUIRED, undefined, "Root");
		return;
	}

	var oResponse = oBulkAccess.del(oParameters.bulkDeleteObject, oParameters.bulkDeleteCondition);
	addMessage(oResponse.messages);

	return oResponse;
}

//update all items from latest list

// when update viewer, check if it is true that the viewers of all type are empty, then delete the related latest idea record

function generateViewerForAction(object_id, object_type_code, involved_id, involved_object_type_code, type_code, extra_viewer) {
	var ideaLatestObject = {
		ID: -1,
		OBJECT_ID: object_id,
		OBJECT_TYPE_CODE: object_type_code,
		INVOLVED_ID: involved_id,
		INVOLVED_OBJECT_TYPE_CODE: involved_object_type_code,
		TYPE_CODE: type_code
	};
	const typeToNode = {
		CreatedViewer: [],
		UpdatedViewer: [],
		StatusChangeViewer: [],
		CommentViewer: []
	};
	if (type_code && typeToNode[type_code]) {
		ideaLatestObject[type_code] = typeToNode[type_code];
	} else {
		return;
	}

	extra_viewer = extra_viewer || [];

	var generateSql, generateResult;
	if (type_code === 'CreatedViewer') {
		generateSql =
			`select distinct identity_id from
    		(select created_by_id as identity_id, campaign_id as object_id from "sap.ino.db.campaign::v_campaign_coach_transitive"
    		union all select identity_id, object_id from "sap.ino.db.campaign::v_campaign_participants_user_transitive" 
    		union all select identity_id, campaign_id as object_id from "sap.ino.db.campaign::v_campaign_manager_transitive" 
    		union all select identity_id, campaign_id as object_id from "sap.ino.db.campaign::v_campaign_resp_coach_transitive")
		where object_id = ?`;
		generateResult = oLHQ.statement(generateSql).execute(involved_id);
		generateResult = _.uniq(_.map(_.union(generateResult, extra_viewer), function(o) {
			return o.IDENTITY_ID;
		}));
	} else {
		generateSql = 'select created_by_id as identity_id from"sap.ino.db.follow::t_follow" where object_id = ? and object_type_code  = ?';
		generateResult = oLHQ.statement(generateSql).execute(object_id, object_type_code);
		generateResult = _.map(generateResult, function(o) {
			return o.IDENTITY_ID;
		});
	}

	var oRes;
	if (generateResult.length > 0) {
		generateResult.forEach(function(item) {
			ideaLatestObject[type_code].push({
				IDENTITY_ID: item
			});
		});

		var IdeaLatestBo = AOF.getApplicationObject("sap.ino.xs.object.idea.IdeaLatest");
		oRes = IdeaLatestBo.create(ideaLatestObject);
	}
	return oRes;
}

function _checkViewerAndDelObjectByIdArray(oContext) {
	var sViewerQuery =
		`select id from "sap.ino.db.idea::t_idea_latest" as latest
		left outer  join  (select id as node_id,object_id from(
		select id, object_id from "sap.ino.db.idea::t_idea_latest_created_viewer"
		union all select id, object_id from "sap.ino.db.idea::t_idea_latest_updated_viewer"
		union all select id, object_id from "sap.ino.db.idea::t_idea_latest_statuschange_viewer"
		union all select id, object_id from "sap.ino.db.idea::t_idea_latest_comment_viewer" ) ) as all_node
		on latest.id = all_node.object_id
		where all_node.node_id is null`;
	var aViewerResult = oLHQ.statement(sViewerQuery).execute();
	if (aViewerResult.length > 0) {
		var sEmptyId = _.pluck(aViewerResult, 'ID').join(',');
		var bulkDeleteObject = {
			Root: {
				CHANGED_BY_ID: oContext.getUser().ID,
				CHANGED_AT: oContext.getRequestTimestamp()
			}
		};
		var bulkDeleteCondition = {
			condition: "id in (" + sEmptyId + ")",
			conditionParameters: [],
			conditionNodeAlias: "latestIdea"
		};
		var AOFIdeaLatest = AOF.getApplicationObject("sap.ino.xs.object.idea.IdeaLatest");
		var oResponse = AOFIdeaLatest.bulkDelete({
			bulkDeleteObject: bulkDeleteObject,
			bulkDeleteCondition: bulkDeleteCondition
		});
	}
}

function deleteViewerByIdAndTypeCode(oParameters, oIdeaLatest, addMessage, getNextHandle, oContext) {
	if (!oParameters.TYPE_CODE) {
		addMessage(Message.MessageSeverity.Error, IdeaMessage.IDEA_LATEST_PARAMETER_REQUIRED, oParameters.ID, "Root");
		return;
	}

	var bulkDeleteCondition = {};
	if (!oParameters.ID) {
		bulkDeleteCondition = {
			condition: "identity_id = ?",
			conditionParameters: [oContext.getUser().ID],
			conditionNodeAlias: "viewer"
		};
	} else {
		bulkDeleteCondition = {
			condition: "object_id in (" + oParameters.ID + ") and identity_id = ?",
			conditionParameters: [oContext.getUser().ID],
			conditionNodeAlias: "viewer"
		};
	}

	var AOFIdeaLatest = AOF.getApplicationObject("sap.ino.xs.object.idea.IdeaLatest");

	var bulkDeleteObject = {};
	if (_.isString(oParameters.TYPE_CODE)) {
		bulkDeleteObject[oParameters.TYPE_CODE] = {
			Root: {
				CHANGED_BY_ID: oContext.getUser().ID,
				CHANGED_AT: oContext.getRequestTimestamp()
			}
		};
		AOFIdeaLatest.bulkDelete({
			bulkDeleteObject: bulkDeleteObject,
			bulkDeleteCondition: bulkDeleteCondition
		});
	} else if (_.isArray(oParameters.TYPE_CODE)) {
		_.each(oParameters.TYPE_CODE, function(sTypeCode) {
			bulkDeleteObject = {};
			bulkDeleteObject[sTypeCode] = {
				Root: {
					CHANGED_BY_ID: oContext.getUser().ID,
					CHANGED_AT: oContext.getRequestTimestamp()
				}
			};
			AOFIdeaLatest.bulkDelete({
				bulkDeleteObject: bulkDeleteObject,
				bulkDeleteCondition: bulkDeleteCondition
			});
		});
	}
	_checkViewerAndDelObjectByIdArray(oContext);
}

function deleteViewerByObjectIdAndTypeCode(oParameters, oIdeaLatest, addMessage, getNextHandle, oContext) {
	var aTypeCode = oParameters.TYPE_CODE;
	var sObjectId = _getIdeaIdByQuery(oParameters);
	var querySql = `select id from "sap.ino.db.idea::t_idea_latest" where object_id in (` + sObjectId + `)`;
	var aResult = oLHQ.statement(querySql).execute();
	oParameters.TYPE_CODE = aTypeCode;
	if (_.size(aResult) > 0) {
		var sId = _.map(aResult, function(o) {
			return o.ID;
		}).join(',');
		var oParam = {
			ID: sId,
			TYPE_CODE: oParameters.TYPE_CODE
		};
		deleteViewerByIdAndTypeCode(oParam, oIdeaLatest, addMessage, getNextHandle, oContext);
	}
}

function _getIdeaIdByQuery(oParameter) {
	const TraceWrapper = $.import("sap.ino.xs.xslib", "traceWrapper");
	// 	var aParameters = $.request.parameters;
	if (oParameter.IDEA_ID) {
		return oParameter.IDEA_ID;
	}
	var oParameters = formatParams(oParameter);

	var aIdeasData, aIdeasMetadata;
	try {
		delete oParameters.FILEFORMAT;
		delete oParameters.FILENAME;
		delete oParameters.ISNOTSENDEMAIL;
		delete oParameters.TYPE_CODE;
		//decode the filterParams
		oParameters.FILTERSTRING = oParameters.FILTERSTRING.replace('$filter=', '').replace(/%20eq%20/g, '=')
			.replace(/%20ne%20/g, '<>').replace(/%20le%20/g, '<=').replace(/%20ge%20/g, '>=').replace(/%20/g, ' ').replace(/%27/g, "'");
		if (oParameters.SEARCHTOKEN) {
			oParameters.SEARCHTOKEN = oParameters.SEARCHTOKEN.replace(/%20/g, ' ');
		}
		oParameters.FILTERBACKOFFICE = parseInt(oParameters.FILTERBACKOFFICE, 10);
		if (oParameters.FILTERSTRING === '()') {
			oParameters.FILTERSTRING = '';
		}
		if (oParameters.FILTERSTRING) {
			oParameters.FILTERSTRING = oParameters.FILTERSTRING.replace(/(VOTE_COUNT\s*[>|<]{0,1}=\s*)(?:binary)?(-?\d+)(?:[d|m|l|f])(?=\s*)/ig,
				"$1$2");
		}
		oParameters.C1 = oParameters.C1 || '';
		oParameters.O1 = oParameters.O1 || -1;
		oParameters.V1 = oParameters.V1 || '';
		oParameters.C2 = oParameters.C2 || '';
		oParameters.O2 = oParameters.O2 || -1;
		oParameters.V2 = oParameters.V2 || '';
		oParameters.C3 = oParameters.C3 || '';
		oParameters.O3 = oParameters.O3 || -1;
		oParameters.V3 = oParameters.V3 || '';
		oParameters.CVT = oParameters.CVT || '';
		oParameters.CVR = oParameters.CVR || 0;
        oParameters.CVY = oParameters.CVY || 0;		
		if (oParameters.FILTERBACKOFFICE) {
            oParameters.SEARCHTYPE = oParameters.SEARCHTYPE || 0;			   
			aIdeasData = oLHQ.procedure("SAP_INO", "sap.ino.db.idea::p_ideas_medium_search").execute(oParameters);
		} else {
			aIdeasData = oLHQ.procedure("SAP_INO", "sap.ino.db.idea::p_ideas_community_search").execute(oParameters);

		}
	} catch (e) {
		TraceWrapper.log_exception(e);
		return e;
	}
	var sId = '';
	_.each(aIdeasData.OT_IDEAS, function(oIdea, index) {
		if (index !== aIdeasData.OT_IDEAS.length - 1) {
			sId += oIdea.ID + ',';
		} else {
			sId += oIdea.ID;
		}
	});
	if (sId) {
		return sId;
	}
}

function formatParams(aParameters) {
	var oParameters = {};
	_.each(aParameters, function(value, name) {
		oParameters[name.toUpperCase()] = value;
	});

	return oParameters;
}