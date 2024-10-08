var _ = $.import("sap.ino.xs.xslib.thirdparty", "underscore")._;

var ObjectType = $.import("sap.ino.xs.aof.core", "framework").ObjectType;
var configCheck = $.import("sap.ino.xs.aof.config", "check");
var configDetermine = $.import("sap.ino.xs.aof.config", "determination");
var determine = $.import("sap.ino.xs.aof.lib", "determination");
var BasisMessage = $.import("sap.ino.xs.object.basis", "message");
var Message = $.import("sap.ino.xs.aof.lib", "message");
var textBundle = $.import("sap.ino.xs.xslib", "textBundle");
var AOF = $.import("sap.ino.xs.aof.core", "framework");
var UrlWhiteList = $.import("sap.ino.xs.xslib", "urlWhiteList");

this.definition = {
	type: ObjectType.Stage,
	actions: {
		create: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck,
			customProperties: createCustomProperties
		},
		copy: {
			authorizationCheck: false,
			enabledCheck: configCheck.configAvailableCheck
		},
		update: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		read: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		del: {
			authorizationCheck: false,
			enabledCheck: configCheck.configEnabledCheck
		},
		migrate: {
			authorizationCheck: false,
			isStatic: true,
			execute: migrate
		}
	},
	Root: {
		table: "sap.ino.db.basis::t_url_whitelist_ui_stage",
		sequence: "sap.ino.db.basis::s_url_whitelist",
		customProperties: {
			fileName: "t_url_whitelist_ui",
			contentOnlyInRepository: false
		},
		determinations: {
			onCreate: [configDetermine.determineConfigPackage],
			onCopy: [configDetermine.determineConfigPackage, updateTitles, configDetermine.determinePackageAndCode],
			onModify: [configDetermine.determinePackageAndCode, determine.systemAdminData],
			onPersist: [configDetermine.activateContent]
		},
		attributes: {
            ID : {
                isPrimaryKey : true
            },
            CODE : {
                readOnly : true
            },
            PLAIN_CODE : {
                required : true,
                consistencyChecks : [configCheck.validPlainCodeCheck]
            },
            CREATED_AT : {
                readOnly : true
            },
            CREATED_BY_ID : {
                readOnly : true
            },
            CHANGED_AT : {
                readOnly : true
            },
            CHANGED_BY_ID : {
                readOnly : true
            }
        }
    }
};

function createCustomProperties(vKey, oPersistedObject, addMessage, oContext) {
    var hq = oContext.getHQ();
	var sSelect = 'select TOP 1 * from "sap.ino.db.basis::t_url_whitelist"';
	var result = hq.statement(sSelect).execute();
	return {
		migrateEnabled: result.length > 0 ? true : false
	};
}

function updateTitles(vKey, oWorkObject, oPersistedObject, fnMessage, fnNextHandle, oContext, oNodeMetadata) {
    var oMeta = oNodeMetadata.objectMetadata.getNodeMetadata("Root");

    var sDefaultText = oWorkObject.DEFAULT_TEXT || '';
    var sPrefix = textBundle.getText("uitexts", "BO_URL_WHITELIST_COPY_CODE_PREFIX", [], "", false, oContext.getHQ());
    sDefaultText = sPrefix + sDefaultText;

    // check length
    sDefaultText = sDefaultText.substr(0, oMeta.attributes.DEFAULT_TEXT.length);

    oWorkObject.DEFAULT_TEXT = sDefaultText;

    var sPlainCodeText = oWorkObject.PLAIN_CODE;
    // check length
    sPlainCodeText = sPlainCodeText.substr(0, oMeta.attributes.PLAIN_CODE.length);

    oWorkObject.PLAIN_CODE = sPlainCodeText;
}

function migrate() {
	UrlWhiteList.migrate();
}