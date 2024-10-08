sap.ui.define([
	"./TotaraUtils",
	"./Command"
], function(
	TotaraUtils,
	Command
) {
	"use strict";

	function ResourceQueue(batchSize) {
		this.batchSize = batchSize;
		this.globalList = new Set();
		this.requestedList = [];
		this.waitingList = new Set();
	}

	ResourceQueue.prototype.push = function(id, requestData) {
		id = id.toString();
		if (!this.globalList.has(id)) {
			this.globalList.add(id);
			this.requestedList.push(requestData || id);
			this.waitingList.add(id);
		}
	};

	ResourceQueue.prototype.fetchBatch = function() {
		return this.requestedList.splice(0, this.batchSize);
	};

	ResourceQueue.prototype.pop = function(id) {
		id = id.toString();
		return this.waitingList.delete(id);
	};

	ResourceQueue.prototype.isReady = function(id) {
		id = id.toString();
		return this.globalList.has(id) && !this.waitingList.has(id);
	};

	ResourceQueue.prototype.clear = function() {
		this.globalList.clear();
		this.requestedList = [];
		this.waitingList.clear();
	};

	ResourceQueue.prototype.isEmpty = function() {
		return this.requestedList.length === 0;
	};

	ResourceQueue.prototype.isWaiting = function() {
		return this.waitingList.size > 0;
	};



	function PriorityResourceQueue(batchSize) {
		ResourceQueue.call(this, batchSize);
		this.priorityMap = new Map();
	}

	PriorityResourceQueue.prototype = Object.create(ResourceQueue.prototype);

	PriorityResourceQueue.prototype.constructor = PriorityResourceQueue;

	PriorityResourceQueue.prototype.push = function(id, priority) {
		if (!this.globalList.has(id)) {
			this.globalList.add(id);
			this.requestedList.push(id);
			this.waitingList.add(id);
			this.priorityMap.set(id, priority);
		}
	};

	PriorityResourceQueue.prototype.clear = function() {
		ResourceQueue.prototype.clear.call(this);
		this.priorityMap.clear();
	};

	PriorityResourceQueue.prototype.fetchBatch = function() {
		var priorityMap = this.priorityMap;
		this.requestedList.sort(function(a, b) {
			return priorityMap.get(b) - priorityMap.get(a);
		});
		var batch = ResourceQueue.prototype.fetchBatch.call(this);
		batch.forEach(priorityMap.delete, priorityMap); // remove ids from priorityMap
		return batch;
	};



	var RequestQueue = function(context, sceneId) {
		this.context = context; // SceneContext
		this.sceneId = sceneId;
		this.token = context.token || TotaraUtils.generateToken();

		this.meshes = new ResourceQueue(128);
		this.materials = new ResourceQueue(128);
		this.images = new ResourceQueue(1);
		this.geometries = new PriorityResourceQueue(32);
		this.geomMeshes = new PriorityResourceQueue(32);
		this.annotations = new ResourceQueue(128);
		this.views = new ResourceQueue(1);
		this.tracks = new ResourceQueue(128);
		this.sequences = new ResourceQueue(128);
		this.highlights = new ResourceQueue(1);
	};

	RequestQueue.prototype.isEmpty = function() {
		return this.meshes.isEmpty()
			&& this.annotations.isEmpty()
			&& this.materials.isEmpty()
			&& this.images.isEmpty()
			&& this.geometries.isEmpty()
			&& this.geomMeshes.isEmpty()
			&& this.views.isEmpty()
			&& this.tracks.isEmpty()
			&& this.sequences.isEmpty()
			&& this.highlights.isEmpty();
	};

	RequestQueue.prototype.isWaitingForContent = function() {
		return this.meshes.isWaiting()
			|| this.images.isWaiting()
			|| this.materials.isWaiting()
			|| this.geometries.isWaiting()
			|| this.geomMeshes.isWaiting()
			|| this.annotations.isWaiting()
			|| this.views.isWaiting()
			|| this.tracks.isWaiting()
			|| this.sequences.isWaiting()
			|| this.highlights.isWaiting();
	};

	RequestQueue.prototype.clearContent = function() {
		this.meshes.clear();
		this.annotations.clear();
		this.materials.clear();
		this.images.clear();
		this.geometries.clear();
		this.geomMeshes.clear();
		this.views.clear();
		this.tracks.clear();
		this.sequences.clear();
		this.highlights.clear();
	};

	RequestQueue.prototype.createGetContentCommand = function(commandName, ids, extraOptions) {
		var options = {
			sceneId: this.sceneId,
			ids: ids.map(function(id) { return parseInt(id, 10); }),
			token: this.token
		};
		return TotaraUtils.createRequestCommand(commandName, extraOptions ? Object.assign(options, extraOptions) : options);
	};

	RequestQueue.prototype.generateRequestCommand = function() {
		var ids;
		var command = null;

		if (!this.meshes.isEmpty()) {
			ids = this.meshes.fetchBatch();
			command = this.createGetContentCommand(Command.getMesh, ids);
		} else if (!this.annotations.isEmpty()) {
			ids = this.annotations.fetchBatch();
			command = this.createGetContentCommand(Command.getAnnotation, ids);
		} else if (!this.materials.isEmpty()) {
			ids = this.materials.fetchBatch();
			command = this.createGetContentCommand(Command.getMaterial, ids);
		} else if (!this.geometries.isEmpty()) {
			ids = this.geometries.fetchBatch();
			command = this.createGetContentCommand(Command.getGeometry, ids);
			command.sceneId = this.sceneId;
			command.geometryIds = ids;
		} else if (!this.geomMeshes.isEmpty()) {
			ids = this.geomMeshes.fetchBatch();
			command = this.createGetContentCommand(Command.getMesh, ids, { $expand: "geometry" });
			command.sceneId = this.sceneId;
			command.meshIds = ids;
		} else if (!this.images.isEmpty()) {
			ids = this.images.fetchBatch();
			command = this.createGetContentCommand(Command.getImage, [ ids[ 0 ].imageId ]);
			command.sceneId = this.sceneId;
			command = Object.assign(command, ids[ 0 ]);
		} else if (!this.sequences.isEmpty()) {
			ids = this.sequences.fetchBatch();
			command = this.createGetContentCommand(Command.getSequence, ids);
		} else if (!this.tracks.isEmpty()) {
			ids = this.tracks.fetchBatch();
			command = this.createGetContentCommand(Command.getTrack, ids);
		} else if (!this.views.isEmpty()) {
			ids = this.views.fetchBatch();
			command = TotaraUtils.createRequestCommand(Command.getView, {
				sceneId: this.sceneId,
				groupId: ids[0].viewGroupId,
				id: ids[0].viewId,
				includeHidden: this.context.includeHidden !== undefined ? this.context.includeHidden : false, // not include hidden by default,
				includeAnimation: this.context.includeAnimation !== undefined ? this.context.includeAnimation : true, // include animation by default,
				token: this.token
			});
		} else if (!this.highlights.isEmpty()) {
			ids = this.highlights.fetchBatch();
			command = TotaraUtils.createRequestCommand(Command.getHighlightStyle, {
				sceneId: this.sceneId,
				id: ids[ 0 ],
				token: this.token
			});
		}

		return command;
	};

	return RequestQueue;
});
