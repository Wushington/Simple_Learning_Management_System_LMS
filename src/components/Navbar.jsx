import { useState } from "react";
import { AiOutlineDown, AiOutlinePlus } from "react-icons/ai";
import NavItem from "./NavItem.jsx";

function Navbar({
	courses,
	selectedChapterId,
	onChapterSelect,
	onAddCourse,
	onEditCourse,
	onEditChapter,
	onCourseSelect,
	courseActionLabel = "Add course",
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
			const nextCourse = selectedCourseId === item.id ? null : item;

			setSelectedCourseId(nextCourse?.id ?? null);
			onCourseSelect?.(nextCourse);
			return;
		}

		if (item.type === "chapter") {
			onChapterSelect(item);
		}
	}

	const courseItems = courses.map((course) => ({
		...course,
		type: "course",
	}));

	return (
		<nav className="navbar" aria-label="Course chapters">
			<section className="navbar-panel" aria-label="Courses">
				<div className="navbar-header">
					<div>
						<p className="navbar-eyebrow">Courses</p>
						<h2>Library</h2>
					</div>
					{onAddCourse && (
						<button
							aria-label={courseActionLabel}
							className="navbar-action-button"
							onClick={onAddCourse}
							title={courseActionLabel}
							type="button"
						>
							<AiOutlinePlus aria-hidden="true" />
							<span>{courseActionLabel}</span>
						</button>
					)}
				</div>

				<div className="navbar-list">
					{courseItems.length === 0 ?
						<div className="navbar-empty-state">
							<p className="navbar-empty">{emptyCourseMessage}</p>
							{onAddCourse && (
								<button
									className="navbar-empty-action"
									onClick={onAddCourse}
									type="button"
								>
									<AiOutlinePlus aria-hidden="true" />
									<span>{courseActionLabel}</span>
								</button>
							)}
						</div>
					:	courseItems.map((item) => {
							const isExpanded = item.id === selectedCourse?.id;
							const chapterItems =
								item.chapters?.map((chapter) => ({
									...chapter,
									type: "chapter",
									courseId: item.id,
								})) ?? [];

							return (
								<div className="course-group" key={`${item.type}-${item.id}`}>
									<NavItem
										item={item}
										isActive={isExpanded}
										isExpanded={isExpanded}
										onEdit={
											canEditCourses && onEditCourse ?
												() => onEditCourse(item)
											:	undefined
										}
										onClick={handleItemClick}
										trailingIcon={
											<AiOutlineDown
												aria-hidden="true"
												className={
													isExpanded ?
														"course-toggle-icon expanded"
													:	"course-toggle-icon"
												}
											/>
										}
									/>

									{isExpanded && (
										<div className="chapter-list">
											{chapterItems.length === 0 ?
												<p className="navbar-empty chapter-empty">
													{emptyChapterMessage}
												</p>
											:	chapterItems.map((chapter) => (
													<NavItem
														key={`${chapter.type}-${chapter.id}`}
														item={chapter}
														isActive={chapter.id === selectedChapterId}
														isNested
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
									)}
								</div>
							);
						})
					}
				</div>
			</section>
		</nav>
	);
}

export default Navbar;
