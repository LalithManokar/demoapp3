/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ui.ino.models.object.EvaluationModelStage");

(function(){
    "use strict";

    jQuery.sap.require("sap.ui.ino.models.core.ApplicationObject");
    jQuery.sap.require("sap.ui.ino.models.core.ReadSource");

    sap.ui.ino.models.core.ApplicationObject.extend("sap.ui.ino.models.object.EvaluationModelStage", {
        objectName : "sap.ino.xs.object.evaluation.ModelStage",
        readSource : sap.ui.ino.models.core.ReadSource.getDefaultODataSource("StagingEvaluationModel"),
        invalidation : {
            entitySets : ["StagingEvaluationModel", "StagingEvaluationModelSearch"]
        },
        determinations : {
            onCreate : function(oDefaultData, objectInstance) {
                return {
                    "ID" : -1,
                    "PLAIN_CODE" : "",
                    "DEFAULT_TEXT" : "",
                    "DEFAULT_LONG_TEXT" : ""
                };
            },
            onRead : function(oData, oObjectInstance) {
                // transformation in hierarchy
                var oDataHierarchy = oData;

                if (oDataHierarchy.Criterion) {
                    oDataHierarchy.Criterion = convertToHierarchy(oDataHierarchy.Criterion, "ID",
                            "PARENT_CRITERION_ID");
                    oDataHierarchy.Criterion = sortObjectArray(oDataHierarchy.Criterion, "SEQUENCE_NO");
                    //normalize the sequence no after sorting
                    normalizeSequenceNo(oDataHierarchy.Criterion);
                };

                return oDataHierarchy;
            },
            onNormalizeData : function(oData) {
                // transform to flat data
                var oDataFlat = oData;

                if (oDataFlat.Criterion) {
                    oDataFlat.Criterion = convertToFlatList(oDataFlat.Criterion);
                };

                return oDataFlat;
            },
        },
        oPreviewModel : null,
        oCriterionCodeModel : null,
        setProperty : setProperty,
        addCriterion : addCriterion,
        removeCriterion : removeCriterion,
        getPreviewModel : getPreviewModel,
        getCriterionCodeModel : getCriterionCodeModel,
        moveCriterionUp : moveCriterionUp,
        moveCriterionDown : moveCriterionDown,
    });

    function setProperty(sPath, oValue, oContext) {
        // allow null values for min and may
        var bSuccess = false;
        if (sPath === "WEIGHT" || sPath === "NUM_VALUE_MIN" || sPath === "NUM_VALUE_MAX") {
            if (oValue === "") {
                oValue = null;
                arguments[1] = null;
            }
            else {
                var sDataType = oContext.getProperty("DATATYPE_CODE");
                var nValue = 0;
                if(sDataType == 'INTEGER'){
                    nValue = parseFloat(oValue);
                    nValue = Math.round(nValue);
                    nValue = parseInt(nValue);
                } else {
                    nValue = parseFloat(oValue);
                }
                arguments[1] = nValue;
            }
        }
        bSuccess = sap.ui.ino.models.core.ApplicationObject.prototype.setProperty.apply(this, arguments);
        if (sPath == "SEQUENCE_NO") {
            var oData = this.getData();
            if (oData.Criterion) {
                oData.Criterion = sortObjectArray(oData.Criterion, "SEQUENCE_NO");
                this.setData(oData);
            };
        }
        return bSuccess;
    }

    function addCriterion(sParentID) {
        var oCriterion = {
                "PLAIN_CODE" : "",
                "DATATYPE_CODE" : "",
                "SEQUENCE_NO" : 1,
                "AGGREGATION_TYPE" : "",
                "DEFAULT_TEXT" : "",
                "DEFAULT_LONG_TEXT" : "",
                "PARENT_CRITERION_ID" : 0,
                "IS_OVERALL_RESULT" : 0,
                "UOM_CODE" : "",
                "VALUE_OPTION_LIST_CODE" : "",
                "WEIGHT": null,
                "NUM_VALUE_MIN" : 0,
                "NUM_VALUE_MAX" : 0,
                "NUM_VALUE_STEP_SIZE" : 0,
                "X_AXIS_CRITERION_ID" : 0,
                "X_AXIS_SEGMENT_NO" : 0,
                "Y_AXIS_CRITERION_ID" : 0,
                "Y_AXIS_SEGMENT_NO" : 0,
                "VIS_PARAM_1_CRITERION_ID" : 0,
                "VIS_PARAM_2_CRITERION_ID" : 0
        };

        if (sParentID) {
            oCriterion.PARENT_CRITERION_ID = sParentID;
        };

        //determine the correct sequence number
        var oData = this.getData();
        var iNextSequenceNo = getNextSequenceNo(oCriterion, oData.Criterion);
        oCriterion["SEQUENCE_NO"] = iNextSequenceNo;
        var iHandle = this.addChild(oCriterion, "Criterion");

        //sort & get object again
        oData = this.getData();
        //child is not added in the hierarchy, so we need to rebuild the hierarchy
        oData.Criterion = convertToHierarchy(oData.Criterion, "ID", "PARENT_CRITERION_ID");
        oData.Criterion = sortObjectArray(oData.Criterion, "SEQUENCE_NO");
        this.setData(oData);

        return iHandle;
    }

    function removeCriterion(oCriterion) {
        this.removeChild(oCriterion);
    }

    function moveCriterionDown(oCriterion){
        var oData = this.getData();
        var oNextCriterion = getNextCriterion(oCriterion, oData.Criterion);
        if(oNextCriterion){
            var iNextSequenceNo = oNextCriterion.SEQUENCE_NO;
            oNextCriterion.SEQUENCE_NO = oCriterion.SEQUENCE_NO;
            oCriterion.SEQUENCE_NO = iNextSequenceNo;
            this.updateNode(oCriterion, "Criterion");
            this.updateNode(oNextCriterion, "Criterion");
            //get the data again
            oData = this.getData();
            oData.Criterion = sortObjectArray(oData.Criterion, "SEQUENCE_NO");
            this.setData(oData);
        }
    }

    function moveCriterionUp(oCriterion){
        var oData = this.getData();
        var oPreviousCriterion = getPreviousCriterion(oCriterion, oData.Criterion);
        if(oPreviousCriterion){
            var iPreviousSequenceNo = oPreviousCriterion.SEQUENCE_NO;
            oPreviousCriterion.SEQUENCE_NO = oCriterion.SEQUENCE_NO;
            oCriterion.SEQUENCE_NO = iPreviousSequenceNo;
            this.updateNode(oCriterion, "Criterion");
            this.updateNode(oPreviousCriterion, "Criterion");
            //get the data again
            oData = this.getData();
            oData.Criterion = sortObjectArray(oData.Criterion, "SEQUENCE_NO");
            this.setData(oData);
        }
    }

    function getPreviewModel() {
        if(!this.oPreviewModel){
            this.oPreviewModel = new sap.ui.model.json.JSONModel();
        }
        // get the flat data
        var oData = jQuery.extend(true, {}, this.getData());
        //add artificial fields needed for the actual evaluation
        oData["IDEA_ID"] = 0;
        oData["STATUS_CODE"] = "";
        oData["IDEA_PHASE_CODE"] = "";
        if (oData.Criterion) {
            oData.Criterion = convertToFlatList(oData.Criterion);
            //also add artificial fields here
            for (var i = 0; i < oData.Criterion.length; i++) {
                oData.Criterion[i]["NUM_VALUE"] = oData.Criterion[i]["NUM_VALUE_MIN"] ? oData.Criterion[i]["NUM_VALUE_MIN"] : 0;
                oData.Criterion[i]["TEXT_VALUE"] = "";
                oData.Criterion[i]["BOOL_VALUE"] = 0; //integer boolean
                oData.Criterion[i]["COMMENT"] = "";
            }
        };

        this.oPreviewModel.setData(oData);
        return this.oPreviewModel;
    }

    function getCriterionCodeModel() {
        if(!this.oCriterionCodeModel){
            this.oCriterionCodeModel = new sap.ui.model.json.JSONModel();
        }
        //get an extra code-like model for the criterions
        var oData = jQuery.extend(true, {}, this.getData());
        var aCriterionCodeData = [];
        if (oData.Criterion) {
            oData.Criterion = convertToFlatList(oData.Criterion);
            //also add empty field here
            var oEmptyCriterionCode = {
                    ID : 0,
                    CODE : "",
                    PLAIN_CODE : "",
                    DEFAULT_TEXT : ""
            };
            aCriterionCodeData.push(oEmptyCriterionCode);
            //now add all normal criterions
            for (var i = 0; i < oData.Criterion.length; i++) {
                var oCriterionCode = {
                        ID : oData.Criterion[i].ID,
                        CODE : oData.Criterion[i].CODE,
                        PLAIN_CODE : oData.Criterion[i].PLAIN_CODE,
                        DEFAULT_TEXT : oData.Criterion[i].DEFAULT_TEXT
                };
                aCriterionCodeData.push(oCriterionCode);
            }
        };

        this.oCriterionCodeModel.setData(aCriterionCodeData);
        return this.oCriterionCodeModel;
    }

    function getCriterionByKey(aCriterions, sKey, sValue){
        //finds a Criterion by a given Key and value
        for (var i = 0; i < aCriterions.length; i++) {
            if(aCriterions[i][sKey].SEQUENCE_NO == sValue){
                return aCriterions[i];
            };
            if(aCriterions[i].children){
                var oCriterion = getCriterionByKey(aCriterions[i].children, sKey, sValue);
                if(oCriterion){
                    return oCriterion;
                };
            };
        };
    }

    function normalizeSequenceNo(aCriterions, iSequenceNo){
        //the aCriterions must be sorted!
        if(iSequenceNo == undefined){ iSequenceNo = 0; };

        for (var i = 0; i < aCriterions.length; i++) {
            iSequenceNo++;
            aCriterions[i].SEQUENCE_NO = iSequenceNo;
            if(aCriterions[i].children){
                iSequenceNo = normalizeSequenceNo(aCriterions[i].children, iSequenceNo);
            };
        }
        //return it as an int is "call by value"
        return iSequenceNo;
    }

    var iMaxInt = 9007199254740992;
    var iMinInt = -9007199254740992;

    function getNextSequenceNo(oCriterion, aCriterions){
        // get the Next Sequence Number for the given Criterion
        // Sequence numbers should be continuous over parents and children like
        // 1 (Parent1)
        // ->2 (Child11)
        // ->3 (Child12)
        // 4 (Parent2)
        // ->5 (Child21)
        var iSequenceNo = 1;
        if(oCriterion.PARENT_CRITERION_ID && oCriterion.PARENT_CRITERION_ID != 0){
            // get the parent
            var oParentCriterion = getParent(oCriterion, aCriterions, "ID", "PARENT_CRITERION_ID");
            if(oParentCriterion == null){
                throw new Error("oParentCriterion must not be null");
            }
            if(oParentCriterion.children && oParentCriterion.children.length > 0 ){
                var iMaxSequenceNo = oParentCriterion.SEQUENCE_NO;
                for (var i = 0; i < oParentCriterion.children.length; i++) {
                    if(oParentCriterion.children[i].SEQUENCE_NO > iMaxSequenceNo){
                        iMaxSequenceNo = oParentCriterion.children[i].SEQUENCE_NO;
                    };
                }
                iSequenceNo = iMaxSequenceNo + 1;
            } else {
                iSequenceNo = oParentCriterion.SEQUENCE_NO + 1;
            };
        } else {
            var iMaxSequenceNo = 0;
            for (var i = 0; i < aCriterions.length; i++) {
                if(aCriterions[i].SEQUENCE_NO > iMaxSequenceNo){
                    iMaxSequenceNo = aCriterions[i].SEQUENCE_NO;
                };
            }
            iSequenceNo = iMaxSequenceNo + 1;
        };
        return iSequenceNo;
    }

    function getPreviousCriterion(oCriterion, aCriterions){
        //get the Previous Criterion according to the sequence Number
        var oPreviousCriterion = null;
        if(oCriterion.PARENT_CRITERION_ID && oCriterion.PARENT_CRITERION_ID != 0){
            // get the parent
            var oParentCriterion = getParent(oCriterion, aCriterions, "ID", "PARENT_CRITERION_ID");
            if(oParentCriterion == null){
                throw new Error("oParentCriterion must not be null");
            }
            if(oParentCriterion.children && oParentCriterion.children.length > 0 ){
                var iMaxSmallerSequenceNo = oParentCriterion.SEQUENCE_NO;
                for (var i = 0; i < oParentCriterion.children.length; i++) {
                    if(   oParentCriterion.children[i].SEQUENCE_NO > iMaxSmallerSequenceNo
                       && oParentCriterion.children[i].SEQUENCE_NO < oCriterion.SEQUENCE_NO ){
                        iMaxSmallerSequenceNo = oParentCriterion.children[i].SEQUENCE_NO;
                        oPreviousCriterion = oParentCriterion.children[i];
                    };
                };
            };
        } else {
            var iMaxSmallerSequenceNo = 0;
            for (var i = 0; i < aCriterions.length; i++) {
                if(   aCriterions[i].SEQUENCE_NO > iMaxSmallerSequenceNo
                   && aCriterions[i].SEQUENCE_NO < oCriterion.SEQUENCE_NO){
                   iMaxSmallerSequenceNo = aCriterions[i].SEQUENCE_NO;
                   oPreviousCriterion = aCriterions[i];
               };
            };
        };
        return oPreviousCriterion;
    }

    function getNextCriterion(oCriterion, aCriterions){
        //get the Next Criterion according to the sequence Number
        var oNextCriterion = null;
        if(oCriterion.PARENT_CRITERION_ID && oCriterion.PARENT_CRITERION_ID != 0){
            // get the parent
            var oParentCriterion = getParent(oCriterion, aCriterions, "ID", "PARENT_CRITERION_ID");
            if(oParentCriterion == null){
                throw new Error("oParentCriterion must not be null");
            }
            if(oParentCriterion.children && oParentCriterion.children.length > 0 ){
                var iMinBiggerSequenceNo = iMaxInt;
                for (var i = 0; i < oParentCriterion.children.length; i++) {
                    if(   oParentCriterion.children[i].SEQUENCE_NO < iMinBiggerSequenceNo
                       && oParentCriterion.children[i].SEQUENCE_NO > oCriterion.SEQUENCE_NO ){
                        iMinBiggerSequenceNo = oParentCriterion.children[i].SEQUENCE_NO;
                        oNextCriterion = oParentCriterion.children[i];
                    };
                };
            };
        } else {
            var iMinBiggerSequenceNo = iMaxInt;
            for (var i = 0; i < aCriterions.length; i++) {
                if(   aCriterions[i].SEQUENCE_NO < iMinBiggerSequenceNo
                   && aCriterions[i].SEQUENCE_NO > oCriterion.SEQUENCE_NO){
                   iMinBiggerSequenceNo = aCriterions[i].SEQUENCE_NO;
                   oNextCriterion = aCriterions[i];
               };
            };
        };
        return oNextCriterion;
    }

    function convertToHierarchy(aObjects, sKeyName, sParentKeyName) {

        var aNodeObjects = createStructure(aObjects);

        for (var i = aNodeObjects.length - 1; i >= 0; i--) {
            var oCurrentNode = aNodeObjects[i];

            // Skip over root node.
            if (!oCurrentNode[sParentKeyName] || oCurrentNode[sParentKeyName] == "") {
                continue;
            }

            var oParent = getParent(oCurrentNode, aNodeObjects, sKeyName, sParentKeyName);

            if (oParent == null) {
                continue;
            }

            oParent.children.push(oCurrentNode);
            aNodeObjects.splice(i, 1);
        }

        // What remains in nodeObjects will be the root nodes.

        return aNodeObjects;
    }

    function createStructure(aNodes) {
        var aObjects = [];

        for (var i = 0; i < aNodes.length; i++) {
            if(!aNodes[i]["children"] || !jQuery.isArray(aNodes[i]["children"])){
                aNodes[i]["children"] = []; // create empty array for children later
            }
            aObjects.push(aNodes[i]);
        }

        return aObjects;
    }

    function getParent(oChild, aNodes, sKeyName, sParentKeyName) {
        var oParent = null;

        for (var i = 0; i < aNodes.length; i++) {
            if (aNodes[i][sKeyName] == oChild[sParentKeyName]) {
                oParent = aNodes[i];
                break;
            }
        }

        return oParent;
    }

    function convertToFlatList(aObjects) {
        var aFlatObjects = [];

        for (var i = 0; i < aObjects.length; i++) {
            if (aObjects[i]) {
                var aChildFlatObject = [];
                // first get the children
                if (aObjects[i].children) {
                    aChildFlatObject = convertToFlatList(aObjects[i].children);
                }
                delete aObjects[i].children;
                aFlatObjects.push(aObjects[i]);
                // add the children if there are any
                if (aChildFlatObject.length > 0) {
                    aFlatObjects = aFlatObjects.concat(aChildFlatObject);
                }
            }
        }

        return aFlatObjects;
    }

    function sortObjectArray(aObjects, sSortKeyName) {

        aObjects.sort(function(o1, o2) {
            if (o1[sSortKeyName] < o2[sSortKeyName]) {
                return -1;
            } else {
                return 1;
            }
        });

        for (var i = 0; i < aObjects.length; i++) {
            // if there are children sort them too
            if (aObjects[i].children) {
                sortObjectArray(aObjects[i].children, sSortKeyName);
            }
        }

        return aObjects;
    }

    function reduceObjectArray(aObjects) {
        if (aObjects.length < 1) {
            return null;
        }

        var oObjects = aObjects.reduce(function(o, v, i) {
            o[i] = v;
            if (o[i].children) {
                if (o[i].children == []) {
                    delete o[i].children;
                } else {
                    // recursive call
                    o[i].children = reduceObjectArray(o[i].children);
                }
            }
            // now reduce the value and children part
            if (!o[i].children || o[i].children == {}) {
                o[i] = o[i].value;
            } else {
                o[i] = jQuery.extend({}, o[i].value, o[i].children);
            }

            return o;
        }, {});

        return oObjects;
    }
})();
