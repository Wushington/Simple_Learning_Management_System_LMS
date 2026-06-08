import { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import ChapterContentPanel from "./ChapterContentPanel.jsx";
import ChapterForm from "./ChapterForm.jsx";
import CourseForm from "./CourseForm.jsx";
import Navbar from "./Navbar.jsx";
import PopoutContainer from "./PopoutContainer.jsx";
import {
	createChapter,
	createCourse,
	getChapters,
	getCourses,
	getCurrentUser,
	updateChapter,
	updateCourse,
} from "../lib/apiServices.js";
import {
	EMPTY_CHAPTER_CONTENT,
	getNextChapterNumber,
	isCourseOwnedByUser,
} from "../lib/chapterUtils.js";

function InstructorView() {
	const [courses, setCourses] = useState([]);
	const [selectedCourse, setSelectedCourse] = useState(null);
	const [selectedChapter, setSelectedChapter] = useState(null);
	const [formMode, setFormMode] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		loadCourses();
	}, []);

	async function loadCourses() {
		setIsLoading(true);
		setError("");

		try {
			const [user, allCourses] = await Promise.all([
				getCurrentUser(),
				getCourses(),
			]);
			const instructorCourses = allCourses.filter((course) =>
				isCourseOwnedByUser(course, user),
			);
			const coursesWithChapters = await Promise.all(
				instructorCourses.map(async (course) => ({
					...course,
					chapters: await getChapters(course.id),
				})),
			);

			setCourses(coursesWithChapters);
			setSelectedCourse((currentCourse) =>
				currentCourse ?
					coursesWithChapters.find((course) => course.id === currentCourse.id) ??
						null
				:	null,
			);
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ??
					"Could not load instructor courses.",
			);
		} finally {
			setIsLoading(false);
		}
	}

	function openCourseForm() {
		setFormMode({ type: "create-course" });
		setError("");
	}

	function openCourseEditForm(course) {
		setFormMode({ type: "edit-course", course });
		setError("");
	}

	function openChapterForm(course) {
		setFormMode({ type: "create-chapter", course });
		setError("");
	}

	function openChapterEditForm(chapter) {
		setFormMode({ type: "edit-chapter", chapter });
		setError("");
	}

	function closePopout() {
		setFormMode(null);
	}

	async function handleCreateCourse(courseFields) {
		setError("");

		try {
			await createCourse(courseFields.title, courseFields.description);
			closePopout();
			await loadCourses();
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ?? "Could not create the course.",
			);
		}
	}

	async function handleUpdateCourse(courseFields) {
		setError("");

		try {
			await updateCourse(
				formMode.course.id,
				courseFields.title,
				courseFields.description,
			);
			closePopout();
			await loadCourses();
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ?? "Could not update the course.",
			);
		}
	}

	async function handleCreateChapter(chapterFields) {
		setError("");

		const course = formMode.course;
		const nextNumber = getNextChapterNumber(course.chapters);

		try {
			const chapter = await createChapter(
				course.id,
				chapterFields.title,
				EMPTY_CHAPTER_CONTENT,
				nextNumber,
				chapterFields.isPublic,
			);
			setSelectedChapter({ ...chapter, courseId: course.id });
			closePopout();
			await loadCourses();
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ?? "Could not create the chapter.",
			);
		}
	}

	async function handleUpdateChapter(chapterFields) {
		setError("");

		const chapter = formMode.chapter;

		try {
			const updatedChapter = await updateChapter(
				chapter.courseId,
				chapter.id,
				chapterFields.title,
				chapter.content,
				chapter.number,
				chapterFields.isPublic,
			);
			setSelectedChapter({ ...updatedChapter, courseId: chapter.courseId });
			closePopout();
			await loadCourses();
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ?? "Could not update the chapter.",
			);
		}
	}

	return (
		<section className="learning-shell">
			<Navbar
				canEditChapters
				canEditCourses
				courseActionLabel="Create course"
				courses={courses}
				emptyCourseMessage="Create a course to get started."
				emptyChapterMessage="Add a chapter for this course."
				onAddCourse={openCourseForm}
				onCourseSelect={setSelectedCourse}
				onEditChapter={openChapterEditForm}
				onEditCourse={openCourseEditForm}
				onChapterSelect={setSelectedChapter}
				selectedChapterId={selectedChapter?.id}
			/>

			<main className="learning-main">
				<header className="learning-main-header">
					<div>
						<p className="learning-eyebrow">Instructor</p>
						<h2>Chapter content</h2>
					</div>
					<button
						className="instructor-header-action"
						disabled={!selectedCourse}
						onClick={() => openChapterForm(selectedCourse)}
						title={
							selectedCourse ?
								`Add chapter to ${selectedCourse.title}`
							:	"Select a course before adding a chapter"
						}
						type="button"
					>
						<AiOutlinePlus aria-hidden="true" />
						<span>Add chapter</span>
					</button>
				</header>

				{isLoading && <p className="surface-message">Loading courses...</p>}
				{error && <p className="form-error">{error}</p>}

				{!isLoading && (
					<ChapterContentPanel
						emptyMessage="Select a chapter from the navbar to edit its content."
						mode="edit"
						selectedChapter={selectedChapter}
					/>
				)}
			</main>

			{formMode?.type === "create-course" && (
				<PopoutContainer onClose={closePopout} title="Create course">
					<CourseForm
						onCancel={closePopout}
						onSubmit={handleCreateCourse}
						submitLabel="Create"
					/>
				</PopoutContainer>
			)}

			{formMode?.type === "edit-course" && (
				<PopoutContainer onClose={closePopout} title="Edit course">
					<CourseForm
						initialCourse={formMode.course}
						onCancel={closePopout}
						onSubmit={handleUpdateCourse}
						submitLabel="Save changes"
					/>
				</PopoutContainer>
			)}

			{formMode?.type === "create-chapter" && (
				<PopoutContainer
					onClose={closePopout}
					title={`Add chapter to ${formMode.course.title}`}
				>
					<ChapterForm
						onCancel={closePopout}
						onSubmit={handleCreateChapter}
						submitLabel="Add chapter"
					/>
				</PopoutContainer>
			)}

			{formMode?.type === "edit-chapter" && (
				<PopoutContainer onClose={closePopout} title="Edit chapter">
					<ChapterForm
						initialChapter={formMode.chapter}
						onCancel={closePopout}
						onSubmit={handleUpdateChapter}
						submitLabel="Save changes"
					/>
				</PopoutContainer>
			)}
		</section>
	);
}

export default InstructorView;
