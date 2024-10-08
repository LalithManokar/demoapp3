sap.ui.define([
    "sap/ino/commons/models/aof/PropertyModel",
    "sap/m/MessageToast"
], function() {
	"use strict";

	/**
	 * @class
	 * Mixin that fix some bug in UI5 lib
	 */
	var UI5Mixin = function() {
		throw "Mixin may not be instantiated directly";
	};

	UI5Mixin.changeMethodGetObjectInV2ODataModel = function() {
		sap.ui.model.odata.v2.ODataModel.prototype._getObject = function(sPath, oContext, bOriginalValue) {
			var oNode = this.isLegacySyntax() ? this.oData : null,
				oChangedNode, oOrigNode,
				sResolvedPath = this.resolve(sPath, oContext),
				iSeparator, sDataPath, sMetaPath, oMetaContext, sKey, oMetaModel;

			if (!sResolvedPath) {
				return oNode;
			}

			//check for metadata path
			if (this._isMetadataPath(sResolvedPath)) {
				if (this.oMetadata && this.oMetadata.isLoaded()) {
					if (this.isMetaModelPath(sResolvedPath)) {
						// Metadata binding resolved by ODataMetaModel
						iSeparator = sResolvedPath.indexOf('/##');
						oMetaModel = this.getMetaModel();
						if (!this.bMetaModelLoaded) {
							return null;
						}
						sDataPath = sResolvedPath.substr(0, iSeparator);
						sMetaPath = sResolvedPath.substr(iSeparator + 3);
						oMetaContext = oMetaModel.getMetaContext(sDataPath);
						oNode = oMetaModel.getProperty(sMetaPath, oMetaContext);
					} else {
						// Metadata binding resolved by ODataMetadata
						oNode = this.oMetadata._getAnnotation(sResolvedPath);
					}
				}
			} else if (/^\/IdeaEvaluation\(\d+\)\/EvalAttachments$/gi.test(sResolvedPath)) {
				oNode = undefined;
			} else {
				// doesn't make any sense, but used to work
				if (sResolvedPath === "/") {
					return this.oData;
				}
				var aParts = sResolvedPath.split("/"),
					iIndex = 0;
				// absolute path starting with slash
				sKey = aParts[1];
				aParts.splice(0, 2);

				oChangedNode = this.mChangedEntities[sKey];
				oOrigNode = this._getEntity(sKey);
				oNode = bOriginalValue ? oOrigNode : oChangedNode || oOrigNode;
				while (oNode && aParts[iIndex]) {
					var bHasChange = oChangedNode && oChangedNode.hasOwnProperty(aParts[iIndex]);
					oChangedNode = oChangedNode && oChangedNode[aParts[iIndex]];
					oOrigNode = oOrigNode && oOrigNode[aParts[iIndex]];
					oNode = bOriginalValue || !bHasChange ? oOrigNode : oChangedNode;
					if (oNode) {
						if (oNode.__ref) {
							oChangedNode = this.mChangedEntities[oNode.__ref];
							oOrigNode = this._getEntity(oNode.__ref);
							oNode = bOriginalValue ? oOrigNode : oChangedNode || oOrigNode;
						} else if (oNode.__list) {
							oNode = oNode.__list;
						} else if (oNode.__deferred) {
							// set to undefined and not to null because navigation properties can have a null value
							oNode = undefined;
						}
					}
					iIndex++;
				}
			}
			//if we have a changed Entity/complex type we need to extend it with the backend data
			if (jQuery.isPlainObject(oChangedNode)) {
				oNode = bOriginalValue ? oOrigNode : jQuery.sap.extend(true, {}, oOrigNode, oChangedNode);
			}
			return oNode;
		};
	};

	return UI5Mixin;
});