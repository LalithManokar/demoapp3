/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.threejs.AnimationTimeController
sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	/**
	 * Constructor for a controller for animation time - all playbacks in a view.
	 *
	 * @author SAP SE
	 * @version 1.71.13
	 *
	 * @constructor
	 * @private
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.threejs.AnimationTimeController
	 * @experimental Since 1.67.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationTimeController = ManagedObject.extend("sap.ui.vk.AnimationTimeController", /** @lends sap.ui.vk.threejs.AnimationTimeController.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			associations: {
				viewport: {
					type: "sap.ui.vk.threejs.Viewport"
				}
			}
		}
	});

	AnimationTimeController.status = { playing : 1, pausing : 2, stopped: 3, completed: 4, dragging: 5, none: 6 };

	/**
	 * Reset parameters when starting a new animation, this function should be called when a new view is activated
	 *
	 * @returns {void}
	 * @private
	 */
	AnimationTimeController.prototype.reset = function() {

		this._totalDuration = 0;
		this._startTime = 0;

		this._currentStatus = AnimationTimeController.status.stopped;
		this._previousStatus = AnimationTimeController.status.none;

		this._previousProgress = 0;
		this._currentProgress = 0;
		this._justStarted = false;
		this._infinite = false;
	};

	AnimationTimeController.prototype.init = function() {
		if (ManagedObject.prototype.init) {
			ManagedObject.prototype.init.call(this);
		}
		this.reset();
	};

	AnimationTimeController.prototype.setInfinite = function(isInfinite) {
		this._infinite = isInfinite;
	};

	AnimationTimeController.prototype.getInfinite = function() {
		return this._infinite;
	};

	/**
	 * Start playing animation, this function should be called when a new animation is initiated
	 *
	 * @param {float} duration total duration of animation
	 * @param {float} dragging true if it's for entering dragging status
	 *
	 * @returns {void}
	 * @private
	 */
	AnimationTimeController.prototype.startAnimation = function(duration, dragging) {
		this._totalDuration = duration;
		this._startTime = Date.now();
		if (this._currentStatus === AnimationTimeController.status.dragging ||
			this._currentStatus === AnimationTimeController.status.pausing || dragging) {
			this._previousProgress = 0;
		} else {
			this._currentStatus = AnimationTimeController.status.playing;
			this._currentProgress = 0;
			this._previousProgress = 0;
		}

		this._justStarted = true;
	};

	/**
	 * Stop playing animation
	 *
	 * @returns {void}
	 * @private
	 */
	AnimationTimeController.prototype.stopAnimation = function() {
		this._currentStatus = AnimationTimeController.status.stopped;
		this._previousStatus =  AnimationTimeController.status.none;
	};

	/**
	 * Checked if animation has stopped playing
	 *
	 * @returns {void}
	 * @private
	 */
	AnimationTimeController.prototype.isAnimationStopped = function() {
		return this._currentStatus === AnimationTimeController.status.stopped;
	};

	/**
	 * Called with animated properties need to be updated, usually in rendering loop.
	 *
	 * @returns {object} result contains two components: delta - time difference between current and previous update,
	 * 													 progress -  playing or pausing if 0 <= progress < 100; restart if progress < -1; finished if progress = 100
	 *
	 * @private
	 */
	AnimationTimeController.prototype.getCurrentStatus = function() {

		if (this._currentStatus === AnimationTimeController.status.playing) {
			// currentTime is in milisecond, progress is between 0 and 100, duration is in second
			var currentTime = Date.now();
			this._currentProgress =  (currentTime - this._startTime) / this._totalDuration / 10;
		} else if (this._currentStatus === AnimationTimeController.status.stopped) {
			this._currentProgress = 0;
			this._previousProgress = 0;
		} else if (this._currentStatus === AnimationTimeController.status.completed) {
			this._currentProgress = 100;
			this._previousProgress = 100;
		}

		if (this._currentProgress >= 100 && !this._infinite) {
			this._currentProgress = 100;
			this._currentStatus = AnimationTimeController.status.completed;
		}

		var result = {};
		result.delta = this._totalDuration * (this._currentProgress - this._previousProgress) / 100;
		if (result.delta < 0) {
			result.progress = -1;
		} else {
			result.progress = this._currentProgress;
		}
		this._previousProgress = this._currentProgress;

		if (this._justStarted && result.delta === 0) {
			result.delta = this._totalDuration * 0.00001; // force update at progress 0
		}

		if (result.delta >= 0) {
			this._justStarted = false;
		}

		return result;
	};

	/**
	 * Pause animation
	 *
	 * @returns {void}
	 * @private
	 */
	AnimationTimeController.prototype.pause = function() {
		if (this._currentStatus === AnimationTimeController.status.playing) {
			this._currentStatus = AnimationTimeController.status.pausing;
			var currentTime = Date.now();
			this._currentProgress =  (currentTime - this._startTime) / this._totalDuration / 10;
		}
	};

	/**
	 * Resume animation playing
	 *
	 * @returns {void}
	 * @private
	 */
	AnimationTimeController.prototype.resume = function() {
		if (this._currentStatus === AnimationTimeController.status.pausing) {
			this._currentStatus = AnimationTimeController.status.playing;
			var currentTime = Date.now();
			this._startTime = currentTime - this._previousProgress * this._totalDuration * 10;
		}
	};

	/**
	 * Drag animation to a progress value
	 *
	 * @param {float} progress a value between 0 and 100
	 *
	 * @private
	 */
	AnimationTimeController.prototype.drag = function(progress) {
		if (this._previousStatus === AnimationTimeController.status.none) {
			this._previousStatus = this._currentStatus;
		}

		this._currentProgress = progress;
		this._currentStatus = AnimationTimeController.status.dragging;
	};

	/**
	 * Complete dragging animation to a progress value
	 *
	 * @param {float} progress a value between 0 and 100
	 *
	 * @private
	 */
	AnimationTimeController.prototype.completeDragging = function(progress) {
		if (this._currentStatus !== AnimationTimeController.status.dragging) {
			return;
		}

		if (this._previousStatus === AnimationTimeController.status.playing) {
			var currentTime = Date.now();
			this._startTime = currentTime - progress * this._totalDuration * 10;
		} else {
			this._currentProgress = progress;
		}

		this._currentStatus = this._previousStatus;
		this._previousStatus = AnimationTimeController.status.none;

		if (this._currentStatus === AnimationTimeController.status.stopped ||
			this._currentStatus === AnimationTimeController.status.completed) {
			this._currentStatus = AnimationTimeController.status.pausing;
		}
	};

	return AnimationTimeController;
});
