function EnrollmentForm({
	availableCourses,
	onCancel,
	onCourseChange,
	onSubmit,
	selectedCourseId,
}) {
	return (
		<form className="learning-form" onSubmit={onSubmit}>
			<label htmlFor="course-enrollment">Course</label>
			<select
				id="course-enrollment"
				onChange={(event) => onCourseChange(event.target.value)}
				required
				value={selectedCourseId}
			>
				<option value="">Choose a course</option>
				{availableCourses.map((course) => (
					<option key={course.id} value={course.id}>
						{course.title}
					</option>
				))}
			</select>
			<div className="form-actions">
				<button disabled={availableCourses.length === 0} type="submit">
					Enroll
				</button>
				<button className="secondary-action" onClick={onCancel} type="button">
					Cancel
				</button>
			</div>
			{availableCourses.length === 0 && (
				<p className="surface-message">No available courses to enroll in.</p>
			)}
		</form>
	);
}

export default EnrollmentForm;
