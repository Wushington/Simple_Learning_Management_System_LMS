import {
	BlockquotePlugin,
	BoldPlugin,
	H2Plugin,
	ItalicPlugin,
	UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { Plate, PlateContent, usePlateEditor } from "platejs/react";

const DEFAULT_EDITOR_VALUE = [{ type: "p", children: [{ text: "" }] }];

function RichText({ initialValue = DEFAULT_EDITOR_VALUE, onChange }) {
	const editor = usePlateEditor({
		plugins: [
			BoldPlugin,
			ItalicPlugin,
			UnderlinePlugin,
			H2Plugin,
			BlockquotePlugin,
		],
		value: normalizeEditorValue(initialValue),
	});

	function toggleMark(mark) {
		editor.tf.toggleMark(mark);
	}

	function toggleBlock(type) {
		editor.tf.toggleBlock(type);
	}

	return (
		<div className="plate-editor">
			<div className="plate-toolbar" role="toolbar" aria-label="Content tools">
				<ToolbarButton label="Bold" onClick={() => toggleMark("bold")}>
					B
				</ToolbarButton>
				<ToolbarButton label="Italic" onClick={() => toggleMark("italic")}>
					<i>I</i>
				</ToolbarButton>
				<ToolbarButton label="Underline" onClick={() => toggleMark("underline")}>
					<u>U</u>
				</ToolbarButton>
				<ToolbarButton label="Heading" onClick={() => toggleBlock("h2")}>
					H2
				</ToolbarButton>
				<ToolbarButton label="Bulleted list" onClick={() => toggleBlock("ul")}>
					List
				</ToolbarButton>
				<ToolbarButton label="Quote" onClick={() => toggleBlock("blockquote")}>
					Quote
				</ToolbarButton>
			</div>
			<Plate
				editor={editor}
				onChange={({ value }) => onChange(normalizeEditorValue(value))}
				renderElement={renderElement}
				renderLeaf={renderLeaf}
			>
				<PlateContent className="plate-content-editable" placeholder="Add content..." />
			</Plate>
		</div>
	);
}

function ToolbarButton({ children, label, onClick }) {
	return (
		<button
			aria-label={label}
			className="plate-toolbar-button"
			onMouseDown={(event) => {
				event.preventDefault();
				onClick();
			}}
			title={label}
			type="button"
		>
			{children}
		</button>
	);
}

function renderElement({ attributes, children, element }) {
	switch (element.type) {
		case "h2":
			return (
				<h2 className="post-render-heading" {...attributes}>
					{children}
				</h2>
			);
		case "blockquote":
			return (
				<blockquote className="post-render-quote" {...attributes}>
					{children}
				</blockquote>
			);
		case "ul":
			return (
				<ul className="post-render-list">
					<li {...attributes}>{children}</li>
				</ul>
			);
		default:
			return <p {...attributes}>{children}</p>;
	}
}

function renderLeaf({ attributes, children, leaf }) {
	let formattedChildren = children;

	if (leaf.bold) {
		formattedChildren = <strong>{formattedChildren}</strong>;
	}

	if (leaf.italic) {
		formattedChildren = <em>{formattedChildren}</em>;
	}

	if (leaf.underline) {
		formattedChildren = <u>{formattedChildren}</u>;
	}

	return <span {...attributes}>{formattedChildren}</span>;
}

function normalizeEditorValue(value) {
	return Array.isArray(value) && value.length > 0 ? value : DEFAULT_EDITOR_VALUE;
}

export default RichText;
