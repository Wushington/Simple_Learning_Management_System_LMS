import { useState } from "react";

function ChapterForm({
	initialChapter,
	onCancel,
	onDelete,
	onSubmit,
	showVisibility = true,
	submitLabel = "Save chapter",
}) {
	const [title, setTitle] = useState(initialChapter?.title ?? "");
	const [isPublic, setIsPublic] = useState(initialChapter?.is_public ?? false);

	function handleSubmit(event) {
		event.preventDefault();
		onSubmit({
			isPublic,
			title: title.trim(),
		});
	}

	return (
		<form className="learning-form" onSubmit={handleSubmit}>
			<label htmlFor="chapter-title">Title</label>
			<input
				id="chapter-title"
				onChange={(event) => setTitle(event.target.value)}
				required
				value={title}
			/>
			{showVisibility && (
				<label className="checkbox-row" htmlFor="chapter-public">
					<input
						checked={isPublic}
						id="chapter-public"
						onChange={(event) => setIsPublic(event.target.checked)}
						type="checkbox"
					/>
					<span>Publish for enrolled students</span>
				</label>
			)}
			<div className="form-actions">
				<button type="submit">{submitLabel}</button>
				<button className="secondary-action" onClick={onCancel} type="button">
					Cancel
				</button>
				{onDelete && (
					<button className="danger-action" onClick={onDelete} type="button">
						Delete chapter
					</button>
				)}
			</div>
		</form>
	);
}

export default ChapterForm;
