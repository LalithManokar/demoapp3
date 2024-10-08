/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides AnimationHelper class.

sap.ui.define([
	"./thirdparty/three", "../View", "../AnimationPlayback"
], function(
	three, View, AnimationPlayback
) {
	"use strict";

	/**
	 * Provides help functions for processing animation data.
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.71.13
	 * @experimental Since 1.60.0 This class is experimental and might be modified or removed in future versions.
	 */
	var AnimationHelper = function() {
	};

	AnimationHelper.prototype._getChildNodesWithMaterial = function(pnode, children) {
		for (var cni = 0; pnode.children && cni < pnode.children.length; cni++) {
			var child = pnode.children[cni];
			if (child && child.material && child.material.color){
				children.push(child);
			}
			this._getChildNodesWithMaterial(child, children);
		}
	};

	AnimationHelper.prototype.addAnimationTracksToHighlight = function(highlight) {

		var duration = highlight.duration;
		if (!highlight.cycles) {
			highlight.cycles = 0;
		} else {
			duration /= 2;
		}

		var needOpacityTrack = false;
		var oi;
		for (oi = 0; highlight.opacities && oi < highlight.opacities.length; oi++) {
			if (highlight.opacities[oi] !== 1) {
				needOpacityTrack = true;
				break;
			}
		}
		var opacityTrack;
		var ki, timeInterval;
		if (needOpacityTrack){
			opacityTrack = {};
			opacityTrack.times = [];
			opacityTrack.values = [];
			timeInterval = highlight.duration / highlight.opacities.length;
			for (ki = 0; ki < highlight.cycles + 1; ki++) {
				for (oi = 0; oi < highlight.opacities.length; oi++) {
					opacityTrack.values.push(highlight.opacities[oi]);
					opacityTrack.times.push(timeInterval * (ki *  highlight.opacities.length + oi));
					if (highlight.type === "STATIC") {
						break;
					}
				}
				if (highlight.type === "STATIC") {
					break;
				}
			}
			opacityTrack.data = {};
			opacityTrack.data.type = "OPACITY";
			opacityTrack.data.highlight = highlight;
			highlight.duration = opacityTrack.times[opacityTrack.times.length - 1];
		}

		var needColorTrack = false;
		var ci;
		for (ci = 0; highlight.colours && ci < highlight.colours.length; ci++) {
			var c = highlight.colours[ci];
			if (c[3] !== 0 && (c[0] !== 0 || c[1] !== 0 || c[2] !== 0)) {
				needColorTrack = true;
				break;
			}
		}
		var colorTrack;
		if (needColorTrack) {

			if (highlight.type === "INFINITE" && highlight.colours.length === 1) {
				var additionalColor = [ 0, 0, 0, 0 ];
				highlight.colours.push(additionalColor);
			}

			colorTrack = {};
			colorTrack.times = [];
			colorTrack.values = [];
			timeInterval = highlight.duration / highlight.colours.length;
			for (ki = 0; ki < highlight.cycles + 1; ki++) {
				for (ci = 0; ci < highlight.colours.length; ci++) {
					var color = highlight.colours[ci];
					colorTrack.values.push(color[0], color[1], color[2], color[3]);
					colorTrack.times.push(timeInterval * (ki *  highlight.opacities.length + ci));
					if (highlight.type === "STATIC") {
						break;
					}
				}
				if (highlight.type === "STATIC") {
					break;
				}
			}
			colorTrack.data = {};
			colorTrack.data.type = "COLOR";
			colorTrack.data.highlight = highlight;
			highlight.duration = colorTrack.times[colorTrack.times.length - 1];
		}

		if (colorTrack) {
			highlight.colorTrack = colorTrack;
		}

		if (opacityTrack) {
			highlight.opacityTrack = opacityTrack;
		}
	};

	AnimationHelper.prototype.processHighlights = function(view, viewId, scene) {
		if (!view.highlights ||  !view.highlights.length) {
			return;
		}

		var maxDuration = 0;
		var hi;
		var highlight;
		var hasInfiniteHighlight = false;
		for (hi = 0; hi < view.highlights.length; hi++) {
			highlight = view.highlights[hi];
			if (maxDuration < highlight.duration) {
				maxDuration = highlight.duration;
			}

			if (highlight.type === "INFINITE") {
				hasInfiniteHighlight = true;
			}
		}

		var playbacks = view.getPlaybacks();
		var highlightSequenceId = viewId + "-" + "highlightSequence";
		var highlightPlaybackId = viewId + "-" + "highlightPlayback";
		var animationSequeForHighlight = scene.getAnimationSequence(highlightSequenceId);
		var playbackForHighlights;
		if (!animationSequeForHighlight){
			animationSequeForHighlight = scene.createAnimationSequence(highlightSequenceId);
			animationSequeForHighlight.setHasHighlight(true);

			if (!playbacks) {
				playbacks = [];
			}

			playbackForHighlights = new AnimationPlayback({
				sequenceId: highlightSequenceId,
				pid: highlightPlaybackId,
				infinite: hasInfiniteHighlight,
				startTime: 0
			});

			playbacks.push(playbackForHighlights);

			view.setPlaybacks(playbacks);
		}

		for (var pi = 0; playbacks && pi < playbacks.length; pi++){
			var playback = playbacks[pi];
			var animationSequence = scene.getAnimationSequence(playback.getSequenceId());
			if (animationSequence) {
				var duration = animationSequence.getDuration();
				if (duration > maxDuration) {
					maxDuration = duration;
				}

				if (!playbackForHighlights && playback.getPid() === highlightPlaybackId) {
					playbackForHighlights = playback;
				}
			}
		}

		if (!playbackForHighlights) {
			playbackForHighlights = new AnimationPlayback({
				sequenceId: highlightSequenceId,
				pid: highlightPlaybackId,
				infinite: hasInfiniteHighlight,
				startTime: 0
			});
			if (!playbacks) {
				playbacks = [];
			}
			playbacks.push(playbackForHighlights);
			view.setPlaybacks(playbacks);
		}

		if (Math.abs(maxDuration - 0.0) < 1e-6) {
			maxDuration = 0.001;
		}

		if (hasInfiniteHighlight) {
			playbackForHighlights.setInfinite(true);
		}

		if (!animationSequeForHighlight.userData) {
			animationSequeForHighlight.userData = {};
		}

		var resetStaticHighlightDuration = true;
		if (!animationSequeForHighlight.userData.maxDuration || Math.abs(animationSequeForHighlight.userData.maxDuration - maxDuration) < 1e-6) {
			animationSequeForHighlight.userData.maxDuration = maxDuration;
		} else {
			resetStaticHighlightDuration = false;
		}

		for (hi = 0; hi < view.highlights.length; hi++) {
			highlight = view.highlights[hi];
			this._processHighlight(highlight, animationSequeForHighlight, resetStaticHighlightDuration);
		}
	};

	AnimationHelper.prototype._processHighlight = function(highlight, animationSequence, resetStaticHighlightDuration) {
		if (!highlight || (!highlight.opacityTrack && !highlight.colorTrack) || !animationSequence) {
			return;
		}

		if (!animationSequence.userData.highlights) {
			animationSequence.userData.highlights = new Map();
		}


		for (var hi = 0; highlight.highlightNodes && hi < highlight.highlightNodes.length; hi++){
			var node = highlight.highlightNodes[hi];

			var nodesWithMaterial = [];
			if (node.material && node.material.color) {
				nodesWithMaterial.push(node);
			} else {
				this._getChildNodesWithMaterial(node, nodesWithMaterial);
			}

			if (nodesWithMaterial.length === 0) {
				continue;
			}

			var storedHighlight = animationSequence.userData.highlights.get(node);
			if (storedHighlight && (!resetStaticHighlightDuration)) {
				continue;
			} else {
				animationSequence.userData.highlights.set(node, highlight);
			}

			if (highlight.opacityTrack) {
				if (highlight.type === "STATIC" && highlight.opacityTrack.values.length === 1) {
					highlight.opacityTrack.times.push(animationSequence.userData.maxDuration);
					highlight.opacityTrack.values.push(highlight.opacityTrack.values[highlight.opacityTrack.values.length - 1]);
				}
				animationSequence.setOpacityTrack(node, highlight.opacityTrack.times, highlight.opacityTrack.values, "linear", true);
			}

			if (highlight.colorTrack) {

				// for non-tatic highlight, extra final key frame is used for reseting the node color to its original
				var resetEndColor = false;
				if (highlight.colorTrack.times.length > 1 && highlight.type !== "INFINITE") {
					resetEndColor = true;
				}

				for (var ni = 0; ni < nodesWithMaterial.length; ni++) {
					var mNode = nodesWithMaterial[ni];
					var nodeMaterial = mNode.material;
					if (mNode.userData && mNode.userData.originalMaterial) {
						nodeMaterial = mNode.userData.originalMaterial;
					}
					var color = new THREE.Color();
					var ci;
					var cTrack = {};
					cTrack.times = [];
					cTrack.values = [];
					cTrack.data = highlight.colorTrack.data;
					var startTime = 0.0;
					if (resetEndColor) { // for reversed playback, set to original color at the end
						startTime = 0.05;
						cTrack.times.push(0.0);
						cTrack.values.push(nodeMaterial.color.r, nodeMaterial.color.g, nodeMaterial.color.b);
					}
					for (ci = 0; ci < highlight.colorTrack.times.length; ci++) {
						cTrack.times.push(highlight.colorTrack.times[ci] + startTime);
						color.fromArray(highlight.colorTrack.values, ci * 4).lerp(nodeMaterial.color, 1 - highlight.colorTrack.values[ ci * 4 + 3]);
						cTrack.values.push(color.r, color.g, color.b);
					}
					if (resetEndColor) { // for not reversed playback, set to original color at the end
						cTrack.times.push(cTrack.times[cTrack.times.length - 1] + 0.05);
						cTrack.values.push(nodeMaterial.color.r, nodeMaterial.color.g, nodeMaterial.color.b);
					}

					if (highlight.type === "INFINITE") {

						var timeInterval = 0.05;
						if (cTrack.times.length > 1) {
							timeInterval = cTrack.times[cTrack.times.length - 1] - cTrack.times[cTrack.times.length - 2];
						}
						startTime = cTrack.times[cTrack.times.length - 1] + timeInterval;
						var endTime = startTime;
						while (endTime < animationSequence.userData.maxDuration) {
							for (ci = 0; ci < highlight.colorTrack.times.length && endTime < animationSequence.userData.maxDuration; ci++) {
								endTime = highlight.colorTrack.times[ci] + startTime;
								cTrack.times.push(endTime);
								color.fromArray(highlight.colorTrack.values, ci * 4).lerp(nodeMaterial.color, 1 - highlight.colorTrack.values[ ci * 4 + 3]);
								cTrack.values.push(color.r, color.g, color.b);
							}
							startTime = endTime + timeInterval;
						}
					}

					if (highlight.type === "STATIC" && cTrack.values.length === 1) {
						cTrack.times.push(animationSequence.userData.maxDuration);
						var v1 = cTrack.values[cTrack.values.length - 3];
						var v2 = cTrack.values[cTrack.values.length - 2];
						var v3 = cTrack.values[cTrack.values.length - 1];
						cTrack.values.push(v1, v2, v3);
					}
					animationSequence.setColorTrack(mNode, cTrack.times, cTrack.values, "linear", true);
				}
			}
		}
	};

	AnimationHelper.prototype.insertTracks = function(tracks, trackIdSequenceNodeMap, nodes, scene) {
		var sequenceIdNodeTrackMap = new Map();

		var track, node, trackArray;
		var ti, di;
		for (ti = 0; ti < tracks.length; ti++) {
			track = tracks[ti];
			var trackData = trackIdSequenceNodeMap.get(track.id);
			if (!trackData || !trackData.length) {
				continue;
			}
			for (di = 0; di < trackData.length; di++) {
				node = nodes.get(trackData[di].targetId);
				if (!node) {
					continue;
				}
				var NodeTrackMap = sequenceIdNodeTrackMap.get(trackData[di].sequenceId);
				if (!NodeTrackMap) {
					NodeTrackMap = new Map();
				}

				trackArray = NodeTrackMap.get(node);
				if (!trackArray) {
					trackArray = [];
				}
				track.data = trackData[di];
				trackArray.push(track);
				NodeTrackMap.set(node, trackArray);
				sequenceIdNodeTrackMap.set(trackData[di].sequenceId, NodeTrackMap);
			}
			trackIdSequenceNodeMap.delete(track.id);
		}

		var entries = sequenceIdNodeTrackMap.entries();
		var next = entries.next();
		while (!next.done) {
			var sequenceId = next.value[0];
			var nodeTrackMap = next.value[1];
			next = entries.next();

			var animationSequence = scene.getAnimationSequence(sequenceId);
			if (!animationSequence) {
				continue;
			}

			var nodeEntries = nodeTrackMap.entries();
			var nextNode = nodeEntries.next();
			while (!nextNode.done) {
				node = nextNode.value[0];
				trackArray = nextNode.value[1];
				nextNode = nodeEntries.next();

				var pivot = null;

				for (ti = 0; ti < trackArray.length; ti++) {
					track = trackArray[ti];
					if (track.data.pivot) {
						pivot = track.data.pivot;
						break;
					}
				}

				var translateTrack = {};
				var scaleTrack = {};
				var rotateTrack = {};

				for (ti = 0; ti < trackArray.length; ti++) {
					track = trackArray[ti];
					if (track.data.type === "TRANSLATE") {
						translateTrack = track;
					} else if (track.data.type === "ROTATE") {
						rotateTrack = track;
					} else if (track.data.type === "SCALE") {
						scaleTrack = track;
					} else if (track.data.type === "OPACITY") {
						animationSequence.setOpacityTrack(node, track.times, track.values, track.interpolation, track.cyclicInfo);
					} else if (track.data.type === "COLOR") {
						animationSequence.setColorTrack(node, track.times, track.values, track.interpolation, track.cyclicInfo);
					}
				}
				animationSequence.setPositionTracks(node,
													rotateTrack.times,
													translateTrack.times,
													scaleTrack.times,
													rotateTrack.rotateType,
													rotateTrack.values,
													translateTrack.values,
													scaleTrack.values,
													pivot,
													rotateTrack.interpolation,
													translateTrack.interpolation,
													scaleTrack.interpolation,
													rotateTrack.cyclicInfo,
													translateTrack.cyclicInfo,
													scaleTrack.cyclicInfo);
			}
		}
		return this;
	};

	// The node initial positions in a view should not be affected by the animations of the subsequent views
	// This function is to reset the node initial positions which may be changed by those animations
	AnimationHelper.prototype.setInitialNodePositionsFromSubsequentViews = function(views, scene, onlyCheckHighlight) {

		if (!views || !views.length) {
			return;
		}

		var animationSequence, nodeData, nextEntry;

		var currentNodeData = new Map();

		for (var vi = views.length - 1; vi > 0; vi--) {
			var subsequentView = views[vi];

			var subsequentPlaybacks;
			if (subsequentView) {
				subsequentPlaybacks = subsequentView.getPlaybacks();
			}

			if (subsequentPlaybacks) {
				for (var pi = subsequentPlaybacks.length - 1; pi >= 0; pi--) {
					var subsequentPlayback = subsequentPlaybacks[pi];

					if (subsequentPlayback) {
						animationSequence = scene.getAnimationSequence(subsequentPlayback.getSequenceId());
						if (animationSequence) {

							if (onlyCheckHighlight && !animationSequence.hasHighlight()) {
								continue;
							}
							if (!subsequentPlayback.getReversed()) {
								nodeData = animationSequence.getNodesStartValues().entries();
							} else {
								nodeData = animationSequence.getNodesEndValues().entries();
							}
							nextEntry = nodeData.next();
							while (!nextEntry.done) {
								currentNodeData.set(nextEntry.value[0], nextEntry.value[1]);
								nextEntry = nodeData.next();
							}
						}
					}
				}
			}

			var currentView = views[vi - 1];

			if (currentView) {

				if (!currentView.userData) {
					currentView.userData = {};
				}

				if (!currentView.userData.nodeStartDataByAnimation) {
					currentView.userData.nodeStartDataByAnimation = new Map();
				}

				nodeData = currentNodeData.entries();
				nextEntry = nodeData.next();
				while (!nextEntry.done) {
					currentView.userData.nodeStartDataByAnimation.set(nextEntry.value[0], nextEntry.value[1]);
					nextEntry = nodeData.next();
				}
			}
		}
	};

	// The node initial positions in a view should be the positions that are changed by the animations of the previous views
	// This function is to reset the node initial positions to those changed positions
	AnimationHelper.prototype.setInitialNodePositionsFromPreviousViews = function(views, scene, onlyCheckHighlight) {

		if (!views || !views.length) {
			return;
		}

		var animationSequence, nodeData, nextEntry;

		var currentNodeData = new Map();

		for (var vi = 0; vi < views.length - 1; vi++) {
			var previousView  = views[vi];

			var previousPlaybacks;
			if (previousView) {
				previousPlaybacks = previousView.getPlaybacks();
			}

			if (previousPlaybacks) {
				for (var pi = 0; pi < previousPlaybacks.length; pi++) {
					var previousPlayback = previousPlaybacks[pi];

					if (previousPlayback) {
						animationSequence = scene.getAnimationSequence(previousPlayback.getSequenceId());
						if (animationSequence) {

							if (onlyCheckHighlight && !animationSequence.hasHighlight()) {
								continue;
							}

							if (!previousPlayback.getReversed()) {
								nodeData = animationSequence.getNodesEndValues().entries();
							} else {
								nodeData = animationSequence.getNodesStartValues().entries();
							}
							nextEntry = nodeData.next();
							while (!nextEntry.done) {
								currentNodeData.set(nextEntry.value[0], nextEntry.value[1]);
								nextEntry = nodeData.next();
							}
						}
					}
				}
			}

			var currentView = views[vi + 1];

			if (currentView) {
				if (!currentView.userData) {
					currentView.userData = {};
				}

				if (!currentView.userData.nodeStartDataByAnimation) {
					currentView.userData.nodeStartDataByAnimation = new Map();
				}

				nodeData = currentNodeData.entries();
				nextEntry = nodeData.next();
				while (!nextEntry.done) {
					currentView.userData.nodeStartDataByAnimation.set(nextEntry.value[0], nextEntry.value[1]);
					nextEntry = nodeData.next();
				}
			}
		}
	};

	// if a view contains multiple playbacks, the initial state of a node at the start of
	// view activation should be the state of the node at start of the first
	// playback which changes the node properties
	AnimationHelper.prototype.setInitialNodePositionsOnView = function(view, scene, onlyCheckHighlight) {

		if (!view) {
			return;
		}

		var nodeData, nextEntry;

		var currentPlaybackIndex = 0;
		var currentPlaybacks = null;
		currentPlaybacks = view.getPlaybacks();

		if (!currentPlaybacks || !currentPlaybacks.length) {
			return;
		}

		if (!view.userData) {
			view.userData = {};
		}

		if (!view.userData.nodeStartDataByAnimation) {
			view.userData.nodeStartDataByAnimation = new Map();
		}

		for (var cpi = currentPlaybacks.length - 1; cpi >= currentPlaybackIndex; cpi--) {
			var pb = currentPlaybacks[cpi];

			var animationSequence = scene.getAnimationSequence(pb.getSequenceId());
			if (animationSequence) {

				if (onlyCheckHighlight && !animationSequence.hasHighlight()) {
					continue;
				}

				if (pb.getReversed()) {
					nodeData = animationSequence.getNodesEndValues().entries();
				} else {
					nodeData = animationSequence.getNodesStartValues().entries();
				}
				nextEntry = nodeData.next();
				while (!nextEntry.done) {
					view.userData.nodeStartDataByAnimation.set(nextEntry.value[0], nextEntry.value[1]);
					nextEntry = nodeData.next();
				}
			}
		}
	};

	// if a view contains multiple playbacks, the initial state of a node at the start of
	// view activation should be the state of the node at start of the first
	// playback which changes the node properties
	AnimationHelper.prototype.setInitialNodePositionsFromCurrenetViews = function(views, scene, onlyCheckHighlight) {

		if (!views || !views.length) {
			return;
		}

		for (var vi = 0; vi < views.length; vi++) {
			var currentView  = views[vi];

			if (!currentView) {
				continue;
			}

			this.setInitialNodePositionsOnView(currentView, scene, onlyCheckHighlight);
		}
	};

	// Used for matai vds file reading, as the start time for playback is not set
	AnimationHelper.prototype.setPlaybackStartTimes = function(views, scene) {

		if (!views || !views.length) {
			return;
		}

		for (var vi = 0; vi < views.length; vi++) {
			var currentView = views[vi];

			if (!currentView) {
				continue;
			}

			var currentPlaybacks = null;
			if (currentView) {
				currentPlaybacks = currentView.getPlaybacks();
			}

			if (!currentPlaybacks || !currentPlaybacks.length) {
				continue;
			}
			var time = 0;
			for (var cpi = 0; cpi < currentPlaybacks.length; cpi++) {
				var pb = currentPlaybacks[cpi];

				var animationSequence = scene.getAnimationSequence(pb.getSequenceId());
				if (animationSequence && animationSequence.hasHighlight()) {
					continue;
				}
				var animationClip;
				if (animationSequence) {
					animationClip = animationSequence.getNativeAnimationClip();
				}

				if (animationClip && !animationClip.hasOptimized) {
					animationClip.resetDuration();
					animationClip.optimize();
					animationClip.hasOptimized = true;
				}

				if (animationClip) {
					pb.setStartTime(time);

					var playbackScale = 1;
					if (pb.getTimeScale() && pb.getTimeScale() > 0) {
						playbackScale = 1 / pb.getTimeScale();
					}

					var repeat = 1;
					if (pb.getRepeat() > 1) {
						repeat = pb.getRepeat();
					}
					time += pb.getPreDelay() + repeat * animationSequence.getDuration() * playbackScale + pb.getPostDelay();
				}
			}
		}
	};

	AnimationHelper.prototype.prepareViewForAnimation = function(view) {

		var nodeInfo;
		if (view && view.getNodeInfos) {
			nodeInfo = view.getNodeInfos();
		}

		if (!nodeInfo) {
			return;
		}

		if (!view.userData) {
			view.userData = {};
		}

		if (!view.userData.nodesDataByView) {
			view.userData.nodesDataByView = new Map();
		} else {
			return;
		}

		function arrayToMatrixThree(array) {
			return new THREE.Matrix4().set(array[0], array[1], array[2], array[3], array[4], array[5], array[6], array[7], array[8], array[9], array[10], array[11], 0, 0, 0, 1);
		}

		for (var vi = 0; vi < nodeInfo.length; vi++) {
			var node = nodeInfo[vi];
			if (!node || !node.target) {
				continue;
			}

			var data = {};
			if (node.transform) {
				data.position = new THREE.Vector3();
				data.scale = new THREE.Vector3();
				data.quaternion = new THREE.Quaternion();
				var newMatrix = arrayToMatrixThree(node.transform);
				newMatrix.decompose(data.position, data.quaternion, data.scale);
				view.userData.nodesDataByView.set(node.target, data);
			}
		}
	};

	AnimationHelper.prototype.getNodePositionByView = function(view, nodeRef) {
		var data;
		if (!view) {
			return data;
		}

		if (!view.userData || !view.userData.nodesDataByView) {
			this.prepareViewForAnimation(view);
		}

		if (view.userData && view.userData.nodesDataByView) {
			data = view.userData.nodesDataByView.get(nodeRef);
		}

		return data;
	};

	AnimationHelper.prototype.getNodePositionFromNearestPlayback = function(scene, view, sequenceId, nodeRef) {

		var data;
		if (!view || !scene) {
			return data;
		}

		var playbacks = view.getPlaybacks();
		if (!playbacks) {
			return data;
		}

		var pi, playback;
		var currentStartTime = 0;
		for (pi = 0; pi < playbacks.length; pi++) {
			playback = playbacks[pi];
			if (sequenceId == playback.getSequenceId()) {
				currentStartTime = playback.getStartTime();
				break;
			}
		}

		var maxStartTime = 0;
		for (pi = 0; pi < playbacks.length; pi++) {
			playback = playbacks[pi];
			var startTime = playback.getStartTime();
			if (currentStartTime <= startTime) {
				continue;
			}
			if (sequenceId == playback.getSequenceId()) {
				continue;
			}
			var sequence = scene.getAnimationSequence(playback.getSequenceId());
			if (sequence) {
				var nodesData;
				if (playback.getReversed()) {
					nodesData = sequence.getNodesStartValues();
				} else {
					nodesData = sequence.getNodesEndValues();
				}

				var nodeData = nodesData.get(nodeRef);
				if (nodeData && startTime >= maxStartTime) {
					data = nodeData;
					maxStartTime = startTime;
				}
			}
		}

		return data;
	};

	return AnimationHelper;
});
