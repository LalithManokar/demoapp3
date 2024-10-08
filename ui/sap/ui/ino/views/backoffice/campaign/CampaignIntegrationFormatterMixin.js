/*!
 * @copyright@
 */

(function() {
	sap.ui.ino.views.backoffice.campaign.CampaignIntegrationFormatterMixin = {
		formatterRemoveBtn: function(nSelectIndex) {
			return nSelectIndex >= 0;
		},
		formatterDestHost: function(sHost, sPort, sPath, sCreate, sQuery, nIndex, sCreateLocationId, sQueryLocationId) {
			if (!sHost) {
				return "";
			}
			return sHost + ((sPort > 0) ? (":" + sPort) : "") + sPath + (nIndex > 0 ? (sQuery || "") : (sCreate || "")) + '?location_id=' + (nIndex > 0 ? (sCreateLocationId || "") : (sCreateLocationId || ""));
		},
		formatterApi: function(sCreate, sQuery, nIndex) {
			return nIndex > 0 ? sQuery : sCreate;
		},
		formatterDataType: function(sDataType) {
			return sDataType === this._MAPPING_VALUE_TYPES.CONSTANT;
		},
		formatterDataTypeValue: function(sDataType) {
			if (sDataType === this._MAPPING_VALUE_TYPES.CONSTANT) {
				return this.getTextModel().getText("BO_INTEGRATION_MAPPING_DETAIL_CONSTANT_ITEM");
			} else if (sDataType === this._MAPPING_VALUE_TYPES.VARIANT) {
				return this.getTextModel().getText("BO_INTEGRATION_MAPPING_DETAIL_VARIANT_ITEM");
			} else {
				return "";
			}
		},
		formatterResReqPanel: function(nSelIndex) {
			return nSelIndex < 2;
		},
		formatterPreviewContent: function(nSelIndex) {
			return nSelIndex === 2;
		},
		formatterPreviewButton: function(nSelIndex) {
			return nSelIndex > -1;
		},
		formatterMappingDetailTable: function(nSelIndex) {
			return nSelIndex < 2;
		},
		formatterExtensionDest: function(sysPkgName, sysName, sPropertyName) {
			var destList = this._getModel("destList");
			if (!destList) {
				return "";
			}
			var result = destList.getData().filter(function(item) {
				return item.standardPackage === sysPkgName && item.standardName === sysName;
			});
			if (!result || result.length <= 0) {
				return "";
			}
			return result[0][sPropertyName];
		},
		formatterFieldLayoutRemoveBtn: function(nSelectIndex, bEdit) {
			return nSelectIndex > -1 && bEdit;
		},
		formatterFieldLayoutAddBtn: function(nSelIndex, bEdit) {
			return nSelIndex > -1 && bEdit;
		},
		formatterMappingField: function(sMappingField) {
		    if(!sMappingField){
		        return "";
		    }
			var inmAllCodeFields = this._getModel("inmFields");
			if (inmAllCodeFields && inmAllCodeFields.getData()) {
				var oCurrentCodeField = inmAllCodeFields.getData().filter(function(item) {
					return item.FIELD_CODE === sMappingField;
				});
				if (oCurrentCodeField && oCurrentCodeField.length > 0) {
					return oCurrentCodeField[0].TEXT_CODE + "(" + sMappingField + ")";
				}
			}
			return sMappingField;
		}
	};
}());