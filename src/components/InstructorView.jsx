import { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import ChapterContentPanel from "./ChapterContentPanel.jsx";
import ChapterContentForm from "./ChapterContentForm.jsx";
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
	buildChapterPost,
	buildChapterPostsContent,
	EMPTY_CHAPTER_CONTENT,
	getChapterPosts,
	getNextChapterNumber,
	isCourseOwnedByUser,
} from "../lib/chapterUtils.js";

function InstructorView() {
	const [courses, setCourses] = useState([]);
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

	function openContentForm(chapter, post = null) {
		setFormMode({ type: post ? "edit-content" : "create-content", chapter, post });
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

	async function handleSaveContentPost(postFields) {
		setError("");

		const chapter = formMode.chapter;
		const posts = getChapterPosts(chapter.content);
		const nextPosts =
			formMode.post ?
				posts.map((post) =>
					post.id === formMode.post.id ?
						{
							...post,
							...postFields,
							updatedAt: new Date().toISOString(),
						}
					:	post,
				)
			:	[...posts, buildChapterPost(postFields)];

		try {
			const updatedChapter = await updateChapter(
				chapter.courseId,
				chapter.id,
				chapter.title,
				buildChapterPostsContent(nextPosts),
				chapter.number,
				chapter.is_public,
			);
			setSelectedChapter({ ...updatedChapter, courseId: chapter.courseId });
			closePopout();
			await loadCourses();
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ?? "Could not update the content.",
			);
		}
	}

	async function handleDeleteContentPost(postToDelete) {
		const shouldDelete = window.confirm(`Delete "${postToDelete.title}"?`);
		if (!shouldDelete) {
			return;
		}

		setError("");

		const chapter = selectedChapter;
		const posts = getChapterPosts(chapter.content);
		const nextPosts = posts.filter((post) => post.id !== postToDelete.id);

		try {
			const updatedChapter = await updateChapter(
				chapter.courseId,
				chapter.id,
				chapter.title,
				buildChapterPostsContent(nextPosts),
				chapter.number,
				chapter.is_public,
			);
			setSelectedChapter({ ...updatedChapter, courseId: chapter.courseId });
			await loadCourses();
		} catch (requestError) {
			setError(
				requestError.response?.data?.detail ?? "Could not delete the content.",
			);
		}
	}

	return (
		<section className="learning-shell">
			<Navbar
				canEditChapters
				canEditCourses
				courses={courses}
				emptyCourseMessage="Create a course to get started."
				emptyChapterMessage="Add a chapter for this course."
				onAddCourse={openCourseForm}
				onAddChapter={openChapterForm}
				onEditChapter={openChapterEditForm}
				onEditCourse={openCourseEditForm}
				newActionLabel="New"
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
						disabled={!selectedChapter}
						onClick={() => openContentForm(selectedChapter)}
						title={
							selectedChapter ?
								`Add content to ${selectedChapter.title}`
							:	"Select a chapter before adding content"
						}
						type="button"
					>
						<AiOutlinePlus aria-hidden="true" />
						<span>Add</span>
					</button>
				</header>

				{isLoading && <p className="surface-message">Loading courses...</p>}
				{error && <p className="form-error">{error}</p>}

				{!isLoading && (
					<ChapterContentPanel
						emptyMessage="Select a chapter from the navbar to edit its content."
						mode="edit"
						onDeletePost={handleDeleteContentPost}
						onEditPost={(post) => openContentForm(selectedChapter, post)}
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

			{(formMode?.type === "create-content" ||
				formMode?.type === "edit-content") && (
				<PopoutContainer
					onClose={closePopout}
					title={formMode.type === "edit-content" ? "Edit post" : "Add post"}
				>
					<ChapterContentForm
						initialPost={formMode.post}
						onCancel={closePopout}
						onSubmit={handleSaveContentPost}
					/>
				</PopoutContainer>
			)}
		</section>
	);
}

export default InstructorView;
