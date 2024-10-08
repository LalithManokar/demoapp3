/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the Scene class.
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	/**
	 * Constructor for a new Scene.
	 *
	 * The objects of this class should not be created directly.
	 * They should be created via {@link sap.ui.vk.ContentConnector sap.ui.vk.ContentConnector}.
	 *
	 * @class Provides the interface for the 3D model.
	 *
	 * The objects of this class should not be created directly.
	 * They should be created via {@link sap.ui.vk.ContentConnector sap.ui.vk.ContentConnector}.
	 *
	 * @public
	 * @abstract
	 * @author SAP SE
	 * @version 1.71.13
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.Scene
	 */
	var Scene = ManagedObject.extend("sap.ui.vk.Scene", /** @lends sap.ui.vk.Scene.prototype */ {
		metadata: {
			"abstract": true,
			properties: {
				/**
				 * Enables or disables double-sided materials
				 */
				doubleSided: {
					type: "boolean",
					defaultValue: false
				}
			}
		}
	});

	/**
	 * Gets the unique ID of the Scene object.
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getId
	 *
	 * @returns {string} The unique ID of the Scene object.
	 * @public
	 */

	/**
	 * Gets the default node hierarchy in the Scene object.
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getDefaultNodeHierarchy
	 *
	 * @returns {sap.ui.vk.NodeHierarchy} The default node hierarchy in the Scene object.
	 * @public
	 */

	/**
	 * Gets the scene reference that this Scene object wraps.
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getSceneRef
	 *
	 * @returns {any} The scene reference that this Scene object wraps.
	 * @public
	 */

	 /**
	 * Create an animation sequence
	 *
	 * @function
	 * @name sap.ui.vk.Scene#createAnimationSequence
	 *
	 * @param {string} id The unique id of sequence
	 * @param {string} name The name of sequence
	 *
	 * @returns {sap.ui.vk.AnimationSequence} the created animation sequence
	 * @public
	 */

	 /**
	 * Get animation sequence
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getAnimationSequence
	 *
	 * @param {string} id The unique id of sequence
	 *
	 * @returns {sap.ui.vk.AnimationSequence} Animation sequence with id
	 * @public
	 */

	 /**
	 * Get initial view
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getInitialView
	 *
	 * @returns {sap.ui.vk.View} initial view
	 * @public
	 */

	/**
	 * Set initial view
	 *
	 * @function
	 * @name sap.ui.vk.Scene#setInitialView
	 *
	 * @param {sap.ui.vk.View} view intial view
	 *
	 * @public
	 */

	 /**
	 * Get material
	 *
	 * @function
	 * @name sap.ui.vk.Scene#getMaterial
	 *
	 * @param {string} materialId material id
	 *
	 * @return {sap.ui.vk.Material} material
	 *
	 * @private
	 */

	/**
	 * Set material
	 *
	 * @function
	 * @name sap.ui.vk.Scene#setMaterial
	 *
	 * @param {string} materialId material id
	 * @param {sap.ui.vk.Material} material to be stored
	 *
	 * @private
	 */

	 /**
	 * Clear materials
	 *
	 * @function
	 * @name sap.ui.vk.Scene#clearMaterials
	 *
	 * @private
	 */

	return Scene;
});
