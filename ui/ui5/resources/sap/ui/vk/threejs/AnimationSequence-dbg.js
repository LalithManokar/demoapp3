/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"jquery.sap.global",
	"../AnimationSequence",
	"../AnimationTrackType",
	"../AnimationRotateType",
	"../AnimationInterpolationType"
], function(jQuery, AnimationSequenceBase, AnimationTrackType, AnimationRotateType, AnimationInterpolationType) {
	"use strict";

	/**
	 * Constructor for an animation sequence.
	 *
	 * @class Provides the definition for animation sequence
	 *
	 * @param {string} name
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.71.13
	 * @extends sap.ui.vk.AnimationSequence
	 * @alias sap.ui.vk.threejs.AnimationSequence
	 * @experimental Since 1.67.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationSequence = AnimationSequenceBase.extend("sap.ui.vk.threejs.AnimationSequence", /** @lends sap.ui.vk.threejs.AnimationSequence.prototype */ {
		metaData: {
		},

		constructor: function(id, name, duration) {
			AnimationSequenceBase.call(this);
			var tracks = [];
			this._animationClip  = new THREE.AnimationClip(name, -1, tracks);

			if (duration) {
				this._duration = duration;
				this._animationClip.duration = duration;
			} else {
				this._duration = 0;
			}
			this._nodesEndData = new Map();
			this._nodesStartData = new Map();
			this._nodesPositionTracksMap = new Map();
			this._nodesOpacityTrackMap = new Map();
			this._nodesColorTrackMap = new Map();
			this._hasHighlight = false;

			this.setName(name);
			this.setSequenceId(id);
		}
	});

	var MIN_STEPS_FOR_ROTATION = 4;


	AnimationSequence.prototype._getMatrixFromEulerRotationAngles = function(x, y, z, order) {
        var getMatrixFromEulerRotationAngle = function(angle,  axis) {
            var c = Math.cos(angle);
            var s = Math.sin(angle);

            var m11 = 1;
            var m12 = 0;
            var m13 = 0;

            var m21 = 0;
            var m22 = 1;
            var m23 = 0;

            var m31 = 0;
            var m32 = 0;
            var m33 = 1;

            if (axis === 0) {
                m22 = c;
                m23 = -s;
                m32 = s;
                m33 = c;
            } else if (axis === 1) {
                m11 = c;
                m13 = s;
                m31 = -s;
                m33 = c;
            } else {
                m11 = c;
                m12 = -s;
                m21 = s;
                m22 = c;
            }
            var m = new THREE.Matrix4();
            m.set(m11, m12, m13, 0, m21, m22, m23, 0, m31, m32, m33, 0, 0, 0, 0, 1);
            return m;
        };

        order = Math.round(order);
        var rm = new THREE.Matrix4();
        var m0;
        for (var oi = 0; oi < 3; oi++){
			var i = (order >> (oi * 2)) & 3;
			var angle = z;
			if (i === 0) {
				angle = x;
			} else if (i === 1) {
				angle = y;
			}
            m0 = getMatrixFromEulerRotationAngle(angle, i);
            rm.premultiply(m0);
        }
        return rm;
    };

	AnimationSequence.prototype._getRotationMatrix = function(index1, index2, rotationValues, type, blendFactor) {

		var x, y, z;
		var v1, v2;
		if (type === AnimationRotateType.euler) {
			v1 = [ rotationValues[index1 * 4], rotationValues[index1 * 4 + 1], rotationValues[index1 * 4 + 2], rotationValues[index1 * 4 + 3] ];
			if (index1 === index2) {
				return this._getMatrixFromEulerRotationAngles(v1[0], v1[1], v1[2], v1[3]);
			}

			v2 = [ rotationValues[index2 * 4], rotationValues[index2 * 4 + 1], rotationValues[index2 * 4 + 2], rotationValues[index2 * 4 + 3] ];

			var order = v1[3];
			x = v1[0] * (1 - blendFactor) + v2[0] * blendFactor;
			y = v1[1] * (1 - blendFactor) + v2[1] * blendFactor;
			z = v1[2] * (1 - blendFactor) + v2[2] * blendFactor;
			return this._getMatrixFromEulerRotationAngles(x, y, z, order);
		} else if (type === AnimationRotateType.angleAxis) {
			var rm1 = new THREE.Matrix4();

			var angle, axis, tempRm;
			for (var ri = 0; ri <= index1; ri++) {
				x = rotationValues[ri * 4];
				y = rotationValues[ri * 4 + 1];
				z = rotationValues[ri * 4 + 2];
				angle = rotationValues[ri * 4 + 3];
				axis = new THREE.Vector3(x, y, z);
				tempRm = new THREE.Matrix4();
				tempRm.makeRotationAxis(axis, angle);
				rm1.premultiply(tempRm);
			}

			if (index1 === index2) {
				return rm1;
			}

			x = rotationValues[index2 * 4];
			y = rotationValues[index2 * 4 + 1];
			z = rotationValues[index2 * 4 + 2];
			angle = rotationValues[index2 * 4 + 3] * blendFactor;

			axis = new THREE.Vector3(x, y, z);
			var rm2 = new THREE.Matrix4();
			rm2.makeRotationAxis(axis, angle);

			rm2.multiply(rm1);
			return rm2;
		} else {
			var quat;
            v1 = [ rotationValues[index1 * 4], rotationValues[index1 * 4 + 1], rotationValues[index1 * 4 + 2], rotationValues[index1 * 4 + 3] ];
            if (index1 === index2) {
                quat = new THREE.Quaternion(v1[0], v1[1], v1[2], v1[3]);
            }
            var rm = new THREE.Matrix4();

            if (quat) {
                rm.makeRotationFromQuaternion(quat);
                return rm;
            }

            v2 = [ rotationValues[index2 * 4], rotationValues[index2 * 4 + 1], rotationValues[index2 * 4 + 2], rotationValues[index2 * 4 + 3] ];

			var EPSILON = 0.001;
			var beta;         		// complementary interp parameter
			var theta;          	// angle between A and B
			var phi;        		// theta plus spins
			var bFlip;    			// use negation of B?
			var x1 = v1[0];
			var y1 = v1[1];
			var z1 = v1[2];
			var w1 = v1[3];
			var x2 = v2[0];
			var y2 = v2[1];
			var z2 = v2[2];
			var w2 = v2[3];

			var cost;
			var sint;

			cost = x1 * x2 + y1 * y2 + z1 * z2 + w1 * w2;

			// if B is on opposite hemisphere from A, use -B instead

			if (cost < 0.0) {
				cost = -cost;
				bFlip = true;
			} else {
				bFlip = false;
			}

			if (cost > 1.0) {
				cost = 1.0;
			}

			// if B is (within precision limits) the same as A,
			// * just linear interpolate between A and B.
			// * Can't do spins, since we don't know what direction to spin.

			if ((1.0 - cost) < EPSILON) {
				beta = 1.0 - blendFactor;
			} else {// normal case
				theta = Math.acos(cost);
				phi = theta;
				sint = Math.sin(theta);
				beta = Math.sin(theta - blendFactor * phi) / sint;
				blendFactor = Math.sin(blendFactor * phi) / sint;
			}

			if (bFlip) {
				blendFactor = -blendFactor;
			}

			// interpolate
			x = beta * x1 + blendFactor * x2;
			y = beta * y1 + blendFactor * y2;
			z = beta * z1 + blendFactor * z2;
			var w = beta * w1 + blendFactor * w2;

			quat = new THREE.Quaternion(x, y, z, w);
			rm.makeRotationFromQuaternion(quat);
			return rm;
		}
	};

	AnimationSequence.prototype._getScaleMatrix = function(vector1, vector2, blendFactor) {
		var xs = 1, ys = 1, zs = 1;
		if (vector1 && !vector2) {
			xs = vector1[0];
			ys = vector1[1];
			zs = vector1[2];
		} else if (!vector1 && vector2) {
			xs = vector2[0];
			ys = vector2[1];
			zs = vector2[2];
		} else if (vector1 && vector2) {
			xs = vector1[0] * (1 - blendFactor) + vector2[0] * blendFactor;
			ys = vector1[1] * (1 - blendFactor) + vector2[1] * blendFactor;
			zs = vector1[2] * (1 - blendFactor) + vector2[2] * blendFactor;
		}

		var sm = new THREE.Matrix4();
		sm.makeScale(xs, ys, zs);
		return sm;
	};

	AnimationSequence.prototype._getTranslateMatrix = function(vector1, vector2, blendFactor) {
		var x = 0, y = 0, z = 0;
		if (vector1 && !vector2) {
			x = vector1[0];
			y = vector1[1];
			z = vector1[2];
		} else if (!vector1 && vector2) {
			x = vector2[0];
			y = vector2[1];
			z = vector2[2];
		} else if (vector1 && vector2) {
			x = vector1[0] * (1 - blendFactor) + vector2[0] * blendFactor;
			y = vector1[1] * (1 - blendFactor) + vector2[1] * blendFactor;
			z = vector1[2] * (1 - blendFactor) + vector2[2] * blendFactor;
		}

		var tm = new THREE.Matrix4();
		tm.makeTranslation(x, y, z);
		return tm;
	};

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
	AnimationSequence.prototype.getTrack = function(target, trackType) {
		var tracks = this._nodesPositionTracksMap.get(target);
		var track;
		if (trackType === AnimationTrackType.scale && tracks && tracks.scale && tracks.scale.times && tracks.scale.times.length) {
			track = {};
			track.times = tracks.scale.times.slice();
			track.values = tracks.scale.values.slice();
			track.interpolation = tracks.scale.interpolation;
			track.cyclicEnd = tracks.scale.cyclicEnd;
			track.cyclicStart = tracks.scale.cyclicStart;
		} else if (trackType === AnimationTrackType.translate && tracks && tracks.translate && tracks.translate.times && tracks.translate.times.length) {
			track = {};
			track.times = tracks.translate.times.slice();
			track.values = tracks.translate.values.slice();
			track.interpolation = tracks.translate.interpolation;
			track.cyclicEnd = tracks.translate.cyclicEnd;
			track.cyclicStart = tracks.translate.cyclicStart;
		} else if (trackType === AnimationTrackType.rotate && tracks && tracks.rotate && tracks.rotate.times && tracks.rotate.times.length) {
			track = {};
			track.times = tracks.rotate.times.slice();
			track.values = tracks.rotate.values.slice();
			track.interpolation = tracks.rotate.interpolation;
			track.rotateType = tracks.rotate.rotateType;
			track.cyclicEnd = tracks.rotate.cyclicEnd;
			track.cyclicStart = tracks.rotate.cyclicStart;
		} else if (trackType === AnimationTrackType.opacity) {
			var opacityTrack = this._nodesOpacityTrackMap.get(target);
			if (opacityTrack) {
				track = {};
				track.times = opacityTrack.times.slice();
				track.values = opacityTrack.values.slice();
				track.interpolation = opacityTrack.interpolation;
				track.cyclicEnd = opacityTrack.cyclicEnd;
				track.cyclicStart = opacityTrack.cyclicStart;
			}
		} else if (trackType === AnimationTrackType.color) {
			var colorTrack = this._nodesColorTrackMap.get(target);
			if (colorTrack) {
				track = {};
				track.times = colorTrack.times.slice();
				track.values = colorTrack.values.slice();
				track.interpolation = colorTrack.interpolation;
				track.cyclicEnd = colorTrack.cyclicEnd;
				track.cyclicStart = colorTrack.cyclicStart;
			}
		}
		return track;
	};

	AnimationSequence.prototype._resetDuration = function() {
		this._animationClip.resetDuration();
		if (this._duration > 0) {
			this._animationClip.duration = this._duration;
		}
	};

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
	 AnimationSequence.prototype.setPositionTracks = function(target,
																timesForRotate,
																timesForTranslate,
																timesForScale,
																rotateType,
																rotateValues,
																translateValues,
																scaleValues,
																pivot,
																interpolationForRotate,
																interpolationForTranslate,
																interpolationForScale,
																cyclicInfoForRotate,
																cyclicInfoForTranslate,
																cyclicInfoForScale) {
		if (!target) {
			return;
		}

		var tracks = this._nodesPositionTracksMap.get(target);
		if (!tracks) {
			tracks = {};
			tracks.rotate = {};
			tracks.translate = {};
			tracks.scale = {};
		}
		var dataExist = false;

		if (timesForRotate && rotateValues && timesForRotate.length > 0 && timesForRotate.length * 4 === rotateValues.length) {
			tracks.rotate.times = timesForRotate.slice();
			tracks.rotate.values = rotateValues.slice();
			tracks.rotate.rotateType = rotateType;
			if (interpolationForRotate) {
				tracks.rotate.interpolation = interpolationForRotate;
			} else {
				tracks.rotate.interpolation = AnimationInterpolationType.linear;
			}
			dataExist = true;

			if (cyclicInfoForRotate) {
				tracks.rotate.cyclicStart = cyclicInfoForRotate.cyclicStart;
				tracks.rotate.cyclicEnd = cyclicInfoForRotate.cyclicEnd;
			}
		}

		if (timesForTranslate && translateValues && timesForTranslate.length > 0 && timesForTranslate.length * 3 === translateValues.length) {
			tracks.translate.times = timesForTranslate.slice();
			tracks.translate.values = translateValues.slice();
			if (interpolationForTranslate) {
				tracks.translate.interpolation = interpolationForTranslate;
			} else {
				tracks.translate.interpolation = AnimationInterpolationType.linear;
			}
			dataExist = true;

			if (cyclicInfoForTranslate) {
				tracks.translate.cyclicStart = cyclicInfoForTranslate.cyclicStart;
				tracks.translate.cyclicEnd = cyclicInfoForTranslate.cyclicEnd;
			}
		}

		if (timesForScale && scaleValues && timesForScale.length > 0 && timesForScale.length * 3 === scaleValues.length) {
			tracks.scale.times = timesForScale.slice();
			tracks.scale.values = scaleValues.slice();
			if (interpolationForScale) {
				tracks.scale.interpolation = interpolationForScale;
			} else {
				tracks.scale.interpolation = AnimationInterpolationType.linear;
			}
			dataExist = true;

			if (cyclicInfoForScale) {
				tracks.scale.cyclicStart = cyclicInfoForScale.cyclicStart;
				tracks.scale.cyclicEnd = cyclicInfoForScale.cyclicEnd;
			}
		}

		if (!dataExist) {
			return;
		}

		if (pivot) {
			tracks.pivot = pivot.slice();
		}

		this._nodesPositionTracksMap.set(target, tracks);

		this._setNativePositionTracks(target);
		this._resetDuration();
	};

	/**
	 * Get track pivot point
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getPivot
	 * @param {object} target - scene node reference
	 *
	 * @returns {float[]} pivot point coordinates
	 * @public
	 */
	AnimationSequence.prototype.getPivot = function(target) {
		var pivot;
		var tracks = this._nodesPositionTracksMap.get(target);
		if (tracks && tracks.pivot) {
			pivot = tracks.pivot.slice();
		}
		return pivot;
	};

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
	AnimationSequence.prototype.setPivot = function(target, pivot) {

		var tracks = this._nodesPositionTracksMap.get(target);

		if (!tracks) {
			return;
		}

		tracks.pivot = pivot.slice();

		this._setNativePositionTracks(target);
		this._resetDuration();
	};

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
	AnimationSequence.prototype.resetOriginalPosition = function(target, quaternion, position, scale) {

		var tracks = this._nodesPositionTracksMap.get(target);

		if (!tracks) {
			return;
		}

		if (!tracks.originalData) {
			tracks.originalData = {};
		}

		if (quaternion) {
			tracks.originalData.quaternion = new THREE.Quaternion(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
		} else if (!tracks.originalData.quaternion) {
			tracks.originalData.quaternion = target.quaternion.clone();
		}

		if (position) {
			tracks.originalData.position = new THREE.Vector3(position[0], position[1], position[2]);
		} else if (!tracks.originalData.position) {
			tracks.originalData.position = target.position.clone();
		}

		if (scale) {
			tracks.originalData.scale = new THREE.Vector3(scale[0], scale[1], scale[2]);
		} else if (!tracks.originalData.scale) {
			tracks.originalData.scale = target.scale.clone();
		}

		this._setNativePositionTracks(target);
	};

	AnimationSequence.prototype._extendTrackForCyclicStart = function(times, values, tCopy, vCopy) {
		if (!times || times.length === 0 || !values || values.length === 0) {
			return;
		}

		var interval = vCopy.length / tCopy.length;
		var start = times[0];

		var ki, vi;
		while (start > 0) {
			var maxDis = 0;
			for (ki = tCopy.length - 1; ki >= 0; --ki) {
				var dis = 0;
				if (tCopy.length !== 1) {
					if (ki === tCopy.length - 1) {
						dis = 0;
					} else {
						dis = tCopy[ki + 1] - tCopy[ki];
					}
					start = start - dis;

					if (dis > maxDis) {
						maxDis = dis;
					}
				} else { // only one key frame
					start = 0;
				}

				for (vi = interval - 1; vi >= 0; vi--) {
					values.unshift(vCopy[ki * interval + vi]);
				}

				if (start >= 0){
					times.unshift(start);
				} else {
					times.unshift(0);
					break;
				}
			}

			if (start > 0 && Math.abs(maxDis - 0) < 1e-6) { // cannot move forward
				start = 0;
				times.unshift(start);
				for (vi = interval - 1; vi >= 0; vi--) {
					values.unshift(vCopy[vi]);
				}
			}
		}
	};

	AnimationSequence.prototype._extendTrackForCyclicEnd = function(times, values, tCopy, vCopy) {
		if (!times || times.length === 0 || !values || values.length === 0) {
			return;
		}

		var interval = vCopy.length / tCopy.length;
		var end = times[times.length - 1];

		var duration = this.getDuration();
		var ki, vi;
		while (end < duration) {
			var maxDis = 0;
			for (ki = 0; ki < tCopy.length; ++ki) {
				var dis = 0;
				if (tCopy.length !== 1) {
					if (ki === 0){
						dis = 0.0;
					} else {
						dis = tCopy[ki] - tCopy[ki - 1];
					}
					end = end + dis;

					if (dis > maxDis) {
						maxDis = dis;
					}
				} else { // only one key frame
					end = duration;
				}

				for (vi = 0; vi < interval; vi++) {
					values.push(vCopy[ki * interval + vi]);
				}
				times.push(end);

				if (end >= duration){
					break;
				}
			}

			if (end < duration && Math.abs(maxDis - 0) < 1e-6) { // cannot move forward
				end = duration;
				times.push(end);
				for (vi = interval; vi > 0; vi--) {
					values.push(vCopy[vCopy.length - vi]);
				}
			}
		}
	};

	AnimationSequence.prototype._resetRotateTimes = function(rotateTimes, rotateValues, rotateType, translateTimes, scaleTimes) {
		var times = [];

		if (!rotateTimes || rotateTimes.length === 0) {
			return times;
		}

		var maxInterval = Math.PI / 6;
		var stepN, ki;
		times.push(rotateTimes[0]);
		for (ki = 1; ki < rotateTimes.length; ki++) {
			var t1 = rotateTimes[ki - 1];
			var t2 = rotateTimes[ki];
			if (rotateType === AnimationRotateType.angleAxis) {
				var angle = rotateValues[ki * 4 + 3];
				stepN = Math.ceil(angle / maxInterval);
			} else if (rotateType === AnimationRotateType.euler) {
				var maxRange = 0;
				for (var ai = 0; ai < 3; ai++) {
					var dis = Math.abs(rotateValues[(ki) * 4 + ai] - rotateValues[(ki - 1) * 4 + ai]);
					if (maxRange < dis) {
						maxRange = dis;
					}
				}
				stepN = Math.ceil(maxRange / maxInterval);
			} else {
				stepN = Math.ceil((t2 - t1) / 0.25);
				if (stepN < MIN_STEPS_FOR_ROTATION) {
					stepN = MIN_STEPS_FOR_ROTATION;
				}
			}

			if (stepN < 2) {
				times.push(t2);
				continue;
			}

			var step = (t2 - t1) / stepN;

			if (Math.abs(step) < 1e-6) {
				times.push(t2);
				continue;
			}

			for (var si = 1; si < stepN; si++) {
				times.push(t1 + si * step);
			}
			times.push(t2);
		}

		var ti;
		var start, end;
		if (translateTimes) {
			start = times[0];
			end = times[times.length - 1];
			for (ti = 0; ti < translateTimes.length; ti++) {
				if (translateTimes[ti] > end + 1e-6) {
					times.push(translateTimes[ti]);
				}
			}
			for (ti = translateTimes.length - 1; ti >= 0; ti--) {
				if (translateTimes[ti] < start - 1e-6) {
					times.unshift(translateTimes[ti]);
				}
			}
		}

		if (scaleTimes) {
			start = times[0];
			end = times[times.length - 1];
			for (ti = 0; ti < scaleTimes.length; ti++) {
				if (scaleTimes[ti] > end + 1e-6) {
					times.push(scaleTimes[ti]);
				}
			}
			for (ti = scaleTimes.length - 1; ti >= 0; ti--) {
				if (scaleTimes[ti] < start - 1e-6) {
					times.unshift(scaleTimes[ti]);
				}
			}
		}

		return times;
	};

	AnimationSequence.prototype._setNativePositionTracks = function(target) {
		var tracks = this._nodesPositionTracksMap.get(target);

		if (!tracks) {
			return;
		}

		if (!tracks.originalData) {
			tracks.originalData = {};
			tracks.originalData.quaternion = target.quaternion.clone();
			tracks.originalData.position = target.position.clone();
			tracks.originalData.scale = target.scale.clone();
		}

		var ki, track;
		if (tracks.scale.nativeTrack) {
			for (ki = 0;  ki < this._animationClip.tracks.length; ki++) {
				track = this._animationClip.tracks[ki];
				if (track === tracks.scale.nativeTrack) {
					this._animationClip.tracks.splice(ki, 1);
					break;
				}
			}
		}

		if (tracks.rotate.nativeTrack) {
			for (ki = 0;  ki < this._animationClip.tracks.length; ki++) {
				track = this._animationClip.tracks[ki];
				if (track === tracks.rotate.nativeTrack) {
					this._animationClip.tracks.splice(ki, 1);
					break;
				}
			}
		}

		if (tracks.translate.nativeTrack) {
			for (ki = 0;  ki < this._animationClip.tracks.length; ki++) {
				track = this._animationClip.tracks[ki];
				if (track === tracks.translate.nativeTrack) {
					this._animationClip.tracks.splice(ki, 1);
					break;
				}
			}
		}

		var nodeEndData = this._nodesEndData.get(target);
		var nodeStartData = this._nodesStartData.get(target);
		if (nodeEndData) {
			nodeEndData.position = null;
			nodeEndData.scale = null;
			nodeEndData.quaternion = null;
		}

		if (nodeStartData) {
			nodeStartData.position = null;
			nodeStartData.scale = null;
			nodeStartData.quaternion = null;
		}

		if ((!tracks.rotate.times || tracks.rotate.times.length === 0) &&
			(!tracks.scale.times || tracks.scale.times.length === 0) &&
			(!tracks.translate.times || tracks.translate.times.length === 0)) {
			this._nodesPositionTracksMap.delete(target);
			return;
		}

		// for streaming reading, the node with offset geometry (for object matrix) should have zero pivot
		var hasOffsetGeometry = function(node) {
			var hasOffset = false;
			var offsetName = node.name + " offset geometry";
			for (var ci = 0; ci < node.children.length; ci++) {
				var child = node.children[ci];
				if (child.name === offsetName && child.type === "Group") {
					hasOffset = true;
					break;
				}
				var childOffsetName = child.name + " offset geometry";
				for (var cci = 0; cci < child.children.length; cci++) {
					var grandChild = child.children[cci];
					if (grandChild.name === childOffsetName && grandChild.type === "Group") {
						hasOffset = true;
						break;
					}
				}
				if (hasOffset) {
					break;
				}
			}
			return hasOffset;
		};

		var hasZeroPivot = false;
		var pivot;
		if (tracks.pivot) {
			pivot = tracks.pivot.slice();
			var needZeroPivot = false;
			if (target.children) {
				needZeroPivot = hasOffsetGeometry(target);
				if (!needZeroPivot) {
					for (var ci = 0; ci < target.children.length; ci++) {
						var child = target.children[ci];
						if (child.isMesh) {  // matai.js file reading - object matrix is placed in the mesh node
							var pv = new THREE.Vector3(pivot[0], pivot[1], pivot[2]);
							pv.applyMatrix4(child.matrix);
							pivot[0] = pv.x;
							pivot[1] = pv.y;
							pivot[2] = pv.z;
							needZeroPivot = false;
							break;
						}
					}
				}
			}
			if (needZeroPivot) {
				hasZeroPivot = true;
			}
		} else {
			hasZeroPivot = true;
		}

		if (!hasZeroPivot) {
			if (Math.abs(pivot[0] - 0.0) < 1e-6 && Math.abs(pivot[1] - 0.0) < 1e-6 && Math.abs(pivot[2] - 0.0) < 1e-6) {
				hasZeroPivot = true;
			}
		}

		var rotateTimes, rotateValues;
		if (tracks.rotate.times && tracks.rotate.times.length > 0) {

			rotateTimes = tracks.rotate.times.slice(0);
			rotateValues = tracks.rotate.values.slice(0);
		}

		var translateTimes, translateValues;
		if (tracks.translate.times && tracks.translate.times.length > 0) {

			translateTimes = tracks.translate.times.slice(0);
			translateValues = tracks.translate.values.slice(0);
		}

		var scaleTimes, scaleValues;
		if (tracks.scale.times && tracks.scale.times.length > 0) {

			scaleTimes = tracks.scale.times.slice(0);
			scaleValues = tracks.scale.values.slice(0);
		}

		var startTime;

		if (rotateTimes) {
			if (startTime === undefined || startTime > rotateTimes[0]) {
				startTime = rotateTimes[0];
			}
		}

		if (translateTimes && !hasZeroPivot) {
			if (startTime === undefined || startTime > translateTimes[0]) {
				startTime = translateTimes[0];
			}
		}

		if (scaleTimes && !hasZeroPivot) {
			if (startTime === undefined || startTime > scaleTimes[0]) {
				startTime = scaleTimes[0];
			}
		}

		if (!rotateTimes) {
			if (!hasZeroPivot) {
				rotateTimes = [ startTime ];
				rotateValues = [ tracks.originalData.quaternion.x, tracks.originalData.quaternion.y, tracks.originalData.quaternion.z, tracks.originalData.quaternion.w ];
				tracks.rotate.rotateType = AnimationRotateType.quaternion;
				tracks.rotate.interpolation = AnimationInterpolationType.linear;
			}
		}

		if (!translateTimes) {
			if (!hasZeroPivot) {
				translateTimes = [ startTime ];
				translateValues = [ tracks.originalData.position.x, tracks.originalData.position.y, tracks.originalData.position.z ];
				tracks.translate.interpolation = AnimationInterpolationType.linear;
			}
		}

		if (!scaleTimes) {
			if (!hasZeroPivot) {
				scaleTimes = [ startTime ];
				scaleValues = [ tracks.originalData.scale.x, tracks.originalData.scale.y, tracks.originalData.scale.z ];
				tracks.scale.interpolation = AnimationInterpolationType.linear;
			}
		}

		var name = target.uuid;

		var qtimes = [];
		if (rotateTimes) {
			qtimes = this._resetRotateTimes(rotateTimes, rotateValues, tracks.rotate.rotateType, translateTimes, scaleTimes);
		}
		var ptimes = [];
		var pvalues = [];
		var qvalues = [];
		var svalues = [];
		var stimes = [];

		var mt1 = new THREE.Matrix4();
		var mt2 = new THREE.Matrix4();
		if (!hasZeroPivot) {
			mt1.makeTranslation(pivot[0], pivot[1], pivot[2]);
			mt2.makeTranslation(-pivot[0], -pivot[1], -pivot[2]);
		}

		var rotationMatrix = new THREE.Matrix4();
		var scaleMatrix = new THREE.Matrix4();
		var positionMatrix = new THREE.Matrix4();

		var t1, t2, si;

		for (si = 0; si < qtimes.length; si++) {
			var currentTime = qtimes[si];
			var index1 = 0;
			var index2 = 0;
			var blendFactor = 0;
			if (rotateTimes) {
				if (currentTime <= rotateTimes[0]) {
					index1 = 0;
					index2 = 0;
				} else if (currentTime >= rotateTimes[rotateTimes.length - 1]){
					if (rotateTimes.length > 1) {
						blendFactor = 1;
					}
					index1 = rotateTimes.length - 1;
					index2 = rotateTimes.length - 1;
				} else {
					for (ki = 0; ki < rotateTimes.length - 1; ki++) {
						t1 = rotateTimes[ki];
						t2 = rotateTimes[ki + 1];
						if (currentTime >= t1 && currentTime <= t2){
							blendFactor = (currentTime - t1) / (t2 - t1);
							index1 = ki;
							index2 = ki + 1;
							break;
						}
					}
				}

				rotationMatrix = this._getRotationMatrix(index1, index2, rotateValues, tracks.rotate.rotateType, blendFactor);
			}

			var scaleVector1 = null;
			var scaleVector2 = null;
			blendFactor = 0;
			if (scaleTimes) {
				if (currentTime <= scaleTimes[0]) {
					scaleVector1 = [ scaleValues[0], scaleValues [1], scaleValues[2] ];
				} else if (currentTime >= scaleTimes[scaleTimes.length - 1]){
					scaleVector2 = [ scaleValues[scaleValues.length - 3],
					scaleValues[scaleValues.length - 2],
					scaleValues[scaleValues.length - 1] ];
				} else {
					for (ki = 0; ki < scaleTimes.length - 1; ki++) {
						t1 = scaleTimes[ki];
						t2 = scaleTimes[ki + 1];
						if (currentTime >= t1 && currentTime <= t2){
							scaleVector1 = [ scaleValues[ki * 3], scaleValues[ki * 3 + 1], scaleValues[ki * 3 + 2] ];
							scaleVector2 = [ scaleValues[ki * 3 + 3], scaleValues[ki * 3 + 4], scaleValues[ki * 3 + 5] ];
							blendFactor = (currentTime - t1) / (t2 - t1);
							break;
						}
					}
				}

				scaleMatrix = this._getScaleMatrix(scaleVector1, scaleVector2, blendFactor);
			}

			var positionVector1 = null;
			var positionVector2 = null;
			blendFactor = 0;
			if (translateTimes) {
				if (currentTime <= translateTimes[0]) {
					positionVector1 = [ translateValues[0], translateValues[1], translateValues[2] ];
				} else if (currentTime >= translateTimes[translateTimes.length - 1]) {
					positionVector2 = [ translateValues[translateValues.length - 3],
					translateValues[translateValues.length - 2],
					translateValues[translateValues.length - 1] ];
				} else {
					for (ki = 0; ki < translateTimes.length - 1; ki++) {
						t1 = translateTimes[ki];
						t2 = translateTimes[ki + 1];
						if (currentTime >= t1 && currentTime <= t2){
							positionVector1 = [ translateValues[ki * 3], translateValues[ki * 3 + 1], translateValues[ki * 3 + 2] ];
							positionVector2 = [ translateValues[ki * 3 + 3], translateValues[ki * 3 + 4], translateValues[ki * 3 + 5] ];
							blendFactor = (currentTime - t1) / (t2 - t1);
							break;
						}
					}
				}

				positionMatrix = this._getTranslateMatrix(positionVector1, positionVector2, blendFactor);
			}
			var m = new THREE.Matrix4();
			// m.multiply(mt1);
			m.multiply(positionMatrix);
            m.multiply(rotationMatrix);
            m.multiply(scaleMatrix);
			m.multiply(mt2);

			var quat = new THREE.Quaternion();
			var posi = new THREE.Vector3();
			var scal = new THREE.Vector3();
			m.decompose(posi, quat, scal);

			qvalues.push(quat.x, quat.y, quat.z, quat.w);
			// qtimes.push(currentTime);
			if (!hasZeroPivot) {
				pvalues.push(posi.x, posi.y, posi.z);
				svalues.push(scal.x, scal.y, scal.z);
				ptimes.push(currentTime);
				stimes.push(currentTime);
			}
		}

		if (hasZeroPivot) {
			pvalues = translateValues;
			ptimes = translateTimes;
			svalues = scaleValues;
			stimes = scaleTimes;
		}

		var tCopy, vCopy;
		if (rotateTimes && (tracks.rotate.cyclicStart || tracks.rotate.cyclicEnd)) {
			tCopy = qtimes.slice(0);
			vCopy = qvalues.slice(0);

			if (tracks.rotate.cyclicStart) {
				this._extendTrackForCyclicStart(qtimes, qvalues, tCopy, vCopy);
			}
			if (tracks.rotate.cyclicEnd) {
				this._extendTrackForCyclicEnd(qtimes, qvalues, tCopy, vCopy);
			}
		}

		if (translateTimes && (tracks.translate.cyclicStart || tracks.translate.cyclicEnd)) {
			tCopy = ptimes.slice(0);
			vCopy = pvalues.slice(0);

			if (tracks.translate.cyclicStart) {
				this._extendTrackForCyclicStart(ptimes, pvalues, tCopy, vCopy);
			}
			if (tracks.translate.cyclicEnd) {
				this._extendTrackForCyclicEnd(ptimes, pvalues, tCopy, vCopy);
			}
		}

		if (scaleTimes && (tracks.scale.cyclicStart || tracks.scale.cyclicEnd)) {
			tCopy = stimes.slice(0);
			vCopy = svalues.slice(0);

			if (tracks.scale.cyclicStart) {
				this._extendTrackForCyclicStart(stimes, svalues, tCopy, vCopy);
			}
			if (tracks.scale.cyclicEnd) {
				this._extendTrackForCyclicEnd(stimes, svalues, tCopy, vCopy);
			}
		}

		if (!nodeEndData) {
			nodeEndData = {};
		}

		if (!nodeStartData) {
			nodeStartData = {};
		}

		if (scaleTimes) {
			if (stimes[0] > 0) {
				svalues.unshift(svalues[0], svalues[1], svalues[2]);
				stimes.unshift(stimes[0]);
				nodeStartData.scale = null;
			} else {
				var scaleVectorS = new THREE.Vector3(svalues[0], svalues[1], svalues[2]);
				nodeStartData.scale = scaleVectorS;
			}
			var scaleVectorE = new THREE.Vector3(svalues[svalues.length - 3], svalues[svalues.length - 2], svalues[svalues.length - 1]);
			nodeEndData.scale = scaleVectorE;

			var sname = name + ".scale";
			tracks.scale.nativeTrack = new THREE.VectorKeyframeTrack(sname, stimes, svalues);
			tracks.scale.nativeTrack.userData = {};
			tracks.scale.nativeTrack.userData.originalValue = target.scale.clone();
			if (tracks.scale.interpolation === AnimationInterpolationType.discrete) {
				tracks.scale.nativeTrack.setInterpolation(THREE.InterpolateDiscrete);
			} else if (tracks.scale.interpolation === AnimationInterpolationType.cubic) {
				tracks.scale.nativeTrack.setInterpolation(THREE.InterpolateSmooth);
			} else {
				tracks.scale.nativeTrack.setInterpolation(THREE.InterpolateLinear);
			}
			tracks.scale.nativeTrack.userData.targetNode = target;
			this._animationClip.tracks.push(tracks.scale.nativeTrack);
		}


		if (rotateTimes) {
			if (qtimes[0] > 0) {
				qvalues.unshift(qvalues[0], qvalues[1], qvalues[2], qvalues[3]);
				qtimes.unshift(qtimes[0]);
				nodeStartData.quaternion  = null;
			} else {
				var currentQuaternion1 = new THREE.Quaternion(qvalues[0], qvalues[1], qvalues[2], qvalues[3]);
				nodeStartData.quaternion  = currentQuaternion1;
			}

			var currentQuaternion = new THREE.Quaternion(qvalues[qvalues.length - 4], qvalues[qvalues.length - 3], qvalues[qvalues.length - 2], qvalues[qvalues.length - 1]);
			nodeEndData.quaternion  = currentQuaternion;

			var qname = name + ".quaternion";
			tracks.rotate.nativeTrack = new THREE.QuaternionKeyframeTrack(qname, qtimes, qvalues);
			tracks.rotate.nativeTrack.userData = {};
			tracks.rotate.nativeTrack.userData.originalValue = target.quaternion.clone();
			if (tracks.rotate.interpolation === AnimationInterpolationType.discrete) {
				tracks.rotate.nativeTrack.setInterpolation(THREE.InterpolateDiscrete);
			} else if (tracks.rotate.interpolation  === AnimationInterpolationType.cubic) {
				tracks.rotate.nativeTrack.setInterpolation(THREE.InterpolateSmooth);
			} else {
				tracks.rotate.nativeTrack.setInterpolation(THREE.InterpolateLinear);
			}
			tracks.rotate.nativeTrack.userData.targetNode = target;
			this._animationClip.tracks.push(tracks.rotate.nativeTrack);
		}

		if (translateTimes) {
			if (ptimes[0] > 0) {
				pvalues.unshift(pvalues[0], pvalues[1], pvalues[2]);
				ptimes.unshift(ptimes[0]);
				nodeStartData.position = null;
			} else {
				var positionVectorS = new THREE.Vector3(pvalues[0], pvalues[1], pvalues[2]);
				nodeStartData.position = positionVectorS;
			}

			var positionVectorE = new THREE.Vector3(pvalues[pvalues.length - 3], pvalues[pvalues.length - 2], pvalues[pvalues.length - 1]);
			nodeEndData.position = positionVectorE;

			var pname = name + ".position";
			tracks.translate.nativeTrack = new THREE.VectorKeyframeTrack(pname, ptimes, pvalues);
			tracks.translate.nativeTrack.userData = {};
			tracks.translate.nativeTrack.userData.originalValue = target.position.clone();
			if (tracks.translate.interpolation === AnimationInterpolationType.discrete) {
				tracks.translate.nativeTrack.setInterpolation(THREE.InterpolateDiscrete);
			} else if (tracks.translate.interpolation === AnimationInterpolationType.cubic) {
				tracks.translate.nativeTrack.setInterpolation(THREE.InterpolateSmooth);
			} else {
				tracks.translate.nativeTrack.setInterpolation(THREE.InterpolateLinear);
			}
			tracks.translate.nativeTrack.userData.targetNode = target;
			this._animationClip.tracks.push(tracks.translate.nativeTrack);

			this._nodesPositionTracksMap.set(target, tracks);
		}

		this._nodesEndData.set(target, nodeEndData);
		this._nodesStartData.set(target, nodeStartData);
	};

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
	AnimationSequence.prototype.setOpacityTrack = function(target, times, values, interpolation, isHighlight, cyclicInfo) {
		if (times.length !== values.length) {
			// error
			return;
		}

		if (interpolation && interpolation !== AnimationInterpolationType.linear
							&& interpolation !== AnimationInterpolationType.cubic
							&& interpolation !== AnimationInterpolationType.discrete) {
			// error
			return;
		}

		var opacityTrack = this._nodesOpacityTrackMap.get(target);
		if (!opacityTrack) {
			opacityTrack = {};
		}
		opacityTrack.times = times.slice();
		opacityTrack.values = values.slice();
		if (interpolation) {
			opacityTrack.interpolation = interpolation;
		} else {
			opacityTrack.interpolation = AnimationInterpolationType.linear;
		}

		if (isHighlight) {
			opacityTrack.isHighlight = true;
			this._hasHighlight = true;
		} else {
			opacityTrack.isHighlight = false;
		}

		if (cyclicInfo) {
			opacityTrack.cyclicStart = cyclicInfo.cyclicStart;
			opacityTrack.cyclicEnd = cyclicInfo.cyclicEnd;
		}

		this._nodesOpacityTrackMap.set(target, opacityTrack);

		this._setNativeOpacityTrack(target);
		this._resetDuration();
	};

	AnimationSequence.prototype._getNodesWithMaterialColor = function(pnode, nodes) {
		if (pnode && pnode.material && pnode.material.color){
			nodes.push(pnode);
		}
		for (var cni = 0; pnode.children && cni < pnode.children.length; cni++) {
			var child = pnode.children[cni];
			this._getNodesWithMaterialColor(child, nodes);
		}
	};

	AnimationSequence.prototype._getNodesWithMaterialOpacity = function(pnode, nodes) {
		if (pnode && pnode.material && pnode.material.opacity !== undefined){
			nodes.push(pnode);
		}
		for (var cni = 0; pnode.children && cni < pnode.children.length; cni++) {
			var child = pnode.children[cni];
			this._getNodesWithMaterialOpacity(child, nodes);
		}
	};

	AnimationSequence.prototype._resetMaterialTransparentForOpacityTrack = function() {
		var oTracks = this._nodesOpacityTrackMap.values();
		var next = oTracks.next();
		while (!next.done) {
			var opacityTrack = next.value;
			if (opacityTrack.nativeTracks) {
				for (var oi = 0; oi < opacityTrack.nativeTracks.length; oi++) {
					var track = opacityTrack.nativeTracks[oi];
					if (track.userData && track.userData.targetNode && track.userData.targetNode.material) {
						track.userData.targetNode.material.transparent = true;
					}
				}
			}
			next = oTracks.next();
		}
	};

	AnimationSequence.prototype._setNativeOpacityTrack = function(target) {
		var opacityTrack = this._nodesOpacityTrackMap.get(target);
		if (!opacityTrack) {
			return;
		}

		if (opacityTrack.nativeTracks) {
			for (var oi = 0; oi < opacityTrack.nativeTracks.length; oi++) {
				var track = opacityTrack.nativeTracks[oi];
				for (var ii = 0; ii < this._animationClip.tracks.length; ii++) {
					var track1 = this._animationClip.tracks[ii];
					if (track === track1) {
						this._animationClip.tracks.splice(ii, 1);
						break;
					}
				}
			}
		}

		opacityTrack.nativeTracks = [];
		var nodesWithOpacity = [];
		this._getNodesWithMaterialOpacity(target, nodesWithOpacity);

		var mNode, ni, nodeEndData, nodeStartData;
		if (!opacityTrack.times || opacityTrack.times.length == 0) {
			for (ni = 0; ni < nodesWithOpacity.length; ni++) {
				mNode = nodesWithOpacity[ni];
				if (mNode.userData && mNode.userData.originalMaterial) {
					if (!mNode.userData.highlightColor && !mNode.userData.animatedColor) {
						mNode.material.color.copy(mNode.userData.originalMaterial.color);
						if (mNode.material.emissive !== undefined) {
							mNode.material.emissive.copy(mNode.userData.originalMaterial.emissive);
						}
						if (mNode.material.specular !== undefined) {
							mNode.material.specular.copy(mNode.userData.originalMaterial.specular);
						}
					}
					mNode.material.opacity = mNode.userData.originalMaterial.opacity;
					mNode.material.transparent = mNode.userData.originalMaterial.transparent;
					delete mNode.userData.animatedOpacity;
				}
				nodeEndData = this._nodesEndData.get(mNode);
				if (nodeEndData && nodeEndData.opacity) {
					delete nodeEndData.opacity;
				}

				nodeStartData = this._nodesStartData.get(mNode);
				if (nodeStartData && nodeStartData.opacity) {
					delete nodeStartData.opacity;
				}
			}
			this._nodesOpacityTrackMap.delete(target);
			return;
		}

		var times = opacityTrack.times.slice(0);
		var values = opacityTrack.values.slice(0);

		if (times.length === 0) {
			return;
		}

		if (opacityTrack.cyclicStart || opacityTrack.cyclicEnd) {
			var tCopy = opacityTrack.times.slice(0);
			var vCopy = opacityTrack.values.slice(0);

			if (opacityTrack.cyclicStart) {
				this._extendTrackForCyclicStart(times, values, tCopy, vCopy);
			}
			if (opacityTrack.cyclicEnd) {
				this._extendTrackForCyclicEnd(times, values, tCopy, vCopy);
			}
		}


		if (times[0] > 0) {
			values.unshift(values[0]);
			times.unshift(times[0] - 1e-4);
		}

		for (ni = 0; ni < nodesWithOpacity.length; ni++) {
			mNode = nodesWithOpacity[ni];
			if (!mNode.userData) {
				mNode.userData = {};
			}

			if (!mNode.userData.originalMaterial) {
				mNode.userData.originalMaterial = mNode.material;
				mNode.material = mNode.material.clone();
			}

			if (times[0] > 0) {
				if (mNode.userData.originalMaterial.opacity !== undefined) {
					values[0] = mNode.userData.originalMaterial.opacity;
				 } else {
					values[0] = 1;
				 }
			}

			mNode.userData.animatedOpacity = true;

			var name = mNode.uuid + ".material.opacity";

			var originalValue = mNode.material.opacity;
			mNode.material.transparent = true;

			nodeEndData = this._nodesEndData.get(mNode);
			if (!nodeEndData) {
				nodeEndData = {};
			}

			nodeStartData = this._nodesStartData.get(mNode);
			if (!nodeStartData) {
				nodeStartData = {};
			}

			if (opacityTrack.isHighlight) {
				nodeEndData.opacity = mNode.material.opacity;
			} else {
				nodeEndData.opacity = values[values.length - 1];
			}

			this._nodesEndData.set(mNode, nodeEndData);

			if (opacityTrack.isHighlight) {
				nodeStartData.opacity = mNode.material.opacity;
			} else {
				nodeStartData.opacity = values[0];
			}
			this._nodesStartData.set(mNode, nodeStartData);

			var nativeTrack = new THREE.NumberKeyframeTrack(name, times, values);

			if (opacityTrack.interpolation === AnimationInterpolationType.discrete) {
				nativeTrack.setInterpolation(THREE.InterpolateDiscrete);
			} else if (opacityTrack.interpolation === AnimationInterpolationType.cubic) {
				nativeTrack.setInterpolation(THREE.InterpolateSmooth);
			} else {
				nativeTrack.setInterpolation(THREE.InterpolateLinear);
			}
			nativeTrack.userData = {};
			nativeTrack.userData.targetNode = mNode;
			nativeTrack.userData.originalValue = originalValue;
			this._animationClip.tracks.push(nativeTrack);
			opacityTrack.nativeTracks.push(nativeTrack);
		}
	};

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
	AnimationSequence.prototype.setColorTrack = function(target, times, values, interpolation, isHighlight, cyclicInfo) {
		if (times.length * 3 !== values.length) {
			// error
			return;
		}

		if (interpolation && interpolation !== AnimationInterpolationType.linear
							&& interpolation !== AnimationInterpolationType.cubic
							&& interpolation !== AnimationInterpolationType.discrete) {
			// error
			return;
		}

		var colorTrack = this._nodesColorTrackMap.get(target);
		if (!colorTrack) {
			colorTrack = {};
		}
		colorTrack.times = times.slice();
		colorTrack.values = values.slice();
		if (interpolation) {
			colorTrack.interpolation = interpolation;
		} else {
			colorTrack.interpolation = AnimationInterpolationType.linear;
		}
		if (isHighlight) {
			colorTrack.isHighlight = true;
			this._hasHighlight = true;
		} else {
			colorTrack.isHighlight = false;
		}

		if (cyclicInfo) {
			colorTrack.cyclicStart = cyclicInfo.cyclicStart;
			colorTrack.cyclicEnd = cyclicInfo.cyclicEnd;
		}

		this._nodesColorTrackMap.set(target, colorTrack);

		this._setNativeColorTrack(target);
		this._resetDuration();
	};

	AnimationSequence.prototype._setNativeColorTrack = function(target) {
		var colorTrack = this._nodesColorTrackMap.get(target);
		if (!colorTrack) {
			return;
		}

		if (colorTrack.nativeTracks) {
			for (var oi = 0; oi < colorTrack.nativeTracks.length; oi++) {
				var track = colorTrack.nativeTracks[oi];
				for (var ii = 0; ii < this._animationClip.tracks.length; ii++) {
					var track1 = this._animationClip.tracks[ii];
					if (track === track1) {
						this._animationClip.tracks.splice(ii, 1);
						break;
					}
				}
			}
		}
		colorTrack.nativeTracks = [];
		var nodesWithColor = [];
		this._getNodesWithMaterialColor(target, nodesWithColor);

		var ni, mNode, nodeEndData, nodeStartData;
		if (!colorTrack.times || colorTrack.times.length == 0) {
			for (ni = 0; ni < nodesWithColor.length; ni++) {
				mNode = nodesWithColor[ni];
				if (mNode.userData && mNode.userData.originalMaterial) {
					if (!mNode.userData.highlightColor) {
						mNode.material.color.copy(mNode.userData.originalMaterial.color);
						if (mNode.material.emissive !== undefined) {
							mNode.material.emissive.copy(mNode.userData.originalMaterial.emissive);
						}
						if (mNode.material.specular !== undefined) {
							mNode.material.specular.copy(mNode.userData.originalMaterial.specular);
						}
					}
					delete mNode.userData.animatedColor;
				}
				nodeEndData = this._nodesEndData.get(mNode);
				if (nodeEndData && nodeEndData.color) {
					delete nodeEndData.color;
				}

				nodeStartData = this._nodesStartData.get(mNode);
				if (nodeStartData && nodeStartData.color) {
					delete nodeStartData.color;
				}
			}
			this._nodesColorTrackMap.delete(target);
			return;
		}

		var times = colorTrack.times.slice(0);
		var values = colorTrack.values.slice(0);

		if (times.length === 0) {
			return;
		}

		if (colorTrack.cyclicStart || colorTrack.cyclicEnd) {
			var tCopy = colorTrack.times.slice(0);
			var vCopy = colorTrack.values.slice(0);

			if (colorTrack.cyclicStart) {
				this._extendTrackForCyclicStart(times, values, tCopy, vCopy);
			}
			if (colorTrack.cyclicEnd) {
				this._extendTrackForCyclicEnd(times, values, tCopy, vCopy);
			}
		}

		if (times[0] > 0) {
			values.unshift(values[0], values[1], values[2]);
			times.unshift(times[0] - 1e-4);
		}

		for (ni = 0; ni < nodesWithColor.length; ni++) {
			mNode = nodesWithColor[ni];
			if (!mNode.userData) {
				mNode.userData = {};
			}

			if (!mNode.userData.originalMaterial) {
				mNode.userData.originalMaterial = mNode.material;
				mNode.material = mNode.material.clone();
			}

			if (times[0] > 0 && mNode.userData.originalMaterial.color) {
				values[0] = mNode.userData.originalMaterial.color.r;
				values[1] = mNode.userData.originalMaterial.color.g;
				values[2] = mNode.userData.originalMaterial.color.b;
		   }

			mNode.userData.animatedColor = true;

			var name = mNode.uuid + ".material.color";

			var originalValue = mNode.material.color.clone();

			nodeEndData = this._nodesEndData.get(mNode);
			if (!nodeEndData) {
				nodeEndData = {};
			}

			nodeStartData = this._nodesStartData.get(mNode);
			if (!nodeStartData) {
				nodeStartData = {};
			}

			if (colorTrack.isHighlight) {
				nodeEndData.color = mNode.material.color.clone();
			} else {
				nodeEndData.color = new THREE.Color(values[values.length - 3],
														values[values.length - 2],
														values[values.length - 1]);
			}
			this._nodesEndData.set(mNode, nodeEndData);

			if (colorTrack.isHighlight) {
				nodeStartData.color = mNode.material.color.clone();
			} else {
				nodeStartData.color = new THREE.Color(values[0],
														values[1],
														values[2]);
			}
			this._nodesStartData.set(mNode, nodeStartData);

			var nativeTrack = new THREE.ColorKeyframeTrack(name, times, values);

			if (colorTrack.interpolation === AnimationInterpolationType.discrete) {
				nativeTrack.setInterpolation(THREE.InterpolateDiscrete);
			} else if (colorTrack.interpolation === AnimationInterpolationType.cubic) {
				nativeTrack.setInterpolation(THREE.InterpolateSmooth);
			} else {
				nativeTrack.setInterpolation(THREE.InterpolateLinear);
			}
			nativeTrack.userData = {};
			nativeTrack.userData.targetNode = mNode;
			nativeTrack.userData.originalValue = originalValue;
			this._animationClip.tracks.push(nativeTrack);
			colorTrack.nativeTracks.push(nativeTrack);
		}
	};

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
	AnimationSequence.prototype.getInterpolation = function(target, trackType) {
		var interpolation;
		var tracks = this._nodesPositionTracksMap.get(target);

		if (trackType === AnimationTrackType.rotate && tracks) {
			interpolation = tracks.rotate.interpolation;
		} else if (trackType === AnimationTrackType.translate && tracks) {
			interpolation = tracks.translate.interpolation;
		} else if (trackType === AnimationTrackType.scale && tracks) {
			interpolation = tracks.scale.interpolation;
		} else if (trackType === AnimationTrackType.opacity) {
			var opacityTrack = this._nodesOpacityTrackMap.get(target);
			if (opacityTrack) {
				interpolation = opacityTrack.interpolation;
			}
		} else if (trackType === AnimationTrackType.color) {
			var colorTrack = this._nodesColorTrackMap.get(target);
			if (colorTrack) {
				interpolation = colorTrack.interpolation;
			}
		}

		return interpolation;
	};

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
	AnimationSequence.prototype.setTrackCyclicStyle = function(target, trackType, cyclicStart, cyclicEnd) {
		var tracks = this._nodesPositionTracksMap.get(target);

		if (trackType === AnimationTrackType.rotate && tracks && tracks.rotate) {
			tracks.rotate.cyclicStart = cyclicStart;
			tracks.rotate.cyclicEnd = cyclicEnd;
			this._setNativePositionTracks(target);
		} else if (trackType === AnimationTrackType.translate && tracks && tracks.translate) {
			tracks.translate.cyclicStart = cyclicStart;
			tracks.translate.cyclicEnd = cyclicEnd;
			this._setNativePositionTracks(target);
		} else if (trackType === AnimationTrackType.scale && tracks && tracks.scale) {
			tracks.scale.cyclicStart = cyclicStart;
			tracks.scale.cyclicEnd = cyclicEnd;
			this._setNativePositionTracks(target);
		} else if (trackType === AnimationTrackType.opacity) {
			var opacityTrack = this._nodesOpacityTrackMap.get(target);
			if (opacityTrack) {
				opacityTrack.cyclicStart = cyclicStart;
				opacityTrack.cyclicEnd = cyclicEnd;
				this._setNativeOpacityTrack(target);
			}
		} else if (trackType === AnimationTrackType.color) {
			var colorTrack = this._nodesColorTrackMap.get(target);
			if (colorTrack) {
				colorTrack.cyclicStart = cyclicStart;
				colorTrack.cyclicEnd = cyclicEnd;
				this._setNativeColorTrack(target);
			}
		}

		this._resetDuration();
	};


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
	AnimationSequence.prototype.setInterpolation = function(target, trackType, interpolation) {
		var tracks = this._nodesPositionTracksMap.get(target);

		var nativeTracks = [];
		if (trackType === AnimationTrackType.rotate && tracks && tracks.rotate) {
			tracks.rotate.interpolation = interpolation;
			nativeTracks.push(tracks.rotate.nativeTrack);
		} else if (trackType === AnimationTrackType.translate && tracks && tracks.translate) {
			tracks.translate.interpolation = interpolation;
			nativeTracks.push(tracks.translate.nativeTrack);
		} else if (trackType === AnimationTrackType.scale && tracks && tracks.scale) {
			tracks.scale.interpolation = interpolation;
			nativeTracks.push(tracks.scale.nativeTrack);
		} else if (trackType === AnimationTrackType.opacity) {
			var opacityTrack = this._nodesOpacityTrackMap.get(target);
			if (opacityTrack) {
				opacityTrack.interpolation = interpolation;
				nativeTracks = opacityTrack.nativeTracks;
			}
		} else if (trackType === AnimationTrackType.color) {
			var colorTrack = this._nodesColorTrackMap.get(target);
			if (colorTrack) {
				colorTrack.interpolation = interpolation;
				nativeTracks = colorTrack.nativeTracks;
			}
		}

		for (var ni = 0; ni < nativeTracks.length; ni++) {
			var nativeTrack = nativeTracks[ni];
			if (nativeTrack) {
				if (interpolation === AnimationInterpolationType.discrete) {
					nativeTrack.setInterpolation(THREE.InterpolateDiscrete);
				} else if (interpolation === AnimationInterpolationType.cubic) {
					nativeTrack.setInterpolation(THREE.InterpolateSmooth);
				} else {
					nativeTrack.setInterpolation(THREE.InterpolateLinear);
				}
			}
		}

		this._resetDuration();
	};


	/**
	 * Get the key frame whose time is nearest to the parameter
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getNearestKeyFrame
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @param {float} time The time
	 * @param {float} threshold if set, the nearest key frame must be between time - threshold and time + threshold, otherwise return value is undefined
	 * @returns {object} contains three/four components:
	 * 						index (int) - index of key frame
	 *						time {float} - actual time in track
	 *						value (float[]) - key frame value
	 * 						rotateType {sap.ui.vk.AnimationRotateType} angleAxis, euler, or quaternion, only for "rotate" track
	 * @public
	 */
	 AnimationSequence.prototype.getNearestKeyFrame = function(target, trackType, time, threshold) {

		var times, values, rotateType;
		if (trackType === AnimationTrackType.rotate || trackType === AnimationTrackType.translate || trackType === AnimationTrackType.scale) {
			var tracks = this._nodesPositionTracksMap.get(target);

			if (trackType === AnimationTrackType.rotate && tracks && tracks.rotate.times && tracks.rotate.times.length) {
				times = tracks.rotate.times;
				values = tracks.rotate.values;
				rotateType = tracks.rotate.rotateType;
			} else if (trackType === AnimationTrackType.translate && tracks && tracks.translate.times && tracks.translate.times.length) {
				times = tracks.translate.times;
				values = tracks.translate.values;
			} else if (trackType === AnimationTrackType.scale && tracks && tracks.scale.times && tracks.scale.times.length) {
				times = tracks.scale.times;
				values = tracks.scale.values;
			}
		} else if (trackType === AnimationTrackType.opacity) {
			var opacityTrack = this._nodesOpacityTrackMap.get(target);
			if (opacityTrack && opacityTrack.times && opacityTrack.values) {
				times = opacityTrack.times;
				values = opacityTrack.values;
			}
		} else if (trackType === AnimationTrackType.color) {
			var colorTrack = this._nodesColorTrackMap.get(target);
			if (colorTrack && colorTrack.times && colorTrack.values) {
				times = colorTrack.times;
				values = colorTrack.values;
			}
		}

		var result;
		if (times && values) {
			var minTimeInterval = Math.abs(time - times[0]);
			var index = 0;
			for (var ti = 1; ti < times.length; ti++) {
				var t = times[ti];
				if (Math.abs(t - time) < minTimeInterval) {
					minTimeInterval = Math.abs(t - time);
					index = ti;
				}
			}

			if (threshold != null) {
				if (minTimeInterval > threshold) {
					return result;
				}
			}

			result = {};
			result.index = index;
			result.time = times[index];
			if (trackType === AnimationTrackType.translate || trackType === AnimationTrackType.scale || trackType === AnimationTrackType.color) {
				result.value = [ values[index * 3],
								values[index * 3 + 1],
								values[index * 3 + 2] ];
			} else if (trackType === AnimationTrackType.rotate) {
				result.value = [ values[index * 4],
								values[index * 4 + 1],
								values[index * 4 + 2],
								values[index * 4 + 3] ];
			} else {
				result.value = [ values[index] ];
			}

			if (rotateType) {
				result.rotateType = rotateType;
			}
		}
		return result;
	 };

	 AnimationSequence.prototype.getRotateKeyFrameInQuaternion = function(target, index) {
		var value;
		var tracks = this._nodesPositionTracksMap.get(target);
		if (tracks && tracks.rotate && tracks.rotate.times.length > index) {
			var rvalue = [ tracks.rotate.values[index * 4],
							tracks.rotate.values[index * 4 + 1],
							tracks.rotate.values[index * 4 + 2],
							tracks.rotate.values[index * 4 + 3] ];
			value = this._convertRotationForm(tracks.rotate.rotateType, AnimationRotateType.quaternion, rvalue);
		}
		return value;
	 };


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
	 * @param {boolean} notFireEvent optional if fire keyFrameDeleted event
	 */
	AnimationSequence.prototype.addKeyFrame = function(target, trackType, time, value, rotateType, notFireEvent) {
		if (value.length !== 3 && (trackType === AnimationTrackType.color || trackType === AnimationTrackType.translate || trackType === AnimationTrackType.scale)) {
			// error
			return;
		} else if (value.length !== 1 && trackType === AnimationTrackType.opacity) {
			// error
			return;
		} else if (value.length !== 4 && trackType === AnimationTrackType.rotate) {
			// error
			return;
		}

		var times, values;
		if (trackType === AnimationTrackType.rotate || trackType === AnimationTrackType.translate || trackType === AnimationTrackType.scale) {
			var tracks = this._nodesPositionTracksMap.get(target);

			if (!tracks) {
				tracks = {};
				tracks.rotate = {};
				tracks.translate = {};
				tracks.scale = {};
				this._nodesPositionTracksMap.set(target, tracks);
			}

			if (trackType === AnimationTrackType.rotate) {
				if (!tracks.rotate.times) {
					tracks.rotate.times = [];
					tracks.rotate.values = [];
				}
				times = tracks.rotate.times;
				values = tracks.rotate.values;

				if (rotateType) {
					if (!tracks.rotate.rotateType) {
						tracks.rotate.rotateType = rotateType;
					} else if (tracks.rotate.rotateType !== rotateType) {
						value = this._convertRotationForm(rotateType, tracks.rotate.rotateType, value);
					}
				}
			} else if (trackType === AnimationTrackType.translate) {
				if (!tracks.translate.times) {
					tracks.translate.times = [];
					tracks.translate.values = [];
				}
				times = tracks.translate.times;
				values = tracks.translate.values;
			} else if (trackType === AnimationTrackType.scale) {
				if (!tracks.scale.times) {
					tracks.scale.times = [];
					tracks.scale.values = [];
				}
				times = tracks.scale.times;
				values = tracks.scale.values;
			}
		} else if (trackType === AnimationTrackType.opacity) {
			var opacityTrack = this._nodesOpacityTrackMap.get(target);
			if (!opacityTrack) {
				opacityTrack = {};
				opacityTrack.times = [];
				opacityTrack.values = [];
				this._nodesOpacityTrackMap.set(target, opacityTrack);
			}
			times = opacityTrack.times;
			values = opacityTrack.values;
		} else if (trackType === AnimationTrackType.color) {
			var colorTrack = this._nodesColorTrackMap.get(target);
			if (!colorTrack) {
				colorTrack = {};
				colorTrack.times = [];
				colorTrack.values = [];
				this._nodesColorTrackMap.set(target, colorTrack);
			}
			times = colorTrack.times;
			values = colorTrack.values;
		}

		var vi;
		if (times && values) {
			if (time <= times[0] || times.length === 0) {
				times.unshift(time);
				for (vi = value.length - 1; vi >= 0; vi--) {
					values.unshift(value[vi]);
				}
			} else if (time >= times[times.length - 1]) {
				times.push(time);
				for (vi = 0; vi < value.length; vi++) {
					values.push(value[vi]);
				}
			} else {
				for (var ti = 1; ti < times.length; ti++) {
					if (time < times[ti]) {
						times.splice(ti, 0, time);
						if (trackType === AnimationTrackType.translate || trackType === AnimationTrackType.scale || trackType === AnimationTrackType.color) {
							values.splice(ti * 3, 0, value[0], value[1], value[2]);
						} else if (trackType === AnimationTrackType.rotate) {
							values.splice(ti * 4, 0, value[0], value[1], value[2], value[3]);
						} else {
							values.splice(ti, 0, value[0]);
						}
						break;
					}
				}
			}
		}

		if (trackType === AnimationTrackType.rotate || trackType === AnimationTrackType.translate || trackType === AnimationTrackType.scale) {
			this._setNativePositionTracks(target);
		} else if (trackType === AnimationTrackType.opacity) {
			this._setNativeOpacityTrack(target);
		} else if (trackType === AnimationTrackType.color) {
			this._setNativeColorTrack(target);
		}

		this._resetDuration();

		if (trackType === AnimationTrackType.rotate && rotateType !== AnimationRotateType.quaternion) {
			var rtracks = this._nodesPositionTracksMap.get(target);
			 if (rtracks && rtracks.rotate.nativeTrack) {
				for (var i = 0; i < rtracks.rotate.nativeTrack.times.length; i++) {
					var t = rtracks.rotate.nativeTrack.times[i];
					if (Math.abs(t - time) < 1e-9) {
						value = [ rtracks.rotate.nativeTrack.values[i * 4],
									rtracks.rotate.nativeTrack.values[i * 4 + 1],
									rtracks.rotate.nativeTrack.values[i * 4 + 2],
									rtracks.rotate.nativeTrack.values[i * 4 + 3] ];
					}
				}
			}
		}

		if (!notFireEvent) {
			this.fireKeyFrameAdded({ sequenceId: this.getSequenceId(), targetNodeRef: target, trackType: trackType, keyFrameValue: value, keyFrameTime: time });
		}
	};

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
	AnimationSequence.prototype.deleteKeyFrame = function(target, trackType, index, notFireEvent) {
		var times, values, tracks;
		if (trackType === AnimationTrackType.rotate || trackType === AnimationTrackType.translate || trackType === AnimationTrackType.scale) {
			tracks = this._nodesPositionTracksMap.get(target);

			if (!tracks) {
				return;
			}

			if (trackType === AnimationTrackType.rotate && tracks && tracks.rotate.times && tracks.rotate.times.length) {
				times = tracks.rotate.times;
				values = tracks.rotate.values;
			} else if (trackType === AnimationTrackType.translate && tracks && tracks.translate.times && tracks.translate.times.length) {
				times = tracks.translate.times;
				values = tracks.translate.values;
			} else if (trackType === AnimationTrackType.scale && tracks && tracks.scale.times && tracks.scale.times.length) {
				times = tracks.scale.times;
				values = tracks.scale.values;
			}
		} else if (trackType === AnimationTrackType.opacity) {
			var opacityTrack = this._nodesOpacityTrackMap.get(target);
			if (!opacityTrack) {
				return;
			}
			times = opacityTrack.times;
			values = opacityTrack.values;
		} else if (trackType === AnimationTrackType.color) {
			var colorTrack = this._nodesColorTrackMap.get(target);
			if (!colorTrack) {
				return;
			}
			times = colorTrack.times;
			values = colorTrack.values;
		}

		var value, time;
		if (times && values) {
			if (index < 0 || index >= times.length) {
				return;
			}
			time = times[index];
			times.splice(index, 1);
			if (trackType === AnimationTrackType.translate || trackType === AnimationTrackType.scale || trackType === AnimationTrackType.color) {
				value = [ values[index * 3], values[index * 3 + 1], values[index * 3 + 2] ];
				values.splice(index * 3, 3);
			} else if (trackType === AnimationTrackType.rotate) {
				var rvalue = [ values[index * 4], values[index * 4 + 1], values[index * 4 + 2], values[index * 4 + 3] ];
				value = this._convertRotationForm(tracks.rotate.rotateType, AnimationRotateType.quaternion, rvalue);
				values.splice(index * 4, 4);
			} else {
				value = [ values[index] ];
				values.splice(index, 1);
			}
		}

		var lastTrack = true;
		if (trackType === AnimationTrackType.rotate || trackType === AnimationTrackType.translate || trackType === AnimationTrackType.scale) {
			this._setNativePositionTracks(target);
			var pTrack = this._nodesPositionTracksMap.get(target);
			if (pTrack) {
				if (trackType === AnimationTrackType.rotate && pTrack.rotate.times && pTrack.rotate.times.length > 0) {
					lastTrack = false;
				} else if (trackType === AnimationTrackType.translate && pTrack.translate.times && pTrack.translate.times.length > 0) {
					lastTrack = false;
				} else if (trackType === AnimationTrackType.scale && pTrack.scale.times && pTrack.scale.times.length > 0) {
					lastTrack = false;
				}
			}
		} else if (trackType === AnimationTrackType.opacity) {
			this._setNativeOpacityTrack(target);
			var oTrack = this._nodesOpacityTrackMap.get(target);
			if (oTrack) {
				lastTrack = false;
			}
		} else if (trackType === AnimationTrackType.color) {
			this._setNativeColorTrack(target);
			var cTrack = this._nodesColorTrackMap.get(target);
			if (cTrack) {
				lastTrack = false;
			}
		}

		this._resetDuration();

		if (!notFireEvent) {
			this.fireKeyFrameDeleted({ sequenceId: this.getSequenceId(), targetNodeRef: target, trackType: trackType, keyFrameValue: value, keyFrameTime: time, keyFrameIndex: index, lastTrack: lastTrack });
		}
	};

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
	 * @param {sap.ui.vk.AnimationRotateType} rotateType angleAxis, euler, or quaternion, only for "rotate" track
	 * @param {boolean} notFireEvent optional if fire keyFrameUpdated event
	 *
	 * @public
	 */
	AnimationSequence.prototype.updateKeyFrame = function(target, trackType, index, time, value, rotateType, notFireEvent) {
		this.deleteKeyFrame(target, trackType, index, true);
		this.addKeyFrame(target, trackType, time, value, rotateType, true);
		if (trackType === AnimationTrackType.rotate && rotateType !== AnimationRotateType.quaternion) {
			var rtracks = this._nodesPositionTracksMap.get(target);
			 if (rtracks.rotate.nativeTrack) {
				for (var i = 0; i < rtracks.rotate.nativeTrack.times.length; i++) {
					var t = rtracks.rotate.nativeTrack.times[i];
					if (Math.abs(t - time) < 1e-9) {
						value = [ rtracks.rotate.nativeTrack.values[i * 4],
									rtracks.rotate.nativeTrack.values[i * 4 + 1],
									rtracks.rotate.nativeTrack.values[i * 4 + 2],
									rtracks.rotate.nativeTrack.values[i * 4 + 3] ];
					}
				}
			}
		}
		if (!notFireEvent) {
			this.fireKeyFrameUpdated({ sequenceId: this.getSequenceId(), targetNodeRef: target, trackType: trackType, keyFrameValue: value, keyFrameTime: time, keyFrameIndex: index });
		}

	};

	AnimationSequence.prototype._getAngleAxisFromQuaternion = function(qx, qy, qz, qw) {
		var q = new THREE.Quaternion(qx, qy, qz, qw);
		if (q.w > 1) {
			q.normalise();
		}

		var angle = 2 * Math.acos(q.w);

		var s = Math.sqrt(1 - q.w * q.w);
		var x, y, z;
		if (s < 0.001) {
			x = q.x;
			y = q.y;
			z = q.z;
		} else {
			x = q.x / s;
			y = q.y / s;
			z = q.z / s;
		}

		return [ x, y, z, angle ];
	};

	AnimationSequence.prototype._getEnulerFromQuaternion = function(qx, qy, qz, qw) {
		var q = new THREE.Quaternion(qx, qy, qz, qw);
		if (q.w > 1) {
			q.normalise();
		}

		var order = 26; // 100100 - "xyz"
		var test = q.x * q.y + q.z * q.w;
		var heading, attitude, bank;
		if (test > 0.499) { // singularity at north pole
			heading = 2 * Math.atan2(q.x, q.w);
			attitude = Math.PI / 2;
			bank = 0;
		}
		if (test < -0.499) { // singularity at south pole
			heading = -2 * Math.atan2(q.x, q.w);
			attitude = -Math.PI / 2;
			bank = 0;
		} else {
			var sqx = q.x * q.x;
			var sqy = q.y * q.y;
			var sqz = q.z * q.z;
			heading = Math.atan2(2 * q.y * q.w - 2 * q.x * q.z, 1 - 2 * sqy - 2 * sqz);
			attitude = Math.asin(2 * test);
			bank = Math.atan2(2 * q.x * q.w - 2 * q.y * q.z, 1 - 2 * sqx - 2 * sqz);
		}

		return [ heading, attitude, bank, order ];
	};

	AnimationSequence.prototype._convertRotationForm = function(srcForm, desForm, srcValue) {
		var desValue;
		var q, e, order, orderString, axis, oi;
		if (desForm === AnimationRotateType.quaternion) {
			q = new THREE.Quaternion();
			if (srcForm === AnimationRotateType.angleAxis) {
				axis = new THREE.Vector3(srcValue[0], srcValue[1], srcValue[2]);
				axis.normalize();
				q.setFromAxisAngle(axis, srcValue[3]);
				desValue = [ q.x, q.y, q.z, q.w ];
			} else if (srcForm === AnimationRotateType.euler) {
				order = Math.round(srcValue[3]);
				orderString = "";
				for (oi = 0; oi < 3; oi++){
					if ((order >> (oi * 2) & 3) === 0) {
						orderString.push("X");
					} else if ((order >> (oi * 2) & 3) === 1) {
						orderString.push("Y");
					} else if ((order >> (oi * 2) & 3) === 2) {
						orderString.push("Z");
					}
				}
				e = new THREE.Euler(srcValue[0], srcValue[1], srcValue[2], orderString);
				q.setFromEuler(e);
				desValue = [ q.x, q.y, q.z, q.w ];
			} else {
				desValue = srcValue.slice();
			}
		} else if (desForm === AnimationRotateType.angleAxis) {
			if (srcForm === AnimationRotateType.quaternion) {
				desValue = this._getAngleAxisFromQuaternion(srcValue);
			} else if (srcForm === AnimationRotateType.euler) {
				order = Math.round(srcValue[3]);
				orderString = "";
				for (oi = 0; oi < 3; oi++){
					if ((order >> (oi * 2) & 3) === 0) {
						orderString.push("X");
					} else if ((order >> (oi * 2) & 3) === 1) {
						orderString.push("Y");
					} else if ((order >> (oi * 2) & 3) === 2) {
						orderString.push("Z");
					}
				}
				e = new THREE.Euler(srcValue[0], srcValue[1], srcValue[2], orderString);
				q.setFromEuler(e);
				desValue = this._getAngleAxisFromQuaternion(srcValue);
			} else {
				desValue = srcValue.slice();
			}
		} else if (desForm === AnimationRotateType.euler) {
			if (srcForm === AnimationRotateType.quaternion) {
				desValue = this._getEnulerFromQuaternion(srcValue);
			} else if (srcForm === AnimationRotateType.angleAxis) {
				q = new THREE.Quaternion();
				axis = new THREE.Vector3(srcValue[0], srcValue[1], srcValue[2]);
				axis.normalize();
				q.setFromAxisAngle(axis, srcValue[3]);
				desValue = this._getAngleAxisFromQuaternion(q);
			} else {
				desValue = srcValue.slice();
			}
		}
		return desValue;
	};

	/**
	 * add a key frame using current node property
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#addKeyFrameByNodeProperty
	 * @param {object} target - scene node reference
	 * @param {sap.ui.vk.AnimationTrackType} trackType rotate, translate, scale, opacity, or color
	 * @param {float} time of the key frame
	 * @param {boolean} notFireEvent optional if fire keyFrameAdded event
	 * @return {float[]} value of node property added
	 * @public
	 */
	AnimationSequence.prototype.addKeyFrameByNodeProperty = function(target, trackType, time, notFireEvent) {
		var value;

		var material;
		var rotateType;
		if (trackType === AnimationTrackType.rotate) {
			value = [ target.quaternion.x, target.quaternion.y, target.quaternion.z, target.quaternion.w ];
			rotateType = AnimationRotateType.quaternion;
		} else if (trackType === AnimationTrackType.translate) {
			value = [ target.position.x, target.position.y, target.position.z ];
		} else if (trackType === AnimationTrackType.scale) {
			value = [ target.scale.x, target.scale.y, target.scale.z ];
		} else if (trackType === AnimationTrackType.opacity) {
			if (target) {
				material = target.material;
				if (material && material.opacity !== undefined) {
					value = [ material.opacity ];
				}
			}
		} else if (trackType === AnimationTrackType.color) {
			if (target) {
				material = target.material;
				if (material && material.color) {
					value = [ material.color.r, material.color.g, material.color.b ];
				}
			}
		}

		if (value) {
			this.addKeyFrame(target, trackType, time, value, rotateType, notFireEvent);
		}

		return value;
	};

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
	 *
	 * @public
	 */
	AnimationSequence.prototype.updateKeyFrameByNodeProperty = function(target, trackType, time, index, notFireEvent) {
		this.deleteKeyFrame(target, trackType, index, true);
		var value = this.addKeyFrameByNodeProperty(target, trackType, time, true);
		if (!notFireEvent) {
			this.fireKeyFrameUpdated({ sequenceId: this.getSequenceId(), targetNodeRef: target, trackType: trackType, keyFrameValue: value, keyFrameTime: time, keyFrameIndex: index });
		}
	};

	/**
	 * Get values of node properties at the end of animation sequence
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getNodesEndValues
	 * @returns {Map} Map of scene node reference and object that may contain node position
	 * 					node rotation, node scale, node opacity, and node color
	 * @public
	 */
	AnimationSequence.prototype.getNodesEndValues = function() {
		return this._nodesEndData;
	};

	/**
	 * Get values of node properties at the start of animation sequence
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getNodesStartValues
	 * @returns {Map} Map of scene node reference and object that may contain node position
	 * 					node rotation, node scale, node opacity, and node color
	 * @public
	 */
	AnimationSequence.prototype.getNodesStartValues = function() {
		return this._nodesStartData;
	};

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
	AnimationSequence.prototype.hasHighlight = function() {
		return this._hasHighlight;
	};

	/**
	 * Set the animation sequence contains any track representing highlight
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setHasHighlight
	 *
	 * @param {boolean} hasHighlight true if the animation sequence contains track representing highlight
	 *
	 * @public
	 */
	AnimationSequence.prototype.setHasHighlight = function(hasHighlight) {
		this._hasHighlight = hasHighlight;
	};

	AnimationSequence.prototype._cloneKeyFrameTrack = function(track) {  // if latest three.js is used, KeyFrameTrack's clone function should be used

		var times = THREE.AnimationUtils.arraySlice(track.times, 0);
		var values = THREE.AnimationUtils.arraySlice(track.values, 0);

		var TypedKeyframeTrack = track.constructor;
		var clonedTrack = new TypedKeyframeTrack(track.name, times, values);

		clonedTrack.createInterpolant = track.createInterpolant;

		return clonedTrack;
	};

	AnimationSequence.prototype._cloneAnimationClip = function(clip) { // if latest three.js is used, AnimationClip's clone function should be used

		var tracks = [];

		for (var i = 0; clip.tracks && i < clip.tracks.length; i++) {

			tracks.push(this._cloneKeyFrameTrack(clip.tracks[ i ]));
		}

		return new THREE.AnimationClip(clip.name, clip.duration, tracks);
	};

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
	AnimationSequence.prototype.clone = function(sequence, includeHighlight) {
		this.setName(sequence.getName());
		this._hasHighlight = sequence._hasHighlight;

		var entries, next, mapKey, mapValue;

		this._nodesEndData = new Map();
		entries = sequence._nodesEndData.entries();
		next = entries.next();
		while (!next.done) {
			mapKey = next.value[0];
			mapValue = next.value[1];
			this._nodesEndData.set(mapKey, mapValue);
			next = entries.next();
		}

		this._nodesStartData = new Map();
		entries = sequence._nodesStartData.entries();
		next = entries.next();
		while (!next.done) {
			mapKey = next.value[0];
			mapValue = next.value[1];
			this._nodesStartData.set(mapKey, mapValue);
			next = entries.next();
		}

		var target;
		this._nodesPositionTracksMap = new Map();
		entries = sequence._nodesPositionTracksMap.entries();
		next = entries.next();
		while (!next.done) {
			target = next.value[0];
			var tracks = next.value[1];
			next = entries.next();
			this.setPositionTracks(target,
									tracks.rotate.times,
									tracks.translate.times,
									tracks.scale.times,
									tracks.rotate.rotateType,
									tracks.rotate.values,
									tracks.translate.values,
									tracks.scale.values,
									tracks.pivot,
									tracks.rotate.interpolation,
									tracks.translate.interpolation,
									tracks.scale.interpolation);
		}

		this._nodesOpacityTrackMap = new Map();
		entries = sequence._nodesOpacityTrackMap.entries();
		next = entries.next();
		while (!next.done) {
			target = next.value[0];
			var opacityTrack = next.value[1];
			next = entries.next();
			if (!opacityTrack.isHighlight || (opacityTrack.isHighlight && includeHighlight)) {
				this.setOpacityTrack(target,
										opacityTrack.times,
										opacityTrack.values,
										opacityTrack.interpolation,
										opacityTrack.isHighlight);
			}
		}

		this._nodesColorTrackMap = new Map();
		entries = sequence._nodesColorTrackMap.entries();
		next = entries.next();
		while (!next.done) {
			target = next.value[0];
			var colorTrack = next.value[1];
			next = entries.next();
			if (!colorTrack.isHighlight || (colorTrack.isHighlight && includeHighlight)) {
				this.setColorTrack(target,
										colorTrack.times,
										colorTrack.values,
										colorTrack.interpolation,
										colorTrack.isHighlight);
			}
		}

		this.setDuration(sequence.getDuration());
	};

	/**
	 * Get duration of animation sequence
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getDuration
	 *
	 * @return {float} time of animation sequence duration
	 * @public
	 */
	AnimationSequence.prototype.getDuration = function() {
		if (this._duration === 0) {
			return this._animationClip.duration;
		} else {
			return this._duration;
		}
	};

	/**
	 * Set the values of animated properties between the start time of sequence and the start times of corresponding tracks
	 * to the values of target nodes' properties
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#setInitialStatusToTargetNodesValues
	 *
	 * @public
	 */
	AnimationSequence.prototype.setInitialStatusToTargetNodesValues = function() {

		var keys, target, next, track, node;

		keys = this._nodesOpacityTrackMap.keys();
		next = keys.next();
		while (!next.done) {
			target  = next.value;
			var opacityTrack = this._nodesOpacityTrackMap.get(target);
			if (opacityTrack && opacityTrack.nativeTracks) {
				for (var i = 0; i < opacityTrack.nativeTracks.length; i++) {
					track = opacityTrack.nativeTracks[i];
					node = track.userData.targetNode;
					if (track.times[0] > 0) {
						if (node && node.material && node.material.opacity !== undefined) {
							track.values[0] = node.material.opacity;
						} else {
							track.values[0] = 1;
						}
					}
				}
			}
			next = keys.next();
		}

		keys = this._nodesColorTrackMap.keys();
		next = keys.next();
		while (!next.done) {
			target  = next.value;
			var colorTrack = this._nodesColorTrackMap.get(target);
			if (colorTrack && colorTrack.nativeTracks) {
				for (var oi = 0; oi < colorTrack.nativeTracks.length; oi++) {
					track = colorTrack.nativeTracks[oi];
					node = track.userData.targetNode;
					if (track.times[0] > 0 && node && node.material && node.material.color) {
						track.values[0] = node.material.color.r;
						track.values[1] = node.material.color.g;
						track.values[2] = node.material.color.b;
					}
				}
			}
			next = keys.next();
		}

		keys = this._nodesPositionTracksMap.keys();
		next = keys.next();
		while (!next.done) {
			target  = next.value;
			var tracks = this._nodesPositionTracksMap.get(target);
			if (tracks && tracks.scale.nativeTrack) {
				if (tracks.scale.nativeTrack.times[0] > 0) {
					tracks.scale.nativeTrack.values[0] = target.scale.x;
					tracks.scale.nativeTrack.values[1] = target.scale.y;
					tracks.scale.nativeTrack.values[2] = target.scale.z;
				}
			}

			if (tracks && tracks.rotate.nativeTrack) {
				if (tracks.rotate.nativeTrack.times[0] > 0) {
					tracks.rotate.nativeTrack.values[0] = target.quaternion.x;
					tracks.rotate.nativeTrack.values[1] = target.quaternion.y;
					tracks.rotate.nativeTrack.values[2] = target.quaternion.z;
					tracks.rotate.nativeTrack.values[3] = target.quaternion.w;
				}
			}

			if (tracks.translate.nativeTrack) {
				if (tracks.translate.nativeTrack.times[0] > 0) {
					tracks.translate.nativeTrack.values[0] = target.position.x;
					tracks.translate.nativeTrack.values[1] = target.position.y;
					tracks.translate.nativeTrack.values[2] = target.position.z;
				}
			}
			next = keys.next();
		}
	};

	AnimationSequence.prototype._resetNativeTracks = function() {

		var entries, target, track, next;

		entries = this._nodesOpacityTrackMap.entries();
		next = entries.next();
		while (!next.done) {
			target  = next.value[0];
			track = next.value[1];
			if (track.cyclicEnd || track.cyclicStart) {
				this._setNativeOpacityTrack(target);
			}
			next = entries.next();
		}

		entries = this._nodesColorTrackMap.entries();
		next = entries.next();
		while (!next.done) {
			target  = next.value[0];
			track = next.value[1];
			if (track.cyclicEnd || track.cyclicStart) {
				this._setNativeColorTrack(target);
			}
			next = entries.next();
		}

		entries = this._nodesPositionTracksMap.entries();
		next = entries.next();
		while (!next.done) {
			target  = next.value[0];
			var tracks = next.value[1];
			if ((tracks.rotate && (tracks.rotate.cyclicEnd || tracks.rotate.cyclicStart)) ||
				(tracks.translate && (tracks.translate.cyclicEnd || tracks.translate.cyclicStart)) ||
				(tracks.scale && (tracks.scale.cyclicEnd || tracks.scale.cyclicStart))) {
				this._setNativePositionTracks(target);
			}
			next = entries.next();
		}

		this._resetDuration();
	};

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
	AnimationSequence.prototype.setDuration = function(duration) {
		this._duration = duration;
		if (duration > 0) {
			this._animationClip.duration = duration;
		} else {
			this._animationClip.resetDuration();
		}
		this._resetNativeTracks();
	};

	/**
	 * Get native animation clip
	 *
	 * @function
	 * @name sap.ui.vk.AnimationSequence#getNativeAnimationClip
	 *
	 * @return {object} native animation clip
	 * @public
	 */
	AnimationSequence.prototype.getNativeAnimationClip = function() {
		this._resetMaterialTransparentForOpacityTrack();
		return this._animationClip;
	};

	return AnimationSequence;
});
