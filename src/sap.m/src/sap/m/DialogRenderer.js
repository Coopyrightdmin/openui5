/*!
 * ${copyright}
 */
sap.ui.define(["sap/m/library", "sap/ui/Device", "sap/m/Dialog"],
	function(library, Device, Dialog) {
		"use strict";

		// shortcut for sap.m.DialogType
		var DialogType = library.DialogType;

		/**
		 * Dialog renderer.
		 *
		 * @namespace
		 */
		var DialogRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		DialogRenderer.render = function (oRm, oControl) {
			var id = oControl.getId(),
				sType = oControl.getType(),
				oHeader = oControl._getAnyHeader(),
				oSubHeader = oControl.getSubHeader(),
				bMessage = (sType === DialogType.Message),
				oLeftButton = oControl.getBeginButton(),
				oRightButton = oControl.getEndButton(),
				bHorizontalScrolling = oControl.getHorizontalScrolling(),
				bVerticalScrolling = oControl.getVerticalScrolling(),
				sState = oControl.getState(),
				bStretch = oControl.getStretch(),
				bStretchOnPhone = oControl.getStretchOnPhone() && Device.system.phone,
				bResizable = oControl.getResizable(),
				bDraggable = oControl.getDraggable(),
				oValueStateText = oControl.getAggregation("_valueState");

			if (oHeader) {
				oHeader.applyTagAndContextClassFor("header");
			}

			if (oSubHeader) {
				oSubHeader.applyTagAndContextClassFor("subheader");
			}

			// write the HTML into the render manager
			// the initial size of the dialog have to be 0, because if there is a large dialog content the initial size can be larger than the html's height (scroller)
			// The scroller will make the initial window width smaller and in the next recalculation the maxWidth will be larger.
			var initialWidth = oControl.getContentWidth() && oControl.getContentWidth() != 'auto' ? ' width: ' + oControl.getContentWidth() + ';' : '';
			var initialHeight = oControl.getContentHeight() && oControl.getContentHeight() != 'auto' ? ' height: ' + oControl.getContentHeight() + ';' : '';
			var initialStyles = "style='" + initialWidth + initialHeight + "'";

			oRm.write('<div ' + initialStyles);
			oRm.writeControlData(oControl);
			oRm.addClass("sapMDialog");
			oRm.addClass("sapMDialog-CTX");
			oRm.addClass("sapMPopup-CTX");

			if (oControl.isOpen()) {
				oRm.addClass("sapMDialogOpen");
			}

			if (window.devicePixelRatio > 1) {
				oRm.addClass("sapMDialogHighPixelDensity");
			}

			if (oControl._bDisableRepositioning) {
				oRm.addClass("sapMDialogTouched");
			}

			if (bStretch || (bStretchOnPhone)) {
				oRm.addClass("sapMDialogStretched");
			}

			oRm.addClass(Dialog._mStateClasses[sState]);

			// No Footer
			var noToolbarAndNobuttons = !oControl._oToolbar && !oLeftButton && !oRightButton;
			var emptyToolbarAndNoButtons = oControl._oToolbar && oControl._isToolbarEmpty() && !oLeftButton && !oRightButton;
			if (noToolbarAndNobuttons || emptyToolbarAndNoButtons) {
				oRm.addClass("sapMDialog-NoFooter");
			}

			if (!oHeader) {
				oRm.addClass("sapMDialog-NoHeader");
			}

			// ARIA
			if (sState === "Error" || sState === "Warning") {
				oRm.writeAccessibilityState(oControl, {
					role: "alertdialog"
				});
			} else {
				oRm.writeAccessibilityState(oControl, {
					role: "dialog"
				});
			}

			if (oControl._forceDisableScrolling) {
				oRm.addClass("sapMDialogWithScrollCont");
			}

			if (oSubHeader && oSubHeader.getVisible()) {
				oRm.addClass("sapMDialogWithSubHeader");
			}

			if (bMessage) {
				oRm.addClass("sapMMessageDialog");
			}

			if (!bVerticalScrolling) {
				oRm.addClass("sapMDialogVerScrollDisabled");
			}

			if (!bHorizontalScrolling) {
				oRm.addClass("sapMDialogHorScrollDisabled");
			}

			if (Device.system.phone) {
				oRm.addClass("sapMDialogPhone");
			}

			if (bDraggable && !bStretch) {
				oRm.addClass("sapMDialogDraggable");
			}

			// test dialog with sap-ui-xx-formfactor=compact
			if (library._bSizeCompact) {
				oRm.addClass("sapUiSizeCompact");
			}

			oRm.writeClasses();

			var sTooltip = oControl.getTooltip_AsString();

			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			oRm.writeAttribute("tabindex", "-1");

			oRm.write(">");

			if (Device.system.desktop) {

				if (bResizable && !bStretch) {
					oRm.writeIcon("sap-icon://resize-corner", ["sapMDialogResizeHandler"], { "title" : ""});
				}

				// Invisible element which is used to determine when desktop keyboard navigation
				// has reached the first focusable element of a dialog and went beyond. In that case, the controller
				// will focus the last focusable element.
				oRm.write('<span id="' + oControl.getId() + '-firstfe" tabindex="0"/>');
			}

			if (oHeader) {
				oRm.renderControl(oHeader);
			}

			if (oSubHeader) {
				oSubHeader.addStyleClass("sapMDialogSubHeader");
				oRm.renderControl(oSubHeader);
			}

			if (oValueStateText) {
				oRm.renderControl(oValueStateText);
			}

			oRm.write('<section id="' + id + '-cont" class="sapMDialogSection">');
			oRm.write('<div id="' + id + '-scroll" class="sapMDialogScroll">');
			oRm.write('<div id="' + id + '-scrollCont" class="sapMDialogScrollCont');

			if (oControl.getStretch() || initialHeight) {
				oRm.write(' sapMDialogStretchContent');
			}

			oRm.write('">');

			var aContent = oControl.getContent();

			for (var i = 0; i < aContent.length; i++) {
				oRm.renderControl(aContent[i]);
			}

			oRm.write("</div>");
			oRm.write("</div>");
			oRm.write("</section>");

			if (!(noToolbarAndNobuttons || emptyToolbarAndNoButtons)) {
				oRm.renderControl(oControl._oToolbar);
			}

			if (Device.system.desktop) {
				// Invisible element which is used to determine when desktop keyboard navigation
				// has reached the last focusable element of a dialog and went beyond. In that case, the controller
				// will focus the first focusable element.
				oRm.write('<span id="' + oControl.getId() + '-lastfe" tabindex="0"/>');
			}

			oRm.write("</div>");
		};

		return DialogRenderer;
	}, /* bExport= */ true);
