import { useEffect, useMemo, useState } from "react";
import ChapterContentPanel from "./ChapterContentPanel.jsx";
import EnrollmentForm from "./EnrollmentForm.jsx";
import Navbar from "./Navbar.jsx";
import PopoutContainer from "./PopoutContainer.jsx";
import {
	enrollInCourse,
	getChapters,
	getCourses,
	getEnrolledCourses,
} from "../lib/apiServices.js";

function StudentView() {
	const [courses, setCourses] = useState([]);
	const [allCourses, setAllCourses] = useState([]);
	const [selectedChapter, setSelectedChapter] = useState(null);
	const [formMode, setFormMode] = useState(null);
	const [selectedCourseId, setSelectedCourseId] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const enrolledCourseIds = useMemo(
		() => new Set(courses.map((course) => course.id)),
		[courses],
	);

	const availableCourses = allCourses.filter(
		(course) => !enrolledCourseIds.has(course.id),
	);

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

			setAllCourses(courseCatalog);
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
		setSelectedCourseId("");
		setError("");
	}

	async function handleEnroll(event) {
		event.preventDefault();
		setError("");

		try {
			await enrollInCourse(selectedCourseId);
			setFormMode(null);
			await loadCourses();
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ?? "Could not enroll in the course.",
			);
		}
	}

	return (
		<section className="learning-shell">
			<Navbar
				courseActionLabel="Enroll in course"
				courses={courses}
				emptyCourseMessage="Enroll in a course to see chapters."
				emptyChapterMessage="No published chapters yet."
				onAddCourse={openEnrollForm}
				onChapterSelect={setSelectedChapter}
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
						availableCourses={availableCourses}
						onCancel={() => setFormMode(null)}
						onCourseChange={setSelectedCourseId}
						onSubmit={handleEnroll}
						selectedCourseId={selectedCourseId}
					/>
				</PopoutContainer>
			)}
		</section>
	);
}

export default StudentView;
