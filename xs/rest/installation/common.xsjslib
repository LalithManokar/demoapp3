(function(exports) {
	"use strict";
	$.import("sap.ino.xs.xslib", "hQuery");
	var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;
	var oConn = $.hdb.getConnection({
		"sqlcc": "sap.ino.xs.rest.installation::installation_dbuser"
	});
	var oHQ = $.sap.ino.xs.xslib.hQuery.hQuery(oConn);
	var _register = $.import("sap.ino.setup.xslib", "register").aRegister;

	function readBaseRelease() {
		// determine last successfully upgraded path or default to 0.0.0
		// char is used as type of version, version_sp and version_patch is character-like in t_log.hdbtable
		const sBaseReleaseQuery =
			'select top 1' +
			'    to_int(VERSION)       as "version",' +
			'    to_int(VERSION_SP)    as "version_sp",' +
			'    to_int(VERSION_PATCH) as "version_patch"' +
			'from "sap.ino.setup.db::t_log"' +
			"where step = 'run' and name = 'sap.ino.setup.release_independent.99_setup_completed' and state = 'finished'" +
			'order by "version" desc, "version_sp" desc, "version_patch" desc';
		const aResult = oHQ.statement(sBaseReleaseQuery).execute();
		const oResult = aResult.length === 1 ? aResult[0] : {
			version: 0,
			version_sp: 0,
			version_patch: 0
		};
		return oResult;
	}

	function getRegister() {
		const oBaseRelease = readBaseRelease();

		// read the part of the register that is after the base release
		const aRelevantRegister = _.filter(_register,
			function(oRegisterEntry) {
				return oRegisterEntry.version > oBaseRelease.version ||
					(oRegisterEntry.version == oBaseRelease.version &&
						oRegisterEntry.version_sp > oBaseRelease.version_sp) ||
					(oRegisterEntry.version == oBaseRelease.version &&
						oRegisterEntry.version_sp == oBaseRelease.version_sp &&
						oRegisterEntry.version_patch > oBaseRelease.version_patch);
			});

		// preprocess the result for easier processing later on
		const aMappedRegister = _.map(aRelevantRegister, function(oRegisterEntry) {
			return _.map(oRegisterEntry.library, function(sFullName) {
				var aPath = sFullName.split(".");
				const sName = aPath.pop();
				const sPackage = aPath.join(".");

				return {
					library_full_name: sFullName,
					library_package: sPackage,
					library_name: sName,
					library: $.import(sPackage, sName),
					version: parseInt(oRegisterEntry.version),
					version_sp: parseInt(oRegisterEntry.version_sp),
					version_patch: parseInt(oRegisterEntry.version_patch)
				};
			});
		});
		return aMappedRegister;
	}

	function getDuVersion() {
		var prevVersion = readBaseRelease();
		var currentVersion = getRegister();
		var du_version = prevVersion;
		if (currentVersion && currentVersion.length > 0) {
			du_version.version = currentVersion[currentVersion.length - 1][0].version;
			du_version.version_sp = currentVersion[currentVersion.length - 1][0].version_sp;
			du_version.version_patch = currentVersion[currentVersion.length - 1][0].version_patch;
		}
		return du_version;
	}

	exports.getDuVersion = getDuVersion;
	exports.readBaseRelease = readBaseRelease;
}(this));