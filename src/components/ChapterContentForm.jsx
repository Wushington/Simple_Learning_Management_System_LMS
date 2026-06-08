import { useState } from "react";
import RichText from "./RichText.jsx";
import { EMPTY_POST_CONTENT, normalizePostBody } from "../lib/chapterUtils.js";

function ChapterContentForm({ initialPost, onCancel, onSubmit }) {
	const [title, setTitle] = useState(initialPost?.title ?? "");
	const [body, setBody] = useState(
		normalizePostBody(initialPost?.body ?? EMPTY_POST_CONTENT),
	);

	function handleSubmit(event) {
		event.preventDefault();
		onSubmit({
			body,
			title: title.trim() || "Untitled",
		});
	}

	return (
		<form className="learning-form content-post-form" onSubmit={handleSubmit}>
			<label htmlFor="content-title">Title</label>
			<input
				id="content-title"
				onChange={(event) => setTitle(event.target.value)}
				placeholder="Content title"
				required
				value={title}
			/>
			<label>Body</label>
			<RichText initialValue={body} onChange={setBody} />
			<div className="form-actions">
				<button type="submit">Save post</button>
				<button className="secondary-action" onClick={onCancel} type="button">
					Cancel
				</button>
			</div>
		</form>
	);
}

export default ChapterContentForm;
