// transfer json metadata to tree data
function json2TreeTransfer(jsonObj) {
	var __fnIsMappingField = function(vValue) {
		if (typeof(vValue) === "string") {
			return /\{\{[A-Z0-9_]+\}\}/g.test(vValue);
		}
		return false;
	};

	var __fnIsConstantField = function(vValue) {
		return vValue !== '';
	};

	var __fnGetDataType = function(vValue) {
		if (__fnIsMappingField(vValue)) {
			return 'Variant';
		}
		if (__fnIsConstantField(vValue)) {
			return 'Constant';
		}
		return '';
	};

	var __fnGetMappingField = function(sValue) {
		return /\{\{([A-Z0-9_]+)\}\}/g.exec(sValue)[1];
	};

	var __fnGetConstantValue = function(vValue) {
		if (vValue === '{{null}}') {
			return '';
		}
		return vValue;
	};

	var __fnTransfer = function(jsondata, node, pathName) {
		Object.keys(jsondata).forEach(function(element) {
			var object = jsondata[element];
			if (typeof(object) === 'object' && !Array.isArray(element)) {
				var subNode = {
					technicalName: element,
					children: []
				};
				node.push(subNode);
				__fnTransfer(object, subNode.children, pathName + '/' + element);
			} else {
				var sDataType = __fnGetDataType(object);
				if (__fnIsMappingField(element)) {
					// response mapping for constant value
					node.push({
						technicalName: '',
						dataType: sDataType,
						constantsValue: __fnGetConstantValue(object),
						mappingField: __fnGetMappingField(element),
						mappingPath: pathName + '/' + element,
						displayName: ''
					});
				} else {
					node.push({
						technicalName: element,
						dataType: sDataType,
						constantsValue: sDataType === 'Constant' ? __fnGetConstantValue(object) : '',
						mappingField: sDataType === 'Variant' ? __fnGetMappingField(object) : '',
						mappingPath: pathName + '/' + element,
						displayName: ''
					});
				}
			}
		});
	};

	var rootNode = {
		children: []
	};
	__fnTransfer(jsonObj, rootNode.children, '');

	return rootNode;
}

function tree2JsonTransfer(treeObj) {
	var __fnGetMappingValue = function(treeNode) {
		if (treeNode.dataType === 'Variant') {
			return '{{' + treeNode.mappingField + '}}';
		} else if (treeNode.dataType === 'Constant') {
			return treeNode.constantsValue === '' ? '{{null}}' : treeNode.constantsValue;
		} else {
			return '';
		}
	};
	var __fnTransfer = function(treeData, jsonPayload) {
		var children = treeData.children;
		if (children && children.length > 0) {
			children.forEach(function(element) {
				if (element.children && element.children.length > 0) {
					if (isNaN(parseInt(element.children[0].technicalName, 10))) {
						jsonPayload[element.technicalName] = {};
						__fnTransfer(element, jsonPayload[element.technicalName]);
					} else {
						jsonPayload[element.technicalName] = [];
						__fnTransfer(element, jsonPayload[element.technicalName]);
					}
				} else {
					__fnTransfer(element, jsonPayload);
				}
			});
		} else {
			if (Array.isArray(jsonPayload)) {
				var objectInArray = {};
				if (treeData.technicalName === '') {
					objectInArray['{{' + treeData.mappingField + '}}'] = __fnGetMappingValue(treeData);
				} else {
					objectInArray[treeData.technicalName] = __fnGetMappingValue(treeData);
				}
				jsonPayload.push(objectInArray);
			} else {
				if (treeData.technicalName === '') {
					jsonPayload['{{' + treeData.mappingField + '}}'] = __fnGetMappingValue(treeData);
				} else {
					jsonPayload[treeData.technicalName] = __fnGetMappingValue(treeData);
				}
			}
		}
	}.bind(this);

	var oPayload = {};
	__fnTransfer(treeObj, oPayload);

	return oPayload;
}