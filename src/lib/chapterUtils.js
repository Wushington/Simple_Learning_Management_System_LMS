const EMPTY_CHAPTER_CONTENT = [{ type: "p", children: [{ text: "" }] }];

function getNextChapterNumber(chapters = []) {
	return Math.max(0, ...chapters.map((chapter) => chapter.number ?? 0)) + 1;
}

function isCourseOwnedByUser(course, user) {
	if (!course.instructor || !user?.username) {
		return false;
	}

	return (
		course.instructor === user.username ||
		course.instructor.startsWith(`${user.username} `)
	);
}

export { EMPTY_CHAPTER_CONTENT, getNextChapterNumber, isCourseOwnedByUser };
