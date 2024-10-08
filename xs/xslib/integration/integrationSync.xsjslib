const hQuery = $.import("sap.ino.xs.xslib", "hQuery");
const conn = $.import("sap.ino.xs.xslib", "dbConnection").getConnection();
const transfer = $.import("sap.ino.xs.xslib.integration", "jsonTreeTransfer");

var _sync = function(srcJsonTreeStr, destJsonTreeStr) {
	if (!srcJsonTreeStr) {
		return null;
	}
	if (srcJsonTreeStr === destJsonTreeStr) {
		// no change
		return;
	}
	// transfer tree data to json data
	var srcJsonObj = transfer.tree2JsonTransfer(JSON.parse(srcJsonTreeStr));
	var destJsonObj = destJsonTreeStr ? transfer.tree2JsonTransfer(JSON.parse(destJsonTreeStr)) : {};

	_syncJsonObj(srcJsonObj, destJsonObj);

	return transfer.json2TreeTransfer(destJsonObj);
};

var _syncJsonObj = function(srcJsonObj, destJsonObj) {
	var aKeys = _noDuplicateArray(Object.keys(srcJsonObj).concat(Object.keys(destJsonObj)));
	aKeys.forEach(function(sKey) {
		if (!srcJsonObj.hasOwnProperty(sKey)) {
			// remove attr not exist in src obj
			delete destJsonObj[sKey];
			return;
		}
		if (!destJsonObj.hasOwnProperty(sKey)) {
			destJsonObj[sKey] = srcJsonObj[sKey];
			return;
		}
		if (_isSimpleType(srcJsonObj[sKey]) && _isSimpleType(destJsonObj[sKey])) {
			// no action for simple value
			return;
		}
		if (_isSameType(srcJsonObj[sKey], destJsonObj[sKey])) {
			// deep into child node
			_syncJsonObj(srcJsonObj[sKey], destJsonObj[sKey]);
		} else {
			destJsonObj[sKey] = Array.isArray(srcJsonObj[sKey]) ? [] : {};
			_syncJsonObj(srcJsonObj[sKey], destJsonObj[sKey]);
		}
	});
};

var _noDuplicateArray = function(array) {
	return array.reduce(function(acc, val) {
		if (acc.indexOf(val) === -1) {
			acc.push(val);
		}
		return acc;
	}, []);
};

var _isSameType = function(srcObj, destObj) {
	return Object.prototype.toString.call(srcObj) === Object.prototype.toString.call(destObj);
};

var _isSimpleType = function(vValue) {
	var sType = Object.prototype.toString.call(vValue);
	return sType !== '[object Object]' && sType !== '[object Array]';
};

var _getDbValue = function(vValue) {
	return vValue === null ? null : '\'' + JSON.stringify(vValue) + '\'';
};

function execute(sys_technical_name) {
	var hq = hQuery.hQuery(conn);
	hq.setSchema('SAP_INO');

	var sql =
		`
        select 
            camp_integr.ID as CAMP_INTEGR_ID,
            camp_integr.CREATE_REQ_JSON as CAMP_CREATE_REQ_JSON,
            camp_integr.CREATE_RES_JSON as CAMP_CREATE_RES_JSON,
            camp_integr.FETCH_REQ_JSON as CAMP_FETCH_REQ_JSON,
            camp_integr.FETCH_RES_JSON as CAMP_FETCH_RES_JSON,
            sys_integr.CREATE_REQ_JSON as SYS_CREATE_REQ_JSON,
            sys_integr.CREATE_RES_JSON as SYS_CREATE_RES_JSON,
            sys_integr.FETCH_REQ_JSON as SYS_FETCH_REQ_JSON,
            sys_integr.FETCH_RES_JSON as SYS_FETCH_RES_JSON
        from 
            "sap.ino.db.integration::t_campaign_integration" as camp_integr
        inner join 
            "sap.ino.db.integration::t_system_integration" as sys_integr
        on 
            camp_integr.TECHNICAL_NAME = sys_integr.TECHNICAL_NAME
        where
            sys_integr.TECHNICAL_NAME = ?
    `;

	var aIntegrationConfig = hq.statement(sql).execute(sys_technical_name);
	if (aIntegrationConfig.length > 0) {
		aIntegrationConfig.forEach(function(oConfig) {

			// sync mapping for create
			var sCreateReqJson = _sync(oConfig.SYS_CREATE_REQ_JSON, oConfig.CAMP_CREATE_REQ_JSON);
			var sCreateResJson = _sync(oConfig.SYS_CREATE_RES_JSON, oConfig.CAMP_CREATE_RES_JSON);
			// sync mapping fro fetch
			var sFetchReqJson = _sync(oConfig.SYS_FETCH_REQ_JSON, oConfig.CAMP_FETCH_REQ_JSON);
			var sFetchResJson = _sync(oConfig.SYS_FETCH_RES_JSON, oConfig.CAMP_FETCH_RES_JSON);
			if (sCreateReqJson === undefined && sCreateResJson === undefined && sFetchReqJson === undefined && sFetchResJson === undefined) {
				// no update
				return;
			}
			var updateSql = 'update "sap.ino.db.integration::t_campaign_integration" set CHANGED_AT = CURRENT_UTCTIMESTAMP,';
			if (sCreateReqJson !== undefined) {
				updateSql += 'CREATE_REQ_JSON = ' + _getDbValue(sCreateReqJson) + ', ';
			}
			if (sCreateResJson !== undefined) {
				updateSql += 'CREATE_RES_JSON = ' + _getDbValue(sCreateResJson) + ', ';
			}
			if (sFetchReqJson !== undefined) {
				updateSql += 'FETCH_REQ_JSON = ' + _getDbValue(sFetchReqJson) + ', ';
			}
			if (sFetchResJson !== undefined) {
				updateSql += 'FETCH_RES_JSON = ' + _getDbValue(sFetchResJson);
			}
			if (updateSql.endsWith(', ')) {
				updateSql = updateSql.slice(0, updateSql.lastIndexOf(', '));
			}
			updateSql += ' where ID = ?';
			hq.statement(updateSql).execute(oConfig.CAMP_INTEGR_ID);
		});
		hq.getConnection().commit();
	}
}