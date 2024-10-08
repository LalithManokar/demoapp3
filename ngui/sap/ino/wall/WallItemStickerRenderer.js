/*!
 * @copyright@
 */
jQuery.sap.declare("sap.ino.wall.WallItemStickerRenderer");

(function() {
	"use strict";

	jQuery.sap.require("sap.ino.wall.WallItemBaseRenderer");
	jQuery.sap.require("sap.ui.core.IconPool");
	jQuery.sap.require("sap.ino.wall.util.Formatter");
	jQuery.sap.require("sap.ino.wall.util.Helper");
	jQuery.sap.require("sap.ino.wall.config.Config");
	jQuery.sap.require("sap.ino.wall.StickerColor");

	/**
	 * @class WallItemText renderer.
	 * @static
	 */
	sap.ino.wall.WallItemStickerRenderer = sap.ui.core.Renderer.extend(sap.ino.wall.WallItemBaseRenderer);

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the control that should be rendered
	 */

	sap.ino.wall.WallItemStickerRenderer.renderItem = function(oRM, oControl) {
		var sId = oControl.getId(),
			sKey = null;

		// start wrapper
		oRM.write("<div class=\"flippable\">");

		oRM.write("<label id=\"" + oControl.getId() +
			"-wallitem-description\" class=\"sapInoWallItemDescription\" style=\"height:0px;width:0px;overflow:hidden;position:absolute;\">");
		// this is only to prevent text bundle errors if color is not yet set in model
		var sColor = oControl._oRB.getText("CRTL_WALL_ITEMSTICKER_COLOR_" + (oControl.getColor() ? oControl.getColor().toUpperCase() : "YELLOW"));
		var sText = sap.ino.wall.util.Helper.stripTags(oControl.getTitle());
		if (sText && sText.trim() !== "") {
			oRM.write(oControl._oRB.getText("CRTL_WALL_ITEMSTICKER_EXP_READERTEXT", [sColor, sText]));
		} else {
			oRM.writeEscaped(oControl._oRB.getText("CRTL_WALL_ITEMSTICKER_EXP_READERTEXT_EMPTY", [sColor]));
		}
		oRM.write("</label>");

		/* front panel (view) */

		oRM.write("<div id=" + oControl.getId() + "-front");
		oRM.addClass("sapInoWallWISticker");
		oRM.addClass("sapInoWallWISticker" + oControl.getColor());
		oRM.addClass("front");
		oRM.writeClasses();
		oRM.write("style=\"" + (oControl.getW() ? "; width: " + oControl.getW() : "") + (oControl.getH() ? "; height: " + oControl.getH() : "") +
			"\"");
		oRM.write(">");

		if (!sap.ino.wall.config.Config.getDebugPositioning()) {
			// text
			oRM.write("<div id=\"" + oControl.getId() +
				"-front-text\" class=\"sapInoWallScrollable sapInoWallWITitleText sapInoWallWIStickerText sapInoWallWIBreakWord");
			// TODO: remove this later
			if (sap.ino.wall.config.Config.getEnableRichtTextEditing()) {
				oRM.write(" sapInoWallWITextEditorNoBold sapInoWallWIRichText");
			}
			oRM.write("\">");
			if (sap.ino.wall.config.Config.getEnableRichtTextEditing()) {
				// TODO: security (sanitize HTML, close tags)
				// TODO: remove <b> wrapper when transisition to new title
				// oRM.write(sap.ino.wall.util.Helper.stripTags((oControl.getTitle()[0] === "<" ? oControl.getTitle() : "<b>" + oControl.getTitle() + "</b>"), "<div><br><b><strong><u><i><em><ol><ul><li><font>"));
				var content = oControl.getTitle() || ""
				content = content[0] === '<' ? content : '<b>' + content + '</b>'
				try {
					var htmlContent = jQuery.parseHTML(content, false)
						// filter scripts
					if (htmlContent && htmlContent.length > 1) {
						// if user input multi item in single level like <a/><a/>, convert it to <div><a/><a/></div>
						htmlContent = jQuery.parseHTML("<div>" + content + "</div>", false);
					}
					if (htmlContent) {
						content = htmlContent[0].outerHTML
					}
				} catch (e) { // failed
				}
				oRM.write(content);
			} else {
				oRM.write(sap.ino.wall.util.Formatter.nl2br(jQuery.sap.encodeHTML(oControl.getTitle())));
			}
			oRM.write("</div>");
		} else {
			oRM.write("front");
		}

		// resize handle
		this.renderResizeHandler(oRM, oControl);

		// end front side
		oRM.write("</div>");

		/* back panel (edit) */

		oRM.write("<div id=" + oControl.getId() + "-back");
		oRM.addClass("sapInoWallWISticker");
		oRM.addClass("sapInoWallWISticker" + oControl.getColor());
		oRM.addClass("back");
		oRM.writeClasses();
		oRM.write("style=\"" + (oControl.getW() ? "; width: " + oControl.getW() : "") + (oControl.getH() ? "; height: " + oControl.getH() : "") +
			"\"");
		oRM.write(">");

		if (!sap.ino.wall.config.Config.getDebugPositioning()) {
			// text
			oRM.write("<div class=\"sapInoWallWIStickerText\">");
			oRM.renderControl(oControl._getTextareaDescription());
			oRM.write("</div>");
			oRM.write("<div class=\"sapInoWallWIStickerPickerContainer\" role=\"toolbar\" aria-label=\"" + oControl._oRB.getText(
				"CRTL_WALL_ITEMSTICKER_EXP_BGCOLOR_TOOLBAR") + "\">");
			for (sKey in sap.ino.wall.StickerColor) {
				if (sap.ino.wall.StickerColor.hasOwnProperty(sKey)) {
					oRM.write('<div role="button" aria-pressed="' + (sKey === oControl.getColor()) + '" tabindex="0" aria-label="' + oControl._oRB.getText(
							"CRTL_WALL_ITEMSTICKER_EXP_BGCOLOR_" + sKey.toUpperCase()) + '" data-sap-color="' + sKey +
						'" class="sapInoWallStickerColorPicker sapInoWallWISticker' + sKey + ' noflip ' + (sKey === oControl.getColor() ? 'active' : '') +
						'" onclick="javascript: sap.ui.getCore().byId(\'' + sId + '\').setColor(\'' + sKey + '\'); return false;"></div>');
				}
			}
			oRM.write("</div>");
		} else {
			oRM.write("back");
		}

		// resize handle
		this.renderResizeHandler(oRM, oControl);

		// end back side
		oRM.write("</div>");

		oRM.write("<div class=\"sapInoWallWIFlipBackButtonGroup\" role=\"group\">");
		// back button
		oRM.renderControl(oControl._getButtonFlip());
		oRM.write("</div>");

		// end wrapper
		oRM.write("</div>");
	};

})();