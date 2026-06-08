import { useState } from "react";
import { getChapterContentText } from "../lib/chapterUtils.js";

function ChapterContentForm({ initialChapter, onCancel, onSubmit }) {
	const [content, setContent] = useState(
		getChapterContentText(initialChapter?.content),
	);

	function handleSubmit(event) {
		event.preventDefault();
		onSubmit(content.trim());
	}

	return (
		<form className="learning-form" onSubmit={handleSubmit}>
			<label htmlFor="chapter-content">Content</label>
			<textarea
				id="chapter-content"
				onChange={(event) => setContent(event.target.value)}
				placeholder="Add chapter content..."
				rows={8}
				value={content}
			/>
			<div className="form-actions">
				<button type="submit">Save content</button>
				<button className="secondary-action" onClick={onCancel} type="button">
					Cancel
				</button>
			</div>
		</form>
	);
}

export default ChapterContentForm;
