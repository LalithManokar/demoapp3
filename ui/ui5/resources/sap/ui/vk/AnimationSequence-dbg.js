/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"./AnimationTrackType",
	"./AnimationRotateType",
	"./AnimationInterpolationType"
], function(jQuery, ManagedObject, AnimationTrackType, AnimationRotateType, AnimationInterpolationType) {
	"use strict";

	/**
	 * Constructor for an animation sequence.
	 *
	 * @class Provides the interface for animation sequence
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.71.13
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.vk.AnimationSequence
	 * @experimental Since 1.67.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationSequence = ManagedObject.extend("sap.ui.vk.AnimationSequence", /** @lends sap.ui.vk.AnimationSequence.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				* string name (optional)
				*/
				name: {
				    type: "string"
				},
				/**
				* sequence id
				*/
				sequenceId: {
				    type: "string"
				}
			},
			events: {
				keyFrameAdded: {
					parameters: {
						/**
						 * id of current sequence.
						 */
						sequenceId: "string",
						/**
						 * reference of target node.
						 */
						targetNodeRef: "object",
						/**
						 * track type.
						 */
						trackType: "sap.ui.vk.AnimationTrackType",
						/**
						 * key frame value, for rotate type, the value is in quaternion form
						 */
						keyFrameValue: "float[]",
						/**
						 * key frame time.
						 */
						keyFrameTime: "float"

					},
					enableEventBubbling: true
				},
				keyFrameUpdated: {
					parameters: {
						/**
						 * id of current sequence.
						 */
						sequenceId: "string",
						/**
						 * reference of target node.
						 */
						targetNodeRef: "object",
						/**
						 * track type.
						 */
						trackType: "sap.ui.vk.AnimationTrackType",
						/**
						 * key frame value, for rotate type, the value is in quaternion form.
						 */
						keyFrameValue: "float[]",
						/**
						 * key frame time.
						 */
						keyFrameTime: "float",
						/**
						 * key frame index.
						 */
						keyFrameIndex: "int"
					},
					enableEventBubbling: true
				},
				keyFrameDeleted: {
					parameters: {
						/**
						 * id of current sequence.
						 */
						sequenceId: "string",
						/**
						 * reference of target node.
						 */
						targetNodeRef: "object",
						/**
						 * track type.
						 */
						trackType: "sap.ui.vk.AnimationTrackType",
						/**
						 * key frame value, for rotate type, the value is in quaternion form.
						 */
						keyFrameValue: "float[]",
						/**
						 * key frame time.
						 */
						keyFrameTime: "float",
						/**
						 * key frame index.
						 */
						keyFrameIndex: "int",
						/**
						 * if the key frame is last, true - the track does not exist any more
						 */
						lastKeyFrame: "boolean"
					},
					enableEventBubbling: true
				}
			}
		}
	});

	/**
	 * Get track
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getTrack
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @returns {object} contain three/six components: times {float[]} array of times
	 * 													values {float[]} array of values
	 * 													interpolation {sap.ui.vk.AnimationInterpolationType} linear, cubic, or discrete
	 * 													rotateType {sap.ui.vk.AnimationRotateType} angleAxis, euler, or quaternion, only for "rotate" track
	 * 													cyclicStart {boolen} (optional) if the track is extended to the start of sequence
	 * 													cyclicEnd {boolean} (optional) if the track is extended to the end of sequence
	 *
	 * @public
	 */

	 /**
	 * Set position tracks
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setPositionTracks
	 * @param {object} target - scene node reference
	 * @param {float[]} timesForRotate array of times for rotate track
	 * @param {float[]} timesForTranslate array of times for translate track
	 * @param {float[]} timesForScale array of times for scale track
	 * @param {sap.ui.vk.AnimationRotateType} rotateType angleAxis, euler, or quaternion
	 * @param {float[]}	rotateValues values for node rotation vectors, every four values for one rotation vector
	 * @param {float[]}	translateValues values for node translation vectors, every three values for one position vector
	 * @param {float[]} scaleValues values for node scale vectors, every three values for one scale vector
	 * @param {float[]} pivot coordinate vector (optional)
	 * @param {sap.ui.vk.AnimationInterpolationType} interpolationForRotate (optional) lieanr, cubic, or discrete, default is linear
	 * @param {sap.ui.vk.AnimationInterpolationType} interpolationForTranslate (optional) lieanr, cubic, or discrete, default is linear
	 * @param {sap.ui.vk.AnimationInterpolationType} interpolationForScale (optional) lieanr, cubic, or discrete, default is linear
	 * @param {object} cyclicInfoForRotate (optional) contain two boolean members cyclicStart and cyclicEnd
	 * 													cyclicStart - if true the key frames will to be extended cyclically to start of animation sequence (time 0)
	 * 													cyclicEnd - if true the key frames will to be extended cyclically to end of animation sequence (time sequence duration)
	 * @param {object} cyclicInfoForTranslate (optional) contain two boolean members cyclicStart and cyclicEnd
	 * @param {object} cyclicInfoForScale (optional) contain two boolean members cyclicStart and cyclicEnd
	 * @public
	 */

	 /**
	 * Get track pivot point
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getTrack
	 * @param {object} target - scene node reference
	 *
	 * @returns {float[]} pivot point coordinates
	 * @public
	 */

	 /**
	 * Set track pivot point, and recalculate corresponding key frames if positional tracks exist
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setPivot
	 *
	 * @param {object} target - scene node reference
	 * @param {float[]} pivot point coordinates
	 *
	 * @public
	 */

	 /**
	 * Set original position, quaternion, and scale which are used to calculate rotate, translate, and scale tracks when no keyframe is specified
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#resetOriginalPosition
	 *
	 * @param {object} target scene node reference
	 * @param {float[]} quaternion for rotation
	 * @param {float[]} position for translation
	 * @param {float[]} scale for scale
	 *
	 * @public
	 */

	/**
	 * Set opacity track
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setOpacityTrack
	 * @param {object} target - scene node reference
	 * @param {float[]} times array of times
	 * @param {float[]} values array of opacity values
	 * @param {sap.ui.vk.AnimationInterpolationType} interpolation (optional) lieanr, cubic, or discrete, default is linear
	 * @param {boolean} isHighlight (optional) if true, the track is used for highlighting
	 * @param {object} cyclicInfo (optional) contain two boolean members cyclicStart and cyclicEnd
	 * 										cyclicStart - if true the key frames will to be extended cyclically to start of animation sequence (time 0)
	 * 										cyclicEnd - if true the key frames will to be extended cyclically to end of animation sequence (time sequence duration)
	 * @public
	 */

	/**
	 * Set color track
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setColorTrack
	 * @param {object} target scene node reference
	 * @param {float[]} times array of times
	 * @param {float[]} values array of color values, three values for each color vector
	 * @param {sap.ui.vk.AnimationInterpolationType} interpolation (optional) lieanr, cubic, or discrete, default is linear
	 * @param {boolean} isHighlight (optional) if true, the track is used for highlighting
	 * @param {object} cyclicInfo (optional) contain two boolean members cyclicStart and cyclicEnd
	 * 								cyclicStart - if true the key frames will to be extended cyclically to start of animation sequence (time 0)
	 * 								cyclicEnd - if true the key frames will to be extended cyclically to end of animation sequence (time sequence duration)
	 * @public
	 */


	/**
	 * Get interpolation type
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getInterpolation
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @returns {sap.ui.vk.AnimationInterpolationType} lieanr, cubic, or discrete
	 * @public
	 */

	/**
	 * set interpolation type
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setInterpolation
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @param {sap.ui.vk.AnimationInterpolationType} interpolation (optional) lieanr, cubic, or discrete
	 * @public
	 */

	 /**
	 * set track cyclic style
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setTrackCyclicStyle
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @param {boolean} cyclicStart if true, extend track to the start of sequence cyclically
	 * @param {boolean} cyclicEnd if true, extend track to the end of sequence cyclically
	 * @public
	 */

	/**
	 * Get the key frame whose time is nearest to the parameter
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getNearestKeyFrame
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @param {float} time The time
	 * @param {float} threshold if set, the time of the nearest key frame must be between time - threshold and time + threshold
	 * @returns {object} contains four/five components:
	 * 						index (int) - index of key frame
	 *						time {float} - actual time in track
	 *						value (float[]) - key frame value
	 * 					  	interpolation {sap.ui.vk.AnimationInterpolationType} linear, cubic, or discrete
	 * 						rotateType {sap.ui.vk.AnimationRotateType} angleAxis, euler, or quaternion, only for "rotate" track
	 * @public
	 */

	/**
	 * add a key frame
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#addKeyFrame
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @param {float} time of key frame
	 * @param {float[]} value property vector
	 * @param {sap.ui.vk.AnimationRotateType} rotateType angleAxis, euler, or quaternion, only for "rotate" track
	 * @param {boolean} notFireEvent optional if fire keyFrameAdded event
	 * @public
	 */

	/**
	 * delete a key frame
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#deleteKeyFrame
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @param {int} index index of key frame
	 * @param {boolean} notFireEvent optional if fire keyFrameDeleted event
	 * @public
	 */

	 /**
	 * Update a key frame
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#updateKeyFrame
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @param {int} index index of postion Key frames
	 * @param {float} time of key frame
	 * @param {float[]}	value property
	 * @param {boolean} notFireEvent optional if fire keyFrameUpdated event
	 * @public
	 */

	/**
	 * add a key frame using current node property
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#addKeyFrameByNodeProperty
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @param {float} time of the key frame
	 * @param {boolean} notFireEvent optional if fire keyFrameAdded event
	 * @public
	 */

	/**
	 * update a key frame using current node property
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#updateKeyFrameByNodeProperty
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @param {float} time of key frame
	 * @param {int} index Index of key frame to be updated
	 * @param {boolean} notFireEvent optional if fire keyFrameUpdated event
	 * @public
	 */

	/**
	 * Get values of node properties at the end of animation sequence
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getNodesEndValues
	 * @returns {Map} Map of scene node reference and object that may contain node position
	 * 					node rotation, node scale, node opacity, and node color
	 * @public
	 */

	/**
	 * Get values of node properties at the start of animation sequence
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getNodesStartValues
	 * @returns {Map} Map of scene node reference and object that may contain node position
	 * 					node rotation, node scale, node opacity, and node color
	 * @public
	 */

	/**
	 * Check if the animation sequence contains any track representing highlight
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#hasHighlight
	 *
	 * @returns {boolean} true if having highlight track
	 *
	 * @public
	 */


	/**
	 * Set the animation sequence contains track representing highlight
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setHasHighlight
	 *
	 * @param {boolean} hasHighlight true if the animation sequence contains track representing highlight
	 *
	 * @public
	 */

	/**
	 * clone from another sequence
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#clone
	 *
	 * @param {sap.ui.vk.AnimationSequence} sequence animation sequence to be cloned
	 * @param {boolean} includeHighlight optional if cloning the tracks representing highlights
	 *
	 * @public
	 */

	/**
	 * Get duration of animation sequence
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getDuration
	 *
	 * @return {float} time of animation sequence duration
	 * @public
	 */

	/**
	 * Set the values of animated properties between the start time of sequence and the start times of corresponding tracks
	 * to the values of target nodes' properties
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setInitialStatusToTargetNodesValues
	 *
	 * @public
	 */

	/**
	 * Set duration of animation sequence, the key frames outside duration are not used for animation
	 * Should be called before adding key frame data
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setDuration
	 *
	 * @param {float} duration of animation sequence
	 * @public
	 */

	/**
	 * Get native animation clip
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getNativeAnimationClip
	 *
	 * @return {object} native animation sequence clip
	 * @public
	 */

	return AnimationSequence;
});

