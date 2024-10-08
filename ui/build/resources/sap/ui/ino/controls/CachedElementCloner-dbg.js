/*!
 * SAP Innovation Management (c) Copyright 2014 SAP AG. All rights reserved.
 */
jQuery.sap.declare("sap.ui.ino.controls.CachedElementCloner");
(function() {
  "use strict";

  /**
   * The cached element cloner is a utility to clone elements and cache them based on their id, i.e. for each instance
   * of the CachedElementCloner an element is cloned once and from then on the clone is re-used. A clone also contains
   * the binding references.
   * 
   * It has been developed for composite controls where aggregations need to be passed to inner controls. Usually in
   * these cases the aggregation would disappear from the composite control as an element can only aggregated once.
   * 
   * The cached element cloner allows to clone objects before passing them to inner controls.
   * 
   */

  sap.ui.base.ManagedObject.extend("sap.ui.ino.controls.CachedElementCloner", {

    init : function() {
      this._oElementClones = {};
    },

    /**
     * @param oElement
     *            element to Clone
     * @param sAggregationName
     *            aggregation where element to Clone currently belongs to
     * @returns a clone
     */
    getClone : function(oElement, sAggregationName) {
      if (this._oElementClones[oElement.getId()]) {
        return this._oElementClones[oElement.getId()];
      } else {
    	
        var oClone = oElement.clone();
        var oBindingInfo = oElement.getBindingInfo(sAggregationName);
        var sModelName = undefined;
        if (oBindingInfo) {
          sModelName = oBindingInfo.model || undefined;
        }
        oClone.setBindingContext(oElement.getBindingContext(), sModelName);
        this._oElementClones[oElement.getId()] = oClone;
        return oClone;
      }
    },
    /**
     * 
     * @param aElements
     *            Elements which need to be cloned
     * @param sAggregationName
     *            Aggregation
     * @returns {Array} of clones
     */
    getClones : function(aElements, sAggregationName) {
      var aClones = [];
      for ( var i = 0; i < aElements.length; i++) {
        aClones.push(this.getClone(aElements[i]));
      }
      return aClones;
    }
  });
})();