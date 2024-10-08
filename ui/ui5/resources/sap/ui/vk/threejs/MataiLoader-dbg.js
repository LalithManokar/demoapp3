/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.threejs.MataiLoader.
sap.ui.define([
	"sap/base/Log",
	"./SceneBuilder"
], function(
	Log,
	SceneBuilder
) {
	"use strict";

	var onmessage = function(event) {
		var data = event.data;
		if (data.ready) {
			onmessage.resolve();
		} else {
			var sceneBuilder = SceneBuilder.getById(data.sceneBuilderId);
			sceneBuilder[data.method].apply(sceneBuilder, data.args);
		}
	};

	var onerror = function(event) {
		Log.error("Error in WebWorker", event);
	};

	var getWorker = (function() {
		var promise;
		return function() {
			return promise || (promise = new Promise(function(resolve) {
				var worker = new Worker(sap.ui.require.toUrl("sap/ui/vk/threejs/MataiLoaderWorker.js"));
				onmessage.resolve = resolve.bind(null, worker);
				worker.onmessage = onmessage;
				worker.onerror = onerror;
			}));
		};
	})();

	var loadContent = function(buffer, url, parentNode, contentResource, resolve, reject) {
		getWorker().then(function(worker) {
			var sceneBuilder = new SceneBuilder(parentNode, contentResource, resolve, reject);
			worker.postMessage(
				{
					method: "loadSceneFromArrayBuffer",
					sceneBuilderId: sceneBuilder.getId(),
					buffer: buffer,
					fileName: url,
					sourceLocation: "remote"
				},
				[ buffer ]
			);
		});
	};

	return function(parentNode, contentResource) {
		return new Promise(function(resolve, reject) {
			// download contentResource.source
			// pass it to worker
			if (typeof contentResource.getSource() === "string") {
				var url = contentResource.getSource();
				fetch(url)
					.then(function(response) {
						if (response.ok) {
							return response.arrayBuffer();
						}
						throw (new Error(response.statusText));
					})
					.then(function(buffer) {
						loadContent(buffer, url, parentNode, contentResource, resolve, reject);
					})
					.catch(function(err) {
						reject(err);
					});
			} else if (contentResource.getSource() instanceof File) {
				var reader = new FileReader();
				reader.onload = function(e) {
					loadContent(e.target.result, contentResource.getSource().name, parentNode, contentResource, resolve, reject);
				};
				reader.onerror = function(err) {
					reject(err);
				};
				reader.readAsArrayBuffer(contentResource.getSource());
			}
		});
	};
});
