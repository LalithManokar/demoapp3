/*!
 * @copyright@
 */
sap.ui.define(["sap/m/FeedListItemRenderer"
, 'sap/ui/core/Renderer'], function(FeedListItemRenderer, Renderer) {
	'use strict';
	var EvalRequestFeedListItemRenderer = Renderer.extend(FeedListItemRenderer);

	EvalRequestFeedListItemRenderer._writeToPrefixSender = function(rm, oFeedListItem, sMyId) {
		rm.write('<span class="sapMFeedListItemTextPrefixName" id="' + sMyId + '-prefixtosender">');
		rm.writeEscaped(oFeedListItem.getPrefixToSender());
		rm.write('</span>');
		rm.write(' ');
	};

	EvalRequestFeedListItemRenderer._writePrefixSender = function(rm, oFeedListItem, sMyId) {
		rm.write('<span class="sapMFeedListItemTextPrefixName" id="' + sMyId + '-prefixsender">');
		rm.writeEscaped(oFeedListItem.getPrefixSender());
		rm.write('</span>');
		rm.write(' ');
	};

	EvalRequestFeedListItemRenderer._writeSender = function(rm, oFeedListItem, sMyId) {
		rm.write('<p id="' + sMyId + '-fullsender" class="sapMFeedListItemTextText"');
		rm.writeAttribute("aria-hidden", true);
		rm.write('>');
		if (oFeedListItem.getPrefixToSender()) {
			this._writeToPrefixSender(rm, oFeedListItem, sMyId);
		}
		if (oFeedListItem.getToSender()) {
			rm.write('<span id="' + sMyId + '-toname" class="sapMFeedListItemTextName">');
			rm.renderControl(oFeedListItem._getLinkToSender());
			rm.write(' ');
			rm.write('</span>');
		}
		if (oFeedListItem.getPrefixSender()) {
			this._writePrefixSender(rm, oFeedListItem, sMyId);
		}
		if (oFeedListItem.getSender()) {
			rm.write('<span id="' + sMyId + '-name" class="sapMFeedListItemTextName">');
			rm.renderControl(oFeedListItem._getLinkSender(false));
			rm.write(' ');
			rm.write('</span>');
		}
		rm.write('</p>');
	};

	EvalRequestFeedListItemRenderer._writeMainText = function(rm, oFeedListItem, sMyId) {
		rm.write('<p id="' + sMyId + '-text" class="sapMFeedListItemTextText"');
		rm.writeAttribute("aria-hidden", true);
		rm.write('>');
		rm.write('<span id="' + sMyId + '-realtext" class="sapMFeedListItemTextString">');
		if (oFeedListItem._checkTextIsExpandable()) {
			this._writeCollapsedText(rm, oFeedListItem, sMyId);
		} else {
			rm.writeEscaped(oFeedListItem.getText(), true);
			rm.write('</span>');
		}
		rm.write('</p>');
	};
	EvalRequestFeedListItemRenderer._writeDate = function(rm, oFeedListItem, sMyId) {
		if (oFeedListItem.getInfo() || !!oFeedListItem.getTimestamp()) {
			// info and date
			rm.write('<p class="sapMFeedListItemFooter sapUiSmallMarginBottom">');
			if (!sap.ui.getCore().getConfiguration().getRTL()) {
				if (oFeedListItem.getInfo()) {
					this._writeInfo(rm, oFeedListItem, sMyId);
					// Write Interpunct separator if necessary (with spaces before and after)
					if (oFeedListItem.getTimestamp()) {
						rm.write("<span>&#160&#160&#x00B7&#160&#160</span>");
					}
				}
				if (oFeedListItem.getTimestamp()) {
					this._writeTimestamp(rm, oFeedListItem, sMyId);
				}
			} else {
				if (oFeedListItem.getTimestamp()) {
					this._writeTimestamp(rm, oFeedListItem, sMyId);
				}
				if (oFeedListItem.getInfo()) {
					// Write Interpunct separator if necessary (with spaces before and after)
					if (oFeedListItem.getTimestamp()) {
						rm.write("<span>&#160&#160&#x00B7&#160&#160</span>");
					}
					this._writeInfo(rm, oFeedListItem, sMyId);
				}
			}
			rm.write('</p>');
		}
	};

	EvalRequestFeedListItemRenderer._RenderPhone = function(rm, oFeedListItem, sMyId) {
		rm.write('<div class= "sapMFeedListItemHeader ');
		if (oFeedListItem.getShowIcon()) {
			rm.write('sapMFeedListItemHasFigure ');
		}
		if (!!oFeedListItem.getSender() && !!oFeedListItem.getTimestamp()) {
			rm.write('sapMFeedListItemFullHeight');
		}
		rm.write('" >');
		rm.write('<p id="' + sMyId + '-fullsender" class="sapMFeedListItemTextText"');
		if (oFeedListItem.getPrefixToSender()) {
			this._writeToPrefixSender(rm, oFeedListItem, sMyId);
		}
		if (oFeedListItem.getToSender()) {
			rm.write('<span id="' + sMyId + '-toname" class="sapMFeedListItemTextName">');
			rm.renderControl(oFeedListItem._getLinkToSender());
			rm.write(' ');
			rm.write('</span>');
		}
		if (oFeedListItem.getPrefixSender()) {
			this._writePrefixSender(rm, oFeedListItem, sMyId);
		}
		if (oFeedListItem.getSender()) {
			rm.write('<span id="' + sMyId + '-name" class="sapMFeedListItemTextName">');
			rm.renderControl(oFeedListItem._getLinkSender(false));
			rm.write('</span>');
		}
		rm.write('</p>');
		if (oFeedListItem.getTimestamp()) {
			// write date
			rm.write('<p class="sapMFeedListItemTimestamp">');
			rm.writeEscaped(oFeedListItem.getTimestamp());
			rm.write('</p>');
		}

		rm.write('</div>');
		rm.write('<p class="sapMFeedListItemText">');
		rm.write('<span id="' + sMyId + '-realtext" class="sapMFeedListItemText">');
		if (oFeedListItem._checkTextIsExpandable()) {
			this._writeCollapsedText(rm, oFeedListItem, sMyId);
		} else {
			rm.writeEscaped(oFeedListItem.getText(), true);
			rm.write('</span>');
		}
		rm.write('</p>');
		if (oFeedListItem.getInfo()) {
			// info
			rm.write('<p class="sapMFeedListItemFooter">');
			if (oFeedListItem.getInfo()) {
				rm.write('<span id="' + sMyId + '-info" class="sapMFeedListItemInfo">');
				rm.writeEscaped(oFeedListItem.getInfo());
				rm.write('</span>');
			}
			rm.write('</p>');
		}
	};

	EvalRequestFeedListItemRenderer._RenderDesktop = function(rm, oFeedListItem, sMyId) {
		rm.write('<div class= "sapMFeedListItemText ');
		if (oFeedListItem.getShowIcon()) {
			rm.write('sapMFeedListItemHasFigure');
		}
		rm.write('" >');
		this._writeSender(rm, oFeedListItem, sMyId);
		this._writeDate(rm, oFeedListItem, sMyId);
		this._writeMainText(rm, oFeedListItem, sMyId);
		rm.write('</div>');
	};

	EvalRequestFeedListItemRenderer.renderLIContent = function(rm, oFeedListItem) {
		var sMyId = oFeedListItem.getId(),
			bIsPhone = sap.ui.Device.system.phone;
		rm.write('<div');
		rm.addClass('sapMFeedListItem');
		rm.writeClasses();
		rm.write('>');
		if (oFeedListItem.getShowIcon()) {
			this._writeImageControl(rm, oFeedListItem, sMyId);
		}
		if (bIsPhone) {
			this._RenderPhone(rm, oFeedListItem, sMyId);
		} else {
			this._RenderDesktop(rm, oFeedListItem, sMyId);
		}
		rm.write('</div>');
	};

	return EvalRequestFeedListItemRenderer;
}, true);