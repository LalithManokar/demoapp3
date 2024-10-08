(function() {
	"use strict";

	var tileWidths = new Map();

	function HttpConnection() {
		var url, cid;
		var authHandler;
		var onErrorCallback;
		var requestQueue = [];
		var maxActiveRequests = 4;
		var activeRequestCount = 0;

		function makeRequestPromise(url) {
			var promise = new Promise(function(resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.onload = function() {
					if (this.status >= 200 && this.status < 300) {
						resolve(xhr.response);
						if (xhr.getAllResponseHeaders().includes("tile-width")) {
							var tileWidth = xhr.getResponseHeader("tile-width");
							var re = new RegExp("[^\/]+$");
							var imageId = xhr.responseURL.match(re); // Get imageId from end of URL
							tileWidths.set(imageId[0], tileWidth);
						}
					} else {
						reject({
							status: this.status,
							statusText: xhr.statusText
						});
					}
				};

				xhr.onerror = function() {
					reject({
						status: this.status,
						statusText: xhr.statusText
					});
				};

				xhr.open("GET", url, true);
				if (authHandler) {
					xhr.setRequestHeader("Authorization", authHandler);
				}
				xhr.setRequestHeader("X-CorrelationID", cid);
				xhr.responseType = "arraybuffer";
				xhr.send();
			});
			return promise;
		}

		this.getUrl = function() {
			return url;
		};

		this.close = function() {
			// don't really need to close anything
		};

		this.send = function(msg, context, onResponse) { // optional context for error handling, custom onResponse callback function
			if (!msg) {
				return;
			}

			requestQueue.push({
				message: msg,
				context: context,
				onResponse: onResponse || this.onResponse
			});

			if (activeRequestCount < maxActiveRequests) {
				_processNextRequest();
			}
		};

		function _processNextRequest() {
			if (!requestQueue.length) {
				return;
			}
			var request = requestQueue.shift();
			activeRequestCount++;
			// console.log(url + request.message);
			makeRequestPromise(encodeURI(url + request.message)).then(function(result) {
				if (request.onResponse) {
					request.onResponse(result);
				}
				activeRequestCount--;
				_processNextRequest();
			}).catch(function(reason) {
				if (onErrorCallback) {
					onErrorCallback({
						errorText: "Could not connect to server: " + url,
						error: reason.status,
						reason: reason.message ? reason.message : reason,
						context: request.context
					});
				}
				activeRequestCount--;
				_processNextRequest();
			});
		}

		this.init = function(serverUrl, authorizationHandler, correlationId) {
			return new Promise(function(resolve, reject) {
				url = serverUrl;
				cid = correlationId;
				if (authorizationHandler != null) {
					authorizationHandler(serverUrl).then(function(token) {
						if (token != null) {
							authHandler = token.token_type + " " + token.access_token;
						} else {
							authHandler = null;
						}
						resolve({});
					}).catch(function(reason) {
						return reject(reason);
					});
				} else {
					resolve({});
				}
			});
		};

		this.setOnErrorCallback = function(callback) {
			onErrorCallback = callback;
		};

		this.onResponse = null;
	}

	function WebSocketConnection() { // inputUrl
		var lastConnectedWebsocketUri;

		var that = this;
		var connection;
		var onErrorCallback;

		function isConnectionOk() {
			if (connection && connection.readyState === 1) {
				return true;
			}
			return false;
		}

		function err(msg, context, code) {
			if (onErrorCallback) {
				onErrorCallback({
					errorText: msg,
					error: code,
					context: context
				});
			}
		}

		this.setOnErrorCallback = function(callback) {
			onErrorCallback = callback;
		};

		this.getUrl = function() {
			return lastConnectedWebsocketUri;
		};

		this.close = function() {
			if (connection) {
				connection.close();
				connection = null;
			}
		};

		this.send = function(msg, context) { // optional context for error handling
			if (!msg) {
				return;
			}

			if (!isConnectionOk()) {
				err("websocket connection lost", context, 4);  // TODO: add enum with error codes, this one is internal server error
			} else {
				try {
					connection.send(msg);
				} catch (e) {
					err(e, context);
				}
			}
		};

		var timerId = 0;
		function keepAlive() {
			var timeout = 60000;
			if (connection == null) {
				clearTimeout(timerId);
				return;
			}

			if (connection.readyState == 1) {
				connection.send("");
			}
			timerId = setTimeout(keepAlive, timeout);
		}

		function cancelKeepAlive() {
			if (timerId) {
				clearTimeout(timerId);
				timerId = 0;
			}
		}

		var isInitialised = false;

		var createSetStreamingTokenCommand = function(options) {
			var requestCommandContent = JSON.stringify(options);
			var command = "setStreamingToken" + ("[" + requestCommandContent.length + "]") + requestCommandContent;
			return command;
		};

		this.init = function(serverUrl, authorizationHandler) {
			return new Promise(function(resolve, reject) {
				if (serverUrl) {
					lastConnectedWebsocketUri = serverUrl;
				} else {
					serverUrl = lastConnectedWebsocketUri;
				}

				connection = new WebSocket(serverUrl);
				connection.binaryType = "arraybuffer";

				connection.onopen = function() {
					isInitialised = true;
					if (authorizationHandler != null) {
						authorizationHandler(serverUrl).then(function(token) {
							if (token != null) {
								var cmd = createSetStreamingTokenCommand({ "token": token.access_token });
								connection.send(cmd);
							}

							keepAlive();
							resolve({});
						}).catch(function(reason) {
							return reject(reason);
						});
					} else {
						keepAlive();
						resolve({});
					}
				};

				connection.onclose = function() {
					cancelKeepAlive();
				};

				connection.onmessage = function(e) {
					var msg = e.data;
					if (that.onResponse) {
						that.onResponse(msg);
					}
				};

				connection.onerror = function(e) {
					if (!isInitialised) {
						reject("error connecting to " + serverUrl);
					} else {
						err(e);
					}
				};

			});
		};

		this.onResponse = null;
	}

	function getContentLengths(contentLengthsString) {
		var list = contentLengthsString.split(",");

		if (list.length < 0 || list.length > 2) {
			throw "invalid content length";
		}

		var jsonContentLength = 0;
		var binaryContentLength = 0;

		try {
			jsonContentLength = parseInt(list[0], 10);

			if (list.length === 2) {
				binaryContentLength = parseInt(list[1], 10);
			}

		} catch (e) {
			throw "invalid content length";
		}

		return {
			jsonContentLength: jsonContentLength,
			binaryContentLength: binaryContentLength
		};
	}

	/**
	 * Parse arrayBuffer into a list of protocol commands with payloads.
	 *
	 * @param {ArrayBuffer} arrayBuffer Contains multiple commands in the following format:                                                   <br/>
	 *                                  <code>COMMAND[JSONLENGTH,BINARYLENGTH]{JSON}BINARY</code>                                             <br/>
	 *                                  or                                                                                                    <br/>
	 *                                  <code>COMMAND[JSONLENGTH]{JSON}</code>                                                                <br/>
	 *                                  where                                                                                                 <br/>
	 *                                  <code>JSONLENGTH</code> is the length in bytes of the JSON payload including {} in the UTF-8 encoding,<br/>
	 *                                  <code>BINARYLENGTH</code> is the length of the binary payload immediately following the JSON payload. <br/>
	 *                                  Multiple commands can optionally be delimited by newlines (\n) or spaces (' ').
	 * @returns {objects[]}             An array of objects with the following properties:
	 *                                  <ul>
	 *                                      <li>name: string</li>
	 *                                      <li>jsonContent: object</li>
	 *                                      <li>binaryContent: ArrayBuffer</li>
	 *                                  </ul>
	 * @private
	 */
	function createCommandList(arrayBuffer) {
		var bracketOpen = "[".charCodeAt(0);
		var bracketClose = "]".charCodeAt(0);

		var commandList = [];

		var start = 0;
		var end = 0;

		var contentLengths;
		var jsonContent;
		var binaryContent;

		var uint8Array = new Uint8Array(arrayBuffer); // This is not a copy, this is just a view into arrayBuffer.

		while (end < arrayBuffer.byteLength) {
			end = uint8Array.indexOf(bracketOpen, start);

			if (end === -1) {
				// Could not locate open bracket '['. So, no more commands.
				break;
			}

			// Get the command name and remove possible whitespaces.
			// The streaming protocol allows multiple commands in one message separated by whitespaces,
			// so, the second and subsequent commands might start with whitespaces.
			var commandName = utf8ToString(arrayBuffer, start, end).replace(/\n|\r|\s/g, "");
			start = end + 1;

			end = uint8Array.indexOf(bracketClose, start);

			if (end === -1) {
				throw "No matching [] for command length. abort";
			}

			contentLengths = getContentLengths(utf8ToString(arrayBuffer, start, end));

			start = end + 1;
			end = start + contentLengths.jsonContentLength;

			jsonContent = utf8ToString(arrayBuffer, start, end);
			try {
				jsonContent = JSON.parse(jsonContent); // TODO: Would it be faster to pass the string to the main thread and parse JSON there instead of structured cloning?
			} catch (e) {
				var errMsg = commandName + ": " + e;
				throw errMsg;
			}

			// binary content is optional atm
			if (contentLengths.binaryContentLength) {
				start = end;
				end = start + contentLengths.binaryContentLength;

				binaryContent = arrayBuffer.slice(start, end); // This is a real copy, not just a view.
			} else {
				binaryContent = undefined;
			}

			start = end;

			var command = {
				name: commandName,
				jsonContent: jsonContent
			};

			if (binaryContent) {
				command.binaryContent = new Uint8Array(binaryContent);
			}

			commandList.push(command);
		}

		return commandList;
	}

	function utf8ToString(arrayBuffer, start, end) {
		var encodedString = "";
		// If arrayBuffer is too long, the stack runs out of space in String.fromCharCode.apply,
		// so batch it in certain size.
		var MAX_CHUNK_SIZE = 1000; // arbitrary number here, not too small, not too big
		try {
			while (start < end) {
				var chunkSize = Math.min(MAX_CHUNK_SIZE, end - start);
				var uint8Array = new Uint8Array(arrayBuffer, start, chunkSize); // This does not create a copy of data, this is just a view inside `arrayBuffer`.
				encodedString += String.fromCharCode.apply(null, uint8Array);
				start += chunkSize;
			}
		} catch (e) {
			return "";
		}
		return decodeURIComponent(escape(encodedString));
	}

	function LoaderProxy() {
		// for handling continuous initializeConnection requests
		// there may be multiple requests before connection is establish
		this.resolveFunctions = [];
		this.rejectFunctions = [];

		this.init = function(providedConnection, httpConnection, builderId) {

			this._connection = providedConnection;
			this._connectionHTTP = httpConnection;
			this._sceneBuilderId = builderId;
			if (!providedConnection) {
				throw "no connection provided for loader!";
			}

			this._connection.onResponse = function(response) {
				var commandList = createCommandList(response);
				processCommands(commandList);
			};

			this._connection.send("getVersion[2]{}");
		};

		var that = this;
		function setProtocolVersion(version) {
			that.protocolVersion = version.split(".").map(function(s) { return parseInt(s, 10); });
		}

		function processCommands(commandList) {
			var command;
			// var commandIndexToBeProcessedLast = -1;

			var viewId, i;
			var needAddIdToSetView = false;
			for (i = 0; i < commandList.length; i++) {
				command = commandList[i];
				if (command.name === "setView") {
					if (!command.jsonContent.viewId) {
						needAddIdToSetView = true;
					}
				} else if (command.name === "setViewNode") {
					viewId = command.jsonContent.viewId;
				} else if (command.name === "notifyFinishedView" || command.name === "notifyFinishedTree") {
					break;
				}
			}

			if (viewId && needAddIdToSetView) {
				for (i = 0; i < commandList.length; i++) {
					command = commandList[i];
					if (command.name === "setView") {
						command.jsonContent.viewId = viewId;
						break;
					}
				}
			}

			for (i = 0; i < commandList.length; i++) {
				command = commandList[i];
				if (command.name === "protocol") {
					setProtocolVersion(command.jsonContent.version);
				}
				// if (command.name === "notifyFinishedView" || command.name === "notifyFinishedTree") {
				// 	commandIndexToBeProcessedLast = i;
				// 	continue;
				// }
				if (command.name === "setImage" && tileWidths.get(command.jsonContent.id)){
					command.jsonContent.tileWidth = tileWidths.get(command.jsonContent.id);
				}
				if (command.binaryContent) {
					self.postMessage({
						name: command.name,
						jsonContent: command.jsonContent,
						binaryContent: command.binaryContent
					}, [ command.binaryContent.buffer ]);
				} else {
					self.postMessage({
						name: command.name,
						jsonContent: command.jsonContent
					});
				}
			}

			// if (commandIndexToBeProcessedLast !== -1) {
			// 	command = commandList[commandIndexToBeProcessedLast];
			// 	if (command.binaryContent) {
			// 		self.postMessage({
			// 			name: command.name,
			// 			jsonContent: command.jsonContent,
			// 			binaryContent: command.binaryContent
			// 		}, [ command.binaryContent.buffer ]);
			// 	} else {
			// 		self.postMessage({
			// 			name: command.name,
			// 			jsonContent: command.jsonContent
			// 		});
			// 	}
			// }
		}

		this.getConnection = function() {
			return this._connection;
		};

		this._sendGetImage = function(command) {
			var request;
			if (this.protocolVersion && (this.protocolVersion[0] > 1 || this.protocolVersion[1] > 0)) {
				if (command.materialId) {
					request = "scenes/" + command.sceneId + "/materials/" + command.materialId + "/images/" + command.imageId;
				} else if (command.viewId) {
					request = "scenes/" + command.sceneId + "/views/" + command.viewId + "/thumbnail";
				}
			}
			request = request || ("images/" + command.imageId);
			this._connectionHTTP.send(request, command, function(result) {
				processCommands([ {
					name: "setImage",
					jsonContent: {
						sceneId: command.sceneId,
						id: command.imageId
					},
					binaryContent: new Uint8Array(result)
				} ]);
			});
		};

		this._sendGetGeometries = function(command) {
			var geometryIds = command.geometryIds;
			var request = "geometry?";
			for (var i = 0; i < geometryIds.length; i++) {
				request += (i > 0 ? "&id=" : "id=") + geometryIds[i];
			}
			this._connectionHTTP.send(request, command, function(result) {
				var dataView = new DataView(result);
				// var version = dataView.getUint16(0, true);
				var bufferCount = dataView.getUint16(2, true), offset = 0;
				var commands = [];
				while (bufferCount-- > 0) {
					var geomInfo = {
						sceneId: command.sceneId,
						id: dataView.getUint32(offset + 4, true).toString(),
						box: [
							dataView.getFloat32(offset + 14, true),
							dataView.getFloat32(offset + 18, true),
							dataView.getFloat32(offset + 22, true),
							dataView.getFloat32(offset + 26, true),
							dataView.getFloat32(offset + 30, true),
							dataView.getFloat32(offset + 34, true)
						]
					};

					var geometryType = dataView.getUint16(offset + 12, true);
					offset += 38;

					if (geometryType !== 3) { // for geometry which is not of type 3 (box)
						geomInfo.flags = dataView.getUint16(offset, true);
						// geomInfo.uvChannelCount = dataView.getUint16(offset + 2, true);
						geomInfo.quality = dataView.getFloat32(offset + 4, true);
						geomInfo.pointCount = dataView.getUint16(offset + 8, true);
						geomInfo.elementCount = dataView.getUint16(offset + 10, true);
						// geomInfo.type = dataView.getUint16(offset + 12, true);
						offset += 14;
					}

					var bufferLength = dataView.getUint32(offset, true);
					var buffer = new Uint8Array(result, offset + 4, bufferLength);
					offset += bufferLength;

					commands.push({
						name: "setGeometry",
						jsonContent: geomInfo,
						binaryContent: buffer.slice()
					});
				}
				processCommands(commands);
			});
		};

		this._sendGetGeomMeshes = function(command) {
			var request = "scenes/" + command.sceneId + "/meshes?ids=";
			var meshIds = command.meshIds;
			for (var i = 0; i < meshIds.length; i++) {
				request += (i > 0 ? "," : "") + meshIds[i];
			}
			// request += "&$expand=geometry";
			this._connectionHTTP.send(request, command, function(result) {
				var commandList = createCommandList(result);
				commandList.forEach(function(subCommand) {
					subCommand.jsonContent.sceneId = command.sceneId;
				});
				processCommands(commandList);
			});
		};

		this.send = function(command) {
			if (this._connectionHTTP) {
				switch (command.method) {
					case "getImage":
						this._sendGetImage(command);
						return;

					case "getGeometry":
						this._sendGetGeometries(command);
						return;

					case "getMesh":
						if (command.meshIds) {
							this._sendGetGeomMeshes(command);
							return;
						}
						break;

					default: break;
				}
			}

			if (this._connection) {
				this._connection.send(command.command);
			}
		};

		this.setSceneBuilderId = function(id) {
			this._sceneBuilderId = id;
		};

		this.getSceneBuilderId = function() {
			return this._sceneBuilderId;
		};

		this.authorizationHandler = function(url) {
			var that = this;
			return new Promise(function(resolve, reject) {
				var data = {
					name: "getAuthorization",
					jsonContent: { "url": url },
					sceneId: that.sceneId
				};
				that.resolveFunctions.push(resolve);
				that.rejectFunctions.push(reject);
				self.postMessage(data);
			});
		}.bind(this);
	}

	var loader = new LoaderProxy();

	var reportError = function(error) {
		self.postMessage({ name: "notifyError", jsonContent: error });
	};

	self.onmessage = function(event) {
		var data = event.data;
		switch (data.method) {
			case "initializeConnection": {
				if (!data.url) {
					break;
				}

				if (data.sceneId) {
					loader.sceneId = data.sceneId;
				}

				var endPoint = "";
				// Must end with forward slash
				if (data.url[data.url.length - 1] !== "/") {
					data.url += "/";
				}
				if (data.url.toLowerCase().startsWith("ws")) {
					endPoint = data.url + "streaming?";
				} else if (data.url.toLowerCase().startsWith("http")) {
					endPoint = data.url + "streaming-http?request=";
				} else {
					endPoint = (data.useSecureConnection ? "wss://" : "ws://") + data.url + "streaming?";
				}
				var cid = data.cid;
				var existingConnection = loader.getConnection();
				if (!existingConnection || existingConnection.getUrl() !== endPoint) {
					if (existingConnection) {
						existingConnection.close();
					}

					var connection;
					var cachingEndPoint = null;

					if (data.url.toLowerCase().startsWith("ws")) {
						// As client explicitely requested WebSocket connection we will not initialize HTTP(S) caching connection
						connection = new WebSocketConnection();
					} else if (data.url.toLowerCase().startsWith("http")) {
						// Load geometry and images over HTTP(S) so that browser caching is used.
						connection = new HttpConnection();
						cachingEndPoint = data.url;
					} else {
						// If protocol is not specified then we will use WebSocket connection as the default
						// In this case we will load geometry and images over HTTP(S) connection so that browser caching is used.
						connection = new WebSocketConnection();
						cachingEndPoint = (data.useSecureConnection ? "https://" : "http://") + data.url;
					}
					connection.setOnErrorCallback(function(error) { reportError(error); });
					connection.init(endPoint, loader.authorizationHandler, cid).then(function() {
						var initLoader = function(connection, connectionHttp) {
							loader.init(connection, connectionHttp, data.sceneBuilderId);
							if (data.command) {
								loader.send(data);
							}
						};
						if (cachingEndPoint) {
							// Initialize caching HTTP(S) connection
							var connectionHttp = new HttpConnection();
							connectionHttp.init(cachingEndPoint, loader.authorizationHandler, cid).then(function() {
								initLoader(connection, connectionHttp);
							}).catch(function(error) {
								reportError(error);
							});
						} else {
							initLoader(connection, null);
						}
					}).catch(function(error) {
						reportError(error);
					});
				} else if (data.command) {
					loader.send(data);
				}
				break;
			}
			case "setAuthorization": {
				var resolve = loader.resolveFunctions.shift();
				var reject = loader.rejectFunctions.shift();
				if (data.error == null) {
					resolve(data.authorizationToken);
				} else {
					reject(data.error);
				}
				break;
			}
			case "close": {
				self.close();
				break;
			}
			default: {
				if (data.command) {
					loader.send(data);
				}
				break;
			}
		}
	};

	self.postMessage({ ready: true });
})();
