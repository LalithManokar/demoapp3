//provide some functions to select_all_ideas.xsjs service
const ohQuery = $.import("sap.ino.xs.xslib", "hQuery");
var oConn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
var oHQ = ohQuery.hQuery(oConn).setSchema("SAP_INO");

function formatParams(aParameters) {
	var oParameters = {};
	_.each(aParameters, function(oParameter) {
		oParameters[oParameter.name.toUpperCase()] = oParameter.value;
	});

	return oParameters;
}

function getAllIdeas(aParameters) {
	var oResponse = {
		status: $.net.http.OK,
		body: {
			
		}
	};

	function missParameters() {
		oResponse.status = $.net.http.INTERNAL_SERVER_ERROR;
		oResponse.body = { messageKey:"IDEA_SELECT_ALL_MSG_MISS_PARAMETERS"};
		return oResponse;
	}

	var oParameters = formatParams(aParameters);

	try {
		//decode the filterParams
		oParameters.FILTERSTRING = oParameters.FILTERSTRING.replace('$filter=', '').replace(/%20eq%20/g, '=')
			.replace(/%20ne%20/g, '<>').replace(/%20ge%20/g,'>=').replace(/%20le%20/g,'<=').replace(/%20/g, ' ')
			.replace(/%26/g, '&').replace(/%27/g, '\'');
		oParameters.FILTERBACKOFFICE = parseInt(oParameters.FILTERBACKOFFICE, 10);

		var aIdeasID;
		aIdeasID = oHQ.procedure("SAP_INO", "sap.ino.db.idea::p_all_ideas_search").execute(oParameters);
		oResponse.body.Ideas = aIdeasID.OT_IDEAS_DATA;
	} catch (e) {
		missParameters();

		return oResponse;
	}

	return oResponse;
}