import { useState } from "react";

function CourseForm({
	initialCourse,
	onCancel,
	onDelete,
	onSubmit,
	submitLabel = "Save course",
}) {
	const [title, setTitle] = useState(initialCourse?.title ?? "");
	const [description, setDescription] = useState(
		initialCourse?.description ?? "",
	);

	function handleSubmit(event) {
		event.preventDefault();
		onSubmit({
			description: description.trim(),
			title: title.trim(),
		});
	}

	return (
		<form className="learning-form" onSubmit={handleSubmit}>
			<label htmlFor="course-title">Title</label>
			<input
				id="course-title"
				onChange={(event) => setTitle(event.target.value)}
				required
				value={title}
			/>
			<label htmlFor="course-description">Description</label>
			<input
				id="course-description"
				onChange={(event) => setDescription(event.target.value)}
				required
				value={description}
			/>
			<div className="form-actions">
				<button type="submit">{submitLabel}</button>
				<button className="secondary-action" onClick={onCancel} type="button">
					Cancel
				</button>
				{onDelete && (
					<button className="danger-action" onClick={onDelete} type="button">
						Delete course
					</button>
				)}
			</div>
		</form>
	);
}

export default CourseForm;
