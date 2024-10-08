/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([ "jquery.sap.global", "sap/ui/base/ManagedObject" ], function(jQuery, ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new Playback.
	 *
	 * The objects of this class contain neccessary information to define how an animation sequence is played
	 *
	 * @class Provides definition for an animation playback
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.71.13
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.AnimationPlayback
	 * @experimental Since 1.67.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationPlayback = ManagedObject.extend("sap.ui.vk.AnimationPlayback", /** @lends sap.ui.vk.AnimationPlayback.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				* pid
				*/
				pid: {
				    type: "string"
				},
				/**
				* sequence id
				*/
				sequenceId: {
				    type: "string"
				},
				/**
				* time scale
				*/
				timeScale: {
					type: "float",
					defaultValue: 1
				},
				/**
				* delay time in second before playback starts
				*/
				preDelay: {
					type: "float",
					defaultValue: 0
				},
				/**
				* delay time in second after playback ends
				*/
				postDelay: {
					type: "float",
					defaultValue: 0
				},
				/**
				* number of repeats playback plays
				*/
				repeat: {
					type: "int",
					defaultValue: 1
				},
				/**
				* if playback is reversed
				*/
				reversed: {
					type: "boolean",
					defaultValue: false
				},
				/**
				* start time of playback
				*/
				startTime: {
					type: "float",
					defaultValue: 0
				},
				/**
				* if playback is repeated infinitely
				*/
				infinite: {
					type: "boolean",
					defaultValue: false
				}
			}
		}
	});

	return AnimationPlayback;
});
