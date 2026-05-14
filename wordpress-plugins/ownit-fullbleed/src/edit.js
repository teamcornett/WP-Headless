import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";
import {
	PanelBody,
	Button,
	ColorPalette,
	BaseControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";

const ALLOWED_BLOCKS = undefined;

export default function Edit({ attributes, setAttributes }) {
	const { backgroundColor, backgroundImageId, backgroundImageUrl } =
		attributes;

	const style = {};
	if (backgroundColor) {
		style.backgroundColor = backgroundColor;
	}
	if (backgroundImageUrl) {
		style.backgroundImage = `url(${backgroundImageUrl})`;
		style.backgroundSize = "cover";
		style.backgroundPosition = "center center";
		style.backgroundRepeat = "no-repeat";
	}

	const blockProps = useBlockProps({
		className: "wp-block-ownit-fullbleed",
		style,
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Background", "ownit-fullbleed")} initialOpen>
					<BaseControl
						id="ownit-fullbleed-bg-color"
						label={__("Background color", "ownit-fullbleed")}
					>
						<ColorPalette
							value={backgroundColor}
							onChange={(value) =>
								setAttributes({
									backgroundColor: value || "",
								})
							}
							clearable
						/>
					</BaseControl>
					<BaseControl
						id="ownit-fullbleed-bg-image"
						label={__("Background image", "ownit-fullbleed")}
					>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={(media) => {
									setAttributes({
										backgroundImageId: media.id,
										backgroundImageUrl: media.url,
										backgroundImageAlt: media.alt || "",
									});
								}}
								allowedTypes={["image"]}
								value={backgroundImageId}
								render={({ open }) => (
									<div className="ownit-fullbleed__media-buttons">
										<Button variant="primary" onClick={open}>
											{backgroundImageUrl
												? __("Replace image", "ownit-fullbleed")
												: __("Select image", "ownit-fullbleed")}
										</Button>
										{backgroundImageUrl ? (
											<Button
												variant="link"
												isDestructive
												onClick={() =>
													setAttributes({
														backgroundImageId: 0,
														backgroundImageUrl: "",
														backgroundImageAlt: "",
													})
												}
											>
												{__("Remove image", "ownit-fullbleed")}
											</Button>
										) : null}
									</div>
								)}
							/>
						</MediaUploadCheck>
					</BaseControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wp-block-ownit-fullbleed__inner">
					<InnerBlocks
						allowedBlocks={ALLOWED_BLOCKS}
						templateLock={false}
						renderAppender={InnerBlocks.ButtonBlockAppender}
					/>
				</div>
			</div>
		</>
	);
}
