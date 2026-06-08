import { useEffect, useState } from "react";
import ChapterContentPanel from "./ChapterContentPanel.jsx";
import EnrollmentForm from "./EnrollmentForm.jsx";
import Navbar from "./Navbar.jsx";
import PopoutContainer from "./PopoutContainer.jsx";
import {
	enrollInCourseByCode,
	getChapters,
	getCourses,
	getEnrolledCourses,
	unenrollFromCourse,
} from "../lib/apiServices.js";

function StudentView() {
	const [courses, setCourses] = useState([]);
	const [selectedChapter, setSelectedChapter] = useState(null);
	const [formMode, setFormMode] = useState(null);
	const [courseCode, setCourseCode] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		loadCourses();
	}, []);

	async function loadCourses() {
		setIsLoading(true);
		setError("");

		try {
			const [courseCatalog, enrollments] = await Promise.all([
				getCourses(),
				getEnrolledCourses(),
			]);
			const enrolledIds = new Set(
				enrollments.map((enrollment) => enrollment.course_id),
			);
			const enrolledCourses = courseCatalog.filter((course) =>
				enrolledIds.has(course.id),
			);
			const coursesWithChapters = await Promise.all(
				enrolledCourses.map(async (course) => ({
					...course,
					chapters: await getChapters(course.id),
				})),
			);

			setCourses(coursesWithChapters);
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ?? "Could not load student courses.",
			);
		} finally {
			setIsLoading(false);
		}
	}

	function openEnrollForm() {
		setFormMode("enroll");
		setCourseCode("");
		setError("");
	}

	async function handleEnroll(event) {
		event.preventDefault();
		setError("");

		try {
			await enrollInCourseByCode(courseCode.trim().toUpperCase());
			setFormMode(null);
			await loadCourses();
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ?? "Could not enroll in the course.",
			);
		}
	}

	async function handleLeaveCourse(course) {
		const shouldLeave = window.confirm(`Leave "${course.title}"?`);
		if (!shouldLeave) {
			return;
		}

		setError("");

		try {
			await unenrollFromCourse(course.id);
			setSelectedChapter(null);
			await loadCourses();
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ?? "Could not leave the course.",
			);
		}
	}

	return (
		<section className="learning-shell">
			<Navbar
				courses={courses}
				emptyCourseMessage="Enroll in a course to see chapters."
				emptyChapterMessage="No published chapters yet."
				newActionLabel="Enroll"
				onAddCourse={openEnrollForm}
				onChapterSelect={setSelectedChapter}
				onLeaveCourse={handleLeaveCourse}
				selectedChapterId={selectedChapter?.id}
			/>

			<main className="learning-main">
				<header className="learning-main-header">
					<div>
						<p className="learning-eyebrow">Student</p>
						<h2>Chapter content</h2>
					</div>
				</header>

				{isLoading && <p className="surface-message">Loading courses...</p>}
				{error && <p className="form-error">{error}</p>}

				{!isLoading && (
					<ChapterContentPanel
						emptyMessage="Select a chapter from the navbar to read its content."
						mode="read"
						selectedChapter={selectedChapter}
					/>
				)}
			</main>

			{formMode === "enroll" && (
				<PopoutContainer
					onClose={() => setFormMode(null)}
					title="Enroll in course"
				>
					<EnrollmentForm
						courseCode={courseCode}
						onCancel={() => setFormMode(null)}
						onCourseCodeChange={setCourseCode}
						onSubmit={handleEnroll}
					/>
				</PopoutContainer>
			)}
		</section>
	);
}

export default StudentView;
