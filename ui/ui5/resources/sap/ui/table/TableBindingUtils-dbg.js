/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides helper sap.ui.table.TableBindingUtils.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Static collection of utility functions related to the binding of sap.ui.table.Table, ...
	 *
	 * Note: Do not access the function of this helper directly but via <code>sap.ui.table.TableUtils.Binding...</code>
	 *
	 * @author SAP SE
	 * @version 1.71.61
	 * @namespace
	 * @alias sap.ui.table.TableBindingUtils
	 * @private
	 */
	return {
		TableUtils: null, // Avoid cyclic dependency. Will be filled by TableUtils.

		/**
		 * Returns a promise for the loaded state of the metadata. If there is no rows binding or model, the promise will reject.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {Promise} A promise on the metadata loaded state.
		 */
		metadataLoaded: function(oTable) {
			var oBinding = oTable.getBinding("rows");
			var oModel = oBinding ? oBinding.getModel() : null;
			var fResolvePromise = null;
			var fRejectPromise = null;
			var pMetadataLoaded = new Promise(function(resolve, reject) {
				fResolvePromise = resolve;
				fRejectPromise = reject;
			});

			if (!oModel) {
				fRejectPromise();
				return pMetadataLoaded;
			}

			if (oModel.metadataLoaded) { // v2
				oModel.metadataLoaded().then(function() {
					fResolvePromise();
				});
			} else if (oModel.attachMetadataLoaded) { // v1
				if (oModel.oMetadata && oModel.oMetadata.isLoaded()) {
					fResolvePromise();
				} else {
					oModel.attachMetadataLoaded(function() {
						fResolvePromise();
					});
				}
			}

			return pMetadataLoaded;
		}
	};
}, /* bExport= */ true);