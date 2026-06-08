import { useState } from "react";
import { AiOutlineLeft, AiOutlinePlus } from "react-icons/ai";
import NavItem from "./NavItem.jsx";

function Navbar({
	courses,
	selectedChapterId,
	onChapterSelect,
	onAddCourse,
	onAddChapter,
	onEditCourse,
	onEditChapter,
	onCourseSelect,
	newActionLabel = "New",
	canEditCourses = false,
	canEditChapters = false,
	emptyCourseMessage = "No courses yet.",
	emptyChapterMessage = "No chapters yet.",
}) {
	const [selectedCourseId, setSelectedCourseId] = useState(null);
	const selectedCourse =
		courses.find((course) => course.id === selectedCourseId) ?? null;

	function handleItemClick(item) {
		if (item.type === "course") {
			setSelectedCourseId(item.id);
			onCourseSelect?.(item);
			onChapterSelect(null);
			return;
		}

		if (item.type === "chapter") {
			onChapterSelect(item);
		}
	}

	function handleBack() {
		setSelectedCourseId(null);
		onCourseSelect?.(null);
		onChapterSelect(null);
	}

	function handleNewClick() {
		if (selectedCourse && onAddChapter) {
			onAddChapter(selectedCourse);
			return;
		}

		onAddCourse?.();
	}

	const courseItems = courses.map((course) => ({
		...course,
		type: "course",
	}));

	const chapterItems =
		selectedCourse?.chapters?.map((chapter) => ({
			...chapter,
			type: "chapter",
			courseId: selectedCourse.id,
		})) ?? [];

	return (
		<nav className="navbar" aria-label="Course chapters">
			<section className="navbar-panel">
				<button
					aria-label={newActionLabel}
					className="navbar-new-button"
					disabled={!onAddCourse && !(selectedCourse && onAddChapter)}
					onClick={handleNewClick}
					title={newActionLabel}
					type="button"
				>
					<AiOutlinePlus aria-hidden="true" />
					<span>{newActionLabel}</span>
				</button>

				{!selectedCourse ?
					<div className="navbar-view" aria-label="Courses">
						<div className="navbar-header">
							<div>
								<p className="navbar-eyebrow">Courses</p>
								<h2>Library</h2>
							</div>
						</div>

						<div className="navbar-list">
							{courseItems.length === 0 ?
								<p className="navbar-empty">{emptyCourseMessage}</p>
							:	courseItems.map((item) => (
									<NavItem
										key={`${item.type}-${item.id}`}
										item={item}
										onEdit={
											canEditCourses && onEditCourse ?
												() => onEditCourse(item)
											:	undefined
										}
										onClick={handleItemClick}
									/>
								))
							}
						</div>
					</div>
				:	<div className="navbar-view" aria-label="Chapters">
						<button
							className="navbar-back-button"
							onClick={handleBack}
							type="button"
						>
							<AiOutlineLeft aria-hidden="true" />
							<span>Back</span>
						</button>

						<div className="navbar-header compact">
							<div>
								<p className="navbar-eyebrow">Course</p>
								<h2>{selectedCourse.title}</h2>
							</div>
						</div>

						<div className="navbar-list">
							{chapterItems.length === 0 ?
								<p className="navbar-empty">{emptyChapterMessage}</p>
							:	chapterItems.map((chapter) => (
									<NavItem
										key={`${chapter.type}-${chapter.id}`}
										item={chapter}
										isActive={chapter.id === selectedChapterId}
										onEdit={
											canEditChapters && onEditChapter ?
												() => onEditChapter(chapter)
											:	undefined
										}
										onClick={handleItemClick}
									/>
								))
							}
						</div>
					</div>
				}
			</section>
		</nav>
	);
}

export default Navbar;
