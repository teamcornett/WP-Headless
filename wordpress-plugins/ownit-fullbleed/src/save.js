import { useBlockProps, InnerBlocks } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { backgroundColor, backgroundImageUrl } = attributes;

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

	const blockProps = useBlockProps.save({
		className: "wp-block-ownit-fullbleed",
		style,
	});

	return (
		<div {...blockProps}>
			<div className="wp-block-ownit-fullbleed__inner">
				<InnerBlocks.Content />
			</div>
		</div>
	);
}
