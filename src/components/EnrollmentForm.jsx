function EnrollmentForm({ courseCode, onCancel, onCourseCodeChange, onSubmit }) {
	return (
		<form className="learning-form" onSubmit={onSubmit}>
			<label htmlFor="course-code">Course code</label>
			<input
				id="course-code"
				maxLength={8}
				onChange={(event) => onCourseCodeChange(event.target.value)}
				placeholder="Example: A1B2C3D4"
				required
				value={courseCode}
			/>
			<div className="form-actions">
				<button type="submit">Join course</button>
				<button className="secondary-action" onClick={onCancel} type="button">
					Cancel
				</button>
			</div>
		</form>
	);
}

export default EnrollmentForm;
